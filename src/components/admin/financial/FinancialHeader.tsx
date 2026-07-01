import React from "react";

interface FinancialHeaderProps {
  onToggleKpis: () => void;
  showKpis: boolean;
}

const FinancialHeader: React.FC<FinancialHeaderProps> = ({ onToggleKpis, showKpis }) => {
  return (
    <header className="px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hover:text-blue-600 cursor-pointer">Início</span>
          <span>/</span>
          <span className="text-slate-900 font-medium">Cobrança e Jurídico</span>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[300px]">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Módulo Financeiro & Jurídico</h1>
            <div className="relative mt-2 max-w-md group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input 
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border-slate-200 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-slate-900 placeholder:text-slate-400 border" 
                placeholder="Buscar por Razão Social ou CNPJ..." 
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 self-end">
            <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
              <button className="px-3 py-1.5 text-xs font-bold bg-white text-blue-600 shadow-sm rounded-md transition-all">Todos</button>
              <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all">30-60d</button>
              <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all">90d+</button>
            </div>
            <button className="flex items-center gap-2 h-9 px-3 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
              <span className="material-symbols-outlined text-lg">description</span>
              Relatório
            </button>
            <button className="flex items-center gap-2 h-9 px-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md">
              <span className="material-symbols-outlined text-lg">send</span>
              Notificar Extrajudicial (2)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default FinancialHeader;