"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { format, startOfWeek, addDays, isSameDay, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

export const useJuridicoCalendar = (appointments: any[]) => {
  const currentISO = useAppStore((state) => state.ui.currentJuridicoDate);
  
  const parsedDate = new Date(currentISO);
  const viewDate = isValid(parsedDate) ? parsedDate : new Date();
  
  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
  
  // 12 slots (de 8h até 19h)
  const timeSlots = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`),
    []
  );
  
  const days = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => {
      const dayDate = addDays(weekStart, i);
      return {
        label: format(dayDate, "eee", { locale: ptBR }),
        day: format(dayDate, "d"),
        fullDate: dayDate,
        active: isSameDay(dayDate, new Date())
      };
    }),
    [weekStart]
  );

  // Mapeia os dados do banco para o formato de exibição do Grid
  const slots = useMemo(() => {
    return appointments.map(app => {
      const date = new Date(app.scheduled_date);
      return {
        ...app,
        fullDate: app.scheduled_date,
        time: format(date, "HH:mm"),
        agent: app.agent_name,
        // 80px por hora
        top: (date.getHours() - 8) * 80 + (date.getMinutes() >= 30 ? 40 : 0),
        height: 40,
        companyName: app.company?.name || null,
        employeeName: app.employee?.name || null
      };
    });
  }, [appointments]);

  return {
    slots,
    days,
    timeSlots,
    viewDate
  };
};