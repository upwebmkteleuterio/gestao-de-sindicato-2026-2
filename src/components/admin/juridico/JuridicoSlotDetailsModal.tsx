"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useJuridico } from "@/hooks/useJuridico";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, User, Building2, CalendarDays, MessageSquare } from "lucide-react";

interface JuridicoSlotDetailsModalProps {
  slot: any | null;
  onClose: () => void;
}

const JuridicoSlotDetailsModal: React.FC<JuridicoSlotDetailsModalProps> = ({ slot, onClose }) => {
  const { updateSlot, deleteSlot } = useJuridico();

  if (!slot) return null;

  const isLivre = slot.status === "Livre" || !slot.status;
  const isMarcado = slot.status === "Marcado";
  const isConfirmado = slot.status === "Confirmado";

  const handleDelete = async () => {
    await deleteSlot.mutateAsync(slot.id);
    onClose();
  };

  const handleConfirm = async () => {
    await updateSlot.mutateAsync({ id: slot.id, status: "Confirmado" });
    toast.success("Atendimento jurídico confirmado!");
    onClose();
  };

  return (
    <Dialog open={!!slot} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b border-slate-50">
          <div className="flex items-center gap-3 mb-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest",
              isLivre ? "bg-slate-50 text-slate-500 border-slate-200" : 
              isConfirmado ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              "bg-indigo-50 text-indigo-600 border-indigo-200"
            )}>
              {isLivre ? "Livre" : isConfirmado ? "Confirmado" : "Agendado"}
            </span>
            {!isLivre && slot.protocol && (
              <span className="text-[10px] font-bold text-slate-400">PROTOCOLO: #{slot.protocol}</span>
            )}
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">{slot.time} - {slot.agent}</DialogTitle>
          <DialogDescription>Gestão de consulta jurídica</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {isLivre ? (
            <div className="bg-slate-50 rounded-xl p-8 border border-dashed border-slate-300 text-center">
              <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">event_available</span>
              <p className="text-sm font-bold text-slate-600">Este horário está disponível.</p>
              <p className="text-xs text-slate-400 mt-1">Aguardando agendamento via Portal do Funcionário.</p>
            </div>
          ) : (
            <>
              {/* Informações do Solicitante */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                  <User size={12} className="text-indigo-500" /> Dados do Solicitante
                </h4>
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-lg font-bold text-indigo-900">{slot.employeeName || "Funcionário"}</p>
                  <p className="text-xs text-indigo-500 mt-0.5 font-mono">CPF: {slot.employee?.cpf || "---"}</p>
                </div>
              </div>

              {/* Informações da Empresa */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Building2 size={12} className="text-slate-400" /> Empresa Vinculada
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-sm font-bold text-slate-900">{slot.companyName || "Empresa não identificada"}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-medium mt-1">Colaborador Ativo</p>
                </div>
              </div>

              {/* Observações do Funcionário */}
              {slot.notes && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                    <MessageSquare size={12} className="text-slate-400" /> Motivo da Consulta
                  </h4>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{slot.notes}"</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="p-6 border-t border-slate-100 bg-white gap-2 sm:gap-0 flex-col sm:flex-row">
          <div className="flex-1 flex gap-2">
            {isLivre ? (
              <Button variant="destructive" className="font-bold px-6" onClick={handleDelete} disabled={deleteSlot.isPending}>
                {deleteSlot.isPending ? <Loader2 className="animate-spin size-4" /> : "Remover Horário"}
              </Button>
            ) : isMarcado && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold px-6" onClick={handleConfirm} disabled={updateSlot.isPending}>
                {updateSlot.isPending ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                Confirmar Atendimento
              </Button>
            )}
          </div>
          <Button variant="secondary" className="font-bold" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JuridicoSlotDetailsModal;