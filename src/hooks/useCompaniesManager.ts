import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionContext } from "@/contexts/SessionContext";
import { addDays, isBefore } from "date-fns";

const mapStatusToEnglish = (status: string): string => {
  if (!status) return 'pending';
  const s = status.toLowerCase().trim();
  if (s === 'pending' || s.includes('pendent')) return 'pending';
  if (s === 'onboarding' || s.includes('incomplet')) return 'onboarding';
  if (s === 'approved' || s.includes('aprovad')) return 'approved';
  if (s === 'rejected' || s.includes('recusad')) return 'rejected';
  if (s === 'suspended' || s.includes('suspens')) return 'suspended';
  if (s === 'deleted' || s.includes('excluid')) return 'deleted';
  return s;
};

export const useCompaniesManager = () => {
  const queryClient = useQueryClient();
  const { user } = useSessionContext();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("approved");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; 

  const [activeTab, setActiveTab] = useState<"companies" | "accounting">("companies");
  const [accountingFilter, setAccountingFilter] = useState<any | null>(null);
  const [accountingSearchTerm, setAccountingSearchTerm] = useState("");

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<any | null>(null);
  const [accountingToEdit, setAccountingToEdit] = useState<any | null>(null);

  // Consulta de Contabilidades
  const { data: accountingData, isLoading: isLoadingAccounting } = useQuery({
    queryKey: ["admin-accounting", accountingSearchTerm],
    queryFn: async () => {
      let query = supabase.from("accounting_offices").select("*");
      
      if (accountingSearchTerm) {
        query = query.or(`name.ilike.%${accountingSearchTerm}%,email.ilike.%${accountingSearchTerm}%`);
      }

      const { data: offices, error } = await query.order("name", { ascending: true });
      if (error) throw error;

      // Buscar contagem de empresas e saúde financeira para cada contabilidade
      const { data: companiesInfo } = await supabase
        .from("companies")
        .select("id, accounting_id, status");

      const { data: invoices } = await supabase
        .from("invoices")
        .select("company_id, status, due_date")
        .not("status", "eq", "Pago");

      const processed = offices.map(office => {
        const linkedCompanies = companiesInfo?.filter(c => c.accounting_id === office.id) || [];
        const companyIds = linkedCompanies.map(c => c.id);
        
        const debtCount = invoices?.filter(inv => companyIds.includes(inv.company_id)).length || 0;
        
        return {
          ...office,
          companiesCount: linkedCompanies.length,
          health: debtCount > 0 ? "Atenção" : "Regular",
          healthColor: debtCount > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
        };
      });

      // Adicionar a opção "Sem Contabilidade"
      const noAccountingCompanies = companiesInfo?.filter(c => !c.accounting_id) || [];
      const noAccDebt = invoices?.filter(inv => noAccountingCompanies.map(c => c.id).includes(inv.company_id)).length || 0;

      processed.push({
        id: "none",
        name: "Sem Contabilidade Vinculada",
        email: "N/A",
        companiesCount: noAccountingCompanies.length,
        health: noAccDebt > 0 ? "Atenção" : "Regular",
        healthColor: noAccDebt > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700",
        isVirtual: true
      });

      return processed;
    },
    enabled: !!user && activeTab === "accounting",
  });

  // Consulta de Empresas
  const { data, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["admin-companies", searchTerm, statusFilter, sortOrder, employeeFilter, currentPage, accountingFilter?.id],
    queryFn: async () => {
      const { data: settings } = await supabase.from('financial_settings').select('grace_period_days').order('updated_at', { ascending: false }).limit(1).single();
      const graceDays = settings?.grace_period_days || 0;

      let query = supabase.from("companies").select("*", { count: 'exact' });
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,cnpj.ilike.%${searchTerm}%`);
      }

      if (accountingFilter) {
        if (accountingFilter.id === "none") {
          query = query.is("accounting_id", null);
        } else {
          query = query.eq("accounting_id", accountingFilter.id);
        }
      }
      
      if (statusFilter !== "all" && !accountingFilter) {
        if (statusFilter === "pending") {
          query = query.or('status.eq.pending,status.eq.Pendente');
        } else if (statusFilter === "onboarding") {
          query = query.eq('status', 'onboarding');
        } else if (statusFilter === "approved") {
          query = query.or('status.eq.approved,status.eq.Aprovado,status.eq.Aprovada');
        } else if (statusFilter === "rejected") {
          query = query.or('status.eq.rejected,status.eq.Recusado,status.eq.Recusada');
        } else if (statusFilter === "deleted") {
          query = query.eq('status', 'deleted');
        } else {
          query = query.eq("status", statusFilter);
        }
      }

      query = query.order("name", { ascending: sortOrder === "asc" });

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data: companiesData, error: compErr, count: totalCount } = await query;
      if (compErr) throw compErr;

      if (!companiesData || companiesData.length === 0) return { companies: [], total: 0 };

      const companyIds = companiesData.map(c => c.id);
      
      const [countsRes, invoicesRes] = await Promise.all([
        supabase.from("employees").select("company_id").in("company_id", companyIds),
        supabase.from("invoices").select("*").in("company_id", companyIds)
      ]);

      const counts = countsRes.data || [];
      const invoices = invoicesRes.data || [];
      
      let processed = companiesData.map(c => {
        const count = counts.filter(e => e.company_id === c.id).length || 0;
        const companyInvoices = invoices.filter(inv => inv.company_id === c.id) || [];
        
        const totalDebt = companyInvoices
          .filter(inv => inv.status !== 'Pago')
          .reduce((acc, inv) => acc + Number(inv.amount), 0);

        const today = new Date();
        const hasCriticalOverdue = companyInvoices.some(inv => {
          if (inv.status === 'Pago') return false;
          const limitDate = addDays(new Date(inv.due_date), graceDays);
          return isBefore(limitDate, today);
        });

        const normalizedStatus = mapStatusToEnglish(c.status || 'pending');
        
        let billingLabel = "Regular";
        let billingColor = "bg-emerald-100 text-emerald-700 border-emerald-200";

        if (totalDebt > 0) {
          billingLabel = hasCriticalOverdue ? "Inadimplente" : "A Vencer";
          billingColor = hasCriticalOverdue
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-blue-100 text-blue-700 border-blue-200";
        } else if (normalizedStatus !== 'approved') {
          billingLabel = normalizedStatus === 'pending' ? "Em Análise" : (normalizedStatus === 'onboarding' ? "Em Onboarding" : (normalizedStatus === 'deleted' ? "Excluída" : "Recusado"));
          billingColor = "bg-slate-100 text-slate-700 border-slate-200";
        }

        return {
          ...c,
          status: normalizedStatus,
          approvalStatus: normalizedStatus,
          representativeName: c.representative_name,
          representativeCpf: c.representative_cpf,
          zipCode: c.zip_code,
          employeesCount: count,
          init: (c.name || "??").substring(0, 2).toUpperCase(),
          billingStatus: billingLabel,
          sColor: billingColor,
          debt: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDebt),
          lastUpdate: c.updated_at || new Date().toISOString()
        };
      });

      return {
        companies: processed,
        total: totalCount || 0
      };
    },
    enabled: !!user && activeTab === "companies",
  });

  const storedCompanies = data?.companies || [];
  const totalItems = data?.total || 0;

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
    
    if (employeeFilter !== "all") {
      result = result.filter(company => {
        const count = company.employeesCount;
        if (employeeFilter === "0-10") return count <= 10;
        if (employeeFilter === "11-50") return count > 10 && count <= 50;
        if (employeeFilter === "51-200") return count > 50 && count <= 200;
        if (employeeFilter === "201+") return count > 200;
        return true;
      });
    }
    
    return result;
  }, [storedCompanies, employeeFilter]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSetSearchTerm = (val: string) => { setSearchTerm(val); setCurrentPage(1); };
  const handleSetStatusFilter = (val: string) => { setStatusFilter(val); setCurrentPage(1); };
  const handleSetEmployeeFilter = (val: string) => { setEmployeeFilter(val); setCurrentPage(1); };
  const handleSetSortOrder = (val: string) => { setSortOrder(val); setCurrentPage(1); };

  const saveCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      const { data, error } = await supabase.from("companies").upsert(companyData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-companies"] })
  });

  const saveAccountingMutation = useMutation({
    mutationFn: async (accountingData: any) => {
      const { data, error } = await supabase.from("accounting_offices").upsert(accountingData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accounting"] });
      toast.success("Contabilidade salva com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao salvar contabilidade: " + error.message);
    }
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
    onError: (error: any) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  });

  const handleUpdateApprovalStatus = (companyId: string, newStatus: string) => {
    updateApprovalStatusMutation.mutate({ id: companyId, status: newStatus });
  };

  return {
    searchTerm, setSearchTerm: handleSetSearchTerm,
    statusFilter, setStatusFilter: handleSetStatusFilter,
    employeeFilter, setEmployeeFilter: handleSetEmployeeFilter,
    sortOrder, setSortOrder: handleSetSortOrder,
    currentPage, setCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
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
    handleCloseModal: () => { setIsNewModalOpen(false); setCompanyToEdit(null); setAccountingToEdit(null); },
    handleUpdateApprovalStatus,
    // Novos Retornos de Contabilidade
    activeTab, setActiveTab,
    accountingFilter, setAccountingFilter,
    accountingSearchTerm, setAccountingSearchTerm,
    accountingData, isLoadingAccounting,
    saveAccounting: (data: any) => saveAccountingMutation.mutate(data),
    accountingToEdit, setAccountingToEdit,
  };
};