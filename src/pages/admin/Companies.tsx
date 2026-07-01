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

const Companies = () => {
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
    handleCloseModal
  } = useCompaniesManager();

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

      <main className="flex-1 overflow-auto p-6">
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