import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ProbeStrategy = 'direct' | 'relationship' | 'filter';

export interface ScanResult {
  strategy: ProbeStrategy;
  data: any;
  count: number;
  error: any;
  latency: number;
}

export interface MismatchReport {
  dbCount: number;
  uiCount: number;
  mismatch: boolean;
  reason?: string;
}

export const useDataProbe = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const addLog = useCallback((type: string, message: string, payload: any) => {
    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type,
        message,
        payload,
      },
      ...prev,
    ].slice(0, 50)); // Mantém os últimos 50
  }, []);

  const deepScan = async (tableName: string, entityId: string, parentField?: string) => {
    setIsScanning(true);
    const results: ScanResult[] = [];

    const runStrategy = async (strategy: ProbeStrategy): Promise<ScanResult> => {
      const start = performance.now();
      let query;
      
      try {
        if (strategy === 'direct') {
          query = supabase.from(tableName).select('*').eq('id', entityId);
        } else if (strategy === 'relationship' && parentField) {
          query = supabase.from(tableName).select('*').eq(parentField, entityId);
        } else if (strategy === 'filter') {
          query = supabase.from(tableName).select('*').filter('id', 'eq', entityId);
        } else {
          return { strategy, data: null, count: 0, error: 'Invalid strategy', latency: 0 };
        }

        const { data, error } = await query;
        const end = performance.now();

        return {
          strategy,
          data,
          count: data?.length || 0,
          error,
          latency: end - start,
        };
      } catch (err) {
        return { strategy, data: null, count: 0, error: err, latency: 0 };
      }
    };

    const direct = await runStrategy('direct');
    results.push(direct);
    addLog('SCAN', `Busca Direta: ${tableName}`, direct);

    const filter = await runStrategy('filter');
    results.push(filter);
    addLog('SCAN', `Busca via Filtro: ${tableName}`, filter);

    setIsScanning(false);
    return results;
  };

  const generateMismatchReport = (dbData: any[], uiData: any[]): MismatchReport => {
    const dbCount = dbData?.length || 0;
    const uiCount = uiData?.length || 0;
    const mismatch = dbCount !== uiCount;
    
    let reason = '';
    if (mismatch) {
      if (dbCount > 0 && uiCount === 0) reason = 'Ponte de Dados Quebrada (RLS ou Bloqueio Silencioso)';
      else if (dbCount > uiCount) reason = 'Dados bloqueados ou erro de filtro na UI';
      else reason = 'Cache dessincronizado ou dados duplicados na UI';
    }

    return { dbCount, uiCount, mismatch, reason };
  };

  return {
    logs,
    addLog,
    deepScan,
    isScanning,
    generateMismatchReport,
    clearLogs: () => setLogs([]),
  };
};