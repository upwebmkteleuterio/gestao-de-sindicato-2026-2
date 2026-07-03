import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { formatCurrency } from "@/utils/formatters";

interface Stat {
  label: string;
  value: string | number;
  sub: string;
  icon: string;
  trend?: string;
  trendColor?: string;
  bgColor: string;
  iconColor?: string;
}

const DashboardStats = () => {
  const { data, isLoading, error } = useAdminDashboardData();

  if (isLoading) {
    // Return a loading state that looks like the stats grid
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 relative z-10">
              <Loader2 className="animate-spin size-6 text-blue-600" />
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest relative z-10">Carregando...</h3>
            <div className="mt-1 flex items-baseline gap-2 relative z-10">
              <span className="text-3xl font-black text-slate-300 tracking-tight">...</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-6 bg-red-100 border border-red-400 rounded-lg text-red-700">Erro ao carregar dados do dashboard: {error.message}</div>;
  }

  const stats: Stat[] = [
    {
      label: "Total de Empresas",
      value: data?.stats.totalCompanies ?? 0,
      sub: "cadastradas",
      icon: "domain",
      bgColor: "bg-blue-50",
    },
    {
      label: "Total de Vidas",
      value: data?.stats.totalEmployees ?? 0,
      sub: "colaboradores",
      icon: "groups",
      bgColor: "bg-blue-50",
    },
    {
      label: "Receita Total (Paga)",
      value: formatCurrency(data?.stats.totalRevenue ?? 0),
      sub: "acumulada",
      icon: "payments",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Receita Pendente",
      value: formatCurrency(data?.stats.pendingRevenue ?? 0),
      sub: "em aberto",
      icon: "warning",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className={cn(
            "bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden animate-in fade-in slide-in-from-top-4 fill-mode-both"
          )}
          style={{ animationDelay: `${(i + 1) * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className={cn("p-2.5 rounded-xl", stat.bgColor, stat.iconColor || 'text-blue-900')}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            {stat.trend && (
              <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest", stat.trendColor)}>
                {stat.trend}
              </span>
            )}
          </div>
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest relative z-10">{stat.label}</h3>
          <div className="mt-1 flex items-baseline gap-2 relative z-10">
            {isLoading ? (
              <Loader2 className="animate-spin size-6 text-slate-300" />
            ) : (
              <span className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>
            )}
            <span className="text-xs text-slate-400 font-medium">{stat.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;