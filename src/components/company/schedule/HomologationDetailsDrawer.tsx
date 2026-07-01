"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { exportToCSV } from "@/utils/exportUtils";
import { useAgenda } from "@/hooks/useAgenda";
import { useCompany } from "@/hooks/useCompany";
import { Loader2 } from "lucide-react";

interface HomologationDetailsDrawerProps {
  homologation: any | null;
  onClose: () => void;
  onViewEmployee: (cpf: string) => void;
}

const HomologationDetailsDrawer: React.FC<HomologationDetailsDrawerProps> = ({ homologation, onClose }) => {
  const { company } = useCompany();
  const { bookSlot } = useAgenda(company?.id);

  const handleCancelBooking = async () => {
    if (homologation) {
      try {
        await bookSlot.mutateAsync({
          id: homologation.id,
          status: 'Livre',
          company_id: null,
          employee_id: null,
          protocol: null,
          type: 'Homologação'
        });
        onClose();
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  };

  const handleExport = () => {
    if (homologation) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 800)),
        {
          loading: 'Gerando comprovante...',
          success: () => {
            exportToCSV([homologation], `agendamento_${homologation.protocol}`);
            return "Comprovante exportado com sucesso!";
          },
          error: 'Erro ao exportar.',
        }
      );
    }
  };

  const employee = homologation?.employee;

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity duration-300",
          homologation ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] border-l border-slate-200 flex flex-col transition-transform duration-300 ease-in-out",
        homologation ? "translate-x-0" : "translate-x-full"
      )}>
        {homologation && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black">
                  {homologation.employeeName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{homologation.employeeName}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase">Protocolo: #{homologation.protocol}</p>
                </div>
              </div>
              <button 
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" 
                onClick={onClose}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {/* DETALHES DO AGENDAMENTO */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Detalhes do Agendamento</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Data Agendada</p>
                    <p className="text-sm font-bold text-slate-900">{homologation.scheduledDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Horário</p>
                    <p className="text-sm font-bold text-slate-900">{homologation.scheduledTime}h</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Agente</p>
                    <p className="text-sm font-bold text-slate-900">{homologation.agent}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                      {homologation.status === 'Marcado' ? 'Agendado' : homologation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* INFORMAÇÕES COMPLETAS DO FUNCIONÁRIO */}
              {employee && (
                <>
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Dados do Funcionário</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">CPF</p>
                        <p className="text-sm font-bold text-slate-900">{employee.cpf}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Estado Civil</p>
                        <p className="text-sm font-bold text-slate-900">{employee.marital_status || "---"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Cargo</p>
                        <p className="text-sm font-bold text-slate-900">{employee.role}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Salário</p>
                        <p className="text-sm font-bold text-slate-900">{employee.salary ? `R$ ${employee.salary}` : "---"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Admissão</p>
                        <p className="text-sm font-bold text-slate-900">{employee.admission_date ? new Date(employee.admission_date).toLocaleDateString() : "---"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Endereço Residencial</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-sm font-bold text-slate-900">
                        {employee.street}{employee.number ? `, ${employee.number}` : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {employee.neighborhood} - {employee.city}/{employee.state}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">CEP: {employee.zip_code || "---"}</p>
                    </div>
                  </div>
                </>
              )}

              {/* HISTÓRICO */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Histórico</h4>
                <div className="relative pl-4 border-l border-slate-200 space-y-4">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-blue-600 border-2 border-white"></span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Criado em {homologation.createdAt}</p>
                    <p className="text-xs text-slate-900 font-medium">Agendamento realizado via Portal Empresa.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 grid grid-cols-2 gap-3">
              <button 
                onClick={handleCancelBooking}
                disabled={bookSlot.isPending}
                className="flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {bookSlot.isPending ? <Loader2 className="animate-spin size-5" /> : <><span className="material-symbols-outlined text-[20px]">delete</span> Remover</>}
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Exportar
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default HomologationDetailsDrawer;