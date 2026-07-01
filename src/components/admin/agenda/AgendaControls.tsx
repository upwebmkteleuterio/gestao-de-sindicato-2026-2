"use client";

import React from "react";
import { format, addDays, subDays, startOfWeek, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAppStore } from "@/store/useAppStore";

const AgendaControls = () => {
  const currentISO = useAppStore((state) => state.ui.currentAgendaDate);
  const setAgendaDate = useAppStore((state) => state.setAgendaDate);
  
  // Garantir data válida para o componente
  const parsedDate = new Date(currentISO);
  const date = isValid(parsedDate) ? parsedDate : new Date();
  
  // Cálculo do intervalo da semana (Segunda a Sexta)
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 4);

  const displayRange = `${format(weekStart, "dd MMM", { locale: ptBR })} - ${format(weekEnd, "dd MMM", { locale: ptBR })}`;

  const handlePrevWeek = () => {
    setAgendaDate(subDays(date, 7));
  };

  const handleNextWeek = () => {
    setAgendaDate(addDays(date, 7));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
        <button 
          onClick={handlePrevWeek}
          className="size-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition-all active:scale-90"
          title="Semana anterior"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="px-4 text-sm font-bold text-slate-800 min-w-[160px] text-center hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 rounded h-8">
              <span className="material-symbols-outlined text-lg text-blue-600">calendar_today</span>
              {displayRange}
              <span className="material-symbols-outlined text-slate-400 text-lg">keyboard_arrow_down</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" sideOffset={8}>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setAgendaDate(d)}
              locale={ptBR}
              initialFocus
              className="rounded-lg border-0"
            />
          </PopoverContent>
        </Popover>

        <button 
          onClick={handleNextWeek}
          className="size-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition-all active:scale-90"
          title="Próxima semana"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        <div className="flex items-center gap-4 bg-white border border-slate-200 px-4 py-1.5 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-slate-200 border border-slate-300"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Livre</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-500"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Marcado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Confirmado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaControls;