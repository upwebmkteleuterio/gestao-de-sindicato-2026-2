"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useApprovals } from "@/hooks/useApprovals";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Check, X, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ApprovalDetailsDrawerProps {
  selectedRequest: any | null;
  onClose: () => void;
}

const ApprovalDetailsDrawer: React.FC<ApprovalDetailsDrawerProps> = ({ selectedRequest, onClose }) => {
  const { updateStatus } = useApprovals();
  const [displayData, setDisplayData] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [actionType, setActionType] = useState<'approving' | 'rejecting' | null>(null);

  // Busca o último log de alteração para comparar
  const { data: lastLog } = useQuery({
    queryKey: ["audit-log", selectedRequest?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_audit_logs")
        .select("*")
        .eq("company_id", selectedRequest?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRequest?.id
  });

  useEffect(() => {
    if (selectedRequest) {
      setDisplayData(selectedRequest);
      setActionType(null);
      setRejectionReason("");
      setShowRejectionInput(false);
    }
  }, [selectedRequest]);

  const handleApprove = async () => {
    if (!displayData) return;
    setActionType('approving');
    await updateStatus.mutateAsync({ id: displayData.id, status: 'approved' });
    onClose();
  };

  const handleReject = async () => {
    if (!showRejectionInput) {
      setShowRejectionInput(true);
      return;
    }
    if (!rejectionReason) return;
    
    setActionType('rejecting');
    await updateStatus.mutateAsync({ id: displayData.id, status: 'rejected', reason: rejectionReason });
    onClose();
  };

  if (!displayData) return null;

  // Função para comparar campos e mostrar o que mudou
  const DiffField = ({ label, field }: { label: string, field: string }) => {
    const newVal = displayData[field];
    const oldVal = lastLog?.old_data?.[field];
    const hasChanged = oldVal !== undefined && oldVal !== newVal;

    return (
      <div className={cn("p-3 rounded-lg border", hasChanged ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100")}>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex flex-col gap-1">
          {hasChanged && (
            <p className="text-xs text-red-500 line-through opacity-60 font-medium">{oldVal || "(Vazio)"}</p>
          )}
          <p className={cn("text-sm font-bold", hasChanged ? "text-amber-700" : "text-slate-900")}>
            {newVal || "---"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={cn("fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300", selectedRequest ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} onClick={onClose} />

      <div className={cn("fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[70] border-l border-slate-200 flex flex-col transition-transform duration-500 ease-in-out", selectedRequest ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg uppercase">{displayData.name?.substring(0, 2)}</div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{displayData.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Solicitação de Alteração Cadastral</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {lastLog && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-amber-600 shrink-0" size={20} />
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Campos destacados:</strong> A empresa alterou informações que já haviam sido aprovadas anteriormente. Verifique os valores riscados.
              </p>
            </div>
          )}

          <section className="grid grid-cols-2 gap-4">
            <DiffField label="Razão Social" field="name" />
            <DiffField label="CNPJ" field="cnpj" />
            <div className="col-span-2">
              <DiffField label="Email Financeiro" field="email" />
            </div>
            <DiffField label="Telefone" field="phone" />
            <DiffField label="WhatsApp" field="whatsapp" />
          </section>

          <section className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Localização</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2"><DiffField label="Rua" field="street" /></div>
              <DiffField label="Número" field="number" />
              <DiffField label="Bairro" field="neighborhood" />
              <DiffField label="Cidade" field="city" />
              <DiffField label="Estado" field="state" />
              <div className="col-span-2"><DiffField label="CEP" field="zip_code" /></div>
            </div>
          </section>

          {showRejectionInput && (
            <section className="p-6 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-bottom-2">
              <h4 className="text-sm font-black text-red-700 uppercase mb-3">Motivo da Recusa</h4>
              <Textarea 
                placeholder="Explique para a empresa por que os dados foram recusados..."
                className="bg-white border-red-200 focus:ring-red-500"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <p className="text-[10px] text-red-500 mt-2 font-bold uppercase italic">* Este texto será lido pelo gestor da empresa.</p>
            </section>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-white grid grid-cols-2 gap-4">
          <button 
            onClick={handleReject}
            disabled={actionType === 'approving'}
            className={cn(
              "flex items-center justify-center gap-2 h-14 rounded-2xl border font-black uppercase text-xs tracking-widest transition-all",
              showRejectionInput ? "bg-red-600 text-white border-red-700" : "border-red-200 text-red-600 hover:bg-red-50"
            )}
          >
            {actionType === 'rejecting' ? <Loader2 className="animate-spin" /> : <>{showRejectionInput ? "Confirmar Recusa" : <><X size={18} /> Recusar</>}</>}
          </button>
          
          {!showRejectionInput && (
            <button 
              onClick={handleApprove}
              disabled={actionType === 'rejecting'}
              className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              {actionType === 'approving' ? <Loader2 className="animate-spin" /> : <><Check size={18} /> Aprovar</>}
            </button>
          )}

          {showRejectionInput && (
            <button 
              onClick={() => setShowRejectionInput(false)}
              className="flex items-center justify-center gap-2 h-14 rounded-2xl border border-slate-200 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ApprovalDetailsDrawer;