import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, Loader2 } from "lucide-react";

export default function EmailTest() {
  const [loading, setLoading] = useState(false);
  const [to, setTo] = useState("gestaosindical@saltonaweb.sh27.com.br");
  const [from, setFrom] = useState("onboarding@resend.dev");
  const [subject, setSubject] = useState("Teste de Envio de Email");
  const [html, setHtml] = useState("<p>Este é um email de teste enviado do sistema via Resend.</p>");

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`https://syzhrxnnoncaftojlflv.supabase.co/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          to,
          from,
          subject,
          html,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar email");
      }

      toast.success("Email enviado com sucesso!");
      console.log("Email sent result:", result);
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error(error.message || "Falha ao enviar email. Verifique se a chave da API está configurada.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teste de Emails</h1>
          <p className="text-slate-500 mt-1">
            Ferramenta para testar a integração com o Resend.
          </p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Mail className="h-5 w-5 text-blue-600" />
                Enviar Email de Teste
              </CardTitle>
              <CardDescription>
                Preencha os campos abaixo para testar o disparo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendTest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="from" className="font-bold text-slate-700">Remetente (E-mail configurado no Resend)</Label>
                  <Input
                    id="from"
                    type="text"
                    placeholder="Nome <contato@seudominio.com.br> ou apenas o e-mail"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to" className="font-bold text-slate-700">Destinatário</Label>
                  <Input
                    id="to"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject" className="font-bold text-slate-700">Assunto</Label>
                  <Input 
                    id="subject" 
                    placeholder="Assunto do email" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="html" className="font-bold text-slate-700">Conteúdo HTML</Label>
                  <Textarea 
                    id="html" 
                    placeholder="<p>Conteúdo do email</p>" 
                    className="min-h-[150px] rounded-xl"
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Teste
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-dashed border-slate-300">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">
                <strong>Nota:</strong> Certifique-se de configurar a Secret <code className="bg-slate-200 px-1 rounded text-slate-900 font-mono">RESEND_API_KEY</code> no painel do Supabase antes de realizar o teste.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}