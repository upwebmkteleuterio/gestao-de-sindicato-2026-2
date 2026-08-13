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
    if (!eventId || !eventType) return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    const { error: eventError } = await supabase.from('asaas_webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      asaas_payment_id: payment?.id ?? null,
      payload,
    })

    if (eventError?.code === '23505') return new Response(JSON.stringify({ received: true, duplicate: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    if (eventError) throw eventError

    if (payment?.id) {
      const nextStatus = statusForEvent(eventType)
      const update: Record<string, unknown> = {
        asaas_status: payment.status ?? eventType,
        payment_updated_at: new Date().toISOString(),
      }
      if (nextStatus) update.status = nextStatus
      if (nextStatus === 'Pago') update.payment_confirmed_at = payment.confirmedDate ?? payment.paymentDate ?? new Date().toISOString()
      if (payment.bankSlipUrl) update.bank_slip_url = payment.bankSlipUrl
      if (payment.identificationField) update.identification_field = payment.identificationField

      await supabase.from('invoices').update(update).eq('asaas_payment_id', payment.id)
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('[asaas-webhook] Erro:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro no webhook' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
