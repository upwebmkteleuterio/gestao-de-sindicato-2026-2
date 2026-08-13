"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useFinancials } from "@/hooks/useFinancials";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  MoreVertical,
  ExternalLink,
  Copy,
  Trash2,
  FileText
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface AdminInvoicesTableProps {
  companyId: string;
}

const AdminInvoicesTable: React.FC<AdminInvoicesTableProps> = ({ companyId }) => {
  const { 
    invoices, 
    isLoading, 
    availableYears, 
    selectedYear, 
    setSelectedYear,
  } = useFinancials(companyId);

  const queryClient = useQueryClient();

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoice: any) => {
      const { error } = await supabase.functions.invoke('delete-asaas-boleto', {
        body: { invoiceId: invoice.id }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', companyId] });
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      toast.success('Fatura retroativa excluída.');
    },
    onError: () => toast.error('Não foi possível excluir a fatura retroativa.')
  });

  const handleOpenBoleto = (invoice: any) => {
    if (!invoice.bank_slip_url) {
      toast.error('Esta fatura ainda não possui boleto emitido.');
      return;
    }
    window.open(invoice.bank_slip_url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success('Linha digitável copiada.');
  };

  const handleDeleteRetroactive = (invoice: any) => {
    if (!window.confirm('Excluir esta fatura retroativa? A cobrança correspondente no Asaas não será cancelada automaticamente.')) return;
    deleteInvoiceMutation.mutate(invoice);
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Histórico Financeiro Administrativo</h3>
            <p className="text-xs text-slate-500">Gestão de faturamentos e controle de status manual.</p>
          </div>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[160px] bg-white rounded-xl border-slate-200 h-10 font-bold text-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year} className="font-bold">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-white text-xs uppercase font-semibold text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Nº Fatura / Ciclo</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => {
                const isPaid = inv.status === 'Pago';
                const isOverdue = inv.display_status === 'Atrasado';
                const isAdminPaid = isPaid && inv.payment_origin === 'admin';

                return (
                  <tr key={inv.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{inv.invoice_number || inv.id.substring(0, 8)}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">{inv.billing_type} • {inv.month_year}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {format(new Date(inv.due_date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border",
                        isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : isOverdue ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {isPaid ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                        {isAdminPaid ? "Pago - Administração" : inv.display_status || inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg transition-colors">
                            <MoreVertical className="size-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Gestão Admin</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer text-blue-600 font-bold"
                            onClick={() => handleOpenBoleto(inv)}
                          >
                            <ExternalLink size={16} /> Visualizar Boleto
                          </DropdownMenuItem>
                          {inv.identification_field && (
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => handleCopyCode(inv.identification_field)}
                            >
                              <Copy size={16} /> Copiar Linha Digitável
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <FileText size={16} /> Dados do Asaas: {inv.asaas_status || 'não emitido'}
                          </DropdownMenuItem>
                          {inv.billing_type === 'Ajuste de Saldo' && (
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteRetroactive(inv)}
                            >
                              <Trash2 size={16} /> Excluir Fatura Retroativa
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminInvoicesTable;