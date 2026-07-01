import React from "react";
import { cn } from "@/lib/utils";
import { useFinancials } from "@/hooks/useFinancials";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, isBefore, startOfDay } from "date-fns";

const CompanyDashboardStats = () => {
  const { invoices, stats, isLoading } = useFinancials();

  const { data: settings } = useQuery({
    queryKey: ['financial-settings-dash'],
    queryFn: async () => {
      const { data } = await supabase.from('financial_settings').select('grace_period_days').order('updated_at', { ascending: false }).limit(1).single();
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const graceDays = settings?.grace_period_days || 0;
  const today = startOfDay(new Date());
  
  const criticalOverdueAmount = invoices
    ?.filter(inv => inv.status === 'Pendente' && isBefore(addDays(new Date(inv.due_date), graceDays), today))
    .reduce((acc, inv) => acc + Number(inv.amount), 0) || 0;

  const hasAtraso = criticalOverdueAmount > 0;

  const items = [
    {
      label: "A Vencer",
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.pendingAmount),
      trend: "Total pendente em aberto",
      icon: "payments",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderClass: "border-l-blue-600"
    },
    {
      label: "Atrasado (Carência Aplicada)",
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(criticalOverdueAmount),
      trend: hasAtraso ? "Atraso além do prazo permitido" : "Nenhum atraso crítico",
      icon: hasAtraso ? "warning" : "gpp_good",
      color: hasAtraso ? "text-red-600" : "text-emerald-600",
      bgColor: hasAtraso ? "bg-red-50" : "bg-emerald-50",
      borderClass: hasAtraso ? "border-l-red-600" : "border-l-emerald-600"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((stat, i) => (
        <div key={i} className={cn(
          "bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-600/30 transition-all border-l-4",
          stat.borderClass
        )}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
            </div>
            <div className={cn("p-2 rounded-lg", stat.bgColor, stat.color)}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">{stat.trend}</p>
        </div>
      ))}
    </div>
  );
};

export default CompanyDashboardStats;