import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

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

// --- Hooks for Data Fetching and Mutation ---

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
      toast({
        title: "Sucesso",
        description: "Configurações de disparo atualizadas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar configurações: ${error.message}`,
        variant: "destructive",
      });
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
      toast({
        title: "Sucesso",
        description: "Template de e-mail atualizado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar template: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// --- Components ---

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

  if (isLoading) return <p>Carregando configurações...</p>;
  if (!settings) return <p>Erro ao carregar configurações.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Disparo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderPrefix">E-mail de Disparo (Prefixo)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="senderPrefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  required
                  className="flex-grow"
                />
                <span className="text-sm text-gray-500">@secbm.org.br</span>
              </div>
              <p className="text-xs text-gray-500">Apenas o valor antes do "@" pode ser alterado.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemUrl">URL do Sistema</Label>
              <Input
                id="systemUrl"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="https://seu-sistema.com.br"
              />
              <p className="text-xs text-gray-500">URL base usada no botão de retorno ao sistema nos e-mails.</p>
            </div>
          </div>
          
          <div className="space-y-2 max-w-md">
            <Label htmlFor="collectionTarget">Meta de Eficiência de Cobrança (%)</Label>
            <Input
              id="collectionTarget"
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              required
              min={0}
              max={100}
              className="max-w-[150px]"
            />
            <p className="text-xs text-gray-500">Valor percentual para a meta de cobrança exibida no Dashboard.</p>
          </div>

          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Salvando..." : "Salvar Configurações"}
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
    updateTemplate.mutate({
      id: template.id,
      subject: subject,
      body_html: body,
    });
  };

  const placeholders = template.name === 'fatura_retroativa'
    ? ['[NOME_EMPRESA]', '[CNPJ]', '[VALOR_FATURA]', '[DATA_VENCIMENTO]', '[URL_SISTEMA]']
    : ['[NOME_EMPRESA]', '[CNPJ]', '[LISTA_FATURAS]', '[URL_SISTEMA]'];

  // Function to replace placeholders with sample data for preview
  const getPreviewHtml = () => {
    let previewHtml = body;
    const sampleData = {
      '[NOME_EMPRESA]': 'Empresa Exemplo S.A.',
      '[CNPJ]': '12.345.678/0001-90',
      '[VALOR_FATURA]': 'R$ 1.500,00',
      '[DATA_VENCIMENTO]': '30/12/2024',
      '[URL_SISTEMA]': settings?.system_url || 'https://seu-sistema.com.br',
      '[LISTA_FATURAS]': '<li>Fatura 1: R$ 500,00 (Vencimento: 01/10/2024)</li><li>Fatura 2: R$ 1.000,00 (Vencimento: 01/11/2024)</li>',
    };

    for (const [key, value] of Object.entries(sampleData)) {
      previewHtml = previewHtml.replace(new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), value);
    }
    return previewHtml;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{template.title} ({template.name})</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`subject-${template.id}`}>Assunto do E-mail</Label>
              <Input
                id={`subject-${template.id}`}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            
            {/* Simplified Editor for Text/HTML */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor={`body-${template.id}`}>Corpo do E-mail (Visual)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                  className="text-xs"
                >
                  Ver Prévia Dinâmica
                </Button>
              </div>
              <RichTextEditor
                value={body}
                onChange={setBody}
                className="min-h-[300px]"
              />
              <p className="text-xs text-gray-500">
                Placeholders disponíveis: {placeholders.join(', ')}
              </p>
            </div>

            <Button type="submit" disabled={updateTemplate.isPending}>
              {updateTemplate.isPending ? "Salvando..." : "Salvar Template"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pré-visualização do E-mail ({template.name})</DialogTitle>
          </DialogHeader>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600 mb-3">
              **Esta pré-visualização usa dados de exemplo e a URL do sistema configurada.**
            </p>
            <div className="bg-white p-4 shadow-lg rounded-lg" dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EmailTemplates = () => {
  const { data: templates, isLoading: templatesLoading } = useEmailTemplates();

  if (templatesLoading) return <p>Carregando templates...</p>;

  const retroativaTemplate = templates?.find(t => t.name === 'fatura_retroativa');
  const pendenteTemplate = templates?.find(t => t.name === 'cobranca_pendente');

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Email e Templates</h1>
      
      <SystemConfigForm />

      <Card>
        <CardHeader>
          <CardTitle>Templates de E-mail</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="retroativa">
            <TabsList>
              <TabsTrigger value="retroativa">Fatura Retroativa</TabsTrigger>
              <TabsTrigger value="pendente">Cobrança Pendente</TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <TabsContent value="retroativa">
                {retroativaTemplate ? (
                  <TemplateEditor template={retroativaTemplate} />
                ) : (
                  <p>Template 'fatura_retroativa' não encontrado.</p>
                )}
              </TabsContent>
              <TabsContent value="pendente">
                {pendenteTemplate ? (
                  <TemplateEditor template={pendenteTemplate} />
                ) : (
                  <p>Template 'cobranca_pendente' não encontrado.</p>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplates;