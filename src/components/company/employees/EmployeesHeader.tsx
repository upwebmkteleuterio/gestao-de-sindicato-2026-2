import React from "react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { exportToCSV } from "@/utils/exportUtils";

interface EmployeesHeaderProps {
  onOpenNewEmployee: () => void;
}

const EmployeesHeader: React.FC<EmployeesHeaderProps> = ({ onOpenNewEmployee }) => {
  // Seletor limpo
  const storedEmployees = useAppStore((state) => state.data.employees);
  const employeesList = storedEmployees || [];
  
  const handleExportAll = () => {
    if (employeesList.length === 0) {
      toast.error("Não há funcionários novos cadastrados para exportar.");
      return;
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Gerando relatório...',
        success: () => {
          exportToCSV(employeesList, "base_funcionarios_sindicato");
          return "Arquivo exportado com sucesso!";
        },
        error: 'Erro ao exportar.',
      }
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão de Funcionários</h1>
        <p className="text-slate-500 mt-1">Gerencie a base de membros e acompanhe o status sindical de cada colaborador.</p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleExportAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          Exportar
        </button>
        <button 
          onClick={onOpenNewEmployee}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Novo Funcionário
        </button>
      </div>
    </div>
  );
};

export default EmployeesHeader;