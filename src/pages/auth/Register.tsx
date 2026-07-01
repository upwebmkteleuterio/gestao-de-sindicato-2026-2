"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isValidCPF, isValidCNPJ, maskCPF, maskCNPJ } from "@/utils/validationUtils";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    repName: "",
    repCpf: "",
    companyName: "",
    companyCnpj: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.repName || !formData.repCpf || !formData.companyName || !formData.companyCnpj || !formData.email || !formData.password) {
      toast.error("Todos os campos são obrigatórios.");
      return;
    }

    if (!isValidCPF(formData.repCpf)) {
      toast.error("CPF inválido.");
      return;
    }

    if (!isValidCNPJ(formData.companyCnpj)) {
      toast.error("CNPJ inválido.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verificar se o CNPJ já existe
      const { data: existingCompany, error: checkError } = await supabase
        .from("companies")
        .select("id")
        .eq("cnpj", formData.companyCnpj)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingCompany) {
        toast.error("Já existe um cadastro com esse CNPJ.");
        setIsLoading(false);
        return;
      }

      const names = formData.repName.trim().split(/\s+/);
      const firstName = names[0];
      const lastName = names.length > 1 ? names.slice(1).join(' ') : "";

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            rep_cpf: formData.repCpf,
            company_name: formData.companyName,
            company_cnpj: formData.companyCnpj,
            role: "empresa",
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Cadastro realizado com sucesso!");
        // Redireciona diretamente para a tela de preenchimento da empresa
        navigate("/empresa/minha-empresa");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro no cadastro.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-center text-white">
          <div className="size-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldPlus size={32} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold">Crie sua Conta</h1>
          <p className="text-slate-400 text-sm mt-1">Portal para cadastro de novas empresas associadas</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nome do Responsável</Label>
              <Input placeholder="Seu nome" value={formData.repName} onChange={(e) => setFormData({ ...formData, repName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>CPF do Responsável</Label>
              <Input placeholder="000.000.000-00" value={formData.repCpf} onChange={(e) => setFormData({ ...formData, repCpf: maskCPF(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label>Razão Social</Label>
              <Input placeholder="Nome da empresa" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input placeholder="00.000.000/0000-00" value={formData.companyCnpj} onChange={(e) => setFormData({ ...formData, companyCnpj: maskCNPJ(e.target.value) })} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Email</Label>
              <Input type="email" placeholder="email@exemplo.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Senha</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Crie uma senha forte" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Concluir Cadastro"}
          </Button>
          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">Já tem uma conta? <Link to="/login" className="text-blue-600 font-bold">Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;