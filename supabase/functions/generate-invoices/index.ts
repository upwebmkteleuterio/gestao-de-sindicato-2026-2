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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log("[generate-invoices] Iniciando geração de faturas...");

    // 1. Buscar configurações financeiras atuais
    const { data: settings, error: settingsError } = await supabase
      .from('financial_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (settingsError) throw settingsError;

    // 2. Determinar tipo de cobrança (Junho/Dezembro = Semestral, outros = Mensal)
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    const isSemiannual = currentMonth === 6 || currentMonth === 12;
    const billingType = isSemiannual ? 'semestral' : 'mensal';
    const feeValue = isSemiannual ? settings.semiannual_fee : settings.associate_fee;
    const monthYear = `${currentMonth.toString().padStart(2, '0')}/${currentYear}`;

    console.log(`[generate-invoices] Ciclo: ${monthYear}, Tipo: ${billingType}, Valor Taxa: ${feeValue}`);

    // 3. Buscar todas as empresas ativas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('status', 'Aprovado');

    if (companiesError) throw companiesError;

    const results = [];

    for (const company of companies) {
      // 4. Contar funcionários associados desta empresa
      const { count, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'Associado')
        .eq('contract_status', 'Ativo');

      if (countError) {
        console.error(`[generate-invoices] Erro ao contar funcionários para ${company.name}:`, countError);
        continue;
      }

      const associatedCount = count || 0;
      const totalAmount = associatedCount * feeValue;

      // 5. Verificar se já existe fatura para este mês para evitar duplicidade
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('company_id', company.id)
        .eq('month_year', monthYear)
        .maybeSingle();

      if (existingInvoice) {
        console.log(`[generate-invoices] Fatura já existe para ${company.name} em ${monthYear}. Pulando.`);
        continue;
      }

      // 6. Criar fatura com Snapshot
      const invoiceNumber = `FAT-${currentYear}-${currentMonth.toString().padStart(2, '0')}-${company.id.substring(0, 4).toUpperCase()}`;
      
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          company_id: company.id,
          month_year: monthYear,
          amount: totalAmount,
          due_date: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0], // Último dia do mês
          status: 'Pendente',
          associated_count: associatedCount,
          fee_value: feeValue,
          billing_type: billingType,
          invoice_number: invoiceNumber
        })
        .select()
        .single();

      if (invoiceError) {
        console.error(`[generate-invoices] Erro ao criar fatura para ${company.name}:`, invoiceError);
      } else {
        results.push(newInvoice);
        console.log(`[generate-invoices] Fatura gerada para ${company.name}: ${totalAmount}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Processamento concluído', 
        generated: results.length,
        cycle: monthYear 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('[generate-invoices] Erro crítico:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
