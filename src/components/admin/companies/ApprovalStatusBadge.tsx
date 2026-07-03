import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronDown, CheckCircle, XCircle, Clock } from 'lucide-react';

type Status = 'approved' | 'pending' | 'rejected' | 'suspended';

interface ApprovalStatusBadgeProps {
  companyId: string;
  currentStatus: Status;
  onUpdate: (companyId: string, newStatus: Status) => void;
}

const statusMap: Record<Status, { label: string; color: string; icon: React.ElementType }> = {
  approved: { label: 'Aprovada', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
  rejected: { label: 'Recusada', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
  suspended: { label: 'Suspensa', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: XCircle },
};

const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({ companyId, currentStatus, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Status | null>(null);

  const { label, color, icon: Icon } = statusMap[currentStatus] || statusMap.pending;

  const handleStatusChange = (status: Status) => {
    if (status !== currentStatus) {
      setNewStatus(status);
      setIsModalOpen(true);
    }
  };

  const handleConfirm = () => {
    if (newStatus) {
      onUpdate(companyId, newStatus);
      setIsModalOpen(false);
      setNewStatus(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            onClick={(e) => e.stopPropagation()}
            variant="outline"
            size="sm"
            className={cn(
              "h-8 text-xs font-bold px-2 py-1 rounded-lg border",
              color,
              "hover:opacity-80 transition-opacity"
            )}
          >
            <Icon className="w-3 h-3 mr-1" />
            {label}
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {Object.entries(statusMap).map(([statusKey, statusValue]) => (
            <DropdownMenuItem
              key={statusKey}
              onSelect={() => handleStatusChange(statusKey as Status)}
              disabled={statusKey === currentStatus}
            >
              <statusValue.icon className="w-3 h-3 mr-2" />
              {statusValue.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Mudança de Status</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja alterar o status da empresa para **{newStatus ? statusMap[newStatus].label : ''}**?
              Esta ação pode afetar o acesso da empresa ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ApprovalStatusBadge;