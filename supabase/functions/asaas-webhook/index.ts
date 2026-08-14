import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-access-token',
}

const statusForEvent = (event: string) => {
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') return 'Pago'
  if (event === 'PAYMENT_DELETED') return 'Cancelado'
  if (event === 'PAYMENT_REFUNDED' || event === 'PAYMENT_REFUND_REQUESTED') return 'Estornado'
  return null
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const expectedSecret = Deno.env.get('ASAAS_WEBHOOK_SECRET') ?? ''
    if (!expectedSecret || req.headers.get('asaas-access-token') !== expectedSecret) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const payload = await req.json()
    const eventId = payload.id
    const eventType = payload.event
    const payment = payload.payment
    if (!eventId || !eventType) return jsonResponse({ received: true })

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    const { data: existingEvent } = await supabase
      .from('asaas_webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle()

    if (existingEvent) return jsonResponse({ received: true, duplicate: true })

    if (payment?.id) {
      const nextStatus = statusForEvent(eventType)
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, company_id, invoice_number, amount, month_year')
        .eq('asaas_payment_id', payment.id)
        .maybeSingle()

      if (invoiceError) throw invoiceError

      if (invoice) {
        const update: Record<string, unknown> = {
          asaas_status: payment.status ?? eventType,
          payment_updated_at: new Date().toISOString(),
        }
        if (nextStatus) update.status = nextStatus
        if (nextStatus === 'Pago') update.payment_confirmed_at = payment.confirmedDate ?? payment.paymentDate ?? new Date().toISOString()
        if (payment.bankSlipUrl) update.bank_slip_url = payment.bankSlipUrl
        if (payment.identificationField) update.identification_field = payment.identificationField

        const { error: updateError } = await supabase.from('invoices').update(update).eq('id', invoice.id)
        if (updateError) throw updateError

        if (eventType === 'PAYMENT_RECEIVED' || eventType === 'PAYMENT_CONFIRMED') {
          const { data: category, error: categoryError } = await supabase
            .from('financial_categories')
            .select('id')
            .eq('code', 'asaas_receipt')
            .eq('kind', 'entrada')
            .eq('active', true)
            .maybeSingle()

          if (categoryError) throw categoryError
          if (!category) throw new Error('Categoria de entrada Asaas não configurada no banco')

          const paymentDate = String(payment.confirmedDate ?? payment.paymentDate ?? new Date().toISOString()).split('T')[0]
          const { error: transactionError } = await supabase
            .from('financial_transactions')
            .upsert({
              type: 'entrada',
              origin: 'asaas',
              title: `Pagamento de boleto ${invoice.invoice_number ?? invoice.id.slice(0, 8)}`,
              amount: Number(payment.value ?? invoice.amount),
              transaction_date: paymentDate,
              category_id: category.id,
              description: `Pagamento referente à competência ${invoice.month_year}`,
              company_id: invoice.company_id,
              invoice_id: invoice.id,
              asaas_payment_id: payment.id,
            }, { onConflict: 'asaas_payment_id', ignoreDuplicates: true })

          if (transactionError) throw transactionError
        }
      }
    }

    const { error: eventError } = await supabase.from('asaas_webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      asaas_payment_id: payment?.id ?? null,
      payload,
    })

    if (eventError?.code === '23505') return jsonResponse({ received: true, duplicate: true })
    if (eventError) throw eventError

    return jsonResponse({ received: true })
  } catch (error) {
    console.error('[asaas-webhook] Erro:', error)
    return jsonResponse({ error: error instanceof Error ? error.message : 'Erro no webhook' }, 500)
  }
})
