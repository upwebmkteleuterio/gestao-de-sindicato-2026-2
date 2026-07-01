import React from "react";

const ApprovalHeader = () => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-5 shrink-0 z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fila de Aprovação</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie cadastros pendentes de empresas e funcionários.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Tempo Médio de Espera</span>
            <span className="text-sm font-bold text-slate-900">1,2 Dias</span>
          </div>
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border-2 border-white shadow-sm">
            JD
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-blue-600 transition-colors">search</span>
          </div>
          <input 
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-slate-100 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-600/20 transition-all text-sm" 
            placeholder="Buscar por nome, ID ou CNPJ/CPF..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium whitespace-nowrap shadow-sm hover:shadow transition-all">
            Todas as Solicitações
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-slate-50 transition-colors">
            Empresas
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-slate-50 transition-colors">
            Funcionários
          </button>
          <div className="w-px h-6 bg-slate-300 mx-2 hidden md:block"></div>
          <button className="flex items-center gap-2 px-3 py-2 text-slate-600 text-sm font-medium hover:text-blue-600 transition-colors whitespace-nowrap">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filtrar
          </button>
        </div>
      </div>
    </header>
  );
};

export default ApprovalHeader;