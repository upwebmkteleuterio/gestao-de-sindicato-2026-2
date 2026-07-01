import React from "react";
import { cn } from "@/lib/utils";

interface LegalScheduleHeaderProps {
  currentStep: number;
}

const LegalScheduleHeader: React.FC<LegalScheduleHeaderProps> = ({ currentStep }) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900">Agendar Consulta Jurídica</h1>
        <p className="text-slate-500 text-base font-normal">Solicite suporte especializado para dúvidas trabalhistas ou previdenciárias.</p>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between relative mb-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
          
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center font-bold ring-4 ring-[#f8f9fc]",
              currentStep >= 1 ? "bg-blue-600 text-white shadow-lg" : "bg-slate-200 text-slate-500"
            )}>
              {currentStep > 1 ? <span className="material-symbols-outlined text-xl">check</span> : <span>1</span>}
            </div>
            <span className={cn("text-xs font-bold hidden sm:block", currentStep >= 1 ? "text-blue-600" : "text-slate-500")}>Verificação</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center font-bold ring-4 ring-[#f8f9fc]",
              currentStep >= 2 ? "bg-blue-600 text-white shadow-lg" : "bg-slate-200 text-slate-500"
            )}>
              {currentStep > 2 ? <span className="material-symbols-outlined text-xl">check</span> : <span>2</span>}
            </div>
            <span className={cn("text-xs font-bold hidden sm:block", currentStep >= 2 ? "text-slate-900" : "text-slate-500")}>Descrição</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center font-bold ring-4 ring-[#f8f9fc]",
              currentStep >= 3 ? "bg-blue-600 text-white shadow-lg" : "bg-slate-200 text-slate-500"
            )}>
              {currentStep > 3 ? <span className="material-symbols-outlined text-xl">check</span> : <span>3</span>}
            </div>
            <span className={cn("text-xs font-bold hidden sm:block", currentStep >= 3 ? "text-slate-900" : "text-slate-500")}>Data e Hora</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center font-bold ring-4 ring-[#f8f9fc]",
              currentStep >= 4 ? "bg-blue-600 text-white shadow-lg" : "bg-slate-200 text-slate-500"
            )}>
              <span>4</span>
            </div>
            <span className={cn("text-xs font-bold hidden sm:block", currentStep >= 4 ? "text-slate-900" : "text-slate-500")}>Finalizado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalScheduleHeader;