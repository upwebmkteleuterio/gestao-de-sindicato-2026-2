import React from "react";
import { cn } from "@/lib/utils";
import { useAgenda } from "@/hooks/useAgenda";
import { useJuridico } from "@/hooks/useJuridico";
import { isSameDay } from "date-fns";

interface AgendaStatsProps {
  show: boolean;
  type?: 'homologacao' | 'juridico';
}

const AgendaStats: React.FC<AgendaStatsProps> = ({ show, type = 'homologacao' }) => {
  // Escolhe o hook de dados baseado no contexto
  const { appointments: homologacaoData } = useAgenda();
  const { appointments: juridicoData } = useJuridico();
  
  const appointments = type === 'juridico' ? juridicoData : homologacaoData;
  
  // Cálculo de dados reais
  const today = new Date();
  const todayApps = appointments.filter(app => app.scheduled_date && isSameDay(new Date(app.scheduled_date), today));
  const pendingConfirm = appointments.filter(app => app.status === 'Marcado').length;
  const freeSlots = appointments.filter(app => app.status === 'Livre').length;

  const stats = [
    { 
      label: type === 'juridico' ? "Consultas para Hoje" : "Agendamentos de Hoje", 
      value: todayApps.length.toString(), 
      trend: todayApps.length > 0 ? "Ativo" : "Vazio", 
      trendColor: todayApps.length > 0 ? "text-emerald-600 bg-emerald-100" : "text-slate-400 bg-slate-100", 
      icon: "event_available", 
      iconColor: type === 'juridico' ? "text-indigo-600 bg-indigo-50" : "text-blue-600 bg-blue-50" 
    },
    { 
      label: "Aguardando Confirmação", 
      value: pendingConfirm.toString(), 
      icon: "pending_actions", 
      iconColor: pendingConfirm > 0 ? "text-orange-600 bg-orange-50" : "text-slate-400 bg-slate-100" 
    },
    { 
      label: "Horários Disponíveis", 
      value: freeSlots.toString(), 
      trend: `${freeSlots} livres`, 
      trendColor: "text-emerald-600 bg-emerald-100", 
      icon: "check_box_outline_blank", 
      iconColor: "text-emerald-600 bg-emerald-50" 
    },
  ];

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-hidden transition-all duration-300",
      show ? "max-h-[500px] opacity-100 mb-4" : "max-h-0 opacity-0"
    )}>
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              {stat.trend && (
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase", stat.trendColor)}>{stat.trend}</span>
              )}
            </div>
          </div>
          <div className={cn("size-10 rounded-full flex items-center justify-center", stat.iconColor)}>
            <span className="material-symbols-outlined">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgendaStats;