"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompaniesManager } from "@/hooks/useCompaniesManager";
import { toast } from "sonner";
import { isValidCPF, isValidCNPJ, maskCPF, maskCNPJ, maskPhone, maskCEP, BRAZILIAN_STATES } from "@/utils/validationUtils";
import { Loader2, ShieldCheck, UserCheck, Database, CheckCircle2, AlertTriangle, RefreshCw, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface NewCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyToEdit?: any | null;
}

const NewCompanyModal: React.FC<NewCompanyModalProps> = ({ isOpen, onClose, companyToEdit }) => {
  const queryClient = useQueryClient();
  const { saveCompany, isSavingCompany } = useCompaniesManager();
  
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    email: "",
    password: "",
    phone: "",
    whatsapp: "",
    representative_name: "",
    representative_cpf: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [diagnostic, setDiagnostic] = useState<any | null>(null);

  useEffect(() => {
    if (companyToEdit && isOpen) {
      setFormData({
        name: companyToEdit.name || "",
        cnpj: companyToEdit.cnpj || "",
        email: companyToEdit.email || "",
        password: "",
        phone: companyToEdit.phone || "",
        whatsapp: companyToEdit.whatsapp || "",
        representative_name: companyToEdit.representative_name || companyToEdit.representativeName || "",
        representative_cpf: companyToEdit.representative_cpf || companyToEdit.representativeCpf || "",
        street: companyToEdit.street || "",
        number: companyToEdit.number || "",
        neighborhood: companyToEdit.neighborhood || "",
        city: companyToEdit.city || "",
        state: companyToEdit.state || "",
        zip_code: companyToEdit.zip_code || companyToEdit.zipCode || "",
      });
      setDiagnostic(null);
    } else if (isOpen) {
      setFormData({ 
        name: "", cnpj: "", email: "", password: "", phone: "", whatsapp: "", representative_name: "", 
        representative_cpf: "", street: "", number: "", neighborhood: "", 
        city: "", state: "", zip_code: ""
      });
      setDiagnostic(null);
      setShowPassword(false);
    }
  }, [companyToEdit, isOpen]);

  const runPostCreationDiagnostic = async (userId: string, companyCnpj: string) => {
    const report: any = { checks: [] };
    
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      report.checks.push({ 
        name: "Criação de Perfil", 
        success: !!profile, 
        detail: profile ? `Cargo: ${profile.role}` : "Perfil não localizado" 
      });

      const { data: company } = await supabase.from('companies').select('*').eq('owner_id', userId).maybeSingle();
      report.checks.push({ 
        name: "Vínculo de Empresa", 
        success: !!company, 
        detail: company ? `Status: ${company.status}` : "Empresa não vinculada ao usuário" 
      });

      setDiagnostic(report);
    } catch (e) {
      console.error("Erro no diagnóstico:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.cnpj || !formData.email) {
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }

    if (!isValidCNPJ(formData.cnpj)) {
      toast.error("O CNPJ informado é inválido.");
      return;
    }

    if (formData.zip_code && formData.zip_code.replace(/\D/g, "").length !== 8) {
      toast.error("CEP incompleto.");
      return;
    }

    if (companyToEdit) {
      const payload = { ...formData, id: companyToEdit.id };
      delete (payload as any).password;
      await saveCompany(payload);
      onClose();
    } else {
      if (!formData.password || formData.password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
        return;
      }

      setIsCreating(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch('https://syzhrxnnoncaftojlflv.supabase.co/functions/v1/create-company-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Falha ao criar empresa.");

        // IMPORTANTE: Invalida a query para forçar o recarregamento da lista no Dashboard
        await queryClient.invalidateQueries({ queryKey: ["admin-companies"] });

        toast.success("Empresa e usuário criados com sucesso!");
        await runPostCreationDiagnostic(result.userId, formData.cnpj);
        
        setTimeout(() => {
          if (!diagnostic) onClose();
        }, 3000);

      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const isBusy = isSavingCompany || isCreating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] flex flex-col p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {companyToEdit ? "Editar Empresa" : "Cadastro de Empresa"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                {companyToEdit ? "Atualize os dados da empresa cadastrada." : "Registre uma nova empresa e crie sua conta de acesso."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-8 no-scrollbar">
          {diagnostic && (
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 animate-in zoom-in-95 duration-500 mb-4">
              <div className="flex items-center gap-2 text-indigo-400 mb-4">
                <RefreshCw size={16} className="animate-spin" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Relatório de Integridade de Cadastro</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diagnostic.checks.map((check: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    {check.success ? <CheckCircle2 className="text-emerald-400" size={18} /> : <AlertTriangle className="text-red-400" size={18} />}
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{check.name}</p>
                      <p className="text-xs text-white font-bold">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={onClose} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 h-10 rounded-xl font-black text-xs uppercase tracking-widest">
                CONCLUIR E FECHAR
              </Button>
            </div>
          )}

          {!diagnostic && (
            <form id="company-form" onSubmit={handleSubmit} className="space-y-8 pb-10">
              {!companyToEdit && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 mb-2">
                    <UserCheck size={18} className="text-blue-600" />
                    <h4 className="text-sm font-black uppercase tracking-wider">Credenciais de Acesso</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-500">E-mail de Login *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        className="rounded-xl border-slate-200 bg-white"
                        placeholder="ex: gestor@empresa.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-xs font-bold uppercase text-slate-500">Senha Provisória *</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          className="rounded-xl border-slate-200 bg-white pr-10"
                          placeholder="Mínimo 6 caracteres"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required={!companyToEdit}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2">Dados Institucionais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Razão Social *</Label>
                    <Input id="name" className="rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input id="cnpj" className="rounded-xl" value={formData.cnpj} onChange={(e) => setFormData({...formData, cnpj: maskCNPJ(e.target.value)})} />
                  </div>
                  {companyToEdit && (
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="email_edit">E-mail Financeiro *</Label>
                      <Input id="email_edit" type="email" className="rounded-xl" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone Comercial</Label>
                    <Input id="phone" className="rounded-xl" value={formData.phone} onChange={(e) => setFormData({...formData, phone: maskPhone(e.target.value)})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" className="rounded-xl" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: maskPhone(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2">Endereço da Sede</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="street">Logradouro / Rua</Label>
                    <Input id="street" className="rounded-xl" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" className="rounded-xl" value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" className="rounded-xl" value={formData.neighborhood} onChange={(e) => setFormData({...formData, neighborhood: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" className="rounded-xl" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">UF (Estado)</Label>
                    <Select value={formData.state} onValueChange={(v) => setFormData({...formData, state: v})}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZILIAN_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>{state.value} - {state.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 md:col-span-3">
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input id="zip_code" className="rounded-xl" value={formData.zip_code} onChange={(e) => setFormData({...formData, zip_code: maskCEP(e.target.value)})} placeholder="00000-000" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2">Representante Legal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="repName">Nome do Responsável</Label>
                    <Input id="repName" className="rounded-xl" value={formData.representative_name} onChange={(e) => setFormData({...formData, representative_name: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repCpf">CPF do Responsável</Label>
                    <Input id="repCpf" className="rounded-xl" value={formData.representative_cpf} onChange={(e) => setFormData({...formData, representative_cpf: maskCPF(e.target.value)})} />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {!diagnostic && (
          <DialogFooter className="p-6 border-t border-slate-100 bg-white">
            <Button type="button" variant="outline" className="rounded-xl h-12" onClick={onClose} disabled={isBusy}>Cancelar</Button>
            <Button type="submit" form="company-form" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20" disabled={isBusy}>
              {isBusy ? <Loader2 className="animate-spin mr-2" /> : <Database size={16} className="mr-2" />}
              {companyToEdit ? "Salvar Alterações" : "Criar Empresa e Usuário"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewCompanyModal;