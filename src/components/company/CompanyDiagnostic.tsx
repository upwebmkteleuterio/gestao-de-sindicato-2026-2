"use client";

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { Bug, Copy, Database, ShieldAlert, UserCheck, RefreshCw, Layers } from "lucide-react";
import { toast } from "sonner";

const CompanyDiagnostic = () => {
  const [report, setReport] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Capturando o estado "da ponte" (Hook da Interface)
  const { company: hookData, isLoading: hookLoading } = useCompany();

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
        roleInMetadata: session?.user.user_metadata?.role,
        roleInStorage: localStorage.getItem('sindicato_user_role')
      };

      // 2. Verdade do Código (Hook State)
      result.hookState = {
        isLoading: hookLoading,
        hasData: !!hookData,
        data: hookData
      };

      // 3. Verdade do Banco (Raw Query)
      const { data: dbData, error: dbErr } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', session?.user.id)
        .maybeSingle();
      
      result.databaseState = {
        found: !!dbData,
        status: dbData?.status,
        error: dbErr?.message,
        rawData: dbData
      };

      // 4. Mismatch Check (Onde a ponte quebra)
      if (result.databaseState.found && !result.hookState.hasData) {
        result.mismatchDetected = true;
        result.mismatchReason = "O banco possui os dados, mas o Hook da interface está retornando vazio (Provável erro de Cache ou Filtro).";
      }

      setReport(result);
      toast.success(result.mismatchDetected ? "ALERTA: Falha na ponte detectada!" : "Integridade confirmada.");
    } catch (e: any) {
      toast.error("Erro fatal no diagnóstico");
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    toast.success("Relatório de Integridade copiado!");
  };

  return (
    <div className="mb-10 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Bug size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Diagnóstico de Fluxo de Execução</h3>
            <p className="text-slate-400 text-xs font-medium">Validando a ponte entre Banco de Dados e Interface</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={runDiagnostic}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50"
          >
            {isRunning ? <RefreshCw className="size-3 animate-spin" /> : <Layers size={14} />}
            EXECUTAR TESTE DE PONTE
          </button>
          {report && (
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all"
            >
              <Copy size={14} />
              COPIAR RESULTADOS
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {!report ? (
          <div className="py-10 text-center flex flex-col items-center gap-3 opacity-40">
            <ShieldAlert size={40} className="text-slate-400" />
            <p className="text-sm font-bold text-slate-400 uppercase">Aguardando execução do teste de fluxo...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {report.mismatchDetected && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-start gap-4 animate-bounce">
                <ShieldAlert className="text-red-500 shrink-0" size={24} />
                <div>
                  <h4 className="text-red-400 font-black text-sm uppercase">FALHA NA PONTE DETECTADA</h4>
                  <p className="text-red-300 text-xs mt-1">{report.mismatchReason}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Database size={16} />
                  <span className="text-[10px] font-black uppercase">Verdade do Banco (RAW)</span>
                </div>
                <p className="text-xs text-white">Status: <span className="text-emerald-400 font-bold">{report.databaseState.status || 'OFFLINE'}</span></p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">Registro encontrado via query bruta.</p>
              </div>
              
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Layers size={16} />
                  <span className="text-[10px] font-black uppercase">Verdade do Código (HOOK)</span>
                </div>
                <p className="text-xs text-white">Estado: <span className={report.hookState.hasData ? 'text-emerald-400' : 'text-red-400'}>{report.hookState.hasData ? 'COM DADOS' : 'VAZIO / NULL'}</span></p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">O que a interface está recebendo do código.</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-black/40 rounded-xl border border-slate-800">
              <p className="text-[10px] font-black text-slate-600 uppercase mb-2">JSON de Integridade para Suporte</p>
              <pre className="text-[10px] text-indigo-300 font-mono overflow-x-auto h-32 no-scrollbar">
                {JSON.stringify(report, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDiagnostic;