import React from "react";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduleSummaryProps {
  employee: any | null;
  slot: any | null;
  company: any | null;
}

const ScheduleSummary: React.FC<ScheduleSummaryProps> = ({ employee, slot, company }) => {
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
        <h3 className="text-white font-bold text-lg">Resumo do Agendamento</h3>
        <p className="text-slate-400 text-sm">Portal da Empresa</p>
      </div>
      <div className="p-6 space-y-4">
        {/* Empresa */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Empresa</p>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-semibold text-slate-900">{company?.name || "Carregando..."}</p>
          </div>
        </div>

        {/* Funcionário */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Funcionário</p>
          {employee ? (
            <div className="animate-in fade-in slide-in-from-left-2">
              <p className="text-sm font-semibold text-slate-900">{employee.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">CPF: {employee.cpf}</p>
              {employee.terminationDate && (
                <p className="text-[10px] text-blue-600 font-bold mt-1">Desligamento: {formatDate(employee.terminationDate)}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 italic text-sm">
              <span className="material-symbols-outlined text-lg">person_search</span>
              <span>Aguardando seleção...</span>
            </div>
          )}
        </div>

        {/* Horário */}
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
              <span>Ainda não selecionado</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start mt-2">
          <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">info</span>
          <p className="text-xs text-blue-800 leading-relaxed">
            Certifique-se de que os documentos foram enviados antes de prosseguir com o agendamento.
          </p>
        </div>
      </div>
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Duração estimada</span>
          <span className="font-bold text-slate-900">45 min</span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSummary;