"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  Briefcase, 
  MapPin, 
  History, 
  FileText, 
  X, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Users,
  Trash2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { maskCPF, maskCEP } from "@/utils/validationUtils";
import { useEmployees } from "@/hooks/useEmployees";
import { useCompany } from "@/hooks/useCompany";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EmployeeDetailsDrawerProps {
  employee: any | null;
  onClose: () => void;
  onEdit: (employee: any) => void;
}

const EmployeeDetailsDrawer: React.FC<EmployeeDetailsDrawerProps> = ({ employee, onClose, onEdit }) => {
  const { company } = useCompany();
  const { deleteEmployee } = useEmployees(company?.id);
  const [displayEmployee, setDisplayEmployee] = useState<any | null>(null);

  // Busca o histórico de agendamentos
  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["employee-history-portal", employee?.id],
    queryFn: async () => {
      if (!employee?.id) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("employee_id", employee.id)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!employee?.id,
  });

  // Busca os dependentes
  const { data: dependents = [], isLoading: isLoadingDependents } = useQuery({
    queryKey: ["employee-dependents", employee?.id],
    queryFn: async () => {
      if (!employee?.id) return [];
      const { data, error } = await supabase
        .from("employee_dependents")
        .select("*")
        .eq("employee_id", employee.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!employee?.id,
  });

  useEffect(() => {
    if (employee) {
      setDisplayEmployee(employee);
    }
  }, [employee]);

  const handleDelete = async () => {
    if (!displayEmployee) return;
    await deleteEmployee.mutateAsync(displayEmployee.id);
    onClose();
  };

  if (!displayEmployee) return null;

  const DetailItem = ({ label, value }: { label: string, value?: string }) => (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value || "---"}</p>
    </div>
  );

  const hasHistory = history.length > 0;

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[30] transition-opacity duration-300",
          employee ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose}
      />

      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-[40] border-l border-slate-200 flex flex-col transition-transform duration-500 ease-in-out",
        employee ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg uppercase">
              {displayEmployee.name.substring(0, 2)}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{displayEmployee.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">CPF: {maskCPF(displayEmployee.cpf || "")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          {/* Dados Pessoais */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2">
              <User size={18} className="text-blue-600" />
              <h4 className="text-xs font-black uppercase tracking-widest">Informações Pessoais</h4>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <DetailItem label="Nome da Mãe" value={displayEmployee.mother_name} />
              <DetailItem label="Estado Civil" value={displayEmployee.marital_status} />
              <DetailItem label="Naturalidade" value={displayEmployee.birth_place} />
              <DetailItem label="E-mail" value={displayEmployee.email} />
            </div>
          </section>

          {/* Dependentes */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2">
              <Users size={18} className="text-blue-600" />
              <h4 className="text-xs font-black uppercase tracking-widest">Dependentes ({dependents.length})</h4>
            </div>
            {isLoadingDependents ? (
              <div className="flex justify-center py-4"><Clock className="animate-spin text-slate-300" /></div>
            ) : dependents.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {dependents.map((dep: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{dep.name}</p>
                      <p className="text-xs text-slate-500 font-mono">CPF: {maskCPF(dep.cpf)}</p>
                    </div>
                    <div className="size-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <User size={14} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                <p className="text-xs text-slate-400 font-medium italic">Nenhum dependente cadastrado.</p>
              </div>
            )}
          </section>

          {/* Dados Profissionais */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2">
              <Briefcase size={18} className="text-blue-600" />
              <h4 className="text-xs font-black uppercase tracking-widest">Contrato & Sindicato</h4>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <DetailItem label="Cargo / Função" value={displayEmployee.role} />
              <DetailItem label="CTPS" value={displayEmployee.ctps} />
              <DetailItem label="Salário Base" value={displayEmployee.salary ? `R$ ${displayEmployee.salary}` : "---"} />
              <DetailItem label="Admissão" value={displayEmployee.admission_date ? new Date(displayEmployee.admission_date).toLocaleDateString('pt-BR') : "---"} />
              <div className="col-span-2">
                <div className={cn(
                  "border rounded-xl p-4 flex items-center gap-4",
                  displayEmployee.status === "Associado" ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
                )}>
                  <div className={cn(
                    "size-10 rounded-full flex items-center justify-center text-white shadow-lg",
                    displayEmployee.status === "Associado" ? "bg-emerald-600 shadow-emerald-500/20" : "bg-slate-400 shadow-slate-500/20"
                  )}>
                    {displayEmployee.status === "Associado" ? <CheckCircle2 size={20} /> : <User size={20} />}
                  </div>
                  <div>
                    <p className={cn("text-sm font-black", displayEmployee.status === "Associado" ? "text-emerald-900" : "text-slate-900")}>
                      {displayEmployee.status}
                    </p>
                    <p className={cn("text-[11px] font-medium", displayEmployee.status === "Associado" ? "text-emerald-700" : "text-slate-500")}>
                      {displayEmployee.status === "Associado" ? "Contribuindo regularmente." : "Não filiado ao sindicato."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Endereço */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2">
              <MapPin size={18} className="text-blue-600" />
              <h4 className="text-xs font-black uppercase tracking-widest">Endereço Residencial</h4>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="col-span-2">
                <DetailItem label="Logradouro" value={`${displayEmployee.street || ""}, ${displayEmployee.number || ""}`} />
              </div>
              <DetailItem label="Bairro" value={displayEmployee.neighborhood} />
              <DetailItem label="Cidade/UF" value={`${displayEmployee.city || ""} - ${displayEmployee.state || ""}`} />
              <DetailItem label="CEP" value={displayEmployee.zip_code ? maskCEP(displayEmployee.zip_code) : ""} />
            </div>
          </section>

          {/* Histórico de Homologações */}
          <section className="space-y-6 pb-10">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2">
              <History size={18} className="text-blue-600" />
              <h4 className="text-xs font-black uppercase tracking-widest">Histórico de Atendimento</h4>
            </div>
            
            <div className="space-y-3">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-6">
                  <Clock className="animate-spin text-slate-300" />
                </div>
              ) : history.length > 0 ? (
                history.map((item: any) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{item.type}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Protocolo: {item.protocol || "#---"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700">{new Date(item.scheduled_date).toLocaleDateString()}</p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <span className={cn(
                          "size-1.5 rounded-full",
                          item.status === 'Confirmado' ? "bg-emerald-500" : "bg-amber-500"
                        )} />
                        <span className="text-[10px] font-black uppercase text-slate-400">{item.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                  <FileText className="mx-auto text-slate-200 mb-2" size={32} />
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sem registros de homologação</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center justify-center gap-2 px-6 py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all">
                <Trash2 size={20} />
                Excluir
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-red-600" />
                  Deseja realmente excluir?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>Esta ação não pode ser desfeita. O cadastro de <strong>{displayEmployee.name}</strong> será removido permanentemente.</p>
                  
                  {hasHistory && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                      <p className="text-red-800 font-bold text-sm uppercase flex items-center gap-2">
                        <AlertTriangle size={16} /> Atenção Crítica
                      </p>
                      <p className="text-red-700 text-xs mt-1">
                        Este funcionário possui <strong>{history.length} agendamento(s) de homologação</strong> ativos. 
                        Ao prosseguir, esses agendamentos também serão excluídos da agenda do sindicato.
                      </p>
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteEmployee.isPending}
                >
                  {deleteEmployee.isPending ? <Loader2 className="animate-spin size-4" /> : "Sim, Excluir Tudo"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <button 
            onClick={() => onEdit(displayEmployee)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
            Editar Dados
          </button>
        </div>
      </div>
    </>
  );
};

export default EmployeeDetailsDrawer;