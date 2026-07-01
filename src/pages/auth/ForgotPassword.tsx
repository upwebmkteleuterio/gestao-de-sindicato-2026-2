"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSent(true);
      toast.success("E-mail de recuperação enviado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar e-mail de recuperação.");
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
          <h1 className="text-2xl font-bold tracking-tight">Recuperar Senha</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isSent 
              ? "Verifique seu e-mail para continuar" 
              : "Informe seu e-mail para receber o link de recuperação"}
          </p>
        </div>

        {isSent ? (
          <div className="p-8 text-center space-y-6">
            <div className="size-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <MailCheck size={40} className="text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">E-mail Enviado</h3>
              <p className="text-slate-600 text-sm">
                Enviamos um link de recuperação para <strong>{email}</strong>. 
                Verifique sua caixa de entrada e spam.
              </p>
            </div>
            <Button asChild className="w-full h-12 rounded-xl">
              <Link to="/login">Voltar para o Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">E-mail cadastrado</Label>
              <Input 
                type="email" 
                placeholder="exemplo@email.com"
                className="h-12 rounded-xl border-slate-200 focus:ring-blue-600/20 focus:border-blue-600"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Enviar Link de Recuperação"}
            </Button>

            <div className="text-center pt-4 border-t border-slate-50">
              <Link to="/login" className="text-sm text-slate-500 hover:text-blue-600 font-bold inline-flex items-center gap-2">
                <ArrowLeft size={16} /> Voltar para o Login
              </Link>
            </div>
          </form>
        )}
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

export default ForgotPassword;