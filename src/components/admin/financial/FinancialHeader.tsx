import React from "react";

interface FinancialHeaderProps {
  onToggleKpis: () => void;
  showKpis: boolean;
  onConfigureBalance: () => void;
  onNewTransaction: () => void;
  onReport: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  period: string;
  onPeriodChange: (value: string) => void;
}

const FinancialHeader: React.FC<FinancialHeaderProps> = ({ onToggleKpis, showKpis, onConfigureBalance, onNewTransaction, onReport, search, onSearchChange, period, onPeriodChange }) => (
  <header className="px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-30">
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
      <div className="flex items-center gap-2 text-xs text-slate-400"><span>Início</span><span>/</span><span className="text-slate-900 font-medium">Financeiro</span></div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[300px]"><h1 className="text-2xl font-black text-slate-900 tracking-tight">Módulo Financeiro</h1><div className="relative mt-2 max-w-md"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 material-symbols-outlined text-[20px]">search</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border-slate-200 text-sm outline-none border" placeholder="Buscar lançamento, empresa ou CNPJ..." type="text" /></div></div>
        <div className="flex flex-wrap items-center gap-2 self-end">
          <select value={period} onChange={(event) => onPeriodChange(event.target.value)} className="h-9 px-3 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold"><option value="current">Este mês</option><option value="previous">Mês anterior</option><option value="quarter">Últimos 3 meses</option><option value="year">Este ano</option><option value="all">Todo o período</option></select>
          <button onClick={onNewTransaction} className="flex items-center gap-2 h-9 px-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"><span className="material-symbols-outlined text-lg">add</span>Novo lançamento</button>
          <button onClick={onConfigureBalance} className="flex items-center gap-2 h-9 px-3 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50"><span className="material-symbols-outlined text-lg">account_balance</span>Saldo inicial</button>
          <button onClick={onReport} className="flex items-center gap-2 h-9 px-3 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50"><span className="material-symbols-outlined text-lg">picture_as_pdf</span>Relatório PDF</button>
          <button onClick={onToggleKpis} className="h-9 px-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">{showKpis ? "Ocultar resumo" : "Resumo"}</button>
        </div>
      </div>
    </div>
  </header>
);
export default FinancialHeader;
