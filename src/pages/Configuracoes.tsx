import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Lock, CalendarClock, ShieldCheck } from "lucide-react";

const Configuracoes = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [settings, setSettings] = useState({
    associate_fee: 20,
    semiannual_fee: 50,
    grace_period_days: 0
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          associate_fee: Number(data.associate_fee),
          semiannual_fee: Number(data.semiannual_fee),
          grace_period_days: Number(data.grace_period_days || 0)
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('financial_settings')
        .insert({
          associate_fee: settings.associate_fee,
          semiannual_fee: settings.semiannual_fee,
          grace_period_days: settings.grace_period_days,
          updated_by: userData.user?.id
        });

      if (error) throw error;
      
      toast.success('Configurações financeiras atualizadas!');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Sua senha foi alterada com sucesso!");
      setNewPassword("");
    } catch (err: any) {
      toast.error("Erro ao alterar senha: " + err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="px-6 py-4 lg:px-10 border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hover:text-blue-600 cursor-pointer">Início</span>
            <span>/</span>
            <span className="font-medium text-slate-900">Configurações do Sistema</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 bg-[#f8f9fc]">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Painel de Configurações</h1>
            <p className="text-slate-500 mt-2 max-w-2xl text-sm leading-relaxed">
              Gerencie as políticas financeiras do sindicato e seus dados de acesso.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-8 py-5 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Políticas Financeiras</h3>
            </div>
            
            <div className="p-8">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-bold text-slate-700">Taxa Mensal (Associado)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                    <input
                      type="number"
                      className="block w-full rounded-xl border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-600/10 transition-all border"
                      value={settings.associate_fee}
                      onChange={(e) => setSettings({ ...settings, associate_fee: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-bold text-slate-700">Taxa Semestral</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                    <input
                      type="number"
                      className="block w-full rounded-xl border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-600/10 transition-all border"
                      value={settings.semiannual_fee}
                      onChange={(e) => setSettings({ ...settings, semiannual_fee: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    Prazo de Carência (Dias)
                    <CalendarClock className="text-blue-600 size-4" />
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="block w-full rounded-xl border-slate-200 bg-blue-50/30 py-3.5 px-4 text-blue-900 font-bold focus:ring-2 focus:ring-blue-600/10 transition-all border"
                      value={settings.grace_period_days}
                      onChange={(e) => setSettings({ ...settings, grace_period_days: Number(e.target.value) })}
                      placeholder="Ex: 5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-400 uppercase tracking-widest">Dias</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Uma fatura só será considerada "Atrasada" após X dias do vencimento.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Lock className="size-4" />
                Configurações protegidas
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Salvar Alterações
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
            <div className="border-b border-slate-100 px-8 py-5 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Segurança do Administrador</h3>
            </div>
            
            <div className="p-8">
              <div className="max-w-md space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Alterar Senha de Acesso</h4>
                    <p className="text-sm text-slate-500 mt-1">Sua senha é pessoal e intransferível. Recomendamos o uso de senhas fortes.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Nova Senha</label>
                    <div className="flex gap-3">
                      <input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        className="flex-1 rounded-xl border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 font-medium focus:ring-2 focus:ring-blue-600/10 transition-all border"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        onClick={handleChangePassword}
                        disabled={changingPassword || !newPassword}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                      >
                        {changingPassword ? <Loader2 className="size-4 animate-spin" /> : "Atualizar"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;