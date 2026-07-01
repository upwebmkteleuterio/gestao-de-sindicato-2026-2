"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAgenda } from "@/hooks/useAgenda";
import { useAgents } from "@/hooks/useAgents";
import { format, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface NewAgendaSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewAgendaSlotModal: React.FC<NewAgendaSlotModalProps> = ({ isOpen, onClose }) => {
  const { createSlot } = useAgenda();
  const { agents, isLoading: loadingAgents } = useAgents();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    time: "10:00", // Alterado de 09:00 para 10:00
    agent: "",
    type: "Homologação",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !formData.agent) return;

    const [hours, minutes] = formData.time.split(":").map(Number);
    
    // Validação de horário comercial (08:00 às 19:00)
    if (hours < 8 || hours > 19 || (hours === 19 && minutes > 0)) {
      toast.error("O horário deve estar entre 08:00 e 19:00.");
      return;
    }

    const scheduledDate = setMinutes(setHours(date, hours), minutes);

    await createSlot.mutateAsync({
      type: formData.type,
      scheduled_date: scheduledDate.toISOString(),
      agent_name: formData.agent,
      status: "Livre"
    });

    onClose();
  };

  const noAgents = !loadingAgents && agents.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Criar Novo Horário</DialogTitle>
          <DialogDescription>Disponibilize um horário livre na agenda.</DialogDescription>
        </DialogHeader>

        {noAgents ? (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="size-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">Nenhum agente cadastrado</p>
              <p className="text-xs text-slate-500">Você precisa cadastrar pelo menos um profissional nas Configurações da Agenda antes de criar horários.</p>
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={onClose}>Entendido</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Selecione o Dia</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Horário de Início (08:00 - 19:00)</Label>
              <Input 
                type="time" 
                min="08:00"
                max="19:00"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
              <p className="text-[10px] text-slate-400 italic">Intervalo permitido: das 8h às 19h.</p>
            </div>

            <div className="grid gap-2">
              <Label>Agente Responsável</Label>
              <Select value={formData.agent} onValueChange={(v) => setFormData({...formData, agent: v})}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingAgents ? "Carregando..." : "Selecione o agente"} />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createSlot.isPending || !formData.agent}>
                {createSlot.isPending ? <Loader2 className="animate-spin size-4" /> : "Criar Horário"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewAgendaSlotModal;