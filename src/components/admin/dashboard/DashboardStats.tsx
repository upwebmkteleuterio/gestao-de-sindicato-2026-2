import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { formatCurrency } from "@/utils/formatters";

const DashboardStats = () => {
  const { data, isLoading, error } = useAdminDashboardData();
  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="bg-white rounded-2xl border border-slate-200 p-6 h-36 flex items-center justify-center"><Loader2 className="animate-spin size-6 text-blue-600" /></div>)}</div>;
  if (error) return <div className="p-6 bg-red-100 border border-red-400 rounded-lg text-red-700">Erro ao carregar dados do dashboard: {error.message}</div>;
  const stats = [
    { label: "Total de Empresas", value: data?.stats.totalCompanies ?? 0, sub: "cadastradas", icon: "domain", bgColor: "bg-blue-50", iconColor: "text-blue-900" },
    { label: "Total de Vidas", value: data?.stats.totalEmployees ?? 0, sub: "colaboradores", icon: "groups", bgColor: "bg-blue-50", iconColor: "text-blue-900" },
    { label: "Receita Recebida", value: formatCurrency(data?.stats.receivedRevenue ?? 0), sub: "pagamentos confirmados", icon: "payments", bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "A Receber", value: formatCurrency(data?.stats.pendingRevenue ?? 0), sub: "faturas em aberto", icon: "schedule", bgColor: "bg-amber-50", iconColor: "text-amber-600" },
    { label: "Em Atraso", value: formatCurrency(data?.stats.overdueRevenue ?? 0), sub: "faturas vencidas", icon: "warning", bgColor: "bg-red-50", iconColor: "text-red-600" },
    { label: "Previsão deste mês", value: formatCurrency(data?.stats.currentForecast ?? 0), sub: "com vencimento no mês", icon: "event", bgColor: "bg-violet-50", iconColor: "text-violet-600" },
  ];
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{stats.map((stat, index) => <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 fill-mode-both" style={{ animationDelay: `${(index + 1) * 100}ms` }}><div className="flex items-center justify-between mb-3"><div className={cn("p-2.5 rounded-xl", stat.bgColor, stat.iconColor)}><span className="material-symbols-outlined">{stat.icon}</span></div></div><h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</h3><div className="mt-1 flex items-baseline gap-2"><span className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</span><span className="text-xs text-slate-400 font-medium">{stat.sub}</span></div></div>)}</div>;
};
export default DashboardStats;
