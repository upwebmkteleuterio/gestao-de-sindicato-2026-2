import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !adminUser) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single()

    if (profile?.role !== 'administrador') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: corsHeaders })
    }

    const { companies } = await req.json()
    if (!Array.isArray(companies)) {
      return new Response(JSON.stringify({ error: 'Invalid payload: companies must be an array' }), { status: 400, headers: corsHeaders })
    }

    const results = []
    
    // Process one by one to avoid overwhelming the Auth API even with service role, 
    // although service role is more lenient.
    for (const companyData of companies) {
      try {
        const rawCnpj = companyData.cnpj || ''
        const cleanCnpj = rawCnpj.replace(/\D/g, '')
        const cleanCep = (companyData.zip_code || '').replace(/\D/g, '')
        
        if (cleanCnpj.length < 14) {
          throw new Error(`CNPJ inválido: ${rawCnpj}`)
        }

        const virtualEmail = `${cleanCnpj}@gestaosindicato.com.br`
        const password = cleanCnpj.substring(0, 6)

        // 1. Create Auth User
        const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
          email: virtualEmail,
          password: password,
          email_confirm: true,
          user_metadata: {
            role: 'empresa',
            first_name: companyData.name || '',
            company_name: companyData.name || '',
            company_cnpj: cleanCnpj
          }
        })

        if (createAuthError) {
          // Se o erro for que o usuário já existe, tentamos apenas atualizar a empresa ou pular
          if (createAuthError.message.includes('already exists')) {
             results.push({ 
               cnpj: rawCnpj, 
               status: 'error', 
               error: 'Usuário com este CNPJ já existe no sistema de autenticação.' 
             })
             continue
          }
          throw createAuthError
        }

        const newUser = authData.user

        // 2. Create Company
        const { error: companyError } = await supabaseAdmin
          .from('companies')
          .insert({
            owner_id: newUser.id,
            name: companyData.name,
            cnpj: cleanCnpj,
            email: virtualEmail,
            accounting_email: companyData.accounting_email,
            street: companyData.street,
            number: companyData.number,
            neighborhood: companyData.neighborhood,
            city: companyData.city,
            state: companyData.state,
            zip_code: cleanCep,
            status: 'approved'
          })

        if (companyError) throw companyError

        results.push({ cnpj: rawCnpj, status: 'success' })
      } catch (err) {
        console.error(`[batch-import-companies] Erro ao importar ${companyData.cnpj}:`, err.message)
        results.push({ cnpj: companyData.cnpj, status: 'error', error: err.message })
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("[batch-import-companies] Erro fatal:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
