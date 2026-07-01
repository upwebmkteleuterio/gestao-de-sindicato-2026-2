import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAgents = (type: 'homologacao' | 'juridico' = 'homologacao') => {
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["service-agents", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_agents")
        .select("*")
        .eq("active", true)
        .eq("type", type) // Filtro por tipo adicionado
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const addAgent = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("service_agents")
        .insert([{ name, type }]) // Insere com o tipo correto
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-agents"] });
      toast.success(`${type === 'juridico' ? 'Advogado' : 'Agente'} cadastrado com sucesso!`);
    }
  });

  const removeAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_agents")
        .update({ active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-agents"] });
      toast.success("Profissional removido.");
    }
  });

  return { agents, isLoading, addAgent, removeAgent };
};