"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompaniesHeaderProps {
  selectedCompany: any;
  onBack: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenNewCompany: () => void;
  onDeleteCompany: (id: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  employeeFilter: string;
  onEmployeeFilterChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
  activeTab: "companies" | "accounting";
  onTabChange: (value: "companies" | "accounting") => void;
}

const CompaniesHeader: React.FC<CompaniesHeaderProps> = ({
  selectedCompany,
  onBack,
  searchTerm,
  onSearchChange,
  onOpenNewCompany,
  onDeleteCompany,
  statusFilter,
  onStatusFilterChange,
  employeeFilter,
  onEmployeeFilterChange,
  sortOrder,
  onSortOrderChange,
  activeTab,
  onTabChange
}) => {
  return (
    <header className="px-6 py-6 border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {selectedCompany ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{selectedCompany.name}</h1>
                  <p className="text-slate-500 text-sm font-mono">{selectedCompany.cnpj}</p>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Empresas e Contabilidades</h1>
                <p className="text-slate-500 text-sm mt-1">Monitore a base instalada, saúde cadastral e escritórios de contabilidade.</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!selectedCompany && (
              <Tabs
                value={activeTab}
                onValueChange={(v) => onTabChange(v as any)}
                className="bg-slate-100 p-1 rounded-xl"
              >
                <TabsList className="bg-transparent gap-1">
                  <TabsTrigger
                    value="companies"
                    className="rounded-lg px-4 h-8 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Empresas
                  </TabsTrigger>
                  <TabsTrigger
                    value="accounting"
                    className="rounded-lg px-4 h-8 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                  >
                    Contabilidades
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {!selectedCompany && activeTab === "companies" && (
              <button
                onClick={onOpenNewCompany}
                className="flex items-center gap-2 h-10 px-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Nova Empresa
              </button>
            )}
          </div>
        </div>

        {!selectedCompany && (
          <div className="flex flex-col md:flex-row gap-4 animate-in slide-in-from-top-4 duration-500">
            <div className="relative flex-1 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-blue-600 transition-colors">search</span>
              <input
                type="text"
                placeholder={activeTab === "companies" ? "Buscar por Empresa ou CNPJ..." : "Buscar por Contabilidade ou E-mail..."}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none text-sm font-medium transition-all"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {activeTab === "companies" && (
              <div className="flex flex-wrap items-center gap-3">
                {/* Filtro de Status (Aprovada por padrão) */}
                <div className="w-[160px]">
                  <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white h-11 text-xs font-bold uppercase tracking-tight">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="approved">Aprovadas (Ativas)</SelectItem>
                      <SelectItem value="onboarding">Incompletas (Onboarding)</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="rejected">Recusadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Funcionários */}
                <div className="w-[160px]">
                  <Select value={employeeFilter} onValueChange={onEmployeeFilterChange}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white h-11 text-xs font-bold uppercase tracking-tight">
                      <SelectValue placeholder="Funcionários" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qtd. Funcionários</SelectItem>
                      <SelectItem value="0-10">Até 10</SelectItem>
                      <SelectItem value="11-50">11 a 50</SelectItem>
                      <SelectItem value="51-200">51 a 200</SelectItem>
                      <SelectItem value="201+">Mais de 200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordem Alfabética */}
                <div className="w-[140px]">
                  <Select value={sortOrder} onValueChange={onSortOrderChange}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white h-11 text-xs font-bold uppercase tracking-tight">
                      <SelectValue placeholder="Ordem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">A - Z</SelectItem>
                      <SelectItem value="desc">Z - A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default CompaniesHeader;