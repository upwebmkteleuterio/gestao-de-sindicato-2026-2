import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FinancialTransaction } from "@/hooks/useFinancialTransactions";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; transaction?: FinancialTransaction | null; }

const ManualTransactionModal: React.FC<Props> = ({ open, onOpenChange, transaction }) => {
  const queryClient = useQueryClient();
  const [type, setType] = useState<"entrada" | "saida">("entrada");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const { data: categories = [] } = useQuery({
    queryKey: ["financial-categories", type],
    queryFn: async () => {
      const { data, error } = await supabase.from("financial_categories").select("id, name, kind").eq("active", true).in("kind", [type, "ambos"]).order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    setType(transaction?.type || "entrada");
    setTitle(transaction?.title || "");
    setAmount(transaction ? String(transaction.amount) : "");
    setDate(transaction?.transaction_date || new Date().toISOString().split("T")[0]);
    setCategoryId("");
    setDescription(transaction?.description || "");
  }, [transaction, open]);

  useEffect(() => {
    if (!categoryId && categories[0]) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  const mutation = useMutation({
    mutationFn: async () => {
      const parsedAmount = Number(amount.replace(",", "."));
      if (!title.trim() || !date || !categoryId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) throw new Error("Preencha os campos obrigatórios.");
      const user = await supabase.auth.getUser();
      const payload = { type, origin: "manual", title: title.trim(), amount: parsedAmount, transaction_date: date, category_id: categoryId, description: description.trim() || null, created_by: user.data.user?.id };
      const result = transaction
        ? await supabase.from("financial_transactions").update(payload).eq("id", transaction.id).eq("origin", "manual")
        : await supabase.from("financial_transactions").insert(payload);
      if (result.error) throw result.error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["financial-transactions"] }); toast.success(transaction ? "Lançamento atualizado." : "Lançamento criado."); onOpenChange(false); },
    onError: (error: Error) => toast.error(error.message),
  });

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-[520px]"><DialogHeader><DialogTitle>{transaction ? "Editar lançamento manual" : "Novo lançamento manual"}</DialogTitle></DialogHeader><div className="space-y-4 py-4">
    <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Tipo</Label><Select value={type} onValueChange={(value: "entrada" | "saida") => { setType(value); setCategoryId(""); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Valor</Label><Input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" /></div></div>
    <div className="space-y-2"><Label>Nome do lançamento</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Aluguel da sede" /></div>
    <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Data</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div><div className="space-y-2"><Label>Categoria</Label><Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></div></div>
    <div className="space-y-2"><Label>Descrição (opcional)</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do lançamento" /></div>
  </div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !categories.length}>{mutation.isPending ? "Salvando..." : "Salvar lançamento"}</Button></DialogFooter></DialogContent></Dialog>;
};
export default ManualTransactionModal;
