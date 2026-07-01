import React from "react";
import JuridicoHeader from "@/components/admin/juridico/JuridicoHeader";
import JuridicoControls from "@/components/admin/juridico/JuridicoControls";
import JuridicoCalendarGrid from "@/components/admin/juridico/JuridicoCalendarGrid";
import NewJuridicoSlotModal from "@/components/admin/juridico/NewJuridicoSlotModal";
import JuridicoSlotDetailsModal from "@/components/admin/juridico/JuridicoSlotDetailsModal";
import AgentSettingsModal from "@/components/admin/agenda/AgentSettingsModal";
import JuridicoFAB from "@/components/admin/juridico/JuridicoFAB";
import AgendaStats from "@/components/admin/agenda/AgendaStats";
import { useJuridicoManager } from "@/hooks/useJuridicoManager";
import { useAgendaManager } from "@/hooks/useAgendaManager";

const Juridico = () => {
  const {
    showKpis,
    isNewModalOpen,
    selectedSlot,
    toggleKpis,
    openNewSlotModal,
    closeNewSlotModal,
    selectSlot,
    clearSelection,
  } = useJuridicoManager();

  // Reutilizamos a lógica de modais de configuração da agenda master
  const { 
    isSettingsModalOpen, 
    openSettingsModal, 
    closeSettingsModal 
  } = useAgendaManager();

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-[#f8f9fc] relative">
      <JuridicoHeader 
        showKpis={showKpis} 
        onToggleKpis={toggleKpis}
        onOpenNewSlot={openNewSlotModal}
        onOpenSettings={openSettingsModal}
      >
        <AgendaStats show={showKpis} type="juridico" />
        <JuridicoControls />
      </JuridicoHeader>

      <JuridicoCalendarGrid onSelectSlot={selectSlot} />

      <NewJuridicoSlotModal 
        isOpen={isNewModalOpen} 
        onClose={closeNewSlotModal} 
      />

      <AgentSettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={closeSettingsModal} 
        type="juridico"
      />

      <JuridicoSlotDetailsModal 
        slot={selectedSlot}
        onClose={clearSelection}
      />

      <JuridicoFAB onClick={openNewSlotModal} />
    </div>
  );
};

export default Juridico;