"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAgents } from "@/hooks/useAgents";
import { Loader2, UserPlus, Trash2, Scale, UserCheck } from "lucide-react";

interface AgentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'homologacao' | 'juridico';
}

const AgentSettingsModal: React.FC<AgentSettingsModalProps> = ({ isOpen, onClose, type = 'homologacao' }) => {
  const { agents, isLoading, addAgent, removeAgent } = useAgents(type);
  const [newName, setNewName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addAgent.mutateAsync(newName);
    setNewName("");
  };

  const isJuridico = type === 'juridico';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {isJuridico ? <Scale className="text-indigo-600" /> : <UserCheck className="text-blue-600" />}
            {isJuridico ? "Advogados Responsáveis" : "Agentes de Atendimento"}
          </DialogTitle>
          <DialogDescription>
            {isJuridico ? "Gerencie os advogados disponíveis para consultas." : "Cadastre os profissionais que realizam as homologações."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <form onSubmit={handleAdd} className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Input 
                placeholder={isJuridico ? "Nome do Advogado..." : "Nome do Agente..."}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={addAgent.isPending || !newName.trim()} className={isJuridico ? "bg-indigo-600 hover:bg-indigo-700" : ""}>
              {addAgent.isPending ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />}
            </Button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {isJuridico ? "Advogados Ativos" : "Agentes Ativos"} ({agents.length})
            </Label>
            {isLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : agents.length > 0 ? (
              agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 group hover:border-blue-200 transition-colors">
                  <span className="text-sm font-bold text-slate-700">{agent.name}</span>
                  <button 
                    onClick={() => removeAgent.mutate(agent.id)}
                    className="p-1.5 text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-medium">Nenhum registro encontrado.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentSettingsModal;