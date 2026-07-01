"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ScheduleSuccessProps {
  employeeName: string;
  protocol: string;
}

const ScheduleSuccess: React.FC<ScheduleSuccessProps> = ({ employeeName, protocol }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
      <div className="size-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
        <CheckCircle2 size={48} />
      </div>
      <div>
        <h2 className="text-3xl font-black text-slate-900">Agendamento Realizado!</h2>
        <p className="text-slate-500 mt-2">Sua solicitação para <strong>{employeeName}</strong> foi confirmada.</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 w-full max-w-sm">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Número do Protocolo</p>
        <p className="text-2xl font-black text-slate-900">#{protocol}</p>
      </div>
      <button 
        onClick={() => window.location.href = '/empresa/homologacoes'}
        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
      >
        Ver Meus Agendamentos
      </button>
    </div>
  );
};

export default ScheduleSuccess;