"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Loader2, Pencil, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

const ADMIN_MENUS = [
  { key: "dashboard", label: "Dashboard", icon: "grid_view" },
  { key: "aprovacoes", label: "Aprovações", icon: "check_circle" },
  { key: "empresas", label: "Empresas", icon: "domain" },
  { key: "importar", label: "Importar empresas", icon: "file_upload" },
  { key: "agenda", label: "Agenda", icon: "calendar_month" },
  { key: "juridico", label: "Jurídico", icon: "gavel" },
  { key: "financeiro", label: "Financeiro", icon: "payments" },
  { key: "emails", label: "E-mails e templates", icon: "mail" },
  { key: "configuracoes", label: "Configurações", icon: "settings" },
];

type AdminRole = { id: string; name: string; allowed_menus: string[] };
type TeamMember = { id: string; email: string; first_name: string; last_name: string; admin_role_id: string; created_at: string; active: boolean };

const callTeamFunction = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("manage-admin-team", { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
};

const Team = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberDialog, setMemberDialog] = useState(false);
  const [roleDialog, setRoleDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("team");
  const [memberRoleFilter, setMemberRoleFilter] = useState("all");
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [memberForm, setMemberForm] = useState({ first_name: "", last_name: "", email: "", password: "", admin_role_id: "" });

  const [roleForm, setRoleForm] = useState({ name: "", allowed_menus: [] as string[] });

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: profileData, error: profileError }, { data: roleData, error: roleError }] = await Promise.all([
        supabase.from("profiles").select("id, email, first_name, last_name, role, admin_role_id, active, created_at, updated_at").eq("role", "administrador").order("created_at", { ascending: false }),
        
        supabase.from("admin_roles").select("id, name, allowed_menus").order("name"),
      ]);
      if (profileError) throw profileError;
      if (roleError) throw roleError;
      setMembers((profileData ?? []).map((profile) => ({ ...profile, active: profile.active ?? true })) as TeamMember[]);
      setRoles((roleData ?? []) as AdminRole[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar equipe.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const roleUsers = useMemo(() => new Map(roles.map((role) => [role.id, members.filter((member) => member.admin_role_id === role.id).length])), [roles, members]);
  const filteredMembers = useMemo(
    () => memberRoleFilter === "all"
      ? members
      : memberRoleFilter === "administrator"
        ? members.filter((member) => !member.admin_role_id)
        : members.filter((member) => member.admin_role_id === memberRoleFilter),
    [memberRoleFilter, members],
  );

  const openNewMember = () => {

    setEditingMember(null);
    setMemberForm({ first_name: "", last_name: "", email: "", password: "", admin_role_id: roles[0]?.id ?? "" });
    setShowPassword(false);
    setMemberDialog(true);

  };

  const openEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberForm({ first_name: member.first_name ?? "", last_name: member.last_name ?? "", email: member.email ?? "", password: "", admin_role_id: member.admin_role_id ?? "" });
    setShowPassword(false);
    setMemberDialog(true);

  };

  const saveMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!memberForm.first_name || !memberForm.email || !memberForm.admin_role_id || (!editingMember && !memberForm.password)) {
      toast.error("Preencha nome, e-mail, cargo e senha.");
      return;
    }
    setSaving(true);
    try {
      const result = await callTeamFunction({ action: editingMember ? "update" : "create", ...(editingMember ? { user_id: editingMember.id } : {}), ...memberForm, ...(editingMember && !memberForm.password ? { password: undefined } : {}) });
      const profileId = editingMember?.id ?? result.userId;
      const { error: profileError } = await supabase.from("profiles").update({ email: memberForm.email, active: true }).eq("id", profileId);
      if (profileError) throw profileError;
      toast.success(editingMember ? "Membro atualizado." : "Membro cadastrado.");

      setMemberDialog(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar membro.");
    } finally { setSaving(false); }
  };

  const toggleMember = async (member: TeamMember, active: boolean) => {
    try {
      await callTeamFunction({ action: "toggle", user_id: member.id, active });
      const { error } = await supabase.from("profiles").update({ active }).eq("id", member.id);
      if (error) throw error;
      toast.success(active ? `O usuário ${member.first_name} foi reativado e já pode acessar o sistema.` : `O usuário ${member.first_name} foi desativado e não poderá mais fazer login.`);
      await loadData();

    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao atualizar acesso."); }
  };

  const deleteMember = async () => {
    if (!memberToDelete) return;
    try {
      await callTeamFunction({ action: "delete", user_id: memberToDelete.id });
      toast.success(`O usuário ${memberToDelete.first_name} foi excluído definitivamente.`);
      setMemberToDelete(null);
      await loadData();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao excluir membro."); }
  };

  const openNewRole = () => { setEditingRole(null); setRoleForm({ name: "", allowed_menus: [] }); setRoleDialog(true); };
  const openEditRole = (role: AdminRole) => { setEditingRole(role); setRoleForm({ name: role.name, allowed_menus: role.allowed_menus ?? [] }); setRoleDialog(true); };

  const saveRole = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roleForm.name.trim()) { toast.error("Informe o nome do cargo."); return; }
    setSaving(true);
    try {
      const query = editingRole
        ? supabase.from("admin_roles").update({ name: roleForm.name.trim(), allowed_menus: roleForm.allowed_menus, updated_at: new Date().toISOString() }).eq("id", editingRole.id)
        : supabase.from("admin_roles").insert({ name: roleForm.name.trim(), allowed_menus: roleForm.allowed_menus });
      const { error } = await query;
      if (error) throw error;
      toast.success(editingRole ? "Cargo atualizado." : "Cargo cadastrado.");
      setRoleDialog(false);
      await loadData();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao salvar cargo."); }
    finally { setSaving(false); }
  };

  const deleteRole = async (role: AdminRole) => {
    if ((roleUsers.get(role.id) ?? 0) > 0) { toast.error("Remova os usuários deste cargo antes de excluí-lo."); return; }
    if (!window.confirm(`Excluir o cargo ${role.name}?`)) return;
    const { error } = await supabase.from("admin_roles").delete().eq("id", role.id);
    if (error) toast.error(error.message); else { toast.success("Cargo excluído."); await loadData(); }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Equipe e acessos</h1>
            <p className="mt-1 text-slate-500">Cadastre a equipe administrativa e controle os menus disponíveis para cada cargo.</p>
          </div>
          {activeTab === "team" ? (
            <Button onClick={openNewMember} className="bg-blue-600 hover:bg-blue-700"><Plus size={17} className="mr-2" /> Novo membro</Button>
          ) : (
            <Button onClick={openNewRole} className="bg-blue-600 hover:bg-blue-700"><Plus size={17} className="mr-2" /> Novo cargo</Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
              <TabsTrigger value="team" className="rounded-lg px-5"><Users size={16} className="mr-2" /> Equipe</TabsTrigger>
              <TabsTrigger value="roles" className="rounded-lg px-5"><ShieldCheck size={16} className="mr-2" /> Cargos</TabsTrigger>
            </TabsList>
            {activeTab === "team" && (
              <select value={memberRoleFilter} onChange={(event) => setMemberRoleFilter(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <option value="all">Todos os cargos</option>
                <option value="administrator">Administrador</option>
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}

              </select>
            )}
          </div>

          <TabsContent value="team" className="mt-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5"><h2 className="font-bold text-slate-900">Usuários da administração</h2><p className="text-sm text-slate-500">{filteredMembers.length} membro(s) exibido(s)</p></div>
              {loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div> : <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4">Nome</th><th className="px-6 py-4">Cargo</th><th className="px-6 py-4">Cadastro</th><th className="px-6 py-4">Ativo</th><th className="px-6 py-4 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredMembers.map((member) => <tr key={member.id} className="hover:bg-slate-50/70"><td className="px-6 py-4"><p className="font-bold text-slate-900">{member.first_name} {member.last_name}</p><p className="text-sm text-slate-500">{member.email}</p></td><td className="px-6 py-4"><Badge variant="secondary">{member.admin_role_id ? roles.find((role) => role.id === member.admin_role_id)?.name ?? "Sem cargo" : "Administrador"}</Badge></td><td className="px-6 py-4 text-sm text-slate-500">{new Date(member.created_at).toLocaleDateString("pt-BR")}</td><td className="px-6 py-4"><div className="flex items-center gap-3"><Switch checked={member.active} onCheckedChange={(checked) => toggleMember(member, checked)} /><span className={member.active ? "text-emerald-600" : "text-slate-400"}>{member.active ? "Ativo" : "Inativo"}</span></div></td><td className="px-6 py-4"><div className="flex justify-end gap-2"><Button variant="outline" size="icon" onClick={() => openEditMember(member)}><Pencil size={16} /></Button><Button variant="outline" size="icon" className="text-red-600 hover:text-red-700" onClick={() => setMemberToDelete(member)}><Trash2 size={16} /></Button></div></td></tr>)}</tbody></table></div>}

            </div>
          </TabsContent>

          <TabsContent value="roles" className="mt-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5"><div><h2 className="font-bold text-slate-900">Cargos administrativos</h2><p className="text-sm text-slate-500">Defina quais menus cada cargo pode visualizar.</p></div></div><div className="divide-y divide-slate-100">{loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div> : roles.map((role) => <div key={role.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-3"><h3 className="font-bold text-slate-900">{role.name}</h3><Badge variant="outline">{roleUsers.get(role.id) ?? 0} usuário(s)</Badge></div><div className="mt-2 flex flex-wrap gap-2">{role.allowed_menus.map((menu) => <Badge key={menu} variant="secondary">{ADMIN_MENUS.find((item) => item.key === menu)?.label ?? menu}</Badge>)}</div></div><div className="flex gap-2"><Button variant="outline" onClick={() => openEditRole(role)}><Pencil size={16} className="mr-2" /> Editar</Button><Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => deleteRole(role)}><Trash2 size={16} /></Button></div></div>)}</div></div>

          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={memberDialog} onOpenChange={setMemberDialog}><DialogContent><DialogHeader><DialogTitle>{editingMember ? "Editar membro" : "Cadastrar membro da equipe"}</DialogTitle></DialogHeader><form onSubmit={saveMember} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><Label>Nome</Label><Input value={memberForm.first_name} onChange={(e) => setMemberForm({ ...memberForm, first_name: e.target.value })} /></div><div><Label>Sobrenome</Label><Input value={memberForm.last_name} onChange={(e) => setMemberForm({ ...memberForm, last_name: e.target.value })} /></div></div><div><Label>E-mail</Label><Input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} /></div><div><Label>{editingMember ? "Nova senha (opcional)" : "Senha"}</Label><div className="relative mt-2"><Input type={showPassword ? "text" : "password"} className="pr-10" value={memberForm.password} onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })} /><button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div><div><Label>Cargo</Label><select className="mt-2 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={memberForm.admin_role_id} onChange={(e) => setMemberForm({ ...memberForm, admin_role_id: e.target.value })}><option value="">Selecione um cargo</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></div><DialogFooter><Button type="button" variant="outline" onClick={() => setMemberDialog(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving && <Loader2 size={16} className="mr-2 animate-spin" />}Salvar</Button></DialogFooter></form></DialogContent></Dialog>

      <Dialog open={roleDialog} onOpenChange={setRoleDialog}><DialogContent><DialogHeader><DialogTitle>{editingRole ? "Editar cargo" : "Cadastrar cargo"}</DialogTitle></DialogHeader><form onSubmit={saveRole} className="space-y-5"><div><Label>Nome do cargo</Label><Input value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="Ex.: Assistente" /></div><div><Label>Menus da administração</Label><div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{ADMIN_MENUS.map((menu) => <label key={menu.key} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm"><input type="checkbox" checked={roleForm.allowed_menus.includes(menu.key)} onChange={(e) => setRoleForm({ ...roleForm, allowed_menus: e.target.checked ? [...roleForm.allowed_menus, menu.key] : roleForm.allowed_menus.filter((item) => item !== menu.key) })} /><span className="material-symbols-outlined text-[19px] text-slate-500">{menu.icon}</span><span>{menu.label}</span></label>)}</div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setRoleDialog(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving && <Loader2 size={16} className="mr-2 animate-spin" />}Salvar cargo</Button></DialogFooter></form></DialogContent></Dialog>

      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir usuário da equipe?</AlertDialogTitle><AlertDialogDescription>Essa ação excluirá definitivamente o acesso de <strong>{memberToDelete?.first_name} {memberToDelete?.last_name}</strong>. O usuário não poderá mais entrar no sistema e o acesso não poderá ser recuperado automaticamente.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={deleteMember} className="bg-red-600 hover:bg-red-700">Excluir definitivamente</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>

  );
};

export default Team;
