"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees } from "@/hooks/useEmployees";
import { useCompany } from "@/hooks/useCompany";
import { Loader2, MoreVertical, UserX, UserCheck, Stethoscope, Baby } from "lucide-react";

interface EmployeesTableProps {
  employees: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onViewEmployee: (employee: any) => void;
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({ 
  employees, 
  searchTerm, 
  onSearchChange, 
  statusFilter,
  onStatusFilterChange,
  onViewEmployee 
}) => {
  const { company } = useCompany();
  const { saveEmployee } = useEmployees(company?.id);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (emp.role && emp.role.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const contractStatus = emp.contract_status || "Ativo";
    
    let matchesStatus = true;
    if (statusFilter === "ativos") {
      matchesStatus = contractStatus === "Ativo";
    } else if (statusFilter === "afastados") {
      matchesStatus = contractStatus !== "Ativo";
    }

    return matchesSearch && matchesStatus;
  });

  const handleUpdateContractStatus = async (e: React.MouseEvent, emp: any, newStatus: string) => {
    e.stopPropagation();
    await saveEmployee.mutateAsync({
      ...emp,
      contract_status: newStatus
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 flex-col md:flex-row items-center gap-4 w-full">
          <div className="relative w-full md:w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm transition-shadow" 
              placeholder="Buscar por nome ou cargo..." 
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="bg-white border-slate-300 rounded-lg h-9 text-xs font-bold uppercase tracking-tight">
                <SelectValue placeholder="Filtrar Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativos">Ativos</SelectItem>
                <SelectItem value="afastados">Afastados / Licença</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Funcionário</th>
              <th className="px-6 py-4">Cargo</th>
              <th className="px-6 py-4">Sindicato</th>
              <th className="px-6 py-4">Contrato</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr 
                  key={emp.id} 
                  onClick={() => onViewEmployee(emp)}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-100">
                        {emp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{emp.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{emp.cpf}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900 font-medium">{emp.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase",
                      emp.status === "Associado" ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-slate-50 text-slate-600 border-slate-200"
                    )}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase",
                      emp.contract_status === "Ativo" || !emp.contract_status ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                    )}>
                      {emp.contract_status || "Ativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Ver Detalhes"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={(e) => e.stopPropagation()} 
                          >
                            <MoreVertical size={20} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Gestão de Contrato</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => handleUpdateContractStatus(e, emp, "Ativo")}
                            className="gap-2 text-emerald-600 cursor-pointer"
                          >
                            <UserCheck size={16} /> Marcar como Ativo
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleUpdateContractStatus(e, emp, "Afastado")}
                            className="gap-2 text-amber-600 cursor-pointer"
                          >
                            <UserX size={16} /> Afastado
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleUpdateContractStatus(e, emp, "Licença Médica")}
                            className="gap-2 text-blue-600 cursor-pointer"
                          >
                            <Stethoscope size={16} /> Licença Médica
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleUpdateContractStatus(e, emp, "Licença Maternidade")}
                            className="gap-2 text-pink-600 cursor-pointer"
                          >
                            <Baby size={16} /> Licença Maternidade
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesTable;