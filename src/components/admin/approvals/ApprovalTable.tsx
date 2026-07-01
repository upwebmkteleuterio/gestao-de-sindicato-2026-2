import React from "react";
import { cn } from "@/lib/utils";

export interface ApprovalRequest {
  id: string;
  name: string;
  initials: string;
  type: "Empresa" | "Funcionário";
  requestType?: "Novo Cadastro" | "Atualização";
  date: string;
  time: string;
  status: string;
  avatar?: string;
  details?: any;
  previousData?: any;
}

interface ApprovalTableProps {
  requests: ApprovalRequest[];
  onSelectRequest: (request: ApprovalRequest) => void;
}

const ApprovalTable: React.FC<ApprovalTableProps> = ({ requests, onSelectRequest }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Solicitante</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Tipo de Pedido</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Data de Envio</th>
              <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr 
                key={req.id} 
                onClick={() => onSelectRequest(req)}
                className="group hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {req.initials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{req.name}</p>
                      <p className="text-xs text-slate-500 font-mono">ID: {req.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1">
                    <span className={cn(
                      "inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                      req.requestType === "Atualização" 
                        ? "bg-blue-50 text-blue-700 border-blue-100" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                      {req.requestType || "Novo Cadastro"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Entidade: {req.type}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-slate-600 font-bold">{req.date}</p>
                  <p className="text-xs text-slate-400">{req.time}</p>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 transition-colors">visibility</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalTable;