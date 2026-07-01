import React, { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import HomologationDetailsDrawer from "@/components/company/schedule/HomologationDetailsDrawer";
import EmployeeDetailsDrawer from "@/components/company/employees/EmployeeDetailsDrawer";
import { toast } from "sonner";
import { useCompany } from "@/hooks/useCompany";
import { useAgenda } from "@/hooks/useAgenda";
import { format, isValid } from "date-fns";

const HomologationList = () => {
  const { company } = useCompany();
  const { appointments, isLoading } = useAgenda(company?.id);
  const employees = useAppStore((state) => state.data.employees) || [];
  
  const [selectedHomologation, setSelectedHomologation] = useState<any | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any | null>(null);

  // Mapeamento dos dados do banco para o formato da UI
  const homologations = useMemo(() => {
    return appointments
      .filter(app => app.status !== "Livre")
      .map(app => {
        const date = new Date(app.scheduled_date);
        const createdAt = new Date(app.created_at);
        return {
          id: app.id,
          protocol: app.protocol,
          createdAt: isValid(createdAt) ? format(createdAt, "dd/MM/yyyy") : "---",
          employeeName: app.employee?.name || "Não identificado",
          employeeCpf: app.employee?.cpf || "---",
          scheduledDate: isValid(date) ? format(date, "dd/MM/yyyy") : "---",
          scheduledTime: isValid(date) ? format(date, "HH:mm") : "---",
          agent: app.agent_name,
          status: app.status,
          employee: app.employee // Passando o objeto completo do funcionário
        };
      });
  }, [appointments]);

  const handleViewEmployee = (cpf: string) => {
    const employee = employees.find(e => e.cpf === cpf);
    if (employee) {
      setViewingEmployee(employee);
    } else {
      toast.error("Cadastro do funcionário não encontrado na base de dados.");
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Confirmado":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 dot-bg-emerald-500";
      case "Cancelado":
        return "bg-red-50 text-red-700 border-red-100 dot-bg-red-500";
      case "Agendado":
      case "Marcado":
      default:
        return "bg-blue-50 text-blue-700 border-blue-100 dot-bg-blue-500";
    }
  };

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Homologações</h1>
            <p className="text-slate-500 mt-1">Histórico e acompanhamento de agendamentos realizados pela empresa.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/empresa/agendar-homologacao"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Novo Agendamento
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Protocolo / Data</th>
                  <th className="px-6 py-4">Funcionário</th>
                  <th className="px-6 py-4">Horário Agendado</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-blue-600">sync</span>
                        Carregando agendamentos...
                      </div>
                    </td>
                  </tr>
                ) : homologations.length > 0 ? (
                  homologations.map((item, i) => {
                    const statusClass = getStatusStyles(item.status);
                    const dotClass = statusClass.split(' ').find(c => c.startsWith('dot-bg-'))?.replace('dot-bg-', '') || 'bg-blue-500';
                    const mainClasses = statusClass.split(' ').filter(c => !c.startsWith('dot-bg-')).join(' ');

                    return (
                      <tr 
                        key={item.id || i} 
                        onClick={() => setSelectedHomologation(item)}
                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">#{item.protocol}</p>
                          <p className="text-xs text-slate-500">Criado em {item.createdAt}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                              {item.employeeName?.substring(0, 2).toUpperCase() || "??"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.employeeName}</p>
                              <p className="text-xs text-slate-500">{item.employeeCpf}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-900 font-bold">{item.scheduledDate}</p>
                          <p className="text-xs text-slate-500">{item.scheduledTime}h • {item.agent}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase",
                            mainClasses
                          )}>
                            <span className={cn("size-1.5 rounded-full", dotClass)}></span>
                            {item.status === 'Marcado' ? 'Agendado' : item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 transition-colors">visibility</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium italic">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl opacity-20">history</span>
                        Nenhuma homologação agendada até o momento.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <HomologationDetailsDrawer 
        homologation={selectedHomologation}
        onClose={() => setSelectedHomologation(null)}
        onViewEmployee={handleViewEmployee}
      />

      <EmployeeDetailsDrawer 
        employee={viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        onEdit={(emp) => {
          setViewingEmployee(null);
          toast.info("Função de edição direta será implementada em breve.");
        }}
      />
    </div>
  );
};

export default HomologationList;