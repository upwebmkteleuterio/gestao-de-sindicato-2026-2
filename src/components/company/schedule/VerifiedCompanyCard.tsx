"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface VerifiedCompanyCardProps {
  company: any;
}

const VerifiedCompanyCard: React.FC<VerifiedCompanyCardProps> = ({ company }) => {
  if (!company) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm opacity-90">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-green-500">verified</span>
          <h3 className="font-bold text-slate-900">Empresa Verificada</h3>
        </div>
        <button className="text-blue-600 text-sm font-medium hover:underline opacity-50 cursor-not-allowed">Editar</button>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Nome da Empresa</p>
          <p className="text-sm font-bold text-slate-900">{company.name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">CNPJ</p>
          <p className="text-sm font-bold text-slate-900">{company.cnpj}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Situação Sindical</p>
          <div className="mt-1">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
              company.status === 'approved' 
                ? "bg-green-50 text-green-700 border-green-100" 
                : "bg-amber-50 text-amber-700 border-amber-100"
            )}>
              <span className={cn("size-1.5 rounded-full", company.status === 'approved' ? "bg-green-500" : "bg-amber-500")}></span>
              {company.status === 'approved' ? "Ativo e Regular" : "Pendente de Aprovação"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiedCompanyCard;