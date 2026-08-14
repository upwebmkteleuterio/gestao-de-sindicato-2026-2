import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStatsData {
  totalCompanies: number;
  totalEmployees: number;
  receivedRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  currentForecast: number;
}

export interface MonthlyRevenue {
  month: string;
  received: number;
  pending: number;
  overdue: number;
  forecast: number;
}

export interface DashboardData { stats: DashboardStatsData; monthlyRevenue: MonthlyRevenue[]; }

export const useAdminDashboardData = () => useQuery<DashboardData>({
  queryKey: ["adminDashboardData"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("get_admin_dashboard_financial", { p_months: 6 });
    if (error) throw error;
    const result = data as { stats: DashboardStatsData; monthlyRevenue: MonthlyRevenue[] };
    return { stats: { totalCompanies: Number(result.stats.totalCompanies || 0), totalEmployees: Number(result.stats.totalEmployees || 0), receivedRevenue: Number(result.stats.receivedRevenue || 0), pendingRevenue: Number(result.stats.pendingRevenue || 0), overdueRevenue: Number(result.stats.overdueRevenue || 0), currentForecast: Number(result.stats.currentForecast || 0) }, monthlyRevenue: (result.monthlyRevenue || []).map((month) => ({ month: month.month, received: Number(month.received || 0), pending: Number(month.pending || 0), overdue: Number(month.overdue || 0), forecast: Number(month.forecast || 0) })) };
  },
});
