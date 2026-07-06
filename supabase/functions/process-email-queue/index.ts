import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const DAILY_LIMIT = 100
const BATCH_SIZE = 10

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

  try {
    console.log("[process-email-queue] Iniciando processamento...")

    // 1. Verificar quantos e-mails foram enviados HOJE
    const { data: dailySent, error: countError } = await supabase.rpc('get_daily_email_count')
    if (countError) throw countError

    if (dailySent >= DAILY_LIMIT) {
      console.log("[process-email-queue] Limite diário atingido. Encerrando.")
      return new Response(JSON.stringify({ message: "Daily limit reached", sent: dailySent }), { status: 200 })
    }

    // 2. Calcular espaço disponível no dia
    const availableToday = DAILY_LIMIT - dailySent
    const currentBatchSize = Math.min(BATCH_SIZE, availableToday)

    // 3. Pegar próximos itens da fila
    const { data: queueItems, error: queueError } = await supabase
      .from('email_queue')
      .select('*, companies(name, cnpj), invoices(amount, due_date, month_year)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(currentBatchSize)

    if (queueError) throw queueError
    if (!queueItems || queueItems.length === 0) {
      console.log("[process-email-queue] Fila vazia.")
      return new Response(JSON.stringify({ message: "Queue empty" }), { status: 200 })
    }

    // 4. Buscar Template de Cobrança e Configurações
    const { data: template } = await supabase.from('email_templates').select('*').eq('name', 'cobranca_pendente').single()
    const { data: settings } = await supabase.from('system_settings').select('*').single()

    if (!template || !settings) throw new Error("Template or Settings not found")

    // 5. Processar Lote
    const results = []
    for (const item of queueItems) {
      try {
        const from = `${settings.sender_email_prefix}@secbm.org.br`
        
        // Substituir Placeholders (Simplificado para o exemplo)
        let body = template.body_html
          .replace('[NOME_EMPRESA]', item.companies?.name || 'Empresa')
          .replace('[CNPJ]', item.companies?.cnpj || '')
          .replace('[VALOR_FATURA]', `R$ ${item.invoices?.amount}`)
          .replace('[DATA_VENCIMENTO]', new Date(item.invoices?.due_date).toLocaleDateString('pt-BR'))
          .replace('[URL_SISTEMA]', settings.system_url)

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: item.recipient_email,
            subject: template.subject,
            html: body,
          }),
        })

        if (res.ok) {
          await supabase.from('email_queue').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', item.id)
          results.push({ id: item.id, status: 'success' })
        } else {
          const errData = await res.json()
          await supabase.from('email_queue').update({ status: 'failed', error_message: JSON.stringify(errData) }).eq('id', item.id)
          results.push({ id: item.id, status: 'failed', error: errData })
        }
      } catch (e) {
        console.error(`[process-email-queue] Erro no item ${item.id}:`, e.message)
      }
    }

    return new Response(JSON.stringify({ message: "Batch processed", results }), { status: 200 })

  } catch (error) {
    console.error("[process-email-queue] Erro fatal:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
