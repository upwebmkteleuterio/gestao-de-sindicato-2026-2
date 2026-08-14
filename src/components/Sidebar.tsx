import React, { useRef, useLayoutEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSessionContext } from "@/contexts/SessionContext";
import { useProfile } from "@/hooks/useProfile";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { LogOut, User as UserIcon } from "lucide-react";

import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

let sidebarScrollPos = 0;

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useSessionContext();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: access, canMenu } = useAdminAccess();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const role = profile?.role || localStorage.getItem('sindicato_user_role');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Saiu com sucesso!");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao sair.");
    }
  };

  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = sidebarScrollPos;
      const rafId = requestAnimationFrame(() => {
        if (container) container.scrollTop = sidebarScrollPos;
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [location.pathname]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    sidebarScrollPos = e.currentTarget.scrollTop;
  };

  const adminItems = [
    { label: "Dashboard", icon: "grid_view", path: "/admin", permission: "dashboard", fill: true },
    { label: "Aprovações", icon: "check_circle", path: "/admin/aprovacoes", permission: "aprovacoes" },
    { label: "Empresas", icon: "domain", path: "/admin/empresas", permission: "empresas" },
    { label: "Importar", icon: "file_upload", path: "/admin/importar", permission: "importar" },
    { label: "Financeiro", icon: "payments", path: "/admin/financeiro", permission: "financeiro" },
    { label: "Agenda", icon: "calendar_month", path: "/admin/agenda", permission: "agenda" },
    { label: "Jurídico", icon: "gavel", path: "/admin/juridico", permission: "juridico" },
    { label: "Email e Templates", icon: "mail", path: "/admin/emails", permission: "emails" },
    { label: "Equipe e Acessos", icon: "group", path: "/admin/equipe", permission: "equipe" },
    { label: "Configurações", icon: "settings", path: "/configuracoes", permission: "configuracoes" },
  ];

  const companyItems = [
    { label: "Visão Geral", icon: "dashboard", path: "/empresa", fill: true },
    { label: "Minha Empresa", icon: "business", path: "/empresa/minha-empresa" },
    { label: "Agendar Homologação", icon: "event_note", path: "/empresa/agendar-homologacao" },
    { label: "Homologações", icon: "list_alt", path: "/empresa/homologacoes" },
    { label: "Funcionários", icon: "group", path: "/empresa/funcionarios" },
    { label: "Faturas", icon: "receipt_long", path: "/empresa/faturas" },
  ];

  const employeeItems = [
    { label: "Agendamento Jurídico", icon: "gavel", path: "/funcionario/agendamento" },
    { label: "Minhas Jurisdições", icon: "list_alt", path: "/funcionario/jurisdicoes" },
  ];

  const NavSection = ({ title, items, colorClass }: { title: string, items: any[], colorClass?: string }) => (
    <div className="flex flex-col gap-1 mb-6">
      {title && <p className={cn("px-3 text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70", colorClass || "text-slate-50")}>{title}</p>}
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            title={isCollapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 px-3 h-10 rounded-lg transition-all duration-200 group overflow-hidden shrink-0",
              isActive
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:bg-slate-800 hover:text-white",
              isCollapsed && "justify-center px-0"
            )}
          >
            <span className={cn(
              "material-symbols-outlined text-[20px] shrink-0",
              item.fill && isActive && "fill"
            )}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className={cn("text-sm truncate animate-in fade-in slide-in-from-left-2 duration-300", isActive ? "font-bold" : "font-semibold")}>
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  const SidebarSkeleton = () => (
    <div className="space-y-6 px-4 py-6">
      {[1, 2].map(i => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-3 w-20 bg-slate-800" />
          {[1, 2, 3].map(j => (
            <Skeleton key={j} className="h-10 w-full bg-slate-800/50 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <aside className="flex h-full w-full flex-col bg-slate-900 text-white border-r border-slate-800 transition-all duration-300">
      <div className={cn(
        "flex items-center gap-3 px-6 py-6 border-b border-slate-800 shrink-0 overflow-hidden",
        isCollapsed && "px-4 justify-center"
      )}>
        <div className="bg-blue-500/20 rounded-lg p-2 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-blue-400 text-2xl">shield_person</span>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
            <h1 className="text-white text-base font-bold leading-none">Gestão Sindical</h1>
            <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-tighter">Sistema Unificado</p>
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
        style={{ scrollBehavior: 'auto' }}
      >
        {(!role && profileLoading) ? (
          <SidebarSkeleton />
        ) : (
          <div className={cn("px-4 py-6", isCollapsed && "px-2")}>
            {role === 'administrador' && (
              <NavSection title={isCollapsed ? "" : "Administração"} items={adminItems.filter((item) => canMenu(item.permission))} />
            )}

            {(role === 'empresa' || (role === 'administrador' && access?.isSuperadmin)) && (
              <NavSection title={isCollapsed ? "" : "Portal Empresa"} items={companyItems} />
            )}

            {(role === 'funcionario' || (role === 'administrador' && access?.isSuperadmin)) && (
              <NavSection title={isCollapsed ? "" : "Portal do Funcionário"} items={employeeItems} colorClass="text-blue-400" />
            )}

            <div className="mt-4">
              <NavSection title={isCollapsed ? "" : "Sistema"} items={[{ label: "Suporte", icon: "help", path: "/suporte" }]} />
            </div>
          </div>
        )}
      </div>

      <div className={cn("p-4 border-t border-slate-800 bg-slate-950/50 shrink-0 space-y-2", isCollapsed && "p-2")}>
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors overflow-hidden",
          isCollapsed && "justify-center px-0"
        )}>
          <div className="size-9 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 overflow-hidden shrink-0">
            {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
              <img src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="User" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={18} className="text-slate-400" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="text-sm font-bold text-white truncate">
                {profile?.first_name
                  ? `${profile.first_name} ${profile.last_name || ''}`
                  : user?.user_metadata?.first_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
                    : user?.email?.split('@')[0] || "Usuário"}
              </p>
              <p className="text-[10px] font-bold text-slate-500 truncate uppercase">
                {!role && profileLoading ? <Skeleton className="h-2 w-16 bg-slate-800 mt-1" /> : (role === 'administrador' ? 'Administrador' : role === 'empresa' ? 'Gestor de Empresa' : 'Funcionário')}
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 h-10 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors group overflow-hidden",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-bold animate-in fade-in slide-in-from-left-2 duration-300">Sair do Sistema</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;