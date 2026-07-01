import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionContext } from "@/contexts/SessionContext";

export const useJuridico = () => {
  const queryClient = useQueryClient();
  const { user, role } = useSessionContext();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["juridico-appointments", user?.id, role],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          company:companies(name),
          employee:employees(*)
        `)
        .eq("type", "Jurídico")
        .order("scheduled_date", { ascending: true });

      // Funcionário só vê os dele.
      if (role === 'funcionario' && user?.id) {
        query = query.eq('employee_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createSlot = useMutation({
    mutationFn: async (slotData: any) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert([{ ...slotData, type: "Jurídico" }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["juridico-appointments"] });
      toast.success("Horário jurídico criado!");
    }
  });

  const updateSlot = useMutation({
    mutationFn: async ({ id, status, protocol, notes, employee_id }: any) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({ status, protocol, notes, employee_id })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["juridico-appointments"] });
    }
  });

  const deleteSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["juridico-appointments"] });
      toast.success("Horário removido.");
    }
  });

  return { appointments, isLoading, createSlot, updateSlot, deleteSlot };
};