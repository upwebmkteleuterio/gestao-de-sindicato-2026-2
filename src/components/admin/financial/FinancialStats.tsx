import React from "react";
import { cn } from "@/lib/utils";

interface FinancialStatsProps {
  isVisible: boolean;
  onToggle: () => void;
  initialBalance: number;
  income: number;
  expenses: number;
  currentBalance: number;
}

const FinancialStats: React.FC<FinancialStatsProps> = ({ isVisible, onToggle, initialBalance, income, expenses, currentBalance }) => {
  const stats = [
    { label: "Saldo inicial", value: initialBalance, color: "text-blue-600", icon: "account_balance" },
    { label: "Entradas registradas", value: income, color: "text-emerald-600", icon: "trending_up" },
    { label: "Saídas registradas", value: expenses, color: "text-red-600", icon: "trending_down" },
    { label: "Saldo atual", value: currentBalance, color: "text-violet-600", icon: "account_balance_wallet" },
  ];

  return (
    <div className="relative">
      <div className={cn("max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden transition-all duration-300 bg-white border-x border-slate-200 px-6", isVisible ? "max-h-[500px] opacity-100 py-4 border-b" : "max-h-0 opacity-0")}>
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span><span className={cn("material-symbols-outlined text-[18px]", stat.color)}>{stat.icon}</span></div>
            <span className="text-2xl font-bold text-slate-900">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stat.value)}</span>
          </div>
        ))}
      </div>
      <button aria-label={isVisible ? "Ocultar resumo" : "Exibir resumo"} onClick={onToggle} className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-40 border-2 border-white">
        <span className={cn("material-symbols-outlined transition-transform duration-300", isVisible ? "rotate-0" : "rotate-180")}>keyboard_arrow_down</span>
      </button>
    </div>
  );
};

export default FinancialStats;
