import React, { useState } from "react";
import EmployeesHeader from "@/components/company/employees/EmployeesHeader";
import EmployeesStats from "@/components/company/employees/EmployeesStats";
import EmployeesTable from "@/components/company/employees/EmployeesTable";
import NewEmployeeModal from "@/components/company/employees/NewEmployeeModal";
import EmployeeDetailsDrawer from "@/components/company/employees/EmployeeDetailsDrawer";
import { useCompany } from "@/hooks/useCompany";
import { useEmployees } from "@/hooks/useEmployees";
import { Loader2 } from "lucide-react";

const Employees = () => {
  const { company } = useCompany();
  const { employees, isLoading } = useEmployees(company?.id);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<any | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<any | null>(null);

  const handleOpenNew = () => {
    setEmployeeToEdit(null);
    setIsNewModalOpen(true);
  };

  const handleEdit = (employee: any) => {
    setEmployeeToEdit(employee);
    setViewingEmployee(null); 
    setIsNewModalOpen(true);   
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600 size-10" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <EmployeesHeader onOpenNewEmployee={handleOpenNew} />
        
        <EmployeesStats />

        <EmployeesTable 
          employees={employees}
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onViewEmployee={setViewingEmployee}
        />
      </div>

      <NewEmployeeModal 
        isOpen={isNewModalOpen} 
        onClose={() => {
          setIsNewModalOpen(false);
          setEmployeeToEdit(null);
        }} 
        employeeToEdit={employeeToEdit}
      />

      <EmployeeDetailsDrawer 
        employee={viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default Employees;