"use client";

import React from "react";
import { cn } from "@/lib/utils";
import CompaniesHeader from "@/components/admin/companies/CompaniesHeader";
import CompaniesListTable from "@/components/admin/companies/CompaniesListTable";
import CompanyDetailsView from "@/components/admin/companies/CompanyDetailsView";
import EmployeeDetailsDrawer from "@/components/admin/companies/EmployeeDetailsDrawer";
import NewCompanyModal from "@/components/admin/companies/NewCompanyModal";
import CompaniesTableSkeleton from "@/components/admin/companies/CompaniesTableSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useCompaniesManager } from "@/hooks/useCompaniesManager";
import { SearchX, Building2, ArrowLeft, MoreHorizontal, Edit, ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AccountingListTable = ({ 
  offices, 
  onSelect, 
  onEdit 
}: { 
  offices: any[], 
  onSelect: (o: any) => void, 
  onEdit: (o: any) => void 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Escritório / E-mail</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Empresas</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Saúde Financeira</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {offices.map((office) => (
              <tr 
                key={office.id} 
                className="group hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onSelect(office)}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                      <span className="material-symbols-outlined">account_balance</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{office.name || office.email}</p>
                      <p className="text-xs text-slate-500">{office.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <Badge variant="secondary" className="font-bold">
                    {office.companiesCount} empresas
                  </Badge>
                </td>
                <td className="p-4 text-center">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tight",
                    office.healthColor
                  )}>
                    {office.health}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {!office.isVirtual && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(office)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Dados
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Companies = () => {
  const lastSelectedId = useRef<string | null>(null);

  const {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    employeeFilter, setEmployeeFilter,
    sortOrder, setSortOrder,
    selectedCompany, setSelectedCompany,
    selectedEmployee, setSelectedEmployee,
    isNewModalOpen, setIsNewModalOpen,
    companyToEdit,
    storedCompanies,
    filteredCompanies,
    currentCompanyEmployees,
    isLoading,
    handleDeleteCompany,
    handleEditCompany,
    handleCloseModal,
    handleUpdateApprovalStatus,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    // Accounting
    activeTab, setActiveTab,
    accountingFilter, setAccountingFilter,
    accountingData, isLoadingAccounting,
    accountingToEdit, setAccountingToEdit,
  } = useCompaniesManager();

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const scrollContainer = document.getElementById('scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [currentPage]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative bg-[#f8f9fc]">
      <CompaniesHeader
        selectedCompany={selectedCompany}
        onBack={() => setSelectedCompany(null)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenNewCompany={() => setIsNewModalOpen(true)}
        onDeleteCompany={handleDeleteCompany}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        employeeFilter={employeeFilter}
        onEmployeeFilterChange={setEmployeeFilter}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setAccountingFilter(null);
        }}
      />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Visualização de Empresas Filtradas por Contabilidade */}
          {accountingFilter && !selectedCompany && (
            <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
              <div className="bg-blue-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-blue-200">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setAccountingFilter(null)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Visualizando empresas ligadas a:</p>
                    <h2 className="text-lg font-bold">{accountingFilter.name || accountingFilter.email}</h2>
                  </div>
                </div>
                <Badge variant="outline" className="text-white border-white/20 bg-white/10 px-4 h-8 font-bold">
                  {totalItems} empresas encontradas
                </Badge>
              </div>
            </div>
          )}

          {(isLoading || isLoadingAccounting) && !selectedCompany ? (
            <CompaniesTableSkeleton />
          ) : !selectedCompany ? (
            activeTab === "companies" ? (
              storedCompanies.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="Nenhuma empresa cadastrada"
                  description="Comece registrando a primeira empresa do seu sindicato para gerenciar as arrecadações."
                  action={{
                    label: "Cadastrar Nova Empresa",
                    onClick: () => setIsNewModalOpen(true)
                  }}
                />
              ) : filteredCompanies.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <CompaniesListTable
                    companies={filteredCompanies}
                    onSelectCompany={setSelectedCompany}
                    onUpdateApprovalStatus={handleUpdateApprovalStatus}
                    highlightId={lastSelectedId.current}
                  />
                  
                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
                      <p className="text-sm text-slate-500 font-medium">
                        Mostrando <span className="text-slate-900">{(currentPage - 1) * 50 + 1}</span> a <span className="text-slate-900">{Math.min(currentPage * 50, totalItems)}</span> de <span className="text-slate-900">{totalItems}</span> empresas
                      </p>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">chevron_left</span>
                        </button>
                        
                        <div className="flex items-center gap-1 mx-2">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={cn(
                                  "h-9 w-9 rounded-lg text-sm font-bold transition-all",
                                  currentPage === pageNum
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                    : "hover:bg-white border border-transparent hover:border-slate-200 text-slate-600"
                                )}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={SearchX}
                  title="Nenhum resultado"
                  description="Não encontramos nenhuma empresa que corresponda aos filtros aplicados."
                  action={{
                    label: "Limpar todos os filtros",
                    onClick: () => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setEmployeeFilter("all");
                      setAccountingFilter(null);
                    }
                  }}
                />
              )
            ) : (
              <AccountingListTable 
                offices={accountingData || []} 
                onSelect={(o) => {
                  setAccountingFilter(o);
                  setActiveTab("companies");
                }}
                onEdit={(o) => {
                  setAccountingToEdit(o);
                  setIsNewModalOpen(true);
                }}
              />
            )
          ) : (
            <CompanyDetailsView
              company={selectedCompany}
              employees={currentCompanyEmployees}
              onSelectEmployee={setSelectedEmployee}
              onEditCompany={handleEditCompany}
              onDeleteCompany={handleDeleteCompany}
            />
          )}
        </div>
      </main>

      <EmployeeDetailsDrawer
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      <NewCompanyModal
        isOpen={isNewModalOpen}
        onClose={handleCloseModal}
        companyToEdit={companyToEdit}
        accountingToEdit={accountingToEdit}
      />
    </div>
  );
};

export default Companies;