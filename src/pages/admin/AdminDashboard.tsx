"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["adminDashboardData"] });
      setLastUpdate(new Date());
      toast.success("Dashboard atualizado com sucesso!");
    } catch {
      toast.error("Erro ao atualizar dados.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 fill-mode-both">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Global do Sindicato</h1>
            <p className="text-slate-500 mt-1">Visão geral da saúde dos associados e conformidade financeira.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              Última atualização: {format(lastUpdate, "'Hoje,' HH:mm", { locale: ptBR })}
            </span>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "flex items-center justify-center size-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-900 transition-all active:scale-95 shadow-sm",
                isRefreshing && "animate-spin text-blue-600 border-blue-200 bg-blue-50"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <DashboardStats />

        {/* Main Sections */}
        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-top-4 duration-700 delay-500 fill-mode-both">
          {/* Charts column (Full Width) */}
          <div className="flex flex-col gap-6">
            <RevenueChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;