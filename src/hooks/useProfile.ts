"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@/contexts/SessionContext";

export const useProfile = () => {
  const { user } = useSessionContext();

  return useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, first_name, last_name, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("[useProfile] Erro ao buscar perfil:", error);
        return null;
      }
      
      // Persiste no localStorage apenas para otimização de UX (App Shell)
      if (data?.role) {
        localStorage.setItem('sindicato_user_role', data.role);
      }
      
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 30, // 30 minutos de cache
  });
};