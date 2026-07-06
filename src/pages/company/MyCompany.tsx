"use client";

import React, { useState, useEffect } from "react";
import { useCompany } from "@/hooks/useCompany";
import { useSessionContext } from "@/contexts/SessionContext";
import { toast } from "sonner";
import { isValidCPF, isValidCNPJ, maskCPF, maskCNPJ, maskPhone, maskCEP, BRAZILIAN_STATES } from "@/utils/validationUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RegistrationModal from "@/components/shared/RegistrationModal";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock, XCircle, Loader2, Info } from "lucide-react";

const MyCompany = () => {
  const { company, isLoading, updateCompany } = useCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", cnpj: "", email: "", phone: "", whatsapp: "",
    street: "", number: "", neighborhood: "", city: "", state: "", zip_code: "",
    representative_name: "", representative_cpf: "",
  });

  // Efeito de Sincronização Robusta
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        cnpj: company.cnpj || "",
        email: company.email || "",
        phone: company.phone || "",
        whatsapp: company.whatsapp || "",
        street: company.street || "",
        number: company.number || "",
        neighborhood: company.neighborhood || "",
        city: company.city || "",
        state: company.state || "",
        zip_code: company.zip_code ? maskCEP(company.zip_code) : "",
        representative_name: company.representative_name || "",
        representative_cpf: company.representative_cpf || "",
      });
      
      // Abre o modal apenas se faltarem dados essenciais do endereço
      if (!company.street || !company.zip_code || !company.city) {
        setIsModalOpen(true);
      }
    }
  }, [company]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCNPJ(formData.cnpj)) {
      toast.error("CNPJ inválido.");
      return;
    }
    await updateCompany.mutateAsync(formData);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600 size-10" />
    </div>
  );

  const isPending = company?.status === 'pending';
  const isRejected = company?.status === 'rejected';
  const isOnboarding = company?.status === 'onboarding';

  const statusInfo: any = {
    onboarding: { label: "Cadastro Incompleto", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <Info size={16} /> },
    pending: { label: "Aguardando Aprovação", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <Clock size={16} /> },
    approved: { label: "Cadastro Aprovado", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={16} /> },
    rejected: { label: "Cadastro Recusado", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={16} /> },
  };

  const currentStatus = statusInfo[company?.status] || statusInfo['pending'];

  return (
    <div className="p-6 lg:p-10 bg-[#f8f9fc] animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {isRejected && company?.rejection_reason && (
          <div className="bg-red-50 border-2 border-red-100 p-6 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="text-red-800 font-black uppercase text-sm tracking-tight">Atenção: Seu cadastro foi recusado</h4>
              <p className="text-red-700 text-sm mt-1 font-medium italic">" {company.rejection_reason} "</p>
              <p className="text-red-600 text-xs mt-3">Por favor, corrija os campos abaixo e reenvie para análise.</p>
            </div>
          </div>
        )}

        {isOnboarding && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3">
            <Info size={18} className="text-blue-600" />
            <p className="text-sm text-blue-800 font-medium">Bem-vindo! Complete as informações abaixo para enviar seu cadastro para aprovação.</p>
          </div>
        )}

        {isPending && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center gap-3">
            <Clock size={18} className="text-amber-600" />
            <p className="text-sm text-amber-800 font-medium">Os campos estão bloqueados para edição enquanto o sindicato analisa sua última alteração.</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Minha Empresa</h1>
            <p className="text-slate-500 mt-1">Dados oficiais registrados no sindicato.</p>
          </div>
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold shadow-sm", currentStatus.color)}>
            {currentStatus.icon} {currentStatus.label}
          </div>
        </div>

        <form 
          key={company?.id + company?.status} 
          onSubmit={handleSave} 
          className="flex flex-col gap-6 mb-20"
        >
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-base font-bold text-slate-900">Dados Institucionais</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label>Razão Social *</Label>
                <Input disabled={isPending} defaultValue={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>CNPJ *</Label>
                <Input disabled={isPending} defaultValue={formData.cnpj} onChange={e => setFormData({...formData, cnpj: maskCNPJ(e.target.value)})} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>E-mail Financeiro *</Label>
                <Input disabled={isPending} type="email" defaultValue={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Telefone</Label>
                <Input disabled={isPending} defaultValue={formData.phone} onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label>WhatsApp</Label>
                <Input disabled={isPending} defaultValue={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: maskPhone(e.target.value)})} />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-base font-bold text-slate-900">Endereço da Sede</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="grid gap-2 md:col-span-2">
                <Label>Rua *</Label>
                <Input disabled={isPending} defaultValue={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Número *</Label>
                <Input disabled={isPending} defaultValue={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Bairro *</Label>
                <Input disabled={isPending} defaultValue={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Cidade *</Label>
                <Input disabled={isPending} defaultValue={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Estado *</Label>
                <Select disabled={isPending} defaultValue={formData.state} onValueChange={v => setFormData({...formData, state: v})}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione o Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>{state.value} - {state.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 md:col-span-3">
                <Label>CEP *</Label>
                <Input disabled={isPending} defaultValue={formData.zip_code} onChange={e => setFormData({...formData, zip_code: maskCEP(e.target.value)})} placeholder="00000-000" />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-base font-bold text-slate-900">Representante Legal</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label>Nome Completo *</Label>
                <Input disabled={isPending} defaultValue={formData.representative_name} onChange={e => setFormData({...formData, representative_name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>CPF *</Label>
                <Input disabled={isPending} defaultValue={formData.representative_cpf} onChange={e => setFormData({...formData, representative_cpf: maskCPF(e.target.value)})} />
              </div>
            </div>
          </section>

          {!isPending && (
            <div className="flex justify-end pt-4">
              <Button type="submit" className="h-12 px-10 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl" disabled={updateCompany.isPending}>
                {updateCompany.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                {isRejected ? "Corrigir e Reenviar" : "Salvar e Enviar para Aprovação"}
              </Button>
            </div>
          )}
        </form>
      </div>
      <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default MyCompany;