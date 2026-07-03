import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { toast } from "sonner";
import { useState } from "react";

export const useFinancials = (explicitCompanyId?: string) => {
  const queryClient = useQueryClient();
  const { company: myCompany } = useCompany();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const targetCompanyId = explicitCompanyId || myCompany?.id;

  const { data: availableYears = [] } = useQuery({
    queryKey: ['invoice-years', targetCompanyId],
    queryFn: async () => {
      if (!targetCompanyId) return [];
      const { data, error } = await supabase
        .from('invoices')
        .select('due_date')
        .eq('company_id', targetCompanyId);
      
      if (error) throw error;
      
      const years = data.map(inv => new Date(inv.due_date).getFullYear().toString());
      const uniqueYears = Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
      
      const currentYear = new Date().getFullYear().toString();
      if (!uniqueYears.includes(currentYear)) uniqueYears.unshift(currentYear);
      
      return uniqueYears;
    },
    enabled: !!targetCompanyId
  });

  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices', targetCompanyId, selectedYear],
    queryFn: async () => {
      if (!targetCompanyId) return [];
      
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', targetCompanyId)
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        // ORDENAÇÃO: Vencimento mais recente e depois ID (ou criado em) mais recente
        .order('due_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!targetCompanyId
  });

  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ id, status, payment_origin }: { id: string, status: string, payment_origin?: string }) => {
      const payload: any = { status };
      if (payment_origin) payload.payment_origin = payment_origin;

      const { data, error } = await supabase
        .from('invoices')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', targetCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      toast.success("Fatura atualizada com sucesso!");
    }
  });

  const stats = {
    pendingAmount: invoices?.filter(inv => inv.status === 'Pendente').reduce((acc, inv) => acc + Number(inv.amount), 0) || 0,
    overdueAmount: invoices?.filter(inv => inv.status === 'Pendente' && new Date(inv.due_date) < new Date()).reduce((acc, inv) => acc + Number(inv.amount), 0) || 0,
    // LOGICA DO DASHBOARD: Pega a fatura pendente mais recente (incluindo ajustes)
    activeInvoice: invoices?.find(inv => inv.status === 'Pendente') || invoices?.[0] || null,
  };

  return {
    invoices,
    isLoading: isLoadingInvoices,
    availableYears,
    selectedYear,
    setSelectedYear,
    stats,
    updateInvoiceStatus
  };
};