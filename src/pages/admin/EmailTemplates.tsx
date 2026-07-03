import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// --- Types ---
type SystemSettings = {
  id: string;
  sender_email_prefix: string;
  system_url: string;
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

  useEffect(() => {
    if (settings) {
      setPrefix(settings.sender_email_prefix);
      setUrl(settings.system_url);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      updateSettings.mutate({
        id: settings.id,
        sender_email_prefix: prefix,
        system_url: url,
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
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body_html);

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

  return (
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
          <div className="space-y-2">
            <Label htmlFor={`body-${template.id}`}>Corpo do E-mail (HTML)</Label>
            <Textarea
              id={`body-${template.id}`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              required
              className="font-mono"
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