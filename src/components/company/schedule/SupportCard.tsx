import React from "react";

const SupportCard = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
      <div className="absolute -right-4 -top-4 size-24 bg-white/10 rounded-full blur-2xl"></div>
      <h4 className="font-bold text-lg mb-2 relative z-10">Precisa de Ajuda?</h4>
      <p className="text-blue-100 text-sm mb-4 relative z-10">Entre em contato com o suporte do sindicato se tiver dúvidas sobre os documentos necessários.</p>
      <button className="w-full bg-white/20 hover:bg-white/30 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors backdrop-blur-sm relative z-10 border border-white/10">
        Contatar Suporte
      </button>
    </div>
  );
};

export default SupportCard;