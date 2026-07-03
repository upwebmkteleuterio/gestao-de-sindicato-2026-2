import React from "react";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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
  const chartWidth = 800;
  const chartHeight = 300;
  const paddingBottom = 50; // Space for X-axis labels

  // Function to generate SVG path data (d attribute)
  const generatePath = (key: 'collected' | 'pending', isArea: boolean = false) => {
    if (monthlyData.length === 0) return "";

    const points = monthlyData.map((d, index) => {
      const x = (index / (monthlyData.length - 1)) * chartWidth;
      // Scale Y value: 0 is bottom (chartHeight - paddingBottom), maxAmount is top (0)
      const y = chartHeight - paddingBottom - ((d[key] / maxAmount) * (chartHeight - paddingBottom));
      return `${x},${y}`;
    }).join(' ');

    let path = `M${points.replace(/ /g, ' L')}`;

    if (isArea) {
      // Close the path for area fill
      path += ` L${chartWidth},${chartHeight - paddingBottom} L0,${chartHeight - paddingBottom} Z`;
    }
    
    return path;
  };

  const collectedPath = generatePath('collected');
  const collectedAreaPath = generatePath('collected', true);
  const pendingPath = generatePath('pending');

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900">Receita vs Inadimplência</CardTitle>
        <p className="text-sm text-slate-500">Desempenho financeiro nos últimos {monthlyData.length} meses</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative h-64 w-full group">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Grid Lines (Horizontal) */}
            {[0, 50, 100, 150, 200, 250].map(y => (
                <line key={y} stroke="#e5e7eb" strokeWidth="1" x1="0" x2={chartWidth} y1={y} y2={y} />
            ))}
            
            {/* Collected Revenue Area (Blue Shadow) */}
            <path 
              d={collectedAreaPath} 
              fill="url(#blueGradient)" 
              opacity="0.2"
            ></path>

            {/* Collected Revenue Line (Blue) */}
            <path 
              d={collectedPath} 
              fill="none" 
              stroke="#3b82f6" // Blue-500
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>

            {/* Pending Revenue Line (Red Dotted) */}
            <path 
              d={pendingPath} 
              fill="none" 
              stroke="#ef4444" // Red-500
              strokeDasharray="5,5" 
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
            
            <defs>
              <linearGradient id="blueGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }}></stop>
                <stop offset="100%" style={{ stopColor: "#3b82f6", stopOpacity: 0 }}></stop>
              </linearGradient>
            </defs>
          </svg>
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