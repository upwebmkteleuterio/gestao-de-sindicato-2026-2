"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useJuridico } from "@/hooks/useJuridico";
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
import { Loader2 } from "lucide-react";

interface LegalCalendarSelectionProps {
  onNext: (slot: any) => void;
  onBack: () => void;
}

const LegalCalendarSelection: React.FC<LegalCalendarSelectionProps> = ({ onNext, onBack }) => {
  const { appointments, isLoading } = useJuridico();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Filtra agendamentos "Livres" para o dia selecionado
  const availableSlots = useMemo(() => {
    return appointments
      .filter((slot) => {
        const date = new Date(slot.scheduled_date);
        return isValid(date) && isSameDay(date, selectedDate) && (slot.status === "Livre" || !slot.status);
      })
      .map(slot => {
        const date = new Date(slot.scheduled_date);
        return {
          ...slot,
          fullDate: slot.scheduled_date,
          time: format(date, "HH:mm"),
          agent: slot.agent_name
        };
      });
  }, [appointments, selectedDate]);

  // Identifica quais dias têm horários disponíveis
  const daysWithSlots = useMemo(() => {
    const set = new Set();
    appointments.forEach(slot => {
      if (slot.status === "Livre") {
        const date = new Date(slot.scheduled_date);
        if (isValid(date)) {
          set.add(format(date, "yyyy-MM-dd"));
        }
      }
    });
    return set;
  }, [appointments]);

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xl p-20 flex flex-col items-center justify-center animate-in fade-in duration-500">
        <Loader2 className="animate-spin text-blue-600 size-10 mb-4" />
        <p className="text-slate-500 font-medium text-center">Consultando horários jurídicos...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Escolha o Melhor Horário</h2>
          <p className="text-slate-500 text-sm">Selecione uma data disponível no calendário.</p>
        </div>
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm font-bold uppercase tracking-widest flex items-center gap-1">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row min-h-[500px]">
        <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-lg"><span className="material-symbols-outlined">chevron_left</span></button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-lg"><span className="material-symbols-outlined">chevron_right</span></button>
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
                    isSelected ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105 z-10" : 
                    !isCurrentMonth ? "opacity-20 pointer-events-none" : "hover:bg-blue-50 border-transparent text-slate-700"
                  )}
                >
                  <span className="text-sm font-bold">{format(day, "d")}</span>
                  {hasSlots && <span className={cn("size-1.5 rounded-full absolute bottom-2", isSelected ? "bg-white" : "bg-blue-500")}></span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:w-80 bg-slate-50/50 p-6 flex flex-col">
          <div className="mb-8">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Dia Selecionado</p>
            <h3 className="text-2xl font-black text-slate-900 capitalize">{format(selectedDate, "eee, d MMM", { locale: ptBR })}</h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar max-h-[300px] lg:max-h-none">
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                    selectedSlot?.id === slot.id ? "bg-blue-600 border-blue-600 text-white shadow-md" : "bg-white border-slate-200 hover:border-blue-400"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none mb-1">{slot.time}h</span>
                    <span className={cn("text-[10px] font-medium uppercase opacity-70", selectedSlot?.id === slot.id ? "text-blue-100" : "text-slate-500")}>Prof: {slot.agent}</span>
                  </div>
                  <span className="material-symbols-outlined">{selectedSlot?.id === slot.id ? "check_circle" : "radio_button_unchecked"}</span>
                </button>
              ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center opacity-40">
                <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                <p className="text-xs font-bold uppercase">Nenhum horário</p>
              </div>
            )}
          </div>

          <button
            onClick={() => selectedSlot && onNext(selectedSlot)}
            disabled={!selectedSlot}
            className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finalizar Agendamento
            <span className="material-symbols-outlined">check</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalCalendarSelection;