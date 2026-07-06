"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    
    setIsLoading(true);
    try {
      let loginEmail = formData.email;
      
      // Se parece um CNPJ (apenas números ou formatado), transforma no e-mail virtual
      const cleanInput = formData.email.replace(/\D/g, '');
      if (cleanInput.length === 14) {
        loginEmail = `${cleanInput}@gestaosindicato.com.br`;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Verificar se a empresa está excluída ANTES de permitir o acesso
        const { data: company } = await supabase
          .from("companies")
          .select("status")
          .eq("owner_id", data.user.id)
          .maybeSingle();

        if (company?.status === 'deleted') {
          await supabase.auth.signOut();
          toast.error("Esta conta foi excluída. Para mais informações, entre em contato com a administração do sindicato.");
          setIsLoading(false);
          return;
        }
      }

      toast.success("Login realizado!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Credenciais inválidas.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Imagem de Fundo com Filtro */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://fia.com.br/wp-content/uploads/2022/06/gestao-empresarial-fia.jpg" 
          alt="Gestão Empresarial" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-slate-900 p-8 text-center text-white border-b border-slate-800">
          <div className="size-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <ShieldCheck size={32} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão Sindical</h1>
          <p className="text-slate-400 text-sm mt-1">Entre para acessar seu portal exclusivo</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold">CNPJ ou E-mail de acesso</Label>
            <Input
              type="text"
              placeholder="00.000.000/0001-00 ou email@exemplo.com"
              className="h-12 rounded-xl border-slate-200 focus:ring-blue-600/20 focus:border-blue-600"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold">Sua senha</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Digite sua senha"
                className="h-12 rounded-xl border-slate-200 pr-10 focus:ring-blue-600/20 focus:border-blue-600"
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Acessar Sistema"}
          </Button>
          <div className="text-center pt-4 border-t border-slate-50">
            <p className="text-sm text-slate-500">Não tem conta? <Link to="/cadastro" className="text-blue-600 font-bold hover:underline">Cadastre sua empresa</Link></p>
          </div>
        </form>
      </div>
      
      {/* Rodapé do Login */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
          Sistema Unificado de Gestão Sindical © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;