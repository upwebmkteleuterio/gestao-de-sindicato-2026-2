"use client";

import React from "react";
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
    handleUpdateApprovalStatus // Novo handler
  } = useCompaniesManager();

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
              <CompaniesListTable
                companies={filteredCompanies}
                onSelectCompany={setSelectedCompany}
                onUpdateApprovalStatus={handleUpdateApprovalStatus} // Passando o novo handler
                highlightId={lastSelectedId.current}
              />
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