"use client";

import { useState } from "react";

export const useAgendaManager = () => {
  const [showKpis, setShowKpis] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  const toggleKpis = () => setShowKpis((prev) => !prev);
  const openNewSlotModal = () => setIsNewModalOpen(true);
  const closeNewSlotModal = () => setIsNewModalOpen(false);
  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);
  const selectSlot = (slot: any) => setSelectedSlot(slot);
  const clearSelection = () => setSelectedSlot(null);

  return {
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
  };
};