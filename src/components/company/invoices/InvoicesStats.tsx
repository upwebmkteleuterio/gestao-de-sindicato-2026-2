"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useFinancials } from "@/hooks/useFinancials";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const InvoicesStats = () => {
  const { invoices, isLoading: loadingFin } = useFinancials();
  const { company, isLoading: loadingComp } = useCompany();

  const { data: settings } = useQuery({
    queryKey: ['financial-settings-stats'],
    queryFn: async () => {
      const { data } = await supabase.from('financial_settings').select('grace_period_days').order('updated_at', { ascending: false }).limit(1).single();
      return data;
    }
  });

  const statsData = useMemo(() => {
    if (!invoices) return null;
    const graceDays = settings?.grace_period_days || 0;
    const today = new Date();

    // 1. Próximo Vencimento
    const pendingInvoices = invoices
      .filter(inv => inv.status === 'Pendente')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    
    const nextInvoice = pendingInvoices[0];
    const nextDueLabel = nextInvoice
      ? format(new Date(nextInvoice.due_date), "dd 'de' MMMM", { locale: ptBR })
      : "Nenhuma pendência";
    const nextDueValue = nextInvoice
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nextInvoice.amount)
      : "R$ 0,00";

    // 2. Total Pago no Ano Atual
    const currentYear = new Date().getFullYear();
    const paidInvoices = invoices.filter(inv =>
      inv.status === 'Pago' &&
      new Date(inv.due_date).getFullYear() === currentYear
    );
    const totalPaidValue = paidInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    const totalPaidFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaidValue);

    // 3. Situação Cadastral com Inteligência de Carência
    const hasCriticalOverdue = invoices.some(inv => {
      if (inv.status === 'Pago') return false;
      const limitDate = addDays(new Date(inv.due_date), graceDays);
      return isBefore(limitDate, today);
    });

    return [
      {
        label: "Próximo Vencimento",
        value: nextDueValue,
        sub: nextDueLabel,
        icon: "calendar_today",
        color: "text-blue-600",
        bg: "bg-blue-50"
      },
      {
        label: `Total Pago (${currentYear})`,
        value: totalPaidFormatted,
        sub: `${paidInvoices.length} faturas quitadas`,
        icon: "check_circle",
        color: "text-emerald-600",
        bg: "bg-emerald-50"
      },
      {
        label: "Situação Cadastral",
        value: hasCriticalOverdue ? "Inadimplente" : "Regular",
        sub: hasCriticalOverdue ? "Faturas em atraso crítico" : "Sem restrições de prazo",
        icon: hasCriticalOverdue ? "warning" : "verified_user",
        color: hasCriticalOverdue ? "text-red-600" : "text-blue-900",
        bg: hasCriticalOverdue ? "bg-red-50" : "bg-slate-100"
      },
    ];
  }, [invoices, company, settings, ptBR]);

  if (loadingFin || loadingComp) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statsData?.map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
          <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
            <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvoicesStats;