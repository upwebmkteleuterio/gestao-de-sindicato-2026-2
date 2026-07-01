import React from "react";
import { cn } from "@/lib/utils";

interface FinancialTableProps {
  records: any[];
}

const FinancialTable: React.FC<FinancialTableProps> = ({ records }) => {
  return (
    <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="overflow-x-auto h-full">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 sticky top-0 z-20 border-b border-slate-200">
            <tr>
              <th className="p-4 w-12"><input className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" type="checkbox"/></th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Razão Social</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">CNPJ</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Dívida Total</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Último Contato</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((row, i) => (
              <tr key={i} className={cn(
                "group transition-colors",
                row.selected ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-slate-50"
              )}>
                <td className="p-4 relative">
                  {row.selected && <div className="absolute inset-y-0 left-0 w-1 bg-blue-600"></div>}
                  <input 
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" 
                    type="checkbox" 
                    defaultChecked={row.selected}
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {row.init}
                    </div>
                    <div>
                      <p className={cn("text-sm font-bold", row.selected ? "text-blue-700" : "text-slate-900")}>{row.name}</p>
                      <p className="text-xs text-slate-500">{row.sub}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600 font-mono">{row.cnpj}</td>
                <td className="p-4">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
                    row.sColor
                  )}>
                    {row.status}
                  </span>
                </td>
                <td className="p-4 text-sm font-black text-slate-900 text-right">{row.debt}</td>
                <td className="p-4 text-sm text-slate-500">{row.lastContact}</td>
                <td className="p-4 text-right">
                  <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 hover:bg-blue-50 rounded-lg">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialTable;