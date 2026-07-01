import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@/contexts/SessionContext";
import { toast } from "sonner";

export const useCompany = () => {
  const { user } = useSessionContext();
  const queryClient = useQueryClient();

  // Removi a dependência do profile/role para evitar bloqueio por cache de cargo
  const { data: company, isLoading } = useQuery({
    queryKey: ["my-company", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    // Habilita sempre que houver um usuário logado, independentemente do cargo no cache
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const updateCompany = useMutation({
    mutationFn: async (formData: any) => {
      if (!company?.id) throw new Error("ID da empresa não localizado.");
      
      const { data: updated, error } = await supabase
        .from("companies")
        .update({ ...formData, status: 'pending' })
        .eq("id", company?.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-company"] });
      toast.success("Dados enviados para aprovação!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar: " + error.message);
    }
  });

  return { company, isLoading, updateCompany };
};