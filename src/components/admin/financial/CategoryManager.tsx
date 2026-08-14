import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FinancialCategory } from "@/hooks/useFinancialTransactions";

interface Props { categories: FinancialCategory[]; }

const CategoryManager: React.FC<Props> = ({ categories }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"entrada" | "saida" | "ambos">("entrada");
  const mutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Informe o nome da categoria.");
      const user = await supabase.auth.getUser();
      const { error } = await supabase.from("financial_categories").insert({ name: name.trim(), kind, created_by: user.data.user?.id });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["financial-categories-all"] }); setName(""); toast.success("Categoria criada."); },
    onError: (error: Error) => toast.error(error.message.includes("duplicate") ? "Essa categoria já existe para este tipo." : error.message),
  });
  const toggleMutation = useMutation({
    mutationFn: async (category: FinancialCategory) => {
      const { error } = await supabase.from("financial_categories").update({ active: !category.active }).eq("id", category.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["financial-categories-all"] }),
    onError: () => toast.error("Não foi possível atualizar a categoria."),
  });
  return <section className="bg-white border border-slate-200 rounded-xl p-5 mt-6"><div className="flex items-center justify-between gap-3 mb-4"><div><h2 className="font-bold text-slate-900">Gerenciar categorias</h2><p className="text-sm text-slate-500">Crie categorias para organizar entradas e saídas.</p></div><span className="text-xs font-semibold text-slate-400">{categories.length} ativas</span></div><div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3 items-end"><div className="space-y-2"><Label>Nome da categoria</Label><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Serviços" /></div><div className="space-y-2"><Label>Aplicável a</Label><Select value={kind} onValueChange={(value: "entrada" | "saida" | "ambos") => setKind(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="entrada">Entradas</SelectItem><SelectItem value="saida">Saídas</SelectItem><SelectItem value="ambos">Ambos</SelectItem></SelectContent></Select></div><Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>Adicionar</Button></div><div className="flex flex-wrap gap-2 mt-4">{categories.map((category) => <div key={category.id} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"><span className="font-medium text-slate-700">{category.name}</span><span className="text-xs text-slate-400">{category.kind === "ambos" ? "Ambos" : category.kind === "entrada" ? "Entrada" : "Saída"}</span><button onClick={() => toggleMutation.mutate(category)} className="text-xs font-semibold text-red-500 hover:text-red-700">Desativar</button></div>)}</div></section>;
};
export default CategoryManager;
