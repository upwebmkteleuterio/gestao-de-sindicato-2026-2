import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FinancialTransaction } from "@/hooks/useFinancialTransactions";

interface FinancialTableProps {
  records: FinancialTransaction[];
}

const FinancialTable: React.FC<FinancialTableProps> = ({ records }) => {
  return (
    <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
      <div className="overflow-x-auto h-full">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 sticky top-0 z-20 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lançamento</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Origem</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => {
              const isIncome = record.type === "entrada";
              return (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-600">{new Date(`${record.transaction_date}T12:00:00`).toLocaleDateString("pt-BR")}</td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-slate-900">{record.title}</p>
                    {record.description && <p className="text-xs text-slate-500 mt-1">{record.description}</p>}
                  </td>
                  <td className="p-4">
                    {record.company ? (
                      <><p className="text-sm font-semibold text-slate-900">{record.company.name}</p><p className="text-xs text-slate-500 font-mono">{record.company.cnpj}</p></>
                    ) : <span className="text-sm text-slate-400">—</span>}
                  </td>
                  <td className="p-4 text-sm text-slate-600">{record.category?.name || "Sem categoria"}</td>
                  <td className="p-4"><Badge variant="outline" className="capitalize">{record.origin === "asaas" ? "Asaas" : "Manual"}</Badge></td>
                  <td className={cn("p-4 text-sm font-black text-right", isIncome ? "text-emerald-600" : "text-red-600")}>
                    {isIncome ? "+" : "−"} {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(record.amount))}
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

export default FinancialTable;
