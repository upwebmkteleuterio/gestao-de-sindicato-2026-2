import React from "react";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";

const RevenueChart = () => {
  const { data, isLoading, error } = useAdminDashboardData();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-96 flex items-center justify-center">
        <Loader2 className="animate-spin size-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 bg-red-100 border border-red-400 rounded-lg text-red-700">Erro ao carregar dados do gráfico: {error.message}</div>;
  }

  const monthlyData = data?.monthlyRevenue || [];
  const maxAmount = Math.max(...monthlyData.flatMap(d => [d.collected, d.pending])) || 1;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900">Receita vs Inadimplência</CardTitle>
        <p className="text-sm text-slate-500">Desempenho financeiro nos últimos 6 meses</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-between h-64 gap-4 p-2 border-b border-slate-200">
          {monthlyData.map((d, index) => {
            const collectedHeight = (d.collected / maxAmount) * 100;
            const pendingHeight = (d.pending / maxAmount) * 100;

            return (
              <div key={index} className="flex flex-col items-center justify-end h-full flex-1 group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                    <p className="font-bold">{d.month}</p>
                    <p>Pago: {formatCurrency(d.collected)}</p>
                    <p>Pendente: {formatCurrency(d.pending)}</p>
                </div>

                {/* Pending Bar (Red) */}
                <div 
                  className="w-full bg-red-500 rounded-t-sm transition-all duration-500" 
                  style={{ height: `${pendingHeight * 0.8}px` }} // Scale down for visual appeal
                ></div>
                {/* Collected Bar (Blue) */}
                <div 
                  className="w-full bg-blue-600 rounded-t-sm transition-all duration-500" 
                  style={{ height: `${collectedHeight * 0.8}px` }} // Scale down for visual appeal
                ></div>
              </div>
            );
          })}
        </div>
        
        {/* X-Axis Labels */}
        <div className="flex justify-between px-2 mt-2 text-xs text-slate-500 font-medium uppercase tracking-wide">
          {monthlyData.map((d, index) => (
            <span key={index} className="flex-1 text-center">{d.month}</span>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-blue-600"></span>
            <span className="text-sm text-slate-600">Receita Arrecadada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-red-500"></span>
            <span className="text-sm text-slate-600">Receita Pendente</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;