"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAgenda } from "@/hooks/useAgenda";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SlotDetailsModalProps {
  slot: any | null;
  onClose: () => void;
}

const SlotDetailsModal: React.FC<SlotDetailsModalProps> = ({ slot, onClose }) => {
  const { deleteSlot, bookSlot } = useAgenda();

  if (!slot) return null;

  const isLivre = slot.status === "Livre" || !slot.status;
  const isMarcado = slot.status === "Marcado";
  const isConfirmado = slot.status === "Confirmado";

  const handleDelete = async () => {
    if (!isLivre) {
      toast.error("Você precisa cancelar o agendamento antes de excluir este horário da agenda.");
      return;
    }
    await deleteSlot.mutateAsync(slot.id);
    onClose();
  };

  const handleCancel = async () => {
    // Para cancelar, voltamos o status para 'Livre' e limpamos os vínculos
    await bookSlot.mutateAsync({
      id: slot.id,
      status: 'Livre',
      company_id: null,
      employee_id: null,
      protocol: null,
      type: slot.type
    });
    toast.success("Agendamento cancelado com sucesso.");
    onClose();
  };

  const handleConfirm = async () => {
    // Confirmar apenas muda o status
    await bookSlot.mutateAsync({
      id: slot.id,
      status: 'Confirmado',
      company_id: slot.company_id,
      employee_id: slot.employee_id,
      protocol: slot.protocol,
      type: slot.type
    });
    toast.success("Horário confirmado com sucesso!");
    onClose();
  };

  return (
    <Dialog open={!!slot} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
              isLivre ? "bg-slate-50 text-slate-500 border-slate-200" :
              isMarcado ? "bg-blue-50 text-blue-600 border-blue-200" :
              "bg-emerald-50 text-emerald-600 border-emerald-200"
            )}>
              {isLivre ? "Disponível" : isMarcado ? "Agendado" : "Confirmado"}
            </span>
            {!isLivre && slot.protocol && (
              <span className="text-[10px] font-bold text-slate-400">PROTOCOLO: #{slot.protocol}</span>
            )}
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">
            {slot.time} - {slot.agent}
          </DialogTitle>
          <DialogDescription>Gestão de agendamento de homologação</DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-8">
          {isLivre ? (
            <div className="bg-slate-50 rounded-xl p-6 border border-dashed border-slate-300 text-center">
              <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">event_available</span>
              <p className="text-sm font-bold text-slate-600">Este horário ainda não possui solicitações.</p>
              <p className="text-xs text-slate-400 mt-1">Aguardando preenchimento via Portal Empresa.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Dados da Empresa</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Razão Social</p>
                    <p className="text-sm font-bold text-slate-900">{slot.companyName || "Empresa solicitante"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tipo</p>
                    <p className="text-sm font-bold text-slate-900">{slot.type || "Homologação"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Dados do Funcionário</h4>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Nome Completo</p>
                  <p className="text-sm font-bold text-blue-900">{slot.employeeName || "Funcionário"}</p>
                  <p className="text-xs text-blue-500 mt-1 font-mono">CPF: {slot.employeeCpf || "000.000.000-00"}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <div className="flex-1 flex gap-3">
            {isLivre && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-bold">
                    Excluir Horário
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir horário disponível?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso removerá este slot da agenda. Empresas não poderão mais agendar neste horário.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete} 
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleteSlot.isPending ? <Loader2 className="animate-spin" /> : "Confirmar Exclusão"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          {!isLivre && (
            <div className="flex gap-3 w-full sm:w-auto">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="font-bold">
                    Cancelar Agendamento
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deseja cancelar o agendamento?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Os dados da empresa e funcionário serão limpos e o horário voltará a ficar disponível para outros usuários.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleCancel} 
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {bookSlot.isPending ? <Loader2 className="animate-spin" /> : "Sim, Cancelar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {isMarcado && (
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                  onClick={handleConfirm}
                  disabled={bookSlot.isPending}
                >
                  {bookSlot.isPending ? <Loader2 className="animate-spin" /> : "Confirmar"}
                </Button>
              )}
            </div>
          )}
          
          <Button variant="secondary" className="font-bold" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SlotDetailsModal;