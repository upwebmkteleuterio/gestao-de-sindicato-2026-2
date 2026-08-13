import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { createAsaasBoleto } from '../_shared/asaas.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const dateWithConfiguredDay = (date: Date, day: number) => {
  const result = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(day, lastDay))
  return result
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const cronSecret = Deno.env.get('ASAAS_CRON_SECRET') ?? ''
    if (!cronSecret || req.headers.get('x-cron-secret') !== cronSecret) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    console.log('[generate-invoices] Iniciando geração configurável de faturas')

    const { data: settings, error: settingsError } = await supabase
      .from('financial_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    if (settingsError) throw settingsError

    const generationDaysBefore = Math.max(0, Number(settings.generation_days_before ?? 5))
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    let dueDate = dateWithConfiguredDay(todayStart, Number(settings.due_day ?? 25))
    let generationDate = new Date(dueDate)
    generationDate.setDate(generationDate.getDate() - generationDaysBefore)

    if (generationDate < todayStart) {
      dueDate = dateWithConfiguredDay(new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 1), Number(settings.due_day ?? 25))
      generationDate = new Date(dueDate)
      generationDate.setDate(generationDate.getDate() - generationDaysBefore)
    }

    if (generationDate.toISOString().split('T')[0] !== todayStart.toISOString().split('T')[0]) {
      return new Response(JSON.stringify({ message: 'Hoje não é o dia programado para geração', generationDate: generationDate.toISOString().split('T')[0] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    const dueDateString = dueDate.toISOString().split('T')[0]
    const month = dueDate.getMonth() + 1
    const year = dueDate.getFullYear()
    const monthYear = `${month.toString().padStart(2, '0')}/${year}`
    const semestralMonths = [Number(settings.semestral_month_1 ?? 6), Number(settings.semestral_month_2 ?? 12)]
    const isSemiannual = semestralMonths.includes(month)
    const billingType = isSemiannual ? 'semestral' : 'mensal'

    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'Aprovado')
    if (companiesError) throw companiesError

    const results: Array<{ companyId: string, invoiceId: string, asaasPaymentId?: string, error?: string }> = []

    for (const company of companies ?? []) {
      try {
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('company_id', company.id)
          .eq('month_year', monthYear)
          .maybeSingle()

        if (existingInvoice?.asaas_payment_id) {
          results.push({ companyId: company.id, invoiceId: existingInvoice.id, asaasPaymentId: existingInvoice.asaas_payment_id })
          continue
        }

        if (existingInvoice) {
          const { customer, payment } = await createAsaasBoleto({ company, invoice: existingInvoice })
          const { error: retryUpdateError } = await supabase.from('invoices').update({
            asaas_customer_id: customer.id,
            asaas_payment_id: payment.id,
            asaas_status: payment.status,
            bank_slip_url: payment.bankSlipUrl ?? payment.invoiceUrl,
            identification_field: payment.identificationField,
            payment_updated_at: new Date().toISOString(),
          }).eq('id', existingInvoice.id)
          if (retryUpdateError) throw retryUpdateError
          results.push({ companyId: company.id, invoiceId: existingInvoice.id, asaasPaymentId: payment.id })
          continue
        }

        const { count, error: countError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .eq('status', 'Associado')
          .eq('contract_status', 'Ativo')
        if (countError) throw countError

        const associatedCount = count ?? 0
        const monthlyAmount = associatedCount * Number(settings.associate_fee)
        const totalAmount = isSemiannual ? monthlyAmount + Number(settings.semiannual_fee) : monthlyAmount
        const invoiceNumber = `FAT-${year}-${month.toString().padStart(2, '0')}-${company.id.substring(0, 4).toUpperCase()}`

        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            company_id: company.id,
            month_year: monthYear,
            amount: totalAmount,
            due_date: dueDateString,
            status: 'Pendente',
            associated_count: associatedCount,
            fee_value: Number(settings.associate_fee),
            billing_type: billingType,
            invoice_number: invoiceNumber,
            description: isSemiannual
              ? `Contribuição de ${associatedCount} associados + taxa semestral fixa`
              : `Contribuição de ${associatedCount} associados`,
          })
          .select()
          .single()
        if (invoiceError || !invoice) throw invoiceError ?? new Error('Fatura não criada')

        const { customer, payment } = await createAsaasBoleto({ company, invoice })
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            asaas_customer_id: customer.id,
            asaas_payment_id: payment.id,
            asaas_status: payment.status,
            bank_slip_url: payment.bankSlipUrl ?? payment.invoiceUrl,
            identification_field: payment.identificationField,
            payment_updated_at: new Date().toISOString(),
          })
          .eq('id', invoice.id)
        if (updateError) throw updateError

        results.push({ companyId: company.id, invoiceId: invoice.id, asaasPaymentId: payment.id })
        console.log(`[generate-invoices] Fatura e boleto criados para ${company.name}`)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        console.error(`[generate-invoices] Falha para empresa ${company.id}: ${message}`)
        results.push({ companyId: company.id, invoiceId: '', error: message })
      }
    }

    return new Response(JSON.stringify({
      message: 'Processamento concluído',
      cycle: monthYear,
      dueDate: dueDateString,
      billingType,
      generated: results.filter(result => result.invoiceId && result.asaasPaymentId).length,
      failed: results.filter(result => result.error).length,
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro crítico'
    console.error(`[generate-invoices] Erro crítico: ${message}`)
    return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})
