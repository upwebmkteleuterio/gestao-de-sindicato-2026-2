import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FinancialCategory = { id: string; name: string; kind: "entrada" | "saida" | "ambos"; active: boolean };
export type FinancialTransaction = { id: string; type: "entrada" | "saida"; origin: "asaas" | "manual"; title: string; amount: number; transaction_date: string; description: string | null; asaas_payment_id: string | null; company: { name: string; cnpj: string } | null; category: { id: string; name: string } | null; };
export type FinancialFilters = { startDate?: string; endDate?: string; type?: string; origin?: string; categoryId?: string; search?: string };

const applyFinancialFilters = async (filters: FinancialFilters, from = 0, to = 19) => {
  let companyIds: string[] | null = null;
  const search = filters.search?.trim();
  if (search) {
    const { data: companies, error: companiesError } = await supabase.from("companies").select("id").or(`name.ilike.%${search}%,cnpj.ilike.%${search}%`);
    if (companiesError) throw companiesError;
    companyIds = (companies ?? []).map((company) => company.id);
  }
  let query = supabase.from("financial_transactions").select("id, type, origin, title, amount, transaction_date, description, asaas_payment_id, company:companies(name, cnpj), category:financial_categories(id, name)", { count: "exact" }).order("transaction_date", { ascending: false }).order("created_at", { ascending: false }).range(from, to);
  if (filters.startDate) query = query.gte("transaction_date", filters.startDate);
  if (filters.endDate) query = query.lt("transaction_date", filters.endDate);
  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.origin && filters.origin !== "all") query = query.eq("origin", filters.origin);
  if (filters.categoryId && filters.categoryId !== "all") query = query.eq("category_id", filters.categoryId);
  if (search) {
    const titleOrDescription = `title.ilike.%${search}%,description.ilike.%${search}%`;
    if (companyIds?.length) query = query.or(`${titleOrDescription},company_id.in.(${companyIds.join(",")})`);
    else query = query.or(titleOrDescription);
  }
  const { data, error, count } = await query;
  if (error) throw error;
  return { records: (data ?? []) as unknown as FinancialTransaction[], totalCount: count ?? 0 };
};

export const useFinancialTransactions = (filters: FinancialFilters, page: number, pageSize = 20) => useQuery({
  queryKey: ["financial-transactions", filters, page, pageSize],
  queryFn: () => applyFinancialFilters(filters, page * pageSize, page * pageSize + pageSize - 1),
  placeholderData: (previous) => previous,
});

export const fetchAllFinancialTransactions = (filters: FinancialFilters) => applyFinancialFilters(filters, 0, 9999).then((result) => result.records);

export const useFinancialCategories = () => useQuery({ queryKey: ["financial-categories-active"], queryFn: async () => { const { data, error } = await supabase.from("financial_categories").select("id, name, kind, active").eq("active", true).order("name"); if (error) throw error; return (data ?? []) as FinancialCategory[]; } });
export const useAllFinancialCategories = () => useQuery({ queryKey: ["financial-categories-all"], queryFn: async () => { const { data, error } = await supabase.from("financial_categories").select("id, name, kind, active").order("active", { ascending: false }).order("name"); if (error) throw error; return (data ?? []) as FinancialCategory[]; } });
export const useFinancialBalanceSettings = () => useQuery({ queryKey: ["financial-balance-settings"], queryFn: async () => { const { data, error } = await supabase.from("financial_balance_settings").select("id, initial_balance, reference_date, description").limit(1).maybeSingle(); if (error) throw error; return data; } });
