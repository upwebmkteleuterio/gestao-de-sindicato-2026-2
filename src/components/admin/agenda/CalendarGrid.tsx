"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useAgenda } from "@/hooks/useAgenda";
import { format, startOfWeek, addDays, isSameDay, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface CalendarGridProps {
  onSelectSlot: (slot: any) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ onSelectSlot }) => {
  const { appointments, isLoading } = useAgenda();
  const currentISO = useAppStore((state) => state.ui.currentAgendaDate);
  
  const parsedDate = new Date(currentISO);
  const viewDate = isValid(parsedDate) ? parsedDate : new Date();
  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
  
  const hoursRange = Array.from({ length: 12 }, (_, i) => i + 8);
  
  const days = Array.from({ length: 5 }, (_, i) => {
    const dayDate = addDays(weekStart, i);
    return {
      label: format(dayDate, "eee", { locale: ptBR }),
      day: format(dayDate, "d"),
      fullDate: dayDate,
      active: isSameDay(dayDate, new Date())
    };
  });

  const slots = appointments.map(app => {
    const date = new Date(app.scheduled_date);
    return {
      ...app,
      fullDate: app.scheduled_date,
      time: format(date, "HH:mm"),
      agent: app.agent_name,
      // Altura baseada em 80px por hora
      top: (date.getHours() - 8) * 80 + (date.getMinutes() >= 30 ? 40 : 0),
      height: 40,
      companyName: app.company?.name || null,
      employeeName: app.employee?.name || null
    };
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600 size-10" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white relative z-10">
      <div className="min-w-[1000px] h-full flex flex-col">
        {/* Cabeçalho dos Dias */}
        <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] border-b border-slate-200 sticky top-0 bg-white z-20 shadow-sm">
          <div className="py-4 border-r border-slate-200"></div> 
          {days.map((d, i) => (
            <div key={i} className={cn(
              "py-3 px-2 text-center border-r border-slate-200 last:border-r-0",
              d.active && "bg-blue-50/50"
            )}>
              <p className={cn("text-[10px] font-bold uppercase", d.active ? "text-blue-600" : "text-slate-400")}>{d.label}</p>
              <p className={cn("text-lg font-black mt-1", d.active ? "text-blue-600" : "text-slate-900")}>{d.day}</p>
            </div>
          ))}
        </div>

        {/* Área do calendário com padding-top para não cortar o 08:00 */}
        <div className="relative flex-1 bg-white pt-6">
          {/* Linhas de fundo e Labels de hora */}
          <div className="absolute top-6 left-0 right-0 bottom-0 grid grid-rows-[repeat(12,minmax(80px,1fr))] pointer-events-none">
            {hoursRange.map((hour) => (
              <div key={hour} className="border-b border-slate-100 flex items-start">
                <div className="w-[80px] shrink-0 text-right pr-4 text-[10px] text-slate-400 font-bold -translate-y-2 uppercase">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              </div>
            ))}
          </div>

          {/* Colunas de Dados */}
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] h-[960px] relative">
            <div className="border-r border-slate-200 bg-slate-50/30"></div>
            
            {days.map((dayObj) => (
              <div key={dayObj.day} className={cn("border-r border-slate-200 relative p-1", dayObj.active && "bg-blue-50/5")}>
                {slots.filter(s => s.fullDate && isSameDay(parseISO(s.fullDate), dayObj.fullDate)).map((slot) => {
                  const status = slot.status || 'Livre';
                  const statusStyles = {
                    Livre: "border-slate-200 border-l-slate-400 bg-white hover:bg-slate-50 text-slate-900",
                    Marcado: "border-blue-200 border-l-blue-600 bg-blue-50/80 hover:bg-blue-100/80 text-blue-900",
                    Confirmado: "border-emerald-200 border-l-emerald-600 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900"
                  };

                  return (
                    <div 
                      key={slot.id}
                      onClick={() => onSelectSlot(slot)}
                      className={cn(
                        "absolute left-1.5 right-1.5 rounded-lg border shadow-sm cursor-pointer transition-all z-10 flex flex-col justify-center px-3 overflow-hidden border-l-4",
                        statusStyles[status as keyof typeof statusStyles]
                      )}
                      style={{ top: `${slot.top}px`, height: `${slot.height}px` }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-tight truncate">
                        {status === 'Livre' ? 'Livre' : status === 'Marcado' ? 'Agendado' : 'Confirmado'}
                      </p>
                      <p className="text-[9px] font-bold opacity-70 truncate">
                        {status === 'Livre' ? slot.agent : `${slot.companyName || 'Empresa'} • ${slot.agent}`}
                      </p>
                      <p className="text-[9px] font-bold opacity-50 truncate">{slot.time}</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;