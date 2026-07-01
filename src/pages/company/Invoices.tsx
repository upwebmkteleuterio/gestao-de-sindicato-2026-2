"use client";

import React from "react";
import InvoicesStats from "@/components/company/invoices/InvoicesStats";
import InvoicesTable from "@/components/company/invoices/InvoicesTable";

const Invoices = () => {
  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500 bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Início</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-900">Financeiro</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-900">Faturas</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">Faturas e Cobranças</h1>
          <p className="text-slate-500 text-sm">Gerencie seus pagamentos mensais e acesse boletos para contribuição sindical.</p>
        </div>

        {/* KPIs */}
        <InvoicesStats />

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-6">
          <InvoicesTable />
          
          <div className="bg-blue-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-[180px]">payments</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold">Dúvidas sobre sua fatura?</h3>
              <p className="text-blue-100 mt-1 max-w-md">Entre em contato com nosso departamento financeiro para esclarecimentos sobre taxas ou acordos.</p>
            </div>
            <button className="relative z-10 px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95">
              Contatar Suporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;