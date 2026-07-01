import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionContext } from "@/contexts/SessionContext";

export const useEmployees = (companyId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useSessionContext();

  const isValidUUID = (uuid?: string) => {
    if (!uuid || typeof uuid !== 'string') return false;
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  };

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees-list", companyId],
    queryFn: async () => {
      if (!isValidUUID(companyId)) return [];
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("company_id", companyId as string)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && isValidUUID(companyId),
  });

  const saveEmployee = useMutation({
    mutationFn: async (employeeData: any) => {
      const { data, error } = await supabase
        .from("employees")
        .upsert(employeeData, { onConflict: 'id' })
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees-list"] });
      toast.success("Dados sincronizados com o banco!");
    },
    onError: (error: any) => {
      toast.error(`Erro de persistência: ${error.message}`);
    }
  });

  const deleteEmployee = useMutation({
    mutationFn: async (employeeId: string) => {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employeeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees-list"] });
      toast.success("Funcionário removido com sucesso.");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    }
  });

  return { employees, isLoading, saveEmployee, deleteEmployee };
};