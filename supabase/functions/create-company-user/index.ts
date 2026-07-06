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

    const payload = await req.json()
    const { 
      email, password, name, cnpj, representative_name, representative_cpf,
      phone, whatsapp, street, number, neighborhood, city, state, zip_code,
      accounting_email
    } = payload

    console.log("[create-company-user] Criando usuário para:", email)

    // 1. Create Auth User - All data goes into metadata so the trigger can handle the rest
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'empresa',
        first_name: representative_name || name || '',
        company_name: name || '',
        company_cnpj: cnpj || '',
        rep_cpf: representative_cpf || '',
        accounting_email: accounting_email || '',
        status: 'approved' // Admins create already approved companies
      }
    })

    if (createAuthError) throw createAuthError
    const newUser = authData.user

    // 2. Update the Company record that was created by the trigger with the remaining fields
    // (The trigger handles owner_id, name, cnpj, representative_name, representative_cpf, email, status, accounting_email)
    const { error: companyError } = await supabaseAdmin
      .from('companies')
      .update({
        phone,
        whatsapp,
        street,
        number,
        neighborhood,
        city,
        state,
        zip_code
      })
      .eq('owner_id', newUser.id)

    if (companyError) console.error("[create-company-user] Erro ao atualizar detalhes da empresa:", companyError)

    return new Response(JSON.stringify({ 
      success: true, 
      userId: newUser.id
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