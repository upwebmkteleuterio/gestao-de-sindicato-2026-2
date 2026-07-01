import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Manual authentication check (since verify_jwt is false)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !adminUser) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders })
    }

    // Check if user is actually an admin in the profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single()

    if (profile?.role !== 'administrador') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: corsHeaders })
    }

    // Process Payload
    const payload = await req.json()
    const { 
      email, 
      password, 
      name, 
      cnpj, 
      representative_name, 
      representative_cpf,
      phone,
      whatsapp,
      street,
      number,
      neighborhood,
      city,
      state,
      zip_code
    } = payload

    console.log("[create-company-user] Criando usuário e empresa para:", email)

    // 1. Create Auth User
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'empresa',
        first_name: name || '',
        company_name: name || '',
        company_cnpj: cnpj || ''
      }
    })

    if (createAuthError) throw createAuthError
    const newUser = authData.user

    // Note: The 'handle_new_user' trigger in SQL should automatically create the profile.
    // However, we want to ensure the company is created and linked to this new user.

    // 2. Create/Update Profile (Ensure role is set to 'empresa')
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'empresa', first_name: name })
      .eq('id', newUser.id)

    if (profileError) console.error("[create-company-user] Erro ao atualizar perfil:", profileError)

    // 3. Create Company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        owner_id: newUser.id,
        name,
        cnpj,
        email,
        phone,
        whatsapp,
        representative_name,
        representative_cpf,
        street,
        number,
        neighborhood,
        city,
        state,
        zip_code,
        status: 'approved' // Admins create already approved companies
      })
      .select()
      .single()

    if (companyError) throw companyError

    return new Response(JSON.stringify({ 
      success: true, 
      userId: newUser.id, 
      companyId: company.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("[create-company-user] Erro fatal:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})