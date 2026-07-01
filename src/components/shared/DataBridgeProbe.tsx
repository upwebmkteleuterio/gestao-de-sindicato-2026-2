import React, { useState } from 'react';
import { useDataProbe, ScanResult } from '@/hooks/useDataProbe';
import { 
  Activity, 
  Database, 
  ShieldAlert, 
  Terminal, 
  Copy, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface DataBridgeProbeProps {
  entityId?: string;
  tableName?: string;
  uiData?: any[];
  dbData?: any[];
}

export const DataBridgeProbe: React.FC<DataBridgeProbeProps> = ({ 
  entityId, 
  tableName, 
  uiData = [], 
  dbData = [] 
}) => {
  const { logs, isScanning, deepScan, generateMismatchReport, clearLogs } = useDataProbe();
  const [isOpen, setIsOpen] = useState(false);

  const report = generateMismatchReport(dbData, uiData);
  const isHealthy = !report.mismatch && (dbData.length > 0 || uiData.length === 0);
  const hasCriticalFailure = report.dbCount > 0 && report.uiCount === 0;

  const handleScan = async () => {
    if (!tableName || !entityId) {
      toast.error('Tabela ou ID não fornecidos para varredura');
      return;
    }
    await deepScan(tableName, entityId);
    toast.success('Varredura completa efetuada');
  };

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('JSON copiado!');
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      {/* Integrity Banner */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-full shadow-2xl border backdrop-blur-md transition-all cursor-pointer",
        hasCriticalFailure ? "bg-red-600 text-white border-red-400 animate-pulse" :
        !isHealthy ? "bg-amber-500 text-white border-amber-400" :
        "bg-slate-900 text-white border-slate-700"
      )} onClick={() => setIsOpen(!isOpen)}>
        {hasCriticalFailure ? <ShieldAlert className="size-4" /> : 
         !isHealthy ? <AlertTriangle className="size-4" /> : 
         <CheckCircle2 className="size-4 text-emerald-400" />}
        
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest divide-x divide-white/20">
          <span className="flex items-center gap-1"><Database className="size-3" /> DB: {report.dbCount}</span>
          <span className="pl-2">UI: {report.uiCount}</span>
          <span className="pl-2">
            {hasCriticalFailure ? "PONTE QUEBRADA" : isHealthy ? "INTEGRIDADE OK" : "DIVERGÊNCIA"}
          </span>
        </div>
        {isOpen ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
      </div>

      {/* Log Monitor Panel */}
      {isOpen && (
        <div className="w-[450px] h-[550px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <header className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">Data-Bridge Monitor v1.0</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(logs)} className="size-8 text-slate-500 hover:text-white hover:bg-slate-800">
                <Copy className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={clearLogs} className="size-8 text-slate-500 hover:text-red-400 hover:bg-slate-800">
                <Trash2 className="size-4" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-2 border-b border-slate-800 text-[10px] font-black uppercase text-slate-500">
              <div className="px-4 py-3 border-r border-slate-800 bg-slate-900/30 text-indigo-400 flex items-center gap-2">
                <Activity size={12} /> Execution Trace
              </div>
              <button className="px-4 py-3 hover:bg-slate-900 transition-colors text-white bg-indigo-600" onClick={handleScan}>
                {isScanning ? "Scanning..." : "Run Deep Scan"}
              </button>
            </div>

            <ScrollArea className="flex-1 p-5">
              {report.mismatch && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Mismatch Detected</p>
                  <p className="text-xs text-red-200 font-medium leading-relaxed">{report.reason}</p>
                </div>
              )}

              <div className="space-y-4">
                {logs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-700">
                    <Activity className="size-12 mb-3 opacity-10 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Aguardando transações...</p>
                  </div>
                )}
                {logs.map((log) => (
                  <div key={log.id} className="group relative bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                        log.type === 'SCAN' ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      )}>
                        {log.type}
                      </span>
                      <span className="text-[9px] text-slate-600 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold mb-3">{log.message}</p>
                    <div className="bg-black/60 rounded-lg p-3 overflow-x-auto max-h-[150px] border border-slate-800">
                      <pre className="text-[10px] text-slate-500 font-mono leading-relaxed">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-4 right-4 size-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white border border-slate-700"
                      onClick={() => copyToClipboard(log.payload)}
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};