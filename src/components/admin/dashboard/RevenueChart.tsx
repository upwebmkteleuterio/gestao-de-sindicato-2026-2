import React from "react";

const RevenueChart = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Receita vs Inadimplência</h3>
          <p className="text-sm text-slate-500">Desempenho financeiro nos últimos 6 meses</p>
        </div>
        <select className="text-sm border-slate-200 rounded-lg text-slate-600 outline-none p-2 border">
          <option>Últimos 6 Meses</option>
          <option>Último Ano</option>
        </select>
      </div>
      <div className="relative h-64 w-full group">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300">
          <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="800" y1="250" y2="250"></line>
          <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="800" y1="200" y2="200"></line>
          <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="800" y1="150" y2="150"></line>
          <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="800" y1="100" y2="100"></line>
          <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="800" y1="50" y2="50"></line>
          
          <path 
            className="animate-in fade-in zoom-in-95 duration-1000 delay-700 origin-bottom fill-mode-both"
            d="M0,250 L0,180 C100,160 200,200 300,150 C400,100 500,120 600,80 C700,40 800,90 800,90 L800,250 Z" 
            fill="url(#blueGradient)" 
            opacity="0.1"
          ></path>
          <path 
            className="animate-in fade-in slide-in-from-left duration-1000 delay-700 fill-mode-both"
            d="M0,180 C100,160 200,200 300,150 C400,100 500,120 600,80 C700,40 800,90 800,90" 
            fill="none" 
            stroke="#0f3460" 
            strokeWidth="3"
          ></path>
          <path 
            className="animate-in fade-in duration-1000 delay-1000 fill-mode-both"
            d="M0,220 C100,210 200,230 300,200 C400,180 500,190 600,170 C700,160 800,150 800,150" 
            fill="none" 
            stroke="#ef4444" 
            strokeDasharray="5,5" 
            strokeWidth="2"
          ></path>
          
          <defs>
            <linearGradient id="blueGradient" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#0f3460", stopOpacity: 1 }}></stop>
              <stop offset="100%" style={{ stopColor: "#0f3460", stopOpacity: 0 }}></stop>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex justify-between px-2 mt-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
        <span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span><span>Jan</span>
      </div>
      <div className="flex items-center gap-6 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-blue-900"></span>
          <span className="text-sm text-slate-600">Receita Arrecadada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-red-500"></span>
          <span className="text-sm text-slate-600">Tendência de Inadimplência</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;