import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@/contexts/SessionContext";

export const useAdminAccess = () => {
  const { user } = useSessionContext();

  const query = useQuery({
    queryKey: ["admin-access", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("role, admin_role_id, admin_roles(allowed_menus)")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      const role = data as { role: string; admin_role_id: string | null; admin_roles: { allowed_menus: string[] }[] | null };
      return {
        isAdmin: role.role === "administrador",
        isSuperadmin: role.role === "administrador" && !role.admin_role_id,
        allowedMenus: role.admin_roles?.[0]?.allowed_menus ?? [],

      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const canMenu = (menu: string) => !!query.data?.isSuperadmin || !!query.data?.allowedMenus.includes(menu);
  return { ...query, canMenu };
};
