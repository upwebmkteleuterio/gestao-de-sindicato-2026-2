import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { SessionContextProvider, useSessionContext } from "./contexts/SessionContext";
import { useProfile } from "./hooks/useProfile";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Approvals from "./pages/admin/Approvals";
import Companies from "./pages/admin/Companies";
import ImportCompanies from "./pages/admin/ImportCompanies";
import Agenda from "./pages/admin/Agenda";
import FinancialLegal from "./pages/admin/FinancialLegal";
import Juridico from "./pages/admin/Juridico";
import EmailTest from "./pages/admin/EmailTest";
import EmailTemplates from "./pages/admin/EmailTemplates";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import ScheduleHomologation from "./pages/company/ScheduleHomologation";
import HomologationList from "./pages/company/HomologationList";
import Employees from "./pages/company/Employees";
import MyCompany from "./pages/company/MyCompany";
import Invoices from "./pages/company/Invoices";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import LegalScheduling from "./pages/employee/LegalScheduling";
import Jurisdictions from "./pages/employee/Jurisdictions";
import NotFound from "./pages/NotFound";
import Team from "./pages/admin/Team";
import AdminEntry from "./pages/admin/AdminEntry";
import { useAdminAccess } from "./hooks/useAdminAccess";

import { useEffect } from "react";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Procuramos o container de scroll definido no DashboardLayout
    const scrollContainer = document.getElementById('scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5, 
      retry: 1,
    },
  },
});

const GlobalLoader = ({ message = "Sincronizando acesso..." }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-slate-500 font-medium animate-pulse">{message}</p>
    </div>
  </div>
);

const AuthenticatedLayout = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { session, loading: sessionLoading } = useSessionContext();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const location = useLocation();
  
  if (sessionLoading) return <GlobalLoader />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;

  const role = profile?.role || localStorage.getItem('sindicato_user_role');

  if (!role && profileLoading) {
    return <GlobalLoader message="Verificando permissões..." />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const homeMap: Record<string, string> = {
      administrador: "/admin",
      empresa: "/empresa",
      funcionario: "/funcionario/agendamento"
    };
    return <Navigate to={homeMap[role] || "/"} replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const RootRedirect = () => {
  const { session, loading: sessionLoading } = useSessionContext();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: adminAccess, isLoading: adminAccessLoading, isError: adminAccessError } = useAdminAccess();
  
  if (sessionLoading) return <GlobalLoader />;
  if (!session) return <Navigate to="/login" replace />;

  const role = profile?.role || localStorage.getItem('sindicato_user_role');
  
  if (!role) {
    if (profileLoading) return <GlobalLoader message="Verificando sessão..." />;
    return <Navigate to="/login" replace />;
  }
  
  if (role === 'administrador') {
    if (adminAccessLoading) return <GlobalLoader message="Preparando seu acesso administrativo..." />;
    if (adminAccessError || !adminAccess) return <Navigate to="/admin/entrada" replace />;
    return <Navigate to={adminAccess.isSuperadmin ? "/admin" : "/admin/entrada"} replace />;
  }
  if (role === 'empresa') return <Navigate to="/empresa" replace />;
  return <Navigate to="/funcionario/agendamento" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSessionContext();
  if (loading) return <GlobalLoader />;
  if (session) return <RootRedirect />;
  return <>{children}</>;
};

const AdminMenuRoute = ({ menu, children }: { menu: string; children: React.ReactNode }) => {
  const { data: access, isLoading } = useAdminAccess();
  if (isLoading) return <GlobalLoader message="Verificando permissões..." />;
  if (!access?.isAdmin) return <Navigate to="/login" replace />;
  if (access.isSuperadmin || access.allowedMenus.includes(menu)) return <>{children}</>;
  return <Navigate to="/admin/entrada" replace />;
};

const App = () => (

  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SessionContextProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/cadastro" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route element={<AuthenticatedLayout allowedRoles={['administrador']} />}>
              <Route path="/admin/entrada" element={<AdminEntry />} />
              <Route path="/admin">
                <Route index element={<AdminMenuRoute menu="dashboard"><AdminDashboard /></AdminMenuRoute>} />

                <Route path="aprovacoes" element={<AdminMenuRoute menu="aprovacoes"><Approvals /></AdminMenuRoute>} />
                <Route path="empresas" element={<AdminMenuRoute menu="empresas"><Companies /></AdminMenuRoute>} />
                <Route path="importar" element={<AdminMenuRoute menu="importar"><ImportCompanies /></AdminMenuRoute>} />
                <Route path="financeiro" element={<AdminMenuRoute menu="financeiro"><FinancialLegal /></AdminMenuRoute>} />
                <Route path="agenda" element={<AdminMenuRoute menu="agenda"><Agenda /></AdminMenuRoute>} />
                <Route path="juridico" element={<AdminMenuRoute menu="juridico"><Juridico /></AdminMenuRoute>} />
                <Route path="email-teste" element={<AdminMenuRoute menu="emails"><EmailTest /></AdminMenuRoute>} />
                <Route path="emails" element={<AdminMenuRoute menu="emails"><EmailTemplates /></AdminMenuRoute>} />
                <Route path="equipe" element={<AdminMenuRoute menu="equipe"><Team /></AdminMenuRoute>} />
              </Route>
              <Route path="/configuracoes" element={<AdminMenuRoute menu="configuracoes"><Configuracoes /></AdminMenuRoute>} />
            </Route>

            <Route element={<AuthenticatedLayout allowedRoles={['empresa', 'administrador']} />}>
              <Route path="/empresa">
                <Route index element={<CompanyDashboard />} />
                <Route path="minha-empresa" element={<MyCompany />} />
                <Route path="homologacoes" element={<HomologationList />} />
                <Route path="agendar-homologacao" element={<ScheduleHomologation />} />
                <Route path="funcionarios" element={<Employees />} />
                <Route path="faturas" element={<Invoices />} />
              </Route>
            </Route>

            <Route element={<AuthenticatedLayout allowedRoles={['funcionario', 'administrador']} />}>
              <Route path="/funcionario">
                <Route path="agendamento" element={<LegalScheduling />} />
                <Route path="jurisdicoes" element={<Jurisdictions />} />
              </Route>
            </Route>

            <Route element={<AuthenticatedLayout />}>
              <Route path="/suporte" element={<div className="p-10"><h1>Suporte</h1></div>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;