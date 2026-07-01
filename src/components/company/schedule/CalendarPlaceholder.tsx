"use client";

import React from "react";

const CalendarPlaceholder = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 opacity-40 select-none grayscale">
      <div className="h-40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-4xl text-slate-400">calendar_month</span>
          <p className="text-slate-500 font-medium text-center">A seleção do calendário estará disponível após<br/>preencher os dados do funcionário</p>
        </div>
      </div>
    </div>
  );
};

export default CalendarPlaceholder;