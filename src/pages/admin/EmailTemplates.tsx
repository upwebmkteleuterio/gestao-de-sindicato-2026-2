"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  Settings2, 
  FileText, 
  Send, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MailWarning,
  Trash2,
  RefreshCw,
  History,
  Inbox
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// --- Types ---
type SystemSettings = {
  id: string;
  sender_email_prefix: string;
  system_url: string;
  collection_efficiency_target: number;
};

type EmailTemplate = {
  id: string;
  name: string;
  title: string;
  subject: string;
  body_html: string;
};

// --- Hooks ---

const useSystemSettings = () => {
  return useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("system_settings").select("*").single();
      if (error) throw new Error(error.message);
      return data as SystemSettings;
    },
  });
};

const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (settings: Partial<SystemSettings> & { id: string }) => {
      const { data, error } = await supabase.from("system_settings").update(settings).eq("id", settings.id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
      toast({ title: "Sucesso", description: "Configurações atualizadas." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
};

const useEmailTemplates = () => {
  return useQuery({
    queryKey: ["emailTemplates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_templates").select("*");
      if (error) throw new Error(error.message);
      return data as EmailTemplate[];
    },
  });
};

const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (template: Partial<EmailTemplate> & { id: string }) => {
      const { data, error } = await supabase.from("email_templates").update(template).eq("id", template.id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      toast({ title: "Sucesso", description: "Template atualizado." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
};

// --- Sub-components ---

const SystemConfigForm = () => {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettings = useUpdateSystemSettings();
  const [prefix, setPrefix] = useState("");
  const [url, setUrl] = useState("");
  const [target, setTarget] = useState(85);

  useEffect(() => {
    if (settings) {
      setPrefix(settings.sender_email_prefix);
      setUrl(settings.system_url);
      setTarget(settings.collection_efficiency_target);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      updateSettings.mutate({
        id: settings.id,
        sender_email_prefix: prefix,
        system_url: url,
        collection_efficiency_target: target,
      });
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Settings2 size={20} className="text-blue-600" />
          Configurações de Disparo
        </CardTitle>
        <CardDescription>Defina os parâmetros técnicos para o envio de e-mails do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="senderPrefix">E-mail de Disparo (Prefixo)</Label>
              <div className="flex items-center">
                <Input
                  id="senderPrefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="rounded-r-none border-r-0"
                />
                <div className="h-10 px-3 flex items-center bg-slate-100 border border-slate-200 rounded-r-md text-slate-500 text-sm font-medium">
                  @secbm.org.br
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemUrl">URL do Sistema</Label>
              <Input
                id="systemUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://sistema.secbm.org.br"
              />
            </div>
          </div>
          
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="collectionTarget">Meta de Eficiência (%)</Label>
            <Input
              id="collectionTarget"
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
            />
          </div>

          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
            Salvar Configurações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const TemplateEditor = ({ template }: { template: EmailTemplate }) => {
  const updateTemplate = useUpdateEmailTemplate();
  const { data: settings } = useSystemSettings();
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body_html);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    setSubject(template.subject);
    setBody(template.body_html);
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTemplate.mutate({ id: template.id, subject, body_html: body });
  };

  const placeholders = template.name === 'fatura_retroativa'
    ? ['[NOME_EMPRESA]', '[CNPJ]', '[VALOR_FATURA]', '[DATA_VENCIMENTO]', '[URL_SISTEMA]']
    : ['[NOME_EMPRESA]', '[CNPJ]', '[LISTA_FATURAS]', '[URL_SISTEMA]'];

  const getPreviewHtml = () => {
    let previewHtml = body;
    const sampleData = {
      '[NOME_EMPRESA]': 'Empresa Exemplo S.A.',
      '[CNPJ]': '12.345.678/0001-90',
      '[VALOR_FATURA]': 'R$ 1.500,00',
      '[DATA_VENCIMENTO]': '30/12/2024',
      '[URL_SISTEMA]': settings?.system_url || 'https://seu-sistema.com.br',
      '[LISTA_FATURAS]': '<li>Fatura Out/24: R$ 500,00</li><li>Fatura Nov/24: R$ 500,00</li>',
    };

    for (const [key, value] of Object.entries(sampleData)) {
      previewHtml = previewHtml.replace(new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), value);
    }
    return previewHtml;
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold">{template.title}</CardTitle>
              <CardDescription>Código interno: {template.name}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>Visualizar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Assunto do E-mail</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo do E-mail</Label>
              <RichTextEditor value={body} onChange={setBody} className="min-h-[400px]" />
              <div className="flex flex-wrap gap-2 pt-2">
                {placeholders.map(p => (
                  <Badge key={p} variant="secondary" className="text-[10px] font-mono">{p}</Badge>
                ))}
              </div>
            </div>
            <Button type="submit" className="bg-blue-600" disabled={updateTemplate.isPending}>
              {updateTemplate.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
              Salvar Template
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Prévia do Template: {template.title}</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-6 shadow-inner rounded-xl border border-slate-100" dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const MassEmailPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeQueueTab, setActiveQueueTab] = useState<"pending" | "sent">("pending");
  
  const { data: overdueCount = 0, isLoading: isLoadingOverdue } = useQuery({
    queryKey: ["overdueInvoicesCount"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("overdue_invoices_view")
        .select("*", { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: queueItems = [] } = useQuery({
    queryKey: ["emailQueueList", activeQueueTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_queue")
        .select(`
          *,
          companies (name)
        `)
        .eq("status", activeQueueTab)
        .order(activeQueueTab === 'sent' ? 'sent_at' : 'created_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000
  });

  const { data: queueStats } = useQuery({
    queryKey: ["emailQueueStats"],
    queryFn: async () => {
      const { data: dailySent } = await supabase.rpc('get_daily_email_count');
      const { count: pending } = await supabase.from("email_queue").select("*", { count: 'exact', head: true }).eq("status", "pending");
      const { count: totalSent } = await supabase.from("email_queue").select("*", { count: 'exact', head: true }).eq("status", "sent");
      
      return {
        dailySent: dailySent || 0,
        pending: pending || 0,
        totalSent: totalSent || 0,
        limit: 100
      };
    },
    refetchInterval: 5000
  });

  const enqueueMutation = useMutation({
    mutationFn: async () => {
      const { data: overdue } = await supabase.from("overdue_invoices_view").select("*");
      if (!overdue || overdue.length === 0) throw new Error("Nenhuma fatura atrasada encontrada.");

      // Agrupar por empresa e determinar destinatário (Contabilidade > Empresa)
      const companyMap = new Map();
      overdue.forEach(item => {
        if (!companyMap.has(item.company_id)) {
          companyMap.set(item.company_id, {
            company_id: item.company_id,
            recipient_email: item.accounting_email || item.company_email,
            email_type: 'cobrança_atraso',
            status: 'pending'
          });
        }
      });

      const queueEntries = Array.from(companyMap.values());

      // Inserir na fila usando upsert com a nova constraint de company_id, email_type
      const { error } = await supabase.from("email_queue").upsert(queueEntries, {
        onConflict: 'company_id,email_type'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailQueueStats"] });
      queryClient.invalidateQueries({ queryKey: ["emailQueueList"] });
      toast({ title: "Fila Gerada", description: "As cobranças foram adicionadas à fila de processamento." });
    },
    onError: (err: any) => {
        toast({ title: "Erro ao gerar fila", description: err.message, variant: "destructive" });
    }
  });

  const clearQueueMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("email_queue").delete().eq('status', 'pending');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailQueueStats"] });
      queryClient.invalidateQueries({ queryKey: ["emailQueueList"] });
      toast({ title: "Fila Limpa", description: "Todos os envios pendentes foram removidos." });
    }
  });

  const processBatchManual = async () => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('https://syzhrxnnoncaftojlflv.supabase.co/functions/v1/process-email-queue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (!response.ok) throw new Error("Falha ao processar lote.");
      toast({ title: "Lote Processado", description: "Um lote de e-mails foi enviado com sucesso." });
      queryClient.invalidateQueries({ queryKey: ["emailQueueStats"] });
      queryClient.invalidateQueries({ queryKey: ["emailQueueList"] });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const dailyProgress = Math.min(((queueStats?.dailySent || 0) / 100) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest">Faturas em Atraso</CardDescription>
            <CardTitle className="text-3xl font-black text-slate-900">
              {isLoadingOverdue ? <Loader2 className="animate-spin size-6" /> : overdueCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Total de pendências com vencimento ultrapassado.</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest">
              Aguardando na Fila
              {queueStats?.pending > 0 && <span className="inline-flex w-4 animate-pulse">...</span>}
            </CardDescription>
            <CardTitle className="text-3xl font-black text-blue-600">{queueStats?.pending || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">E-mails prontos para envio em lotes.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total disparos hoje</CardDescription>
            <CardTitle className="text-3xl font-black">{queueStats?.dailySent || 0} <span className="text-lg text-slate-500 font-medium">/ 100</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={dailyProgress} className="h-2 bg-slate-800" />
            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
              <span className={queueStats?.dailySent >= 100 ? "text-amber-400" : "text-emerald-400"}>
                {queueStats?.dailySent >= 100 ? "Limite Atingido" : "Disponível"}
              </span>
              <span className="text-slate-500">Renovação: 00:00h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-100 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <MailWarning size={22} className="text-blue-600" />
            Iniciar Disparo de Cobrança em Massa
          </CardTitle>
          <CardDescription className="text-slate-600">
            Este processo identifica inadimplentes e agrupa faturas por empresa. O sistema respeita o limite diário enviando em lotes automáticos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20"
              onClick={() => enqueueMutation.mutate()}
              disabled={enqueueMutation.isPending || overdueCount === 0}
            >
              {enqueueMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
              Gerar Fila de Cobrança
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200 hover:bg-white bg-white shadow-sm"
              onClick={processBatchManual}
              disabled={isProcessing || (queueStats?.pending || 0) === 0 || queueStats?.dailySent >= 100}
            >
              {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw size={18} className="mr-2 text-blue-600" />}
              Processar Lote Agora
            </Button>

            <Button 
              size="lg" 
              variant="ghost"
              className="h-14 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => clearQueueMutation.mutate()}
              disabled={clearQueueMutation.isPending || (queueStats?.pending || 0) === 0}
            >
              {clearQueueMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Trash2 size={18} className="mr-2" />}
              Cancelar e Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Monitoramento com Abas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            Monitoramento de Disparos
          </h3>
          
          <Tabs value={activeQueueTab} onValueChange={(v) => setActiveQueueTab(v as any)} className="bg-slate-200/50 p-1 rounded-xl h-10">
            <TabsList className="bg-transparent gap-1">
              <TabsTrigger value="pending" className="rounded-lg px-4 h-8 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600">
                <Clock size={12} className="mr-1.5" />
                Aguardando ({queueStats?.pending || 0})
              </TabsTrigger>
              <TabsTrigger value="sent" className="rounded-lg px-4 h-8 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600">
                <CheckCircle2 size={12} className="mr-1.5" />
                Enviados ({queueStats?.totalSent || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Empresa</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Destinatário</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                  {activeQueueTab === 'sent' ? 'Data de Envio' : 'Adicionado em'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queueItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Inbox size={32} strokeWidth={1.5} />
                      <p className="text-sm font-medium">Nenhum registro encontrado nesta categoria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                queueItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-900">{(item.companies as any)?.name || 'Empresa'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">{item.recipient_email}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "font-black text-[9px] uppercase tracking-tighter",
                          item.status === 'sent' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                          item.status === 'pending' && "bg-blue-50 text-blue-600 border-blue-100",
                          item.status === 'failed' && "bg-red-50 text-red-600 border-red-100"
                        )}
                      >
                        {item.status === 'sent' ? 'Enviado' : item.status === 'pending' ? 'Pendente' : 'Falhou'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-[10px] font-medium text-slate-400">
                      {new Date(item.sent_at || item.created_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EmailTemplates = () => {
  const { data: templates, isLoading: templatesLoading } = useEmailTemplates();

  if (templatesLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin size-10 text-blue-600" /></div>;

  const retroativaTemplate = templates?.find(t => t.name === 'fatura_retroativa');
  const pendenteTemplate = templates?.find(t => t.name === 'cobranca_pendente');

  return (
    <div className="p-6 lg:p-10 bg-[#f8f9fc] min-h-full animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Email e Comunicação</h1>
          <p className="text-slate-500 mt-1">Gerencie templates, configurações e disparos automáticos.</p>
        </div>

        <Tabs defaultValue="mass" className="space-y-6">
          <TabsList className="bg-slate-200/50 p-1 rounded-2xl h-14">
            <TabsTrigger value="config" className="rounded-xl px-8 h-12 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
              <Settings2 size={16} className="mr-2" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-xl px-8 h-12 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
              <FileText size={16} className="mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="mass" className="rounded-xl px-8 h-12 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
              <Send size={16} className="mr-2" />
              Disparo em Massa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="animate-in slide-in-from-bottom-2 duration-300">
            <SystemConfigForm />
          </TabsContent>

          <TabsContent value="templates" className="animate-in slide-in-from-bottom-2 duration-300">
            <div className="grid gap-6">
              {retroativaTemplate && <TemplateEditor template={retroativaTemplate} />}
              {pendenteTemplate && <TemplateEditor template={pendenteTemplate} />}
            </div>
          </TabsContent>

          <TabsContent value="mass" className="animate-in slide-in-from-bottom-2 duration-300">
            <MassEmailPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailTemplates;