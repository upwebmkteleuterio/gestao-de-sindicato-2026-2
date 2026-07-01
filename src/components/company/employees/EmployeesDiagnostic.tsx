"use client";

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { useEmployees } from "@/hooks/useEmployees";
import { Bug, Copy, Database, ShieldAlert, RefreshCw, Layers, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const EmployeesDiagnostic = () => {
  const [report, setReport] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const { company } = useCompany();
  const { employees: hookData, isLoading: hookLoading } = useEmployees(company?.id);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const result: any = { 
      timestamp: new Date().toISOString(),
      mismatchDetected: false 
    };

    try {
      // 1. Verdade do Navegador (Sessão)
      const { data: { session } } = await supabase.auth.getSession();
      result.browserState = {
        userId: session?.user.id,
        companyId: company?.id,
      };

      // 2. Verdade do Código (O que o Hook está processando)
      result.hookState = {
        isLoading: hookLoading,
        countInHook: hookData?.length || 0,
        data: hookData?.slice(0, 2)
      };

      // 3. Verdade do Banco (Raw Query Sem Filtros de App)
      const { data: dbData, error: dbErr, count } = await supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .eq('company_id', company?.id);
      
      result.databaseState = {
        totalRecords: count || 0,
        error: dbErr?.message,
        rawData: dbData?.slice(0, 2)
      };

      // 4. Check de Desconexão
      if (result.databaseState.totalRecords > 0 && result.hookState.countInHook === 0) {
        result.mismatchDetected = true;
        result.mismatchReason = "POLÍTICA DE SEGURANÇA (RLS): Existem dados no banco, mas a interface não recebeu nada. Verifique se o seu usuário tem permissão SELECT na tabela 'employees'.";
      }

      setReport(result);
      toast.success(result.mismatchDetected ? "ALERTA: Falha de fluxo detectada!" : "Integridade de dados confirmada.");
    } catch (e: any) {
      toast.error("Erro fatal ao executar diagnóstico.");
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    toast.success("Relatório copiado!");
  };

  return (
    <div className="mb-8 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Bug size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Diagnóstico de Fluxo de Funcionários</h3>
            <p className="text-slate-400 text-xs font-medium">Validando a sincronia entre Banco (RAW) e Interface (HOOK)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={runDiagnostic}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50"
          >
            {isRunning ? <RefreshCw className="size-3 animate-spin" /> : <Layers size={14} />}
            EXECUTAR TESTE
          </button>
          {report && (
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all"
            >
              <Copy size={14} />
              COPIAR
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {!report ? (
          <div className="py-10 text-center flex flex-col items-center gap-3 opacity-40">
            <Database size={40} className="text-slate-400" />
            <p className="text-sm font-bold text-slate-400 uppercase">Aguardando gatilho do teste de fluxo...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {report.mismatchDetected && (
              <div className="bg-red-500/10 border border-red-500/50 p-5 rounded-xl flex items-start gap-4 animate-bounce">
                <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="text-red-400 font-black text-sm uppercase">FALHA DE SINCRONIA DETECTADA</h4>
                  <p className="text-red-200 text-xs mt-1 leading-relaxed">{report.mismatchReason}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Database size={16} />
                  <span className="text-[10px] font-black uppercase">Banco de Dados (Verdade RAW)</span>
                </div>
                <p className="text-xl font-black text-white">{report.databaseState.totalRecords} <span className="text-xs font-normal text-slate-400">Registros Encontrados</span></p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Layers size={16} />
                  <span className="text-[10px] font-black uppercase">Interface (Verdade HOOK)</span>
                </div>
                <p className="text-xl font-black text-white">{report.hookState.countInHook} <span className="text-xs font-normal text-slate-400">Dados Carregados na UI</span></p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-black/40 rounded-xl border border-slate-800">
              <p className="text-[10px] font-black text-slate-600 uppercase mb-2">JSON de Depuração</p>
              <pre className="text-[10px] text-indigo-300 font-mono overflow-x-auto h-24 no-scrollbar">
                {JSON.stringify(report, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesDiagnostic;