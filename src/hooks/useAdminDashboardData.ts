import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define types for the data
interface DashboardStatsData {
  totalCompanies: number;
  totalEmployees: number;
  totalRevenue: number;
  pendingRevenue: number;
}

interface MonthlyRevenue {
  month: string; // e.g., "Jan 24"
  collected: number;
  pending: number;
}

interface DashboardData {
  stats: DashboardStatsData;
  monthlyRevenue: MonthlyRevenue[];
}

export const useAdminDashboardData = () => {
  return useQuery<DashboardData>({
    queryKey: ['adminDashboardData'],
    queryFn: async () => {
      // --- 1. Fetch Stats Data ---
      const { count: totalCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('id', { count: 'exact' });
      if (companiesError) throw companiesError;

      const { count: totalEmployees, error: employeesError } = await supabase
        .from('employees')
        .select('id', { count: 'exact' });
      if (employeesError) throw employeesError;

      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('amount, status, due_date');
      if (invoicesError) throw invoicesError;

      const totalRevenue = invoices
        .filter(inv => inv.status === 'Pago') // Assuming 'Pago' is the collected status
        .reduce((sum, inv) => sum + Number(inv.amount), 0);

      const pendingRevenue = invoices
        .filter(inv => inv.status === 'Pendente')
        .reduce((sum, inv) => sum + Number(inv.amount), 0);

      const stats: DashboardStatsData = {
        totalCompanies: totalCompanies || 0,
        totalEmployees: totalEmployees || 0,
        totalRevenue: totalRevenue,
        pendingRevenue: pendingRevenue,
      };

      // --- 2. Process Monthly Revenue Data (Last 6 months) ---
      const monthlyDataMap = new Map<string, { collected: number, pending: number }>();
      const today = new Date();
      
      // Initialize map for last 6 months
      for (let i = 0; i < 6; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        monthlyDataMap.set(monthKey, { collected: 0, pending: 0 });
      }

      invoices.forEach(inv => {
        const date = new Date(inv.due_date);
        const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        if (monthlyDataMap.has(monthKey)) {
          const current = monthlyDataMap.get(monthKey)!;
          if (inv.status === 'Pago') {
            current.collected += Number(inv.amount);
          } else if (inv.status === 'Pendente') {
            current.pending += Number(inv.amount);
          }
          monthlyDataMap.set(monthKey, current);
        }
      });

      const monthlyRevenue: MonthlyRevenue[] = Array.from(monthlyDataMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => {
            // Simple sorting based on month string, good enough for this scope
            const dateA = new Date(`01 ${a.month.replace(' ', ' 20')}`);
            const dateB = new Date(`01 ${b.month.replace(' ', ' 20')}`);
            return dateA.getTime() - dateB.getTime();
        });

      return { stats, monthlyRevenue };
    },
  });
};