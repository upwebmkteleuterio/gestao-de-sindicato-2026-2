"use client";

import { useState } from "react";

export const useJuridicoManager = () => {
  const [showKpis, setShowKpis] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  const toggleKpis = () => setShowKpis((prev) => !prev);
  const openNewSlotModal = () => setIsNewModalOpen(true);
  const closeNewSlotModal = () => setIsNewModalOpen(false);
  const selectSlot = (slot: any) => setSelectedSlot(slot);
  const clearSelection = () => setSelectedSlot(null);

  return {
    showKpis,
    isNewModalOpen,
    selectedSlot,
    toggleKpis,
    openNewSlotModal,
    closeNewSlotModal,
    selectSlot,
    clearSelection,
  };
};