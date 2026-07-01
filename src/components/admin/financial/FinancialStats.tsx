import React from "react";
import { cn } from "@/lib/utils";

interface FinancialStatsProps {
  isVisible: boolean;
  onToggle: () => void;
}

const FinancialStats: React.FC<FinancialStatsProps> = ({ isVisible, onToggle }) => {
  const stats = [
    { label: "Total Inadimplência (>30 Dias)", value: "R$ 1.240.500", trend: "+12%", trendColor: "text-red-600 bg-red-50", icon: "trending_up" },
    { label: "Contas Acionáveis", value: "42", trend: "5 novas", trendColor: "text-emerald-600 bg-emerald-50", icon: "gavel" },
    { label: "Média de Atraso", value: "45 Dias", trend: "+2 dias", trendColor: "text-amber-600 bg-amber-50", icon: "schedule" },
  ];

  return (
    <div className="relative">
      <div className={cn(
        "max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-hidden transition-all duration-300 bg-white border-x border-slate-200 px-6",
        isVisible ? "max-h-[500px] opacity-100 py-4 border-b" : "max-h-0 opacity-0"
      )}>
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col hover:border-blue-200 transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">{stat.icon}</span>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded flex items-center mb-1", stat.trendColor)}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={onToggle}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-40 border-2 border-white"
      >
        <span className={cn(
          "material-symbols-outlined transition-transform duration-300",
          isVisible ? "rotate-0" : "rotate-180"
        )}>
          keyboard_arrow_down
        </span>
      </button>
    </div>
  );
};

export default FinancialStats;