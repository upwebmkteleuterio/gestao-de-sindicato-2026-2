import React from "react";
import { cn } from "@/lib/utils";

interface CompaniesListTableProps {
  companies: any[];
  onSelectCompany: (company: any) => void;
  highlightId?: string | null;
}

const CompaniesListTable: React.FC<CompaniesListTableProps> = ({ companies, onSelectCompany, highlightId }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Empresa / CNPJ</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Membros</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Saúde Cadastral</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status Cobrança</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Dívida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((company, i) => {
              const isHighlighted = highlightId === company.id;
              return (
                <tr
                  key={i}
                  data-id={company.id}
                  className={cn(
                    "group hover:bg-slate-50 transition-colors cursor-pointer relative",
                    isHighlighted && "bg-blue-50/50"
                  )}
                  onClick={() => onSelectCompany(company)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm transition-all",
                        company.risk === "Crítico" ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600",
                        isHighlighted && "ring-2 ring-blue-400 ring-offset-2"
                      )}>
                        {company.init}
                      </div>
                      <div>
                        <p className={cn("text-sm font-bold text-slate-900", isHighlighted && "text-blue-700")}>{company.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{company.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-bold text-slate-700">{company.employeesCount}</span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-lg",
                      company.lastUpdate.includes('45') || company.lastUpdate.includes('60')
                        ? "text-red-600 bg-red-50"
                        : "text-emerald-600 bg-emerald-50"
                    )}>
                      {company.lastUpdate}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tight",
                      company.sColor
                    )}>
                      {company.billingStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <p className={cn(
                      "text-sm font-black",
                      company.debt !== "R$ 0,00" ? "text-red-600" : "text-emerald-600"
                    )}>
                      {company.debt}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompaniesListTable;