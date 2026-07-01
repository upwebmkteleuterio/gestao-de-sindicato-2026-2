import React from "react";
import { Link } from "react-router-dom";

const HomologationPromo = () => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-lg p-6 relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <span className="material-symbols-outlined text-9xl">calendar_month</span>
      </div>
      <h3 className="text-lg font-bold mb-2">Homologação</h3>
      <p className="text-sm text-slate-300 mb-6">Precisa rescindir um contrato? Agende agora para garantir sua data.</p>
      <Link to="/empresa/agendar-homologacao" className="w-full bg-white text-slate-900 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
        <span className="material-symbols-outlined text-[18px]">add</span>
        Novo Agendamento
      </Link>
    </div>
  );
};

export default HomologationPromo;