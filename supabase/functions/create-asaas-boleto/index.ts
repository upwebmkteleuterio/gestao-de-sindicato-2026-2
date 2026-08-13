import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { createAsaasBoleto } from '../_shared/asaas.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) throw new Error('Sessão inválida')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'administrador') return new Response(JSON.stringify({ error: 'Acesso restrito ao administrador' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { invoiceId } = await req.json()
    const { data: invoice, error: invoiceError } = await supabase.from('invoices').select('*, companies(*)').eq('id', invoiceId).single()
    if (invoiceError || !invoice) throw new Error('Fatura não encontrada')
    if (invoice.asaas_payment_id) return new Response(JSON.stringify({ invoice }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { customer, payment } = await createAsaasBoleto({ company: invoice.companies, invoice })
    const { data: updated, error: updateError } = await supabase.from('invoices').update({
      asaas_customer_id: customer.id,
      asaas_payment_id: payment.id,
      asaas_status: payment.status,
      bank_slip_url: payment.bankSlipUrl ?? payment.invoiceUrl,
      identification_field: payment.identificationField,
      payment_updated_at: new Date().toISOString(),
    }).eq('id', invoice.id).select().single()
    if (updateError) throw updateError

    return new Response(JSON.stringify({ invoice: updated }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('[create-asaas-boleto] Erro:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao criar boleto' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
