import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Stat {
  label: string;
  value: string | number;
  sub: string;
  icon: string;
  trend?: string;
  trendColor?: string;
  bgColor: string;
  iconColor?: string;
  isLoading?: boolean;
}

const DashboardStats = () => {
  // 1. Busca contagem total de empresas
  const { data: totalCompanies, isLoading: loadingCompanies } = useQuery({
    queryKey: ["admin-stats-companies"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("companies")
        .select("*", { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // 2. Busca contagem total de funcionários (Vidas)
  const { data: totalEmployees, isLoading: loadingEmployees } = useQuery({
    queryKey: ["admin-stats-employees"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("employees")
        .select("*", { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // 3. Busca contagem de aprovações pendentes
  const { data: pendingApprovals, isLoading: loadingPending } = useQuery({
    queryKey: ["admin-stats-pending"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("companies")
        .select("*", { count: 'exact', head: true })
        .eq("status", "pending");
      if (error) throw error;
      return count || 0;
    }
  });

  const stats: Stat[] = [
    { 
      label: "Total de Empresas", 
      value: totalCompanies ?? 0, 
      sub: "cadastradas", 
      icon: "domain", 
      bgColor: "bg-blue-50",
      isLoading: loadingCompanies
    },
    { 
      label: "Total de Vidas", 
      value: totalEmployees ?? 0, 
      sub: "colaboradores", 
      icon: "groups", 
      bgColor: "bg-blue-50",
      isLoading: loadingEmployees
    },
    { 
      label: "Aprovações Pendentes", 
      value: pendingApprovals ?? 0, 
      sub: "em análise", 
      icon: "pending_actions", 
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      isLoading: loadingPending
    },
    { 
      label: "Receita em Atraso", 
      value: "R$ 1.2M", 
      sub: "842 empresas", 
      icon: "warning", 
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      trend: "+5%",
      trendColor: "text-red-700 bg-red-100"
    },
    { 
      label: "Eficiência de Cobrança", 
      value: "28%", 
      sub: "Meta: 85%", 
      icon: "trending_down", 
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: "-2%",
      trendColor: "text-amber-700 bg-amber-100"
    },
    { 
      label: "Cadastros Desatualizados", 
      value: "312", 
      sub: "> 30 dias", 
      icon: "sync_problem", 
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      trend: "Crítico",
      trendColor: "text-indigo-700 bg-indigo-100"
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
            {stat.isLoading ? (
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