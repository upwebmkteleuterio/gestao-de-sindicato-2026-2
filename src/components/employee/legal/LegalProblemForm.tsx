"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface LegalProblemFormProps {
  onNext: (problem: string) => void;
}

const LegalProblemForm: React.FC<LegalProblemFormProps> = ({ onNext }) => {
  const [problem, setProblem] = useState("");

  const handleNext = () => {
    if (problem.length < 10) {
      toast.error("Por favor, descreva seu problema com um pouco mais de detalhes.");
      return;
    }
    onNext(problem);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-xl font-bold text-slate-900">Como podemos te ajudar?</h3>
        <p className="text-slate-500 text-sm mt-1">Descreva brevemente o motivo da sua consulta para que nosso advogado possa se preparar.</p>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Explique seu problema *</label>
          <Textarea 
            placeholder="Ex: Tenho dúvidas sobre o cálculo das minhas férias ou horas extras não pagas..."
            className="min-h-[200px] resize-none border-slate-200 focus:ring-blue-600/20 focus:border-blue-600"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
          />
          <p className="text-xs text-slate-400 italic">Suas informações são confidenciais e protegidas pelo sigilo advogado-cliente.</p>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end rounded-b-xl">
        <button 
          onClick={handleNext}
          className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
        >
          Próxima Etapa
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default LegalProblemForm;