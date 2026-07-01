import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSessionContext } from "@/contexts/SessionContext";
import { useProfile } from "@/hooks/useProfile";

export const useAgenda = (companyId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useSessionContext();
  const { data: profile } = useProfile();
  const role = profile?.role;

  // 1. Buscar todos os agendamentos (Filtro por empresa se fornecido e não for admin)
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", companyId, role],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          company:companies(name),
          employee:employees(*)
        `)
        .order("scheduled_date", { ascending: true });

      // Se for empresa, vê horários livres OU os dela.
      // Se for Admin, ignora o filtro e vê tudo.
      if (role === 'empresa' && companyId && typeof companyId === 'string') {
        query = query.or(`status.eq.Livre,company_id.eq.${companyId}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user, 
  });

  // 2. Criar novo horário livre (Admin)
  const createSlot = useMutation({
    mutationFn: async (slotData: any) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert([slotData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Horário disponibilizado na agenda!");
    }
  });

  // 3. Atualizar status do horário (Reservar ou Cancelar)
  const bookSlot = useMutation({
    mutationFn: async ({ id, status = 'Marcado', company_id, employee_id, protocol, type }: any) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({ 
          status, 
          company_id, 
          employee_id, 
          protocol,
          type 
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      if (variables.status === 'Livre') {
        toast.success("Agendamento cancelado com sucesso.");
      } else {
        toast.success("Homologação agendada com sucesso!");
      }
    },
    onError: (error: any) => {
      toast.error("Erro ao processar agendamento: " + error.message);
    }
  });

  // 4. Cancelar/Remover Permanentemente (Admin)
  const deleteSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Horário removido da agenda.");
    }
  });

  return { appointments, isLoading, createSlot, bookSlot, deleteSlot };
};