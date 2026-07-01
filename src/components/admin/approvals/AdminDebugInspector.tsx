"use client";

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Bug, Copy, Check, ChevronDown, ChevronUp, Database, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const AdminDebugInspector = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Busca TUDO do banco sem filtros para auditoria
  const { data: allCompanies = [], isLoading, error, refetch } = useQuery({
    queryKey: ["debug-audit-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000 // Atualiza a cada 10s
  });

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success("Dados brutos copiados para o clipboard!");
  };

  const statusCount = {
    pending: allCompanies.filter(c => c.status === 'pending').length,
    approved: allCompanies.filter(c => c.status === 'approved').length,
    rejected: allCompanies.filter(c => c.status === 'rejected').length,
    others: allCompanies.filter(c => !['pending', 'approved', 'rejected'].includes(c.status)).length
  };

  return (
    <div className="mb-8 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/30 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Bug size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-black text-blue-900 uppercase tracking-tighter text-sm">Inspetor de Auditoria de Dados (Debug)</h3>
            <p className="text-xs text-blue-600 font-bold">Monitore o estado bruto do banco em tempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-black">PENDING: {statusCount.pending}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-black">APPROVED: {statusCount.approved}</span>
            {statusCount.others > 0 && (
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-black">INVÁLIDOS: {statusCount.others}</span>
            )}
          </div>
          {isOpen ? <ChevronUp className="text-blue-400" /> : <ChevronDown className="text-blue-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t-2 border-dashed border-blue-200 animate-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-slate-500">
              <Database size={16} />
              <span className="text-xs font-bold uppercase">Base Total: {allCompanies.length} registros</span>
            </div>
            <button 
              onClick={() => refetch()}
              className="text-xs font-black text-blue-600 hover:underline"
            >
              FORÇAR RECARREGAMENTO
            </button>
          </div>

          <div className="space-y-4">
            {allCompanies.map((company) => (
              <div key={company.id} className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`size-2 rounded-full ${company.status === 'pending' ? 'bg-amber-500' : company.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <span className="text-[10px] font-black text-slate-900 truncate max-w-[200px]">{company.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">STATUS: {company.status}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(company)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded text-[10px] font-black hover:bg-blue-700 transition-colors uppercase"
                  >
                    <Copy size={12} /> Copiar JSON Bruto
                  </button>
                </div>
                <div className="p-4">
                  <pre className="text-[10px] leading-relaxed font-mono bg-slate-900 text-emerald-400 p-4 rounded-lg overflow-x-auto max-h-[150px]">
                    {JSON.stringify(company, null, 2)}
                  </pre>
                </div>
              </div>
            ))}

            {allCompanies.length === 0 && !isLoading && (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <AlertTriangle className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-400 uppercase">Nenhum dado encontrado no banco.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDebugInspector;