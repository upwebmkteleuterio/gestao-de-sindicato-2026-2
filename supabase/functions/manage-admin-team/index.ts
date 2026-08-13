import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const functionName = 'manage-admin-team'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const response = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const authorization = req.headers.get('Authorization')
    if (!authorization) return response({ error: 'Unauthorized' }, 401)

    const token = authorization.replace('Bearer ', '')
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: { user: actor }, error: actorError } = await supabaseAdmin.auth.getUser(token)
    if (actorError || !actor) return response({ error: 'Invalid token' }, 401)

    const { data: actorProfile } = await supabaseAdmin
      .from('profiles')
      .select('role, admin_role_id')
      .eq('id', actor.id)
      .single()

    if (actorProfile?.role !== 'administrador' || actorProfile.admin_role_id) {
      return response({ error: 'Superadmin access required' }, 403)
    }

    const payload = await req.json()
    const action = payload.action

    if (action === 'list') {
      const [{ data: users, error: usersError }, { data: profiles, error: profilesError }, { data: roles, error: rolesError }] = await Promise.all([
        supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
        supabaseAdmin.from('profiles').select('id, first_name, last_name, role, admin_role_id, updated_at'),
        supabaseAdmin.from('admin_roles').select('*').order('name'),
      ])
      if (usersError || profilesError || rolesError) throw usersError ?? profilesError ?? rolesError
      const admins = (users?.users ?? []).filter((user) => profiles?.some((profile) => profile.id === user.id && profile.role === 'administrador'))
      return response({
        users: admins.map((user) => {
          const profile = profiles?.find((item) => item.id === user.id)
          return { id: user.id, email: user.email, created_at: user.created_at, active: !user.banned_until || new Date(user.banned_until) < new Date(), ...profile }
        }),
        roles: roles ?? [],
      })
    }

    if (action === 'create') {

      const { email, password, first_name, last_name, admin_role_id } = payload
      if (!email || !password || !first_name || !admin_role_id) return response({ error: 'Nome, e-mail, senha e cargo são obrigatórios' }, 400)

      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name, last_name, role: 'administrador' },
      })
      if (createError || !created.user) throw createError ?? new Error('Usuário não criado')

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ first_name, last_name, admin_role_id, role: 'administrador' })
        .eq('id', created.user.id)
      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(created.user.id)
        throw profileError
      }

      console.log(`[${functionName}] usuário administrativo criado`, { userId: created.user.id })
      return response({ userId: created.user.id })
    }

    const userId = payload.user_id
    if (!userId || userId === actor.id) return response({ error: 'Usuário inválido' }, 400)

    if (action === 'update') {
      const { email, password, first_name, last_name, admin_role_id } = payload
      const authUpdate: Record<string, unknown> = { email, user_metadata: { first_name, last_name, role: 'administrador' } }
      if (password) authUpdate.password = password
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdate)
      if (authError) throw authError

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ first_name, last_name, admin_role_id, role: 'administrador' })
        .eq('id', userId)
      if (profileError) throw profileError
      return response({ userId })
    }

    if (action === 'toggle') {
      const { active } = payload
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: active ? 'none' : '876000h',
      })
      if (error) throw error
      return response({ userId, active })
    }

    if (action === 'delete') {
      const { data: target } = await supabaseAdmin.from('profiles').select('role, admin_role_id').eq('id', userId).single()
      if (target?.role === 'administrador' && !target.admin_role_id) return response({ error: 'O superadmin não pode ser excluído por este fluxo' }, 400)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) throw error
      return response({ userId })
    }

    return response({ error: 'Ação inválida' }, 400)
  } catch (error) {
    console.error(`[${functionName}] erro`, error)
    return response({ error: error instanceof Error ? error.message : 'Erro interno' }, 500)
  }
})
