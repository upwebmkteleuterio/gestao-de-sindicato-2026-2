"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useAdminAccess } from "@/hooks/useAdminAccess";

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
  const { data: access, isLoading, isError } = useAdminAccess();

  useEffect(() => {
    if (isLoading || isError || !access) return;
    if (access.isSuperadmin) {
      navigate("/admin", { replace: true });
      return;
    }

    const firstAllowedRoute = ADMIN_ROUTES.find(([menu]) => access.allowedMenus.includes(menu));
    if (firstAllowedRoute) navigate(firstAllowedRoute[1], { replace: true });
  }, [access, isError, isLoading, navigate]);

  if (isError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 size-10 text-red-500" />
          <h1 className="text-xl font-bold text-slate-900">Não foi possível validar seu acesso</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Atualize a página ou entre em contato com o superadmin para verificar seu cargo.</p>
        </div>
      </div>
    );
  }

  if (!isLoading && access && !access.isSuperadmin && !ADMIN_ROUTES.some(([menu]) => access.allowedMenus.includes(menu))) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 size-10 text-amber-500" />
          <h1 className="text-xl font-bold text-slate-900">Acesso ainda não configurado</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Seu cargo administrativo ainda não possui nenhum menu liberado. Solicite ao superadmin a configuração do seu acesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          {isLoading ? <Loader2 className="size-8 animate-spin" /> : <CheckCircle2 className="size-8" />}
        </div>
        <h1 className="text-xl font-bold text-slate-900">Preparando seu acesso</h1>
        <p className="mt-2 text-sm text-slate-500">Estamos verificando seu cargo e direcionando você para a área autorizada.</p>
      </div>
    </div>
  );
};

export default AdminEntry;
