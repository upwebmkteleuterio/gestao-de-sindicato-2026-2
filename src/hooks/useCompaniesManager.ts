import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionContext } from "@/contexts/SessionContext";
import { addDays, isBefore } from "date-fns";

export const useCompaniesManager = () => {
  const queryClient = useQueryClient();
  const { user } = useSessionContext();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("approved"); 
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<any | null>(null);

  const { data: storedCompanies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: async () => {
      // 1. Busca configurações para saber a carência
      const { data: settings } = await supabase.from('financial_settings').select('grace_period_days').order('updated_at', { ascending: false }).limit(1).single();
      const graceDays = settings?.grace_period_days || 0;

      // 2. Busca dados brutos
      const { data: companiesData, error: compErr } = await supabase.from("companies").select("*");
      if (compErr) throw compErr;

      const { data: counts } = await supabase.from("employees").select("company_id");
      const { data: invoices } = await supabase.from("invoices").select("*");
      
      return (companiesData || []).map(c => {
        const count = counts?.filter(e => e.company_id === c.id).length || 0;
        const companyInvoices = invoices?.filter(inv => inv.company_id === c.id) || [];
        
        const totalDebt = companyInvoices
          .filter(inv => inv.status !== 'Pago')
          .reduce((acc, inv) => acc + Number(inv.amount), 0);

        // NOVA LÓGICA: Só é considerado atrasado se passar da data de vencimento + carência
        const today = new Date();
        const hasCriticalOverdue = companyInvoices.some(inv => {
          if (inv.status === 'Pago') return false;
          const limitDate = addDays(new Date(inv.due_date), graceDays);
          return isBefore(limitDate, today);
        });

        const normalizedStatus = (c.status || 'pending').toLowerCase();
        
        let billingLabel = "Regular";
        let billingColor = "bg-emerald-100 text-emerald-700 border-emerald-200";

        if (totalDebt > 0) {
          // Só fica vermelho (Inadimplente) se tiver ultrapassado a carência
          billingLabel = hasCriticalOverdue ? "Inadimplente" : "A Vencer";
          billingColor = hasCriticalOverdue
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-blue-100 text-blue-700 border-blue-200";
        } else if (normalizedStatus !== 'approved') {
          billingLabel = normalizedStatus === 'pending' ? "Em Análise" : "Recusado";
          billingColor = "bg-slate-100 text-slate-700 border-slate-200";
        }

        return {
          ...c,
          status: normalizedStatus,
          approvalStatus: normalizedStatus, // Adicionado o status de aprovação
          representativeName: c.representative_name,
          representativeCpf: c.representative_cpf,
          zipCode: c.zip_code,
          employeesCount: count,
          init: (c.name || "??").substring(0, 2).toUpperCase(),
          billingStatus: billingLabel,
          sColor: billingColor,
          debt: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDebt),
          lastUpdate: c.updated_at || new Date().toISOString() // Corrigido para usar a data real
        };
      });
    },
    enabled: !!user,
  });

  const selectedCompany = useMemo(() =>
    storedCompanies.find(c => c.id === selectedCompanyId) || null,
  [storedCompanies, selectedCompanyId]);

  const { data: currentCompanyEmployees = [] } = useQuery({
    queryKey: ["admin-company-employees", selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase.from("employees").select("*").eq("company_id", selectedCompanyId).order("name", { ascending: true });
      if (error) throw error;
      return data.map(e => ({ ...e, status: e.status || "Associado", admission: e.admission_date ? new Date(e.admission_date).toLocaleDateString() : "---" }));
    },
    enabled: !!selectedCompanyId && !!user,
  });

  const filteredCompanies = useMemo(() => {
    let result = [...storedCompanies];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(company => company.name?.toLowerCase().includes(lowerSearch) || company.cnpj?.includes(searchTerm));
    }
    if (statusFilter !== "all") result = result.filter(company => company.status === statusFilter);
    result.sort((a, b) => (sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
    return result;
  }, [storedCompanies, searchTerm, statusFilter, sortOrder]);

  const saveCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      const { data, error } = await supabase.from("companies").upsert(companyData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-companies"] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      setSelectedCompanyId(null);
    }
  });

  const updateApprovalStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase.from("companies").update({ status }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success(`Status da empresa ${data.name} atualizado para ${data.status}.`);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  });

  const handleUpdateApprovalStatus = (companyId: string, newStatus: string) => {
    updateApprovalStatusMutation.mutate({ id: companyId, status: newStatus });
  };

  return {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    employeeFilter, setEmployeeFilter,
    sortOrder, setSortOrder,
    selectedCompany,
    setSelectedCompany: (c: any) => setSelectedCompanyId(c?.id || null),
    selectedEmployee, setSelectedEmployee,
    isNewModalOpen, setIsNewModalOpen,
    companyToEdit,
    storedCompanies,
    filteredCompanies,
    currentCompanyEmployees,
    isLoading: isLoadingCompanies,
    handleDeleteCompany: (id: string) => deleteMutation.mutate(id),
    saveCompany: (data: any) => saveCompanyMutation.mutate(data),
    isSavingCompany: saveCompanyMutation.isPending,
    handleEditCompany: (company: any) => { setCompanyToEdit(company); setIsNewModalOpen(true); },
    handleCloseModal: () => { setIsNewModalOpen(false); setCompanyToEdit(null); },
    handleUpdateApprovalStatus,
  };
};