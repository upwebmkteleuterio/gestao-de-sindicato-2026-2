import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@/contexts/SessionContext";

type AdminAccess = {
  isAdmin: boolean;
  isSuperadmin: boolean;
  allowedMenus: string[];
  role: string | null;
  adminRoleId: string | null;
  cargoName: string | null;
  rawRelation: unknown;
  diagnosticStatus: "ok" | "missing-role" | "missing-menus";
};

export const useAdminAccess = () => {
  const { user } = useSessionContext();

  const query = useQuery<AdminAccess | null>({
    queryKey: ["admin-access", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("role, admin_role_id, admin_roles(id, name, allowed_menus)")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const row = data as unknown as {
        role: string | null;
        admin_role_id: string | null;
        admin_roles: { id: string; name: string; allowed_menus: string[] } | { id: string; name: string; allowed_menus: string[] }[] | null;
      };
      const relation = Array.isArray(row.admin_roles) ? row.admin_roles[0] : row.admin_roles;
      const allowedMenus = Array.isArray(relation?.allowed_menus) ? relation.allowed_menus : [];
      const isAdmin = row.role === "administrador";
      const isSuperadmin = isAdmin && !row.admin_role_id;

      return {
        isAdmin,
        isSuperadmin,
        allowedMenus,
        role: row.role,
        adminRoleId: row.admin_role_id,
        cargoName: relation?.name ?? null,
        rawRelation: row.admin_roles,
        diagnosticStatus: !isAdmin || isSuperadmin || allowedMenus.length > 0 ? "ok" : relation ? "missing-menus" : "missing-role",
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const canMenu = (menu: string) => !!query.data?.isSuperadmin || !!query.data?.allowedMenus.includes(menu);
  return { ...query, canMenu };
};
