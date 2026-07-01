"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancials } from "@/hooks/useFinancials";
import { useSessionContext } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Receipt } from "lucide-react";

interface EditInvoiceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
}

const EditInvoiceStatusModal: React.FC<EditInvoiceStatusModalProps> = ({ isOpen, onClose, invoice }) => {
  const { updateInvoiceStatus } = useFinancials();
  const { user } = useSessionContext();
  const [newStatus, setNewStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (invoice) {
      setNewStatus(invoice.status);
    }
  }, [invoice]);

  const handleSave = async () => {
    if (!invoice || newStatus === invoice.status) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Atualiza o status da fatura definindo a origem como 'admin' se for pago
      await updateInvoiceStatus.mutateAsync({ 
        id: invoice.id, 
        status: newStatus,
        payment_origin: newStatus === 'Pago' ? 'admin' : null 
      });

      // 2. Auditoria
      await supabase.from('invoice_audit_logs').insert({
        invoice_id: invoice.id,
        changed_by: user?.id,
        old_status: invoice.status,
        new_status: newStatus,
        notes: "Alteração manual via painel administrativo"
      });

      onClose();
    } catch (error: any) {
      toast.error("Erro ao atualizar status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Receipt size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Editar Status da Fatura</DialogTitle>
              <DialogDescription>#{invoice.invoice_number || invoice.id.substring(0, 8)}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</p>
              <p className="text-lg font-black text-slate-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.amount)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimento</p>
              <p className="text-sm font-bold text-slate-700">{new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Novo Status:</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente (Em aberto)</SelectItem>
                <SelectItem value="Pago">Pago (Quitado)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
            <ShieldCheck className="text-amber-600 shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              <strong>Atenção:</strong> Ao marcar como pago aqui, a fatura exibirá o rótulo "Pago - Administração" para controle interno.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" className="h-11 rounded-xl" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 font-bold h-11 rounded-xl flex-1" 
            onClick={handleSave}
            disabled={isSubmitting || newStatus === invoice.status}
          >
            {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : "Salvar Alteração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditInvoiceStatusModal;