"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useFinancials } from "@/hooks/useFinancials";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { 
  Download,
  CheckCircle2,
  Clock,
  CreditCard,
  AlertTriangle,
  Copy
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoicesTableProps {
  explicitCompanyId?: string;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ explicitCompanyId }) => {
  const { 
    invoices, 
    isLoading, 
    availableYears, 
    selectedYear, 
    setSelectedYear,
  } = useFinancials(explicitCompanyId);


  const handlePay = (inv: any) => {
    if (!inv.bank_slip_url) {
      toast.error('O boleto ainda não está disponível.');
      return;
    }
    window.open(inv.bank_slip_url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = (inv: any) => {
    if (!inv.bank_slip_url) {
      toast.error('O boleto ainda não está disponível.');
      return;
    }
    window.open(inv.bank_slip_url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success('Linha digitável copiada.');
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  const currentYear = new Date().getFullYear().toString();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Histórico de Faturamentos</h3>
          <p className="text-xs text-slate-500">Acompanhe seu histórico financeiro e faturas em aberto.</p>
        </div>
        
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[160px] bg-white rounded-xl border-slate-200 h-10 font-bold text-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => (
              <SelectItem key={year} value={year} className="font-bold">
                {year === currentYear ? "Ano Atual" : year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-white text-xs uppercase font-semibold text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Fatura</th>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {invoices.map((inv) => {
              const isPaid = inv.status === 'Pago';
              const isAdminPaid = isPaid && inv.payment_origin === 'admin';
              const isAtrasado = inv.display_status === 'Atrasado';

              return (
                <tr key={inv.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{inv.invoice_number || inv.id.substring(0, 8)}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{inv.month_year}</p>
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
                      isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                      isAtrasado ? "bg-red-50 text-red-700 border-red-200 animate-pulse" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {isPaid ? <CheckCircle2 className="size-3" /> : 
                       isAtrasado ? <AlertTriangle className="size-3" /> : 
                       <Clock className="size-3" />}
                      
                      {isAdminPaid ? "Ajuste Administrativo" : (isAtrasado ? "Atrasado" : inv.display_status || inv.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inv.identification_field && !isPaid && (
                        <button
                          onClick={() => handleCopyCode(inv.identification_field)}
                          className="text-slate-500 hover:text-blue-600 p-2 rounded-lg hover:bg-white transition-colors flex items-center gap-1 font-bold text-xs"
                          title="Copiar linha digitável"
                        >
                          <Copy size={15} /> Código
                        </button>
                      )}
                      {!isPaid ? (
                        <button
                          onClick={() => handlePay(inv)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95",
                            isAtrasado ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/10" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10"
                          )}
                        >
                          <CreditCard size={14} />
                          {isAtrasado ? "Pagar Atrasado" : "Pagar Fatura"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownload(inv)}
                          className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-white transition-colors flex items-center gap-2 font-bold text-xs"
                        >
                          <Download size={16} /> PDF
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicesTable;