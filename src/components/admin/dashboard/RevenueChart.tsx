import React, { useState } from "react";
import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";

const RevenueChart: React.FC<{ currentMonth: boolean }> = ({ currentMonth }) => {
  const { data, isLoading, error } = useAdminDashboardData(currentMonth);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
  const maxAmount = Math.max(...monthlyData.flatMap(d => [d.received, d.pending, d.overdue])) || 1;
  const chartWidth = 800;
  const chartHeight = 300;
  const paddingBottom = 50;
  const chartAreaHeight = chartHeight - paddingBottom;
  const columnWidth = chartWidth / Math.max(monthlyData.length, 1);
  const getPointX = (index: number) => monthlyData.length === 1 ? chartWidth / 2 : (index / (monthlyData.length - 1)) * chartWidth;

  // 1. Calculate data points
  const receivedPoints = monthlyData.map((d, index) => ({
    x: getPointX(index),
    y: chartAreaHeight - ((d.received / maxAmount) * chartAreaHeight),
    data: d,
  }));

  const pendingPoints = monthlyData.map((d, index) => ({
    x: getPointX(index),
    y: chartAreaHeight - ((d.pending / maxAmount) * chartAreaHeight),
    data: d,
  }));

  // 2. Function to generate smooth curve path (Cubic Bézier approximation)
  const getCurvePath = (dataPoints: { x: number, y: number }[], isArea: boolean = false) => {
    if (dataPoints.length === 0) return "";
    if (dataPoints.length === 1) return `M${dataPoints[0].x},${dataPoints[0].y} L${dataPoints[0].x},${dataPoints[0].y}`;

    let path = `M${dataPoints[0].x},${dataPoints[0].y}`;

    for (let i = 0; i < dataPoints.length - 1; i++) {
        const p0 = dataPoints[i];
        const p1 = dataPoints[i + 1];

        // Simple control point approximation for smooth curve
        const tension = 0.3;
        const cp1x = p0.x + (p1.x - p0.x) * tension;
        const cp1y = p0.y;
        const cp2x = p1.x - (p1.x - p0.x) * tension;
        const cp2y = p1.y;

        path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
    }

    if (isArea) {
        // Close the path for area fill
        path += ` L${dataPoints[dataPoints.length - 1].x},${chartAreaHeight} L${dataPoints[0].x},${chartAreaHeight} Z`;
    }

    return path;
  };

  const receivedPath = getCurvePath(receivedPoints);
  const receivedAreaPath = getCurvePath(receivedPoints, true);
  const pendingPath = getCurvePath(pendingPoints);
  const overduePoints = monthlyData.map((d, index) => ({ x: getPointX(index), y: chartAreaHeight - ((d.overdue / maxAmount) * chartAreaHeight), data: d }));
  const overduePath = getCurvePath(overduePoints);
  
  const hoveredData = hoveredIndex !== null ? monthlyData[hoveredIndex] : null;
  const hoveredPoint = hoveredIndex !== null ? receivedPoints[hoveredIndex] : null;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900">Recebimentos e valores em aberto</CardTitle>
        <p className="text-sm text-slate-500">Recebimentos confirmados, valores pendentes e vencidos nos últimos {monthlyData.length} meses</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative h-64 w-full group" onMouseLeave={() => setHoveredIndex(null)}>
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Grid Lines (Horizontal) - Adjusted to use chartAreaHeight */}
            {[0, 50, 100, 150, 200, 250].map(y => (
                <line key={y} stroke="#e5e7eb" strokeWidth="1" x1="0" x2={chartWidth} y1={y} y2={y} />
            ))}
            
            {/* Received Revenue Area (Blue Shadow) */}
            <path 
              d={receivedAreaPath} 
              fill="url(#blueGradient)" 
              opacity="0.2"
            ></path>

            {/* Collected Revenue Line (Blue Smooth Curve) */}
            <path 
              d={receivedPath} 
              fill="none" 
              stroke="#10b981"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>

            {/* Pending Revenue Line (Red Dotted Smooth Curve) */}
            <path d={overduePath} fill="none" stroke="#ef4444" strokeDasharray="3,4" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"></path>
            <path 
              d={pendingPath} 
              fill="none" 
              stroke="#f59e0b"
              strokeDasharray="5,5"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
            
            {monthlyData.length === 1 && <>
              <circle cx={receivedPoints[0].x} cy={receivedPoints[0].y} r="5" fill="#10b981" stroke="white" strokeWidth="2" />
              <circle cx={pendingPoints[0].x} cy={pendingPoints[0].y} r="5" fill="#f59e0b" stroke="white" strokeWidth="2" />
              <circle cx={overduePoints[0].x} cy={overduePoints[0].y} r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
            </>}

            {/* Hover Points (Invisible hit areas for Tooltip) */}
            {receivedPoints.map((point, index) => (
                <rect
                    key={index}
                    x={index * columnWidth}
                    y={0}
                    width={columnWidth}
                    height={chartAreaHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ cursor: 'pointer' }}
                />
            ))}

            {/* Hover Indicator (Circle on the collected line) */}
            {hoveredPoint && (
                <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="6"
                    fill="#10b981"
                    stroke="white"
                    strokeWidth="2"
                    style={{ pointerEvents: 'none' }}
                />
            )}

            <defs>
              <linearGradient id="blueGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#10b981", stopOpacity: 1 }}></stop>
                <stop offset="100%" style={{ stopColor: "#3b82f6", stopOpacity: 0 }}></stop>
              </linearGradient>
            </defs>
          </svg>

          {/* Tooltip Component (Outside SVG for easier styling) */}
          {hoveredData && hoveredPoint && (
            <div
                className={cn(
                    "absolute bg-slate-900 text-white p-2 rounded-lg shadow-xl transition-opacity duration-200 z-50 w-max",
                    hoveredPoint.x > chartWidth / 2 ? "right-0" : "left-0" // Position tooltip to avoid overflow
                )}
                style={{
                    top: hoveredPoint.y * (256 / chartHeight) - 100, // Scale Y position to actual div height (256px)
                    transform: `translateX(${hoveredPoint.x * (800 / chartWidth)}px) translateX(-50%)`,
                    left: 0,
                    pointerEvents: 'none',
                }}
            >
                <p className="text-xs font-bold border-b border-slate-700 pb-1 mb-1">Mês: {hoveredData.month}</p>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-400">Recebido: {formatCurrency(hoveredData.received)}</p>
                    <p className="text-sm font-medium text-amber-400">A receber: {formatCurrency(hoveredData.pending)}</p><p className="text-sm font-medium text-red-400">Em atraso: {formatCurrency(hoveredData.overdue)}</p>
                </div>
            </div>
          )}
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
            <span className="size-3 rounded-full bg-emerald-500"></span>
            <span className="text-sm text-slate-600">Receita Recebida</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-amber-500"></span>
            <span className="text-sm text-slate-600">A receber</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-red-500"></span>
            <span className="text-sm text-slate-600">Em atraso</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;