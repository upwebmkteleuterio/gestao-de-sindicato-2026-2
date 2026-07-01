"use client";

import React, { useState, useMemo } from "react";
import { useCompany } from "@/hooks/useCompany";
import { useAgenda } from "@/hooks/useAgenda";
import { cn } from "@/lib/utils";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  parseISO, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isValid
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CalendarSelectionProps {
  onNext: (slotData: any) => void;
}

const CalendarSelection: React.FC<CalendarSelectionProps> = ({ onNext }) => {
  const { company } = useCompany();
  const { appointments, isLoading } = useAgenda(company?.id);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Filtra apenas os horários "Livre" do dia selecionado vindos do banco
  const availableSlotsForDay = useMemo(() => {
    return appointments
      .filter((app) => {
        const date = new Date(app.scheduled_date);
        return isValid(date) && isSameDay(date, selectedDate) && app.status === "Livre";
      })
      .map(app => {
        const date = new Date(app.scheduled_date);
        return {
          ...app,
          fullDate: app.scheduled_date,
          time: format(date, "HH:mm"),
          agent: app.agent_name
        };
      });
  }, [appointments, selectedDate]);

  // Verifica quais dias do mês possuem pelo menos um horário livre no banco
  const daysWithSlots = useMemo(() => {
    const set = new Set();
    appointments.forEach(app => {
      if (app.status === "Livre") {
        set.add(format(new Date(app.scheduled_date), "yyyy-MM-dd"));
      }
    });
    return set;
  }, [appointments]);

  const handleConfirm = () => {
    if (!selectedSlot) {
      toast.error("Selecione um horário disponível no calendário.");
      return;
    }
    onNext(selectedSlot);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xl p-20 flex flex-col items-center justify-center mt-6">
        <Loader2 className="animate-spin text-blue-600 size-10 mb-4" />
        <p className="text-slate-500 font-medium">Consultando agenda do sindicato...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden mt-6 mb-20 animate-in fade-in zoom-in-95 duration-500">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-2xl font-bold text-slate-900">Selecione o Horário</h2>
        <p className="text-slate-500 text-sm">Escolha uma data no calendário para visualizar os horários disponíveis à direita.</p>
      </div>
      
      <div className="flex flex-col lg:flex-row min-h-[500px]">
        <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4 text-center">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-xs font-black text-slate-400 uppercase tracking-widest">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {daysInMonth.map((day, idx) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const hasSlots = daysWithSlots.has(dateStr);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(day);
                    setSelectedSlot(null);
                  }}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all border relative",
                    isSelected 
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-105 z-10" 
                      : !isCurrentMonth
                        ? "text-slate-300 border-transparent cursor-default opacity-40"
                        : "hover:bg-slate-50 text-slate-700 border-transparent"
                  )}
                >
                  <span className="text-sm font-bold">{format(day, "d")}</span>
                  {hasSlots && (
                    <span className={cn(
                      "size-1.5 rounded-full absolute bottom-2",
                      isSelected ? "bg-white" : "bg-blue-500"
                    )}></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:w-80 bg-slate-50/50 p-6 flex flex-col border-t lg:border-t-0">
          <div className="mb-8">
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Dia Selecionado</p>
            <h3 className="text-2xl font-black text-slate-900 capitalize">
              {format(selectedDate, "eee, d 'de' MMM", { locale: ptBR })}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {availableSlotsForDay.length} {availableSlotsForDay.length === 1 ? 'horário livre' : 'horários livres'}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1 no-scrollbar max-h-[300px] lg:max-h-none">
            {availableSlotsForDay.length > 0 ? (
              availableSlotsForDay.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all group text-left",
                    selectedSlot?.id === slot.id
                      ? "bg-blue-600 border-blue-600 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-700 hover:border-blue-400"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none mb-1">{slot.time}</span>
                    <span className={cn(
                      "text-[10px] font-medium uppercase tracking-tighter opacity-70",
                      selectedSlot?.id === slot.id ? "text-blue-50" : "text-slate-500"
                    )}>
                      Agente: {slot.agent}
                    </span>
                  </div>
                  {selectedSlot?.id === slot.id ? (
                    <span className="material-symbols-outlined text-white">check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600">radio_button_unchecked</span>
                  )}
                </button>
              ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center opacity-40">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-400">event_busy</span>
                <p className="text-xs font-bold uppercase text-slate-500">Nenhum horário livre para esta data</p>
              </div>
            )}
          </div>

          <button
            onClick={handleConfirm}
            type="button"
            className="w-full mt-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-slate-900 text-white shadow-xl hover:bg-slate-800 active:scale-95 cursor-pointer"
          >
            Confirmar e Avançar
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSelection;