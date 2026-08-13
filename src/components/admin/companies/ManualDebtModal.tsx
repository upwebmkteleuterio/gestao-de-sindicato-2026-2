import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useFinancials } from "@/hooks/useFinancials";
import { maskCurrency } from "@/utils/validationUtils";
import { Loader2, History, Info, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendInvoiceEmail } from "@/utils/emailSender";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ManualDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  companyEmail: string;
  accountingEmail: string;
  companyCnpj: string;
}

const ManualDebtModal: React.FC<ManualDebtModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyName,
  companyEmail,
  accountingEmail,
  companyCnpj
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // const { createManualInvoice } = useFinancials(companyId); // Mutation logic moved here
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    amount: "", // Guardamos a string formatada "R$ 0,00"
    description: "",
    due_date: new Date().toISOString().split('T')[0],
  });

  // ADD: Email selection state
  const [loginEmailSelected, setLoginEmailSelected] = useState(false);
  const [accountingEmailSelected, setAccountingEmailSelected] = useState(!!accountingEmail); // Default: accounting email marked if exists

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Aplicamos a máscara que já criamos no utils/validationUtils
    const maskedValue = maskCurrency(value);
    setFormData({ ...formData, amount: maskedValue });
  };

  // ADD: Mutation for invoice creation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceData,
          company_id: companyId,
          status: 'Pendente',
          billing_type: 'Ajuste de Saldo',
          invoice_number: `MIG-${Math.floor(1000 + Math.random() * 9000)}`
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', companyId] });
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    const numericValue = Number(formData.amount.replace(/\D/g, "")) / 100;
    const invoiceData = {
      amount: numericValue,
      description: formData.description,
      due_date: formData.due_date,
      month_year: "SALDO"
    };

    try {
      // 1. Create Invoice
      const createdInvoice = await createInvoiceMutation.mutateAsync(invoiceData);

      // 2. Create the real Asaas boleto without changing the existing notification flow
      const { error: boletoError } = await supabase.functions.invoke('create-asaas-boleto', {
        body: { invoiceId: createdInvoice.id }
      });
      if (boletoError) throw boletoError;
      
      // 3. Prepare and Send Email
      const recipients: string[] = [];
      if (loginEmailSelected && companyEmail) recipients.push(companyEmail);
      if (accountingEmailSelected && accountingEmail) recipients.push(accountingEmail);

      let emailMessage = "Dívida lançada com sucesso.";
      let emailSuccess = true;

      if (recipients.length > 0) {
        const emailResult = await sendInvoiceEmail({
          templateName: 'fatura_retroativa',
          recipients: recipients,
          companyName: companyName,
          cnpj: companyCnpj,
          invoiceData: {
            amount: numericValue,
            dueDate: formData.due_date,
          },
        });
        
        emailSuccess = emailResult.success;
        emailMessage = emailSuccess
          ? "Dívida lançada e e-mail disparado."
          : `Dívida lançada, mas falha ao disparar e-mail: ${emailResult.message}`;
      } else {
        emailMessage += " Nenhum e-mail de cobrança selecionado.";
      }

      // 3. Show Toast
      toast({
        title: emailSuccess ? "Sucesso" : "Atenção",
        description: emailMessage,
        className: emailSuccess ? "bg-black text-white [&>div]:text-green-400" : "bg-black text-white [&>div]:text-yellow-400",
      });

      setFormData({ amount: "", description: "", due_date: new Date().toISOString().split('T')[0] });
      onClose();

    } catch (error) {
      console.error("Erro ao lançar dívida:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar a dívida no banco. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <History size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Lançar Dívida Retroativa</DialogTitle>
              <DialogDescription>Migre débitos de planilhas antigas para {companyName}.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-sm font-bold text-slate-700">Valor Total da Dívida</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign size={18} className="text-slate-400" />
              </div>
              <Input
                id="amount"
                ref={inputRef}
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                className="pl-11 h-12 text-lg font-mono font-bold border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-right"
                value={formData.amount}
                onChange={handleAmountChange}
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">Digite apenas os números. O sistema cuidará da vírgula e pontos.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="due_date" className="text-sm font-bold text-slate-700">Data de Vencimento para Pagamento</Label>
            <Input
              id="due_date"
              type="date"
              className="h-11 border-slate-200"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-bold text-slate-700">Detalhamento das Pendências</Label>
            <Textarea
              id="description"
              placeholder="Ex: Ref. Contribuições de 2021 (R$ 500), 2022 (R$ 1.200) e 2023 (R$ 800)..."
              className="min-h-[120px] resize-none border-slate-200 focus:ring-blue-600/10"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
            <p className="text-[10px] text-slate-400 italic">Este detalhamento será visível para a empresa no portal.</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start border border-blue-100">
            <Info className="text-blue-600 shrink-0" size={18} />
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Este valor será somado à dívida total da empresa e aparecerá no portal dela como um "Ajuste de Saldo Anterior".
            </p>
          </div>
          
          {/* Email Selection UI */}
          <div className="grid gap-2 p-4 border rounded-xl bg-slate-50">
            <Label className="text-sm font-bold text-slate-700">Enviar e-mail de cobrança para:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-accounting"
                  checked={accountingEmailSelected}
                  onCheckedChange={(checked) => setAccountingEmailSelected(!!checked)}
                  disabled={!accountingEmail}
                />
                <Label htmlFor="email-accounting" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  E-mail da Contabilidade ({accountingEmail || 'Não disponível'})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-login"
                  checked={loginEmailSelected}
                  onCheckedChange={(checked) => setLoginEmailSelected(!!checked)}
                  disabled={!companyEmail}
                />
                <Label htmlFor="email-login" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  E-mail de Login ({companyEmail || 'Não disponível'})
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-bold h-11 rounded-xl flex-1" disabled={createInvoiceMutation.isPending}>
              {createInvoiceMutation.isPending ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
              Confirmar Lançamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualDebtModal;