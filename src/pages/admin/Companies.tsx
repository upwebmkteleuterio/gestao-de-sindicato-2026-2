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
import { SearchX, Building2 } from "lucide-react";
import { useEffect, useRef } from "react";

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
    totalItems
  } = useCompaniesManager();

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const scrollContainer = document.getElementById('scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [currentPage]);

  // Armazena o ID da última empresa selecionada para destacar e voltar scroll
  useEffect(() => {
    if (selectedCompany) {
      lastSelectedId.current = selectedCompany.id;
      // Forçamos o scroll para o topo de múltiplas formas para garantir
      const scrollContainer = document.getElementById('scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    }
  }, [selectedCompany]);

  // Restaura o scroll quando volta para a lista
  useEffect(() => {
    if (!selectedCompany && lastSelectedId.current) {
      // Pequeno delay para garantir que a lista foi renderizada
      const timer = setTimeout(() => {
        const row = document.querySelector(`[data-id="${lastSelectedId.current}"]`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedCompany]);

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
      />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading && !selectedCompany ? (
            <CompaniesTableSkeleton />
          ) : !selectedCompany ? (
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
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
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
                  }
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
      />
    </div>
  );
};

export default Companies;