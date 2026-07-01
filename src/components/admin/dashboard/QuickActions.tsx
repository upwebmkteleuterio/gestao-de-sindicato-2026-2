import React, { useState } from "react";
import NewCompanyModal from "../companies/NewCompanyModal";

const QuickActions = () => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const actions = [
    { label: "Registrar Nova Empresa", icon: "add_business", onClick: () => setIsNewModalOpen(true) },
    { label: "Alertar Inadimplentes", icon: "notification_important", onClick: () => {} },
    { label: "Gerar Relatório Mensal", icon: "file_download", onClick: () => {} },
  ];

  return (
    <>
      <div className="bg-blue-900 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-9xl">bolt</span>
        </div>
        <h3 className="text-lg font-bold mb-4 relative z-10">Ações Rápidas</h3>
        <div className="flex flex-col gap-3 relative z-10">
          {actions.map((action, i) => (
            <button 
              key={i} 
              onClick={action.onClick}
              className="flex items-center gap-3 w-full bg-white/10 hover:bg-white/20 transition-colors p-3 rounded-lg text-left backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-xl">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <NewCompanyModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
      />
    </>
  );
};

export default QuickActions;