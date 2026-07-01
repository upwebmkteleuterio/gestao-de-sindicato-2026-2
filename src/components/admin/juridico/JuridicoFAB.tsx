"use client";

import React from "react";

interface JuridicoFABProps {
  onClick: () => void;
}

const JuridicoFAB: React.FC<JuridicoFABProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="md:hidden absolute bottom-6 right-6 size-14 rounded-full bg-indigo-600 text-white shadow-xl flex items-center justify-center z-50 transition-transform active:scale-90"
    >
      <span className="material-symbols-outlined text-3xl">add</span>
    </button>
  );
};

export default JuridicoFAB;