import React from "react";
import AgendaHeader from "@/components/admin/agenda/AgendaHeader";
import AgendaStats from "@/components/admin/agenda/AgendaStats";
import AgendaControls from "@/components/admin/agenda/AgendaControls";
import CalendarGrid from "@/components/admin/agenda/CalendarGrid";
import NewAgendaSlotModal from "@/components/admin/agenda/NewAgendaSlotModal";
import SlotDetailsModal from "@/components/admin/agenda/SlotDetailsModal";
import AgentSettingsModal from "@/components/admin/agenda/AgentSettingsModal";
import AgendaOnboarding from "@/components/admin/agenda/AgendaOnboarding";
import { useAgendaManager } from "@/hooks/useAgendaManager";

const Agenda = () => {
  const {
    showKpis,
    isNewModalOpen,
    isSettingsModalOpen,
    selectedSlot,
    toggleKpis,
    openNewSlotModal,
    closeNewSlotModal,
    openSettingsModal,
    closeSettingsModal,
    selectSlot,
    clearSelection,
  } = useAgendaManager();

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-[#f8f9fc] relative">
      {/* Tutorial Spotlight */}
      <AgendaOnboarding />

      {/* Header fixo no topo */}
      <AgendaHeader 
        showKpis={showKpis} 
        onToggleKpis={toggleKpis}
        onOpenNewSlot={openNewSlotModal}
        onOpenSettings={openSettingsModal}
      >
        <AgendaStats show={showKpis} />
        <AgendaControls />
      </AgendaHeader>

      {/* A grade agora é flex-1 e gerencia seu scroll interno */}
      <CalendarGrid onSelectSlot={selectSlot} />

      {/* Modais */}
      <NewAgendaSlotModal isOpen={isNewModalOpen} onClose={closeNewSlotModal} />
      <AgentSettingsModal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} />
      <SlotDetailsModal slot={selectedSlot} onClose={clearSelection} />

      {/* FAB Mobile */}
      <button 
        onClick={openNewSlotModal}
        className="md:hidden absolute bottom-6 right-6 size-14 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center z-50 transition-transform active:scale-90"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

export default Agenda;