"use client";

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompaniesManager } from "@/hooks/useCompaniesManager";
import { Bug, Copy, Database, ShieldAlert, UserCheck, RefreshCw, Layers, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const CompaniesDiagnostic = () => {
  const [report, setReport] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Capturando o que a Interface está recebendo
  const { filteredCompanies, storedCompanies, isLoading: hookLoading, statusFilter } = useCompaniesManager();

  const runDiagnostic = async () => {
    setIsRunning(true);
    const result: any = { 
      timestamp: new Date().toISOString(),
      mismatchDetected: false 
    };

    try {
      // 1. Verdade do Navegador (Sessão e Cache)
      const { data: { session } } = await supabase.auth.getSession();
      const roleInStorage = localStorage.getItem('sindicato_user_role');
      
      result.browserState = {
        userId: session?.user.id,
        email: session?.user.email,
        roleInMetadata: session?.user.user_metadata?.role,
        roleInStorage: roleInStorage
      };

      // 2. Verdade do Perfil (Teste de RLS)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session?.user.id)
        .single();
      
      result.authIntegrity = {
        roleInDb: profile?.role,
        isAdmin: profile?.role === 'administrador',
        isMatch: profile?.role === roleInStorage
      };

      // 3. Verdade do Banco (Raw Query Sem Filtros)
      const { data: rawDb, error: dbErr, count } = await supabase
        .from('companies')
        .select('*', { count: 'exact' });
      
      result.databaseState = {
        totalRecords: count || 0,
        error: dbErr?.message,
        rawData: rawDb?.slice(0, 3) // Apenas os 3 primeiros para não travar
      };

      // 4. Verdade do Código (O que o Hook está processando)
      result.hookState = {
        isLoading: hookLoading,
        totalInHook: storedCompanies.length,
        visibleInUi: filteredCompanies.length,
        activeFilter: statusFilter
      };

      // 5. Check de Desconexão (Onde a ponte quebra)
      if (result.databaseState.totalRecords > 0 && result.hookState.totalInHook === 0) {
        result.mismatchDetected = true;
        result.mismatchReason = "RLS OU POLÍTICA DE SEGURANÇA: O banco tem dados, mas o seu usuário não tem permissão de leitura (SELECT) na tabela 'companies'.";
      } else if (result.hookState.totalInHook > 0 && result.hookState.visibleInUi === 0) {
        result.mismatchDetected = true;
        result.mismatchReason = `FILTRO DE INTERFACE: O Hook carregou ${result.hookState.totalInHook} empresas, mas o filtro '${statusFilter}' as escondeu da lista.`;
      }

      setReport(result);
      if (result.mismatchDetected) {
        toast.error("FALHA DETECTADA: Dados bloqueados no fluxo.");
      } else {
        toast.success("Teste de fluxo concluído com sucesso.");
      }
    } catch (e: any) {
      toast.error("Erro fatal ao executar diagnóstico.");
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    toast.success("Relatório copiado para o clipboard!");
  };

  return (
    <div className="mb-8 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Bug size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Diagnóstico de Fluxo de Execução (Empresas)</h3>
            <p className="text-slate-400 text-xs font-medium">Comparação em tempo real: Banco de Dados vs Interface</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={runDiagnostic}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50"
          >
            {isRunning ? <RefreshCw className="size-3 animate-spin" /> : <Layers size={14} />}
            EXECUTAR TESTE COMPLETO
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
            <p className="text-sm font-bold text-slate-400 uppercase">Aguardando gatilho do teste de integridade...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {report.mismatchDetected && (
              <div className="bg-red-500/10 border border-red-500/50 p-5 rounded-xl flex items-start gap-4 animate-in slide-in-from-top-2">
                <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="text-red-400 font-black text-sm uppercase tracking-tight">BLOQUEIO DE FLUXO DETECTADO</h4>
                  <p className="text-red-200 text-xs mt-1 leading-relaxed">{report.mismatchReason}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Database size={16} />
                  <span className="text-[10px] font-black uppercase">Banco de Dados (Bruto)</span>
                </div>
                <p className="text-xl font-black text-white">{report.databaseState.totalRecords} <span className="text-xs font-normal text-slate-400">Registros</span></p>
                {report.databaseState.error && <p className="text-[9px] text-red-400 font-bold mt-1 uppercase">Erro: {report.databaseState.error}</p>}
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Layers size={16} />
                  <span className="text-[10px] font-black uppercase">Hook / Memória</span>
                </div>
                <p className="text-xl font-black text-white">{report.hookState.totalInHook} <span className="text-xs font-normal text-slate-400">Carregados</span></p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">O que o código conseguiu ler.</p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <UserCheck size={16} />
                  <span className="text-[10px] font-black uppercase">Permissão (Admin)</span>
                </div>
                <p className={`text-xl font-black ${report.authIntegrity.isAdmin ? 'text-emerald-400' : 'text-red-400'}`}>
                  {report.authIntegrity.isAdmin ? 'RECONHECIDO' : 'NEGADO'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">Role verificada no servidor.</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-black/40 rounded-xl border border-slate-800">
              <p className="text-[10px] font-black text-slate-600 uppercase mb-2">JSON de Depuração Técnica</p>
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

export default CompaniesDiagnostic;