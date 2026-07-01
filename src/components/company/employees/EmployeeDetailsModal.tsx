"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { exportToCSV } from "@/utils/exportUtils";

interface EmployeeDetailsModalProps {
  employee: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({ employee, isOpen, onClose }) => {
  const removeItem = useAppStore((state) => state.removeItem);

  if (!employee) return null;

  const handleDelete = () => {
    removeItem("employees", employee.id);
    toast.success("Funcionário removido com sucesso.");
    onClose();
  };

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: 'Gerando ficha do colaborador...',
        success: () => {
          exportToCSV([employee], `ficha_colaborador_${employee.id}`);
          return `Ficha de ${employee.name} exportada com sucesso!`;
        },
        error: 'Erro ao exportar.',
      }
    );
  };

  const handleEdit = () => {
    toast.info("Função de edição será implementada em breve.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-100">
              {employee.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            {employee.name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matrícula</p>
              <p className="text-sm font-medium text-slate-900">#{employee.id}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border", employee.statusColor)}>
                {employee.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cargo</p>
              <p className="text-sm font-medium text-slate-900">{employee.role}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Departamento</p>
              <p className="text-sm font-medium text-slate-900">{employee.dept}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admissão</p>
              <p className="text-sm font-medium text-slate-900">{employee.date}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ações Administrativas</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleEdit}>
                <span className="material-symbols-outlined text-lg">edit</span>
                Editar
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleExport}>
                <span className="material-symbols-outlined text-lg">download</span>
                Exportar
              </Button>
              <Button variant="destructive" size="sm" className="flex items-center gap-2" onClick={handleDelete}>
                <span className="material-symbols-outlined text-lg">delete</span>
                Excluir
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsModal;