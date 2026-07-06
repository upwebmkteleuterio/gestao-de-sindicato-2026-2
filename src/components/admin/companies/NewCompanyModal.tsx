"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompaniesManager } from "@/hooks/useCompaniesManager";
import { toast } from "sonner";
import { isValidCPF, isValidCNPJ, maskCPF, maskCNPJ, maskPhone, maskCEP, BRAZILIAN_STATES } from "@/utils/validationUtils";
import { Loader2, ShieldCheck, UserCheck, Database, CheckCircle2, AlertTriangle, RefreshCw, Eye, EyeOff, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface NewCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyToEdit?: any | null;
  accountingToEdit?: any | null;
}

const NewCompanyModal: React.FC<NewCompanyModalProps> = ({ isOpen, onClose, companyToEdit, accountingToEdit }) => {
  const queryClient = useQueryClient();
  const { saveCompany, isSavingCompany, saveAccounting } = useCompaniesManager();
  
  const [formData, setFormData] = useState({
    name: "", cnpj: "", email: "", password: "", phone: "", whatsapp: "",
    representative_name: "", representative_cpf: "", street: "", number: "",
    neighborhood: "", city: "", state: "", zip_code: "", accounting_email: ""
  });

  const [accFormData, setAccFormData] = useState({
    name: "", email: "", phone: ""
  });

  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [diagnostic, setDiagnostic] = useState<any | null>(null);
  const [accSearch, setAccSearch] = useState("");
  const [showAccSuggestions, setShowAccSuggestions] = useState(false);

  // Buscar todas as contabilidades para o autocomplete
  const { data: allAccounting } = useQuery({
    queryKey: ["all-accounting-emails"],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounting_offices").select("email, name");
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !accountingToEdit
  });

  const accSuggestions = useMemo(() => {
    if (!accSearch || accSearch.length < 2 || !allAccounting) return [];
    return allAccounting.filter(acc => 
      acc.email?.toLowerCase().includes(accSearch.toLowerCase()) || 
      acc.name?.toLowerCase().includes(accSearch.toLowerCase())
    ).slice(0, 5);
  }, [accSearch, allAccounting]);

  useEffect(() => {
    if (accountingToEdit && isOpen) {
      setAccFormData({
        name: accountingToEdit.name || "",
        email: accountingToEdit.email || "",
        phone: accountingToEdit.phone || ""
      });
    } else if (companyToEdit && isOpen) {
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
        accounting_email: companyToEdit.accounting_email || ""
      });
      setAccSearch(companyToEdit.accounting_email || "");
      setDiagnostic(null);
    } else if (isOpen) {
      setFormData({ 
        name: "", cnpj: "", email: "", password: "", phone: "", whatsapp: "", representative_name: "", 
        representative_cpf: "", street: "", number: "", neighborhood: "", 
        city: "", state: "", zip_code: "", accounting_email: ""
      });
      setAccFormData({ name: "", email: "", phone: "" });
      setAccSearch("");
      setDiagnostic(null);
      setShowPassword(false);
    }
  }, [companyToEdit, accountingToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accountingToEdit) {
      await saveAccounting({ ...accFormData, id: accountingToEdit.id });
      onClose();
      return;
    }

    if (!formData.name || !formData.cnpj || !formData.email) {
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }

    if (!isValidCNPJ(formData.cnpj)) {
      toast.error("O CNPJ informado é inválido.");
      return;
    }

    const payload = { ...formData, accounting_email: accSearch };

    if (companyToEdit) {
      const editPayload = { ...payload, id: companyToEdit.id };
      delete (editPayload as any).password;
      await saveCompany(editPayload);
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
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Falha ao criar empresa.");

        await queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
        toast.success("Empresa e usuário criados com sucesso!");
        onClose();
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
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] flex flex-col p-0 overflow-hidden bg-white rounded-3xl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {accountingToEdit ? "Editar Contabilidade" : (companyToEdit ? "Editar Empresa" : "Cadastro de Empresa")}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                {accountingToEdit ? "Atualize os dados do escritório de contabilidade." : (companyToEdit ? "Atualize os dados da empresa cadastrada." : "Registre uma nova empresa e crie sua conta de acesso.")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-8 no-scrollbar">
          <form id="main-form" onSubmit={handleSubmit} className="space-y-8 pb-10">
            {accountingToEdit ? (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="acc_name">Nome do Escritório / Responsável</Label>
                    <Input id="acc_name" className="rounded-xl" value={accFormData.name} onChange={e => setAccFormData({...accFormData, name: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="acc_email">E-mail de Contato *</Label>
                    <Input id="acc_email" type="email" className="rounded-xl" value={accFormData.email} onChange={e => setAccFormData({...accFormData, email: e.target.value})} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="acc_phone">Telefone</Label>
                    <Input id="acc_phone" className="rounded-xl" value={accFormData.phone} onChange={e => setAccFormData({...accFormData, phone: maskPhone(e.target.value)})} />
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                          id="email" type="email" className="rounded-xl border-slate-200 bg-white"
                          value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password" className="text-xs font-bold uppercase text-slate-500">Senha Provisória *</Label>
                        <div className="relative">
                          <Input 
                            id="password" type={showPassword ? "text" : "password"} className="rounded-xl border-slate-200 bg-white pr-10"
                            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!companyToEdit}
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
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
                    
                    <div className="grid gap-2 relative md:col-span-2">
                      <Label htmlFor="acc_search">E-mail da Contabilidade</Label>
                      <div className="relative">
                        <Input 
                          id="acc_search" className="rounded-xl pr-10" placeholder="Digite para buscar e-mails existentes..."
                          value={accSearch} 
                          onChange={(e) => {
                            setAccSearch(e.target.value);
                            setShowAccSuggestions(true);
                          }}
                          onFocus={() => setShowAccSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowAccSuggestions(false), 200)}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      </div>
                      
                      {showAccSuggestions && accSuggestions.length > 0 && (
                        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                          {accSuggestions.map((acc, i) => (
                            <button
                              key={i} type="button"
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                              onClick={() => {
                                setAccSearch(acc.email);
                                setShowAccSuggestions(false);
                              }}
                            >
                              <p className="text-xs font-bold text-slate-900">{acc.name || acc.email}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{acc.email}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {companyToEdit && (
                      <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="email_edit">E-mail Financeiro da Empresa *</Label>
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
                      <Label htmlFor="street">Rua</Label>
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
                      <Label htmlFor="state">Estado</Label>
                      <Select value={formData.state} onValueChange={(v) => setFormData({...formData, state: v})}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="UF" /></SelectTrigger>
                        <SelectContent>{BRAZILIAN_STATES.map((state) => (<SelectItem key={state.value} value={state.value}>{state.value} - {state.label}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2 md:col-span-3">
                      <Label htmlFor="zip_code">CEP</Label>
                      <Input id="zip_code" className="rounded-xl" value={formData.zip_code} onChange={(e) => setFormData({...formData, zip_code: maskCEP(e.target.value)})} placeholder="00000-000" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        <DialogFooter className="p-6 border-t border-slate-100 bg-white">
          <Button type="button" variant="outline" className="rounded-xl h-12" onClick={onClose} disabled={isBusy}>Cancelar</Button>
          <Button type="submit" form="main-form" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl font-black uppercase text-xs tracking-widest" disabled={isBusy}>
            {isBusy ? <Loader2 className="animate-spin mr-2" /> : <Database size={16} className="mr-2" />}
            {accountingToEdit ? "Salvar Contabilidade" : (companyToEdit ? "Salvar Alterações" : "Criar Empresa")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewCompanyModal;