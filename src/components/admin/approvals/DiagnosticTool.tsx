"use client";

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bug, Copy, Database, ShieldAlert, UserCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const DiagnosticTool = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const report: any = { timestamp: new Date().toISOString(), tests: [] };

    try {
      // Teste 1: Sessão Atual
      const { data: sessionData } = await supabase.auth.getSession();
      report.session = {
        userId: sessionData.session?.user.id,
        email: sessionData.session?.user.email,
        roleInMetadata: sessionData.session?.user.user_metadata?.role
      };

      // Teste 2: Perfil do Admin no Banco
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', sessionData.session?.user.id).single();
      report.adminProfile = profile;

      // Teste 3: Busca Bruta (Sem filtros, sem joins)
      const { data: rawCompanies, error: err1 } = await supabase.from('companies').select('*').limit(5);
      report.tests.push({ name: "Busca Bruta Companies", count: rawCompanies?.length, error: err1?.message });

      // Teste 4: Busca Pendentes (Sem joins)
      const { data: pendingRaw, error: err2 } = await supabase.from('companies').select('*').eq('status', 'pending');
      report.tests.push({ name: "Pendentes sem Join", count: pendingRaw?.length, error: err2?.message, ids: pendingRaw?.map(c => c.id) });

      // Teste 5: Busca com Join (O que está falhando)
      const { data: joinTest, error: err3 } = await supabase.from('companies').select('id, name, status, owner_id, profiles(id, first_name)').eq('status', 'pending');
      report.tests.push({ name: "Teste com Join Profiles", count: joinTest?.length, error: err3?.message });

      // Teste 6: Acesso Direto a Profiles de Terceiros
      if (pendingRaw && pendingRaw.length > 0) {
        const firstOwner = pendingRaw[0].owner_id;
        const { data: thirdPartyProfile, error: err4 } = await supabase.from('profiles').select('id, first_name').eq('id', firstOwner).single();
        report.tests.push({ name: "Acesso Perfil Terceiro", success: !!thirdPartyProfile, error: err4?.message });
      }

      setLogs([report]);
      toast.success("Diagnóstico concluído!");
    } catch (e: any) {
      toast.error("Erro ao rodar diagnóstico");
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
    toast.success("Relatório copiado! Cole no chat para análise.");
  };

  return (
    <div className="mb-10 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Bug size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Console de Diagnóstico Sênior</h3>
            <p className="text-slate-400 text-xs font-medium">Use para identificar por que os dados sumiram</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={runDiagnostic}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50"
          >
            {isRunning ? <RefreshCw className="size-3 animate-spin" /> : <Database size={14} />}
            EXECUTAR TESTES
          </button>
          {logs.length > 0 && (
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
        {logs.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center gap-3 opacity-40">
            <ShieldAlert size={40} className="text-slate-400" />
            <p className="text-sm font-bold text-slate-400 uppercase">Aguardando execução dos testes de integridade...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <UserCheck size={16} />
                  <span className="text-[10px] font-black uppercase">Sessão</span>
                </div>
                <p className="text-xs text-white font-mono truncate">{logs[0].session.email}</p>
                <p className="text-[10px] text-slate-500 font-bold mt-1">ROLE: {logs[0].adminProfile?.role || 'Não definido'}</p>
              </div>
              
              {logs[0].tests.map((test: any, i: number) => (
                <div key={i} className={`p-4 rounded-xl border ${test.error ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{test.name}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-black ${test.error ? 'text-red-400' : 'text-white'}`}>
                      {test.count !== undefined ? test.count : (test.success ? 'OK' : 'FALHA')}
                    </span>
                    {test.error && <span className="text-[9px] text-red-400 font-bold uppercase">Erro de RLS</span>}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-black/40 rounded-xl border border-slate-800">
              <p className="text-[10px] font-black text-slate-600 uppercase mb-2">JSON Bruto para Suporte</p>
              <pre className="text-[10px] text-indigo-300 font-mono overflow-x-auto h-32 no-scrollbar">
                {JSON.stringify(logs[0], null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticTool;