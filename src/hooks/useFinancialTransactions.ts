import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FinancialTransaction = {
  id: string;
  type: "entrada" | "saida";
  origin: "asaas" | "manual";
  title: string;
  amount: number;
  transaction_date: string;
  description: string | null;
  asaas_payment_id: string | null;
  company: { name: string; cnpj: string } | null;
  category: { id: string; name: string } | null;
};

export const useFinancialTransactions = () => useQuery({
  queryKey: ["financial-transactions"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("financial_transactions")
      .select("id, type, origin, title, amount, transaction_date, description, asaas_payment_id, company:companies(name, cnpj), category:financial_categories(id, name)")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as FinancialTransaction[];
  },
});

export const useFinancialCategories = () => useQuery({
  queryKey: ["financial-categories-all"],
  queryFn: async () => {
    const { data, error } = await supabase.from("financial_categories").select("id, name, kind, active").eq("active", true).order("name");
    if (error) throw error;
    return data;
  },
});

export const useFinancialBalanceSettings = () => useQuery({
  queryKey: ["financial-balance-settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("financial_balance_settings").select("id, initial_balance, reference_date, description").limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },
});
