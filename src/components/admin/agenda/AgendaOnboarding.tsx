"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgents } from "@/hooks/useAgents";
import { useAgenda } from "@/hooks/useAgenda";
import { X } from "lucide-react";

const AgendaOnboarding = () => {
  const { agents, isLoading: loadingAgents } = useAgents();
  const { appointments, isLoading: loadingAgenda } = useAgenda();
  
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [dismissed, setDismissed] = useState(false);

  // Monitoramento Reativo: Muda o passo assim que os dados chegam do banco
  useEffect(() => {
    if (loadingAgents || loadingAgenda || dismissed) return;

    if (agents.length === 0) {
      setStep(1); 
    } else if (appointments.length === 0) {
      setStep(2);
    } else {
      setStep(0);
    }
  }, [agents.length, appointments.length, loadingAgents, loadingAgenda, dismissed]);

  // Recálculo de Coordenadas: Dispara sempre que o passo OU os dados mudarem
  useEffect(() => {
    if (step === 0) return;

    const updatePosition = () => {
      const targetId = step === 1 ? "agenda-settings-button" : "agenda-new-slot-button";
      const el = document.getElementById(targetId);
      
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    };

    updatePosition();
    // Delay de segurança para esperar o modal fechar e o layout estabilizar
    const timer = setTimeout(updatePosition, 300);
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      clearTimeout(timer);
    };
  }, [step, agents.length, appointments.length]);

  if (step === 0 || coords.width === 0) return null;

  const handleDismiss = () => {
    setDismissed(true);
    setStep(0);
  };

  const content = {
    1: { title: "Passo 1: Cadastre um agente", desc: "Clique em configurações para gerenciar os profissionais de atendimento." },
    2: { title: "Passo 2: Crie um horário", desc: "Agora disponibilize horários livres para agendamentos de empresas." }
  }[step as 1 | 2];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/75 backdrop-blur-[1px] pointer-events-auto"
          onClick={handleDismiss}
          style={{
            maskImage: `radial-gradient(circle 60px at ${coords.left + coords.width/2}px ${coords.top + coords.height/2}px, transparent 100%, black 100%)`,
            WebkitMaskImage: `radial-gradient(circle 60px at ${coords.left + coords.width/2}px ${coords.top + coords.height/2}px, transparent 100%, black 100%)`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          key={step} // Força animação de troca de passo
          className="absolute w-[300px] bg-white rounded-2xl shadow-2xl p-6 pointer-events-auto border border-blue-50"
          style={{ 
            top: coords.top + coords.height + 20,
            left: Math.min(window.innerWidth - 320, Math.max(270, coords.left + (coords.width / 2) - 150))
          }}
        >
          <div className="absolute -top-2 left-1/2 -translate-y-0 w-4 h-4 bg-white rotate-45 border-l border-t border-blue-50" style={{ marginLeft: '-8px' }} />

          <div className="flex items-start justify-between mb-4">
            <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 font-black">
              {step}
            </div>
            <button onClick={handleDismiss} className="p-1 text-slate-300 hover:text-slate-500">
              <X size={20} />
            </button>
          </div>
          
          <h4 className="text-base font-black text-slate-900 leading-tight">{content.title}</h4>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">{content.desc}</p>
          
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`} />
              <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`} />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Tutorial Onboarding</span>
          </div>
        </motion.div>

        <style dangerouslySetInnerHTML={{ __html: `
          #${step === 1 ? 'agenda-settings-button' : 'agenda-new-slot-button'} {
            z-index: 10000 !important;
            position: relative !important;
            background-color: white !important;
            color: ${step === 1 ? '#0f172a' : '#2563eb'} !important;
            box-shadow: 0 0 0 4px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.5) !important;
            pointer-events: auto !important;
          }
        `}} />
      </div>
    </AnimatePresence>
  );
};

export default AgendaOnboarding;