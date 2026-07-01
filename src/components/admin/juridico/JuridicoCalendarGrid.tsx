"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { isSameDay, parseISO } from "date-fns";
import { useJuridicoCalendar } from "@/hooks/useJuridicoCalendar";
import { useJuridico } from "@/hooks/useJuridico";
import { Loader2 } from "lucide-react";

interface JuridicoCalendarGridProps {
  onSelectSlot: (slot: any) => void;
}

const JuridicoCalendarGrid: React.FC<JuridicoCalendarGridProps> = ({ onSelectSlot }) => {
  const { appointments, isLoading } = useJuridico();
  const { slots, days, timeSlots } = useJuridicoCalendar(appointments);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-indigo-600 size-10" />
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
              d.active && "bg-indigo-50/50"
            )}>
              <p className={cn("text-[10px] font-bold uppercase", d.active ? "text-indigo-600" : "text-slate-400")}>{d.label}</p>
              <p className={cn("text-lg font-black mt-1", d.active ? "text-indigo-600" : "text-slate-900")}>{d.day}</p>
            </div>
          ))}
        </div>

        {/* Área da grade com padding-top */}
        <div className="relative flex-1 bg-white pt-6">
          {/* Linhas e labels de hora */}
          <div className="absolute top-6 left-0 right-0 bottom-0 grid grid-rows-[repeat(12,minmax(80px,1fr))] pointer-events-none">
            {timeSlots.map((time, i) => (
              <div key={i} className="border-b border-slate-100 flex items-start">
                <div className="w-[80px] shrink-0 text-right pr-4 text-[10px] text-slate-400 font-bold -translate-y-2 uppercase">
                  {time}
                </div>
              </div>
            ))}
          </div>

          {/* Colunas */}
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] h-[960px] relative">
            <div className="border-r border-slate-200 bg-slate-50/30"></div>
            
            {days.map((dayObj) => (
              <div key={dayObj.day} className={cn("border-r border-slate-200 relative p-1", dayObj.active && "bg-indigo-50/5")}>
                {slots.filter(s => s.fullDate && isSameDay(parseISO(s.fullDate), dayObj.fullDate)).map((slot) => {
                  const status = slot.status || 'Livre';
                  
                  const statusStyles = {
                    Livre: "border-slate-200 border-l-slate-400 bg-white hover:bg-slate-50 text-slate-900",
                    Marcado: "border-indigo-200 border-l-indigo-600 bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-900",
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
                        {status === 'Livre' ? slot.agent : `${slot.employeeName || 'Associado'} • ${slot.agent}`}
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

export default JuridicoCalendarGrid;