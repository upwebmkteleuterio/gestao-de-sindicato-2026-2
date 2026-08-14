import React, { useMemo, useState } from "react";
import FinancialHeader from "@/components/admin/financial/FinancialHeader";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FinancialStats from "@/components/admin/financial/FinancialStats";
import FinancialTable from "@/components/admin/financial/FinancialTable";
import FinancialPagination from "@/components/admin/financial/FinancialPagination";
import ManualTransactionModal from "@/components/admin/financial/ManualTransactionModal";
import { useFinancialBalanceSettings, useFinancialTransactions } from "@/hooks/useFinancialTransactions";
import type { FinancialTransaction } from "@/hooks/useFinancialTransactions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const FinancialLegal = () => {
  const [showKpis, setShowKpis] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [balanceValue, setBalanceValue] = useState("");
  const [balanceDate, setBalanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [balanceDescription, setBalanceDescription] = useState("");
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const queryClient = useQueryClient();
  const { data: records = [], isLoading: transactionsLoading, error: transactionsError } = useFinancialTransactions();
  const { data: balanceSettings, isLoading: balanceLoading } = useFinancialBalanceSettings();

  const totals = useMemo(() => records.reduce((result, record) => {
    if (record.type === "entrada") result.income += Number(record.amount);
    if (record.type === "saida") result.expenses += Number(record.amount);
    return result;
  }, { income: 0, expenses: 0 }), [records]);

  const isLoading = transactionsLoading || balanceLoading;
  const initialBalance = Number(balanceSettings?.initial_balance || 0);
  const saveBalanceMutation = useMutation({
    mutationFn: async () => {
      const value = Number(balanceValue.replace(",", "."));
      if (value < 0 || !balanceDate) throw new Error("Informe um saldo e uma data válidos.");
      const { data: userData } = await supabase.auth.getUser();
      const payload = {
        initial_balance: value,
        reference_date: balanceDate,
        description: balanceDescription || null,
        updated_by: userData.user?.id,
      };
      const existingId = balanceSettings?.id;
      const result = existingId
        ? await supabase.from("financial_balance_settings").update(payload).eq("id", existingId)
        : await supabase.from("financial_balance_settings").insert(payload);
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-balance-settings"] });
      setBalanceDialogOpen(false);
    },
  });

  const openBalanceDialog = () => {
    setBalanceValue(initialBalance.toFixed(2));
    setBalanceDate(balanceSettings?.reference_date || new Date().toISOString().split("T")[0]);
    setBalanceDescription(balanceSettings?.description || "");
    setBalanceDialogOpen(true);
  };

  const deleteTransaction = async (record: FinancialTransaction) => {
    if (!window.confirm(`Excluir o lançamento manual "${record.title}"?`)) return;
    const { error } = await supabase.from("financial_transactions").delete().eq("id", record.id).eq("origin", "manual");
    if (error) { toast.error("Não foi possível excluir o lançamento."); return; }
    toast.success("Lançamento excluído.");
    queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
  };

  const openNewTransaction = () => { setSelectedTransaction(null); setTransactionDialogOpen(true); };
  const openEditTransaction = (record: FinancialTransaction) => { setSelectedTransaction(record); setTransactionDialogOpen(true); };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
      <FinancialHeader showKpis={showKpis} onToggleKpis={() => setShowKpis(!showKpis)} onConfigureBalance={openBalanceDialog} onNewTransaction={openNewTransaction} />
      <ManualTransactionModal open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen} transaction={selectedTransaction} />
      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configurar saldo inicial</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="initial-balance">Valor do saldo</Label><Input id="initial-balance" type="number" min="0" step="0.01" value={balanceValue} onChange={(event) => setBalanceValue(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="balance-date">Data de referência</Label><Input id="balance-date" type="date" value={balanceDate} onChange={(event) => setBalanceDate(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="balance-description">Descrição (opcional)</Label><Input id="balance-description" value={balanceDescription} onChange={(event) => setBalanceDescription(event.target.value)} placeholder="Saldo trazido de 2025" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBalanceDialogOpen(false)}>Cancelar</Button><Button onClick={() => saveBalanceMutation.mutate()} disabled={saveBalanceMutation.isPending}>Salvar saldo</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <FinancialStats isVisible={showKpis} onToggle={() => setShowKpis(!showKpis)} initialBalance={initialBalance} income={totals.income} expenses={totals.expenses} currentBalance={initialBalance + totals.income - totals.expenses} />

      <main className="flex-1 overflow-hidden p-6 bg-[#f8f9fc] flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col h-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="size-8 animate-spin text-blue-600" /></div>
          ) : transactionsError ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-red-200 text-red-600">Erro ao carregar os lançamentos financeiros.</div>
          ) : records.length > 0 ? (
            <><FinancialTable records={records} onEdit={openEditTransaction} onDelete={deleteTransaction} /><FinancialPagination currentRange={`1-${records.length}`} totalCount={records.length} /></>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">payments</span>
              <p className="text-slate-500 font-medium">Nenhum lançamento financeiro registrado.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FinancialLegal;
