"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit2, Phone, MessageSquare, History, Receipt, Users as UsersIcon } from "lucide-react";
import ManualDebtModal from "./ManualDebtModal";
import AdminInvoicesTable from "./AdminInvoicesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompanyDetailsViewProps {
  company: any;
  employees: any[];
  onSelectEmployee: (employee: any) => void;
  onEditCompany: (company: any) => void;
}

const CompanyDetailsView: React.FC<CompanyDetailsViewProps> = ({ 
  company, 
  employees, 
  onSelectEmployee,
  onEditCompany
}) => {
  const [isManualDebtOpen, setIsManualDebtOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Cards Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-2">
            <h3 className="text-lg font-bold text-slate-900">Informações Cadastrais</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 h-8 text-xs font-bold border-blue-100 text-blue-600 hover:bg-blue-50"
              onClick={() => onEditCompany(company)}
            >
              <Edit2 size={14} />
              Editar Dados
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Representante Legal</p>
              <p className="text-sm font-bold text-slate-900">{company.representativeName || "Não informado"}</p>
              <p className="text-xs text-slate-500 font-mono">CPF: {company.representativeCpf || "---"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail de Cadastro</p>
              <p className="text-sm font-medium text-blue-600 truncate">{company.email}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail da Contabilidade</p>
              <p className="text-sm font-medium text-blue-600 truncate">{company.accountingEmail || company.accounting_email || "---"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telefone Comercial</p>
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-slate-400" />
                <p className="text-sm font-bold text-slate-900">{company.phone || "---"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp</p>
              <div className="flex items-center gap-2">
                <MessageSquare size={12} className="text-emerald-500" />
                <p className="text-sm font-bold text-slate-900">{company.whatsapp || "---"}</p>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-2 pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Endereço da Sede</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Rua</p>
                  <p className="text-sm font-bold text-slate-900">{company.street || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Número</p>
                  <p className="text-sm font-bold text-slate-900">{company.number || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Bairro</p>
                  <p className="text-sm font-bold text-slate-900">{company.neighborhood || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Cidade</p>
                  <p className="text-sm font-bold text-slate-900">{company.city || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Estado</p>
                  <p className="text-sm font-bold text-slate-900">{company.state || "---"}</p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">CEP</p>
                  <p className="text-sm font-bold text-slate-900 font-mono">{company.zipCode || "---"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Situação Financeira</h3>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight border",
                company.billingStatus === 'Regular' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"
              )}>
                {company.billingStatus}
              </span>
            </div>
          </div>
          <div className="my-6">
            <p className="text-4xl font-black text-white tracking-tighter">{company.debt}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Dívida Total Consolidada</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full h-11 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-900/50"
            >
              Gerar Boleto de Acordo
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsManualDebtOpen(true)}
              className="w-full h-11 bg-transparent border-slate-700 text-slate-300 font-bold hover:bg-slate-800 hover:text-white gap-2 transition-all"
            >
              <History size={16} />
              Lançar Dívida Retroativa
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs de Detalhamento */}
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="invoices" className="rounded-lg font-bold gap-2 px-6">
            <Receipt size={16} />
            Histórico Financeiro
          </TabsTrigger>
          <TabsTrigger value="employees" className="rounded-lg font-bold gap-2 px-6">
            <UsersIcon size={16} />
            Funcionários ({employees.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="animate-in fade-in slide-in-from-left-4 duration-500">
          <AdminInvoicesTable companyId={company.id} />
        </TabsContent>

        <TabsContent value="employees" className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Colaborador</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Cargo</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <tr 
                        key={emp.id} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => onSelectEmployee(emp)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-100">
                              {emp.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-slate-900">{emp.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 font-medium">{emp.role}</td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase border",
                            emp.status === "Associado" ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-slate-50 text-slate-600 border-slate-200"
                          )}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 transition-colors">visibility</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-400 italic text-sm">
                        Nenhum funcionário vinculado a esta empresa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ManualDebtModal 
        isOpen={isManualDebtOpen}
        onClose={() => setIsManualDebtOpen(false)}
        companyId={company.id}
        companyName={company.name}
      />
    </div>
  );
};

export default CompanyDetailsView;