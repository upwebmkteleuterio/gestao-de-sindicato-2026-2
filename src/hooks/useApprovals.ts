import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionContext } from "@/contexts/SessionContext";

export const useApprovals = () => {
  const queryClient = useQueryClient();
  const { user } = useSessionContext();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      return (data || []).map(company => ({
        ...company,
        requestType: (!company.street || !company.zip_code) ? "Novo Cadastro" : "Alteração Cadastral"
      }));
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: 'approved' | 'rejected'; reason?: string }) => {
      const payload: any = { status };
      if (reason) payload.rejection_reason = reason;

      const { data, error } = await supabase
        .from("companies")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      
      toast.success(variables.status === 'approved' ? "Empresa aprovada!" : "Cadastro recusado.");
    },
    onError: (error: any) => {
      toast.error("Falha na operação: " + error.message);
    }
  });

  return { requests, isLoading, updateStatus };
};