"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Clipboard, Copy, Loader2, ShieldCheck } from "lucide-react";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useSessionContext } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ADMIN_ROUTES: Array<[string, string]> = [
  ["dashboard", "/admin"],
  ["aprovacoes", "/admin/aprovacoes"],
  ["empresas", "/admin/empresas"],
  ["importar", "/admin/importar"],
  ["agenda", "/admin/agenda"],
  ["juridico", "/admin/juridico"],
  ["financeiro", "/admin/financeiro"],
  ["emails", "/admin/emails"],
  ["configuracoes", "/configuracoes"],
];

const AdminEntry = () => {
  const navigate = useNavigate();
  const { user } = useSessionContext();
  const { data: access, isLoading, isError, error, refetch } = useAdminAccess();
  const [copied, setCopied] = useState(false);

  const diagnosticReport = useMemo(() => JSON.stringify({
    timestamp: new Date().toISOString(),
    screen: "/admin/entrada",
    user: { id: user?.id ?? null, email: user?.email ?? null },
    query: { isLoading, isError, error: error instanceof Error ? error.message : error ?? null },
    access: access ? {
      isAdmin: access.isAdmin,
      isSuperadmin: access.isSuperadmin,
      role: access.role,
      adminRoleId: access.adminRoleId,
      cargoName: access.cargoName,
      allowedMenus: access.allowedMenus,
      diagnosticStatus: access.diagnosticStatus,
      rawRelation: access.rawRelation,
    } : null,
    expectedRoutes: ADMIN_ROUTES,
  }, null, 2), [access, error, isError, isLoading, user?.email, user?.id]);

  useEffect(() => {
    if (isLoading || isError || !access) return;
    if (access.isSuperadmin) {
      navigate("/admin", { replace: true });
      return;
    }

    const firstAllowedRoute = ADMIN_ROUTES.find(([menu]) => access.allowedMenus.includes(menu));
    if (firstAllowedRoute) navigate(firstAllowedRoute[1], { replace: true });
  }, [access, isError, isLoading, navigate]);

  const copyDiagnostic = async () => {
    await navigator.clipboard.writeText(diagnosticReport);
    setCopied(true);
    toast.success("Diagnóstico copiado. Agora você pode colar o relatório aqui.");
    window.setTimeout(() => setCopied(false), 2000);
  };

  const DiagnosticPanel = () => (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Diagnóstico técnico</p>
          <p className="mt-1 text-xs text-slate-500">Copie este relatório para identificar erros silenciosos de sessão, cargo ou menus.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={copyDiagnostic}><Copy size={15} className="mr-2" /> {copied ? "Copiado" : "Copiar diagnóstico"}</Button>
      </div>
      <pre className="mt-4 max-h-56 overflow-auto rounded-lg bg-slate-900 p-3 text-[10px] leading-relaxed text-slate-100">{diagnosticReport}</pre>
    </div>
  );

  if (isError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-2xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 size-10 text-red-500" />
          <h1 className="text-xl font-bold text-slate-900">Não foi possível validar seu acesso</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">A consulta do perfil ou cargo retornou um erro. Você pode tentar novamente ou copiar o diagnóstico abaixo.</p>
          <div className="mt-5 flex justify-center gap-3"><Button type="button" variant="outline" onClick={() => refetch()}><Loader2 size={15} className="mr-2" /> Tentar novamente</Button><Button type="button" onClick={copyDiagnostic}><Clipboard size={15} className="mr-2" /> Copiar relatório</Button></div>
          <DiagnosticPanel />
        </div>
      </div>
    );
  }

  if (!isLoading && access && !access.isSuperadmin && !ADMIN_ROUTES.some(([menu]) => access.allowedMenus.includes(menu))) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-2xl rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 size-10 text-amber-500" />
          <h1 className="text-xl font-bold text-slate-900">Acesso ainda não configurado</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Seu cargo administrativo ainda não possui nenhum menu liberado. Solicite ao superadmin a configuração do seu acesso.</p>
          <DiagnosticPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">{isLoading ? <Loader2 className="size-8 animate-spin" /> : <CheckCircle2 className="size-8" />}</div>
        <h1 className="text-xl font-bold text-slate-900">Preparando seu acesso</h1>
        <p className="mt-2 text-sm text-slate-500">Estamos verificando seu cargo e direcionando você para a área autorizada.</p>
      </div>
    </div>
  );
};

export default AdminEntry;
