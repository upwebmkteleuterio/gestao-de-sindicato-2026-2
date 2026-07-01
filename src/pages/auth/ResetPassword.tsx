"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verificar se existe uma sessão (o Supabase coloca o usuário em uma sessão temporária ao clicar no link)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Link expirado ou inválido.");
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("Senha redefinida com sucesso!");
      // Após redefinir, podemos deslogar ou enviar para a home se a sessão persistir
      // O ideal é enviar para o login para ele logar com a nova senha
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao redefinir senha.");
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
          <h1 className="text-2xl font-bold tracking-tight">Nova Senha</h1>
          <p className="text-slate-400 text-sm mt-1">Defina sua nova senha de acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold">Nova Senha</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Mínimo 6 caracteres"
                className="h-12 rounded-xl border-slate-200 pr-10 focus:ring-blue-600/20 focus:border-blue-600"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold">Confirmar Nova Senha</Label>
            <Input 
              type={showPassword ? "text" : "password"} 
              placeholder="Digite novamente a senha"
              className="h-12 rounded-xl border-slate-200 focus:ring-blue-600/20 focus:border-blue-600"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Redefinir Senha"}
          </Button>
        </form>
      </div>
      
      {/* Rodapé */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
          Sistema Unificado de Gestão Sindical © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;