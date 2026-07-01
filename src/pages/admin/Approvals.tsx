"use client";

import React, { useState } from "react";
import ApprovalHeader from "@/components/admin/approvals/ApprovalHeader";
import ApprovalTable from "@/components/admin/approvals/ApprovalTable";
import ApprovalDetailsDrawer from "@/components/admin/approvals/ApprovalDetailsDrawer";
import EmptyState from "@/components/shared/EmptyState";
import { useApprovals } from "@/hooks/useApprovals";
import { ClipboardList, Loader2 } from "lucide-react";

const Approvals = () => {
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const { requests, isLoading } = useApprovals();

  // Mapeamento para o formato esperado pelo componente ApprovalTable
  const mappedRequests = requests.map(req => ({
    id: req.id,
    name: req.name || "Empresa sem Nome",
    initials: (req.name || "??").substring(0, 2).toUpperCase(),
    type: "Empresa" as const,
    requestType: (req as any).requestType || "Novo Cadastro", 
    date: new Date(req.created_at).toLocaleDateString('pt-BR'),
    time: new Date(req.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    status: req.status,
    details: req 
  }));

  return (
    <div className="flex flex-col h-full relative">
      <ApprovalHeader />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8f9fc]">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-600 size-10" />
              <p className="text-slate-500 font-medium">Sincronizando fila de aprovação...</p>
            </div>
          ) : mappedRequests.length > 0 ? (
            <ApprovalTable 
              requests={mappedRequests} 
              onSelectRequest={(req) => setSelectedRequest(req.details)} 
            />
          ) : (
            <EmptyState 
              icon={ClipboardList}
              title="Tudo em dia!"
              description="Não existem solicitações de cadastro pendentes de aprovação no momento."
            />
          )}
        </div>
      </main>

      <ApprovalDetailsDrawer 
        selectedRequest={selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
      />
    </div>
  );
};

export default Approvals;