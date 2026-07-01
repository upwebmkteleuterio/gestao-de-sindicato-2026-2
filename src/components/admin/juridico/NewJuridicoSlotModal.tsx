"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useJuridico } from "@/hooks/useJuridico";
import { useAgents } from "@/hooks/useAgents";
import { format, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";

interface NewJuridicoSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewJuridicoSlotModal: React.FC<NewJuridicoSlotModalProps> = ({ isOpen, onClose }) => {
  const { createSlot } = useJuridico();
  const { agents, isLoading: loadingAgents } = useAgents('juridico');
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    time: "10:00",
    agent: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !formData.agent) return;

    const [hours, minutes] = formData.time.split(":").map(Number);
    const scheduledDate = setMinutes(setHours(date, hours), minutes);

    await createSlot.mutateAsync({
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
          <DialogTitle className="text-xl font-bold">Novo Horário Jurídico</DialogTitle>
          <DialogDescription>Disponibilize um novo horário para consultas jurídicas.</DialogDescription>
        </DialogHeader>

        {noAgents ? (
          <div className="py-8 flex flex-col items-center gap-4 text-center">
            <div className="size-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-2">
              <p className="text-base font-black text-slate-900 uppercase tracking-tight">Nenhum advogado cadastrado</p>
              <p className="text-xs text-slate-500 leading-relaxed px-4">
                Você precisa cadastrar pelo menos um profissional nas Configurações do Jurídico antes de criar novos horários.
              </p>
            </div>
            <Button variant="outline" className="w-full mt-4 h-12 font-bold" onClick={onClose}>
              Entendido
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Data do Atendimento</Label>
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
              <Label>Início (08:00 - 19:00)</Label>
              <Input 
                type="time" 
                value={formData.time} 
                onChange={(e) => setFormData({...formData, time: e.target.value})} 
              />
            </div>

            <div className="grid gap-2">
              <Label>Advogado Responsável</Label>
              <Select value={formData.agent} onValueChange={(v) => setFormData({...formData, agent: v})}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingAgents ? "Carregando..." : "Selecione o profissional"} />
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
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700" 
                disabled={createSlot.isPending || !formData.agent}
              >
                {createSlot.isPending ? <Loader2 className="animate-spin size-4" /> : "Criar Horário"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewJuridicoSlotModal;