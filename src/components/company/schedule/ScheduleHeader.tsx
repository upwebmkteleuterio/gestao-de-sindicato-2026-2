import React from "react";
import { cn } from "@/lib/utils";

interface ScheduleHeaderProps {
  currentStep: number;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ currentStep }) => {
  return (
    <div className="flex flex-col gap-8">
      {/* Header da Página */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900">Agendar Homologação</h1>
        <p className="text-slate-500 text-base font-normal">Reserve um horário para análise e homologação da rescisão de contrato do funcionário.</p>
      </div>

      {/* Stepper */}
      <div className="w-full">
        <div className="flex items-center justify-between relative mb-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
          
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center font-bold ring-4 ring-[#f8f9fc]",
              currentStep >= 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-200 text-slate-500"
            )}>
              {currentStep > 1 ? <span className="material-symbols-outlined text-xl">check</span> : <span>1</span>}
            </div>
            <span className={cn("text-sm font-bold hidden sm:block", currentStep >= 1 ? "text-blue-600" : "text-slate-500")}>Status da Empresa</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center font-bold ring-4 ring-[#f8f9fc]",
              currentStep >= 2 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-200 text-slate-500"
            )}>
              {currentStep > 2 ? <span className="material-symbols-outlined text-xl">check</span> : <span>2</span>}
            </div>
            <span className={cn("text-sm font-bold hidden sm:block", currentStep >= 2 ? "text-slate-900" : "text-slate-500")}>Seleção do Funcionário</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center font-bold ring-4 ring-[#f8f9fc]",
              currentStep >= 3 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-200 text-slate-500"
            )}>
              {currentStep > 3 ? <span className="material-symbols-outlined text-xl">check</span> : <span>3</span>}
            </div>
            <span className={cn("text-sm font-bold hidden sm:block", currentStep >= 3 ? "text-slate-900" : "text-slate-500")}>Data e Hora</span>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center font-bold ring-4 ring-[#f8f9fc]",
              currentStep >= 4 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-200 text-slate-500"
            )}>
              <span>4</span>
            </div>
            <span className={cn("text-sm font-bold hidden sm:block", currentStep >= 4 ? "text-slate-900" : "text-slate-500")}>Confirmação</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleHeader;