import { supabase } from "@/integrations/supabase/client";

interface SendEmailParams {
  templateName: 'fatura_retroativa' | 'cobranca_pendente';
  recipients: string[];
  companyName: string;
  cnpj: string;
  invoiceData: {
    amount?: number; // For retroativa
    dueDate?: string; // For retroativa
    invoiceList?: string; // For cobranca_pendente (HTML list)
  };
}

export async function sendInvoiceEmail({
  templateName,
  recipients,
  companyName,
  cnpj,
  invoiceData,
}: SendEmailParams): Promise<{ success: boolean; message: string }> {
  if (recipients.length === 0) {
    return { success: true, message: "Nenhum destinatário selecionado. E-mail não enviado." };
  }

  try {
    // 1. Fetch Template and System Settings
    const { data: templates, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, body_html')
      .eq('name', templateName)
      .single();

    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('sender_email_prefix, system_url')
      .single();

    if (templateError || !templates) {
      console.error("Erro ao buscar template:", templateError);
      throw new Error("Template de e-mail não encontrado.");
    }
    if (settingsError || !settings) {
      console.error("Erro ao buscar configurações de sistema:", settingsError);
      throw new Error("Configurações de sistema não encontradas.");
    }

    let subject = templates.subject.replace('[CNPJ]', cnpj);
    let htmlBody = templates.body_html
      .replace('[NOME_EMPRESA]', companyName)
      .replace('[CNPJ]', cnpj)
      .replace('[URL_SISTEMA]', settings.system_url);

    // 2. Replace specific placeholders
    if (templateName === 'fatura_retroativa') {
      const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoiceData.amount || 0);
      const formattedDueDate = invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('pt-BR') : 'N/A';
      
      htmlBody = htmlBody
        .replace('[VALOR_FATURA]', formattedAmount)
        .replace('[DATA_VENCIMENTO]', formattedDueDate);
    } else if (templateName === 'cobranca_pendente') {
      htmlBody = htmlBody.replace('[LISTA_FATURAS]', invoiceData.invoiceList || '<li>Nenhuma fatura listada.</li>');
    }

    // 3. Call Edge Function
    const { data, error: edgeError } = await supabase.functions.invoke('send-email', {
      body: {
        to: recipients,
        subject: subject,
        html: htmlBody,
        sender_email_prefix: settings.sender_email_prefix,
      },
    });

    if (edgeError) {
      console.error("Erro ao chamar Edge Function:", edgeError);
      throw new Error(`Falha no disparo de e-mail: ${edgeError.message}`);
    }
    
    // Check for error response from the Edge Function itself
    if (data && data.error) {
        console.error("Erro retornado pela Edge Function:", data.error);
        throw new Error(`Falha no disparo de e-mail: ${data.error.message || data.error}`);
    }

    return { success: true, message: "E-mail disparado com sucesso." };

  } catch (error) {
    console.error("Erro no sendInvoiceEmail:", error);
    return { success: false, message: error.message || "Erro desconhecido ao enviar e-mail." };
  }
}