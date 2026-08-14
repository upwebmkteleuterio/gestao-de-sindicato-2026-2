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
  category: { name: string } | null;
};

export const useFinancialTransactions = () => {
  return useQuery({
    queryKey: ["financial-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("id, type, origin, title, amount, transaction_date, description, asaas_payment_id, company:companies(name, cnpj), category:financial_categories(name)")
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as FinancialTransaction[];
    },
  });
};

export const useFinancialBalanceSettings = () => {
  return useQuery({
    queryKey: ["financial-balance-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_balance_settings")
        .select("id, initial_balance, reference_date, description")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};
