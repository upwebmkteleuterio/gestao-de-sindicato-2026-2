import React from "react";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LegalScheduleSummaryProps {
  employee: any;
  problem: string;
  slot: any | null;
}

const LegalScheduleSummary: React.FC<LegalScheduleSummaryProps> = ({ employee, problem, slot }) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      if (!isValid(d)) return dateStr;
      return format(d, "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-slate-900 px-6 py-4">
        <h3 className="text-white font-bold text-lg">Resumo do Atendimento</h3>
        <p className="text-slate-400 text-sm">Portal do Funcionário</p>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Solicitante</p>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
              {employee.name.substring(0, 2)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{employee.name}</p>
              <p className="text-[10px] text-slate-500">CPF: {employee.cpf}</p>
            </div>
          </div>
        </div>

        {problem && (
          <div className="border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-left-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Motivo</p>
            <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">{problem}</p>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Horário</p>
          {slot ? (
            <div className="animate-in fade-in slide-in-from-left-2">
              <div className="flex items-center gap-2 text-blue-700">
                <span className="material-symbols-outlined text-lg">event_available</span>
                <p className="text-sm font-bold">{formatDate(slot.fullDate)}</p>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-1 ml-7">{slot.time}h • {slot.agent}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 italic text-sm">
              <span className="material-symbols-outlined text-lg">schedule</span>
              <span>Aguardando seleção...</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start mt-2">
          <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">verified_user</span>
          <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
            O atendimento será realizado por um advogado especialista em Direito do Trabalho.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalScheduleSummary;