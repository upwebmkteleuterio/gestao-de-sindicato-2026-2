// src/components/admin/companies/CollectInvoicesModal.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Info, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendInvoiceEmail } from "@/utils/emailSender";
import { formatCurrency } from "@/utils/formatters";

interface CollectInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  companyEmail: string;
  accountingEmail: string;
  companyCnpj: string;
}

// Assuming a simple Invoice type for display
type Invoice = {
    id: string;
    amount: number;
    due_date: string;
    description: string;
};

const usePendingInvoices = (companyId: string, enabled: boolean) => {
    return useQuery({
        queryKey: ['pendingInvoices', companyId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('invoices')
                .select('id, amount, due_date, description')
                .eq('company_id', companyId)
                .eq('status', 'Pendente')
                .order('due_date', { ascending: true });

            if (error) throw error;
            return data as Invoice[];
        },
        enabled: enabled && !!companyId,
    });
};

const CollectInvoicesModal: React.FC<CollectInvoicesModalProps> = ({ 
  isOpen, 
  onClose, 
  companyId, 
  companyName,
  companyEmail,
  accountingEmail,
  companyCnpj
}) => {
  const { toast } = useToast();
  const { data: invoices, isLoading: isLoadingInvoices } = usePendingInvoices(companyId, isOpen);

  // State for email selection
  const [loginEmailSelected, setLoginEmailSelected] = useState(false);
  const [accountingEmailSelected, setAccountingEmailSelected] = useState(!!accountingEmail);

  // Mutation for sending the email
  const sendEmailMutation = useMutation({
    mutationFn: async (invoiceListHtml: string) => {
      const recipients: string[] = [];
      if (loginEmailSelected && companyEmail) recipients.push(companyEmail);
      if (accountingEmailSelected && accountingEmail) recipients.push(accountingEmail);

      if (recipients.length === 0) {
        throw new Error("Nenhum destinatário selecionado.");
      }

      const emailResult = await sendInvoiceEmail({
        templateName: 'cobranca_pendente',
        recipients: recipients,
        companyName: companyName,
        cnpj: companyCnpj,
        invoiceData: {
          invoiceList: invoiceListHtml,
        },
      });

      if (!emailResult.success) {
        throw new Error(emailResult.message);
      }
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "E-mail de cobrança disparado com sucesso.",
        className: "bg-black text-white [&>div]:text-green-400",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao disparar e-mail: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoices || invoices.length === 0) return;

    // 1. Format the invoice list into HTML
    const invoiceListHtml = invoices.map(inv => {
        const formattedAmount = formatCurrency(inv.amount);
        const formattedDueDate = new Date(inv.due_date).toLocaleDateString('pt-BR');
        return `<li>${formattedAmount} (Vencimento: ${formattedDueDate}) - ${inv.description || 'Fatura sem descrição'}</li>`;
    }).join('');

    // 2. Trigger email sending
    sendEmailMutation.mutate(invoiceListHtml);
  };

  const totalDebt = invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <Mail size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Disparar Cobrança de Faturas</DialogTitle>
              <DialogDescription>Envie um e-mail para {companyName} listando todas as pendências.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="bg-red-50 p-4 rounded-xl flex gap-3 items-start border border-red-100">
            <Info className="text-red-600 shrink-0" size={18} />
            <p className="text-xs text-red-800 leading-relaxed font-medium">
              O e-mail será enviado usando o template "Cobrança Pendente" configurado na área de administração.
            </p>
          </div>

          <div className="grid gap-4">
            <Label className="text-sm font-bold text-slate-700">Faturas Pendentes ({invoices?.length || 0})</Label>
            {isLoadingInvoices ? (
                <div className="flex justify-center items-center h-20">
                    <Loader2 className="animate-spin size-6 text-blue-600" />
                </div>
            ) : invoices && invoices.length > 0 ? (
                <div className="border rounded-xl p-4 max-h-48 overflow-y-auto space-y-2 bg-white">
                    <div className="flex justify-between font-bold text-sm border-b pb-1">
                        <span>Total:</span>
                        <span className="text-red-600">{formatCurrency(totalDebt)}</span>
                    </div>
                    {invoices.map((inv) => (
                        <div key={inv.id} className="flex justify-between text-sm text-slate-700">
                            <span className="truncate">{inv.description || 'Fatura'}</span>
                            <span className="font-mono text-xs text-right">
                                {formatCurrency(inv.amount)} ({new Date(inv.due_date).toLocaleDateString('pt-BR')})
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-4 border rounded-xl bg-slate-50 text-slate-500">
                    Nenhuma fatura pendente encontrada para esta empresa.
                </div>
            )}
          </div>

          {/* Email Selection UI */}
          <div className="grid gap-2 p-4 border rounded-xl bg-slate-50">
            <Label className="text-sm font-bold text-slate-700">Enviar e-mail de cobrança para:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="collect-accounting"
                  checked={accountingEmailSelected}
                  onCheckedChange={(checked) => setAccountingEmailSelected(!!checked)}
                  disabled={!accountingEmail}
                />
                <Label htmlFor="collect-accounting" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  E-mail da Contabilidade ({accountingEmail || 'Não disponível'})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="collect-login"
                  checked={loginEmailSelected}
                  onCheckedChange={(checked) => setLoginEmailSelected(!!checked)}
                  disabled={!companyEmail}
                />
                <Label htmlFor="collect-login" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  E-mail de Login ({companyEmail || 'Não disponível'})
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={onClose}>Cancelar</Button>
            <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700 font-bold h-11 rounded-xl flex-1" 
                disabled={sendEmailMutation.isPending || !invoices || invoices.length === 0 || (!loginEmailSelected && !accountingEmailSelected)}
            >
              {sendEmailMutation.isPending ? <Loader2 className="animate-spin size-4 mr-2" /> : <Mail size={16} className="mr-2" />}
              {sendEmailMutation.isPending ? "Enviando Cobrança..." : "Confirmar e Enviar Cobrança"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CollectInvoicesModal;