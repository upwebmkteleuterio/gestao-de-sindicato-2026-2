import React, { useState } from "react";
import { useFinancials } from "@/hooks/useFinancials";
import { useCompany } from "@/hooks/useCompany";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { FileText, Download, Users, DollarSign, Receipt, Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const ActiveInvoice = () => {

  const { stats, isLoading } = useFinancials();
  const { company } = useCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  const invoice = stats.activeInvoice;

  if (!invoice) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Receipt className="size-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Nenhuma fatura pendente</h3>
        <p className="text-sm text-slate-500 max-w-xs mt-1">
          Não há cobranças em aberto para sua empresa no momento.
        </p>
      </div>
    );
  }

  const formattedDueDate = format(new Date(invoice.due_date), "dd 'de' MMMM, yyyy", { locale: ptBR });
  const amountFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.amount);
  const isAdjustment = invoice.billing_type === 'Ajuste de Saldo';
  const isOverdue = invoice.display_status === 'Atrasado';
  const handleOpenBoleto = () => {
    if (!invoice.bank_slip_url) return;
    window.open(invoice.bank_slip_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {isAdjustment ? "Pendência Financeira" : `Fatura Atual: #${invoice.invoice_number || invoice.id.substring(0, 8)}`}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Vencimento: {formattedDueDate} 
            {isAdjustment && <span className="ml-2 font-bold text-amber-600">(Saldo Anterior)</span>}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
          invoice.status === 'Pago' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : isOverdue ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'
        }`}>
          <span className="material-symbols-outlined text-[16px]">
            {invoice.status === 'Pago' ? 'check_circle' : isOverdue ? 'warning' : 'schedule'}
          </span>
          {invoice.status === 'Pago' ? 'Pago' : isOverdue ? 'Atrasado' : 'Pendente'}
        </div>
      </div>
      <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-1/3 aspect-video bg-slate-100 rounded-lg flex items-center justify-center group cursor-pointer border border-slate-200 hover:bg-slate-200 transition-colors">
          <FileText className="size-12 text-slate-300 group-hover:text-blue-600 transition-colors" />
        </div>
        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Faturado Para</span>
              <span className="font-medium text-slate-900 mt-1">{company?.name || "Sua Empresa"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Valor em Aberto</span>
              <span className="font-bold text-slate-900 mt-1 text-lg">{amountFormatted}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenBoleto}
              disabled={!invoice.bank_slip_url}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="size-4" />
              {invoice.bank_slip_url ? 'Visualizar Boleto' : 'Boleto indisponível'}
            </button>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2 rounded-lg text-sm font-bold transition-colors">
                  Ver Detalhes
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Receipt className="size-5 text-blue-600" />
                    Detalhamento da Cobrança
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 pt-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Cobrança</p>
                        <p className="font-bold text-slate-900">{invoice.billing_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Referência</p>
                        <p className="font-bold text-blue-600">{invoice.month_year}</p>
                      </div>
                    </div>

                    <div className="space-y-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição do Lançamento</p>
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        {invoice.description || "Cobrança mensal de associados."}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 border-dashed">
                      <p className="text-sm font-bold text-slate-900">Total a Pagar</p>
                      <p className="text-xl font-black text-blue-600">{amountFormatted}</p>
                    </div>
                  </div>

                  <Button className="w-full gap-2 font-bold" onClick={() => setIsModalOpen(false)}>
                    Fechar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveInvoice;