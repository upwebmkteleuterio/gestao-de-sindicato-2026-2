import React from "react";
import { cn } from "@/lib/utils";
import ActionButton from "@/components/shared/ActionButton";

interface AgendaHeaderProps {
  showKpis: boolean;
  onToggleKpis: () => void;
  onOpenNewSlot: () => void;
  onOpenSettings: () => void;
  children?: React.ReactNode;
}

const AgendaHeader: React.FC<AgendaHeaderProps> = ({ 
  showKpis, 
  onToggleKpis, 
  onOpenNewSlot, 
  onOpenSettings,
  children 
}) => {
  return (
    <header className="bg-white border-b border-slate-200 p-6 shrink-0 z-20 sticky top-0">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Agenda Mestre de Homologação</h2>
            <p className="text-slate-500 text-sm mt-0.5">Gerencie slots de 30 minutos e veja agendamentos confirmados.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              id="agenda-settings-button"
              onClick={onOpenSettings}
              className="flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors relative"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              Configurações
            </button>
            <ActionButton id="agenda-new-slot-button" onClick={onOpenNewSlot} icon={<span className="material-symbols-outlined text-[20px]">add</span>}>Criar Novos Horários</ActionButton>
          </div>
        </div>

        {children}
      </div>

      <button 
        onClick={onToggleKpis}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-40 border-2 border-white"
      >
        <span className={cn(
          "material-symbols-outlined transition-transform duration-300",
          showKpis ? "rotate-0" : "rotate-180"
        )}>
          keyboard_arrow_down
        </span>
      </button>
    </header>
  );
};

export default AgendaHeader;