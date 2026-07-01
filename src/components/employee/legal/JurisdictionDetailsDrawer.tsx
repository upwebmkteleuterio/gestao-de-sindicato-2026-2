"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { exportToCSV } from "@/utils/exportUtils";
import { useJuridico } from "@/hooks/useJuridico";
import { Loader2, Trash2, Download, X, Gavel, User, MessageSquare, Calendar } from "lucide-react";

interface JurisdictionDetailsDrawerProps {
  jurisdiction: any | null;
  onClose: () => void;
}

const JurisdictionDetailsDrawer: React.FC<JurisdictionDetailsDrawerProps> = ({ jurisdiction, onClose }) => {
  const { updateSlot } = useJuridico();

  const handleCancel = async () => {
    if (!jurisdiction) return;

    try {
      // Libera o horário no banco (volta para Livre e limpa vínculos)
      await updateSlot.mutateAsync({
        id: jurisdiction.id,
        status: "Livre",
        protocol: null,
        notes: null,
        employee_id: null
      });

      toast.success("Agendamento cancelado. O horário foi liberado na agenda.");
      onClose();
    } catch (error: any) {
      toast.error("Erro ao cancelar agendamento.");
    }
  };

  const handleExport = () => {
    if (jurisdiction) {
      exportToCSV([jurisdiction], `consulta_${jurisdiction.protocol}`);
      toast.success("Comprovante exportado.");
    }
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity duration-300",
          jurisdiction ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose}
      />

      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] border-l border-slate-200 flex flex-col transition-transform duration-300 ease-in-out",
        jurisdiction ? "translate-x-0" : "translate-x-full"
      )}>
        {jurisdiction && (
          <>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black">
                  <Gavel size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Consulta Jurídica</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase">Protocolo: #{jurisdiction.protocol}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Data e Horário</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Dia Marcado</p>
                    <p className="text-sm font-bold text-slate-900">{jurisdiction.scheduledDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Horário</p>
                    <p className="text-sm font-bold text-slate-900">{jurisdiction.scheduledTime}h</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Profissional</h4>
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <User size={18} className="text-blue-600" />
                  <p className="text-sm font-bold text-slate-900">{jurisdiction.agent}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Descrição do Problema</h4>
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{jurisdiction.problemDescription}"</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                <Calendar className="text-amber-600 shrink-0" size={18} />
                <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                  <strong>Atenção:</strong> Ao cancelar, seu horário será liberado imediatamente para outros associados e você deverá realizar um novo agendamento se precisar.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 grid grid-cols-2 gap-3">
              <button 
                onClick={handleCancel}
                disabled={updateSlot.isPending}
                className="flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {updateSlot.isPending ? <Loader2 className="animate-spin size-4" /> : <><Trash2 size={18} /> Cancelar</>}
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                <Download size={18} />
                Comprovante
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default JurisdictionDetailsDrawer;