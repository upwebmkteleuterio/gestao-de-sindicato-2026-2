"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import JurisdictionDetailsDrawer from "@/components/employee/legal/JurisdictionDetailsDrawer";
import { useJuridico } from "@/hooks/useJuridico";
import { useSessionContext } from "@/contexts/SessionContext";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

const Jurisdictions = () => {
  const { user } = useSessionContext();
  const { appointments, isLoading } = useJuridico();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Filtra apenas os agendamentos marcados pelo funcionário logado
  const myJurisdictions = useMemo(() => {
    return appointments
      .filter(app => app.employee_id === user?.id)
      .map(app => {
        const date = new Date(app.scheduled_date);
        return {
          id: app.id,
          protocol: app.protocol || "S/P",
          scheduledDate: isValid(date) ? format(date, "dd 'de' MMM, yyyy", { locale: ptBR }) : "---",
          scheduledTime: isValid(date) ? format(date, "HH:mm") : "---",
          agent: app.agent_name,
          problemDescription: app.notes || "Sem descrição informada.",
          createdAt: app.created_at ? format(new Date(app.created_at), "dd/MM/yyyy HH:mm") : "---",
          status: app.status
        };
      });
  }, [appointments, user?.id]);

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Minhas Jurisdições</h1>
            <p className="text-slate-500 mt-1">Acompanhe suas solicitações de suporte e consultas jurídicas.</p>
          </div>
          <Link 
            to="/funcionario/agendamento"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Novo Agendamento
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Protocolo / Data</th>
                  <th className="px-6 py-4">Profissional Responsável</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-blue-600" />
                        <p className="text-slate-500 font-medium italic">Buscando seu histórico...</p>
                      </div>
                    </td>
                  </tr>
                ) : myJurisdictions.length > 0 ? (
                  myJurisdictions.map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">#{item.protocol}</p>
                        <p className="text-xs text-slate-500">Agendado em {item.createdAt}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                            <span className="material-symbols-outlined text-sm">person</span>
                          </div>
                          <p className="font-bold text-slate-900">{item.agent}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                          item.status === 'Confirmado' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"
                        )}>
                          <span className={cn("size-1.5 rounded-full", item.status === 'Confirmado' ? "bg-emerald-500" : "bg-blue-500")}></span>
                          {item.status === 'Marcado' ? 'Agendado' : item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 transition-colors">visibility</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium italic">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl opacity-20">history</span>
                        Você ainda não possui consultas jurídicas agendadas.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <JurisdictionDetailsDrawer 
        jurisdiction={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default Jurisdictions;