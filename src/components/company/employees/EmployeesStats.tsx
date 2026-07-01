"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useCompany } from "@/hooks/useCompany";
import { useEmployees } from "@/hooks/useEmployees";

const EmployeesStats = () => {
  const { company } = useCompany();
  const { employees } = useEmployees(company?.id);

  const total = employees?.length || 0;
  const associates = employees?.filter(e => e.status === "Associado").length || 0;
  const leave = employees?.filter(e => e.contract_status && e.contract_status !== "Ativo").length || 0;

  const stats = [
    { label: "Total de Funcionários", value: total.toString(), icon: "groups", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Associados ao Sindicato", value: associates.toString(), icon: "verified", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Afastados / Licença", value: leave.toString(), icon: "person_off", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className={cn("size-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
            <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeesStats;