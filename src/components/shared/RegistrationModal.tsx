"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ClipboardCheck, Clock, ArrowRight } from 'lucide-react';

const RegistrationAnimation = () => {
  return (
    <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-blue-100 rounded-full"
      />
      
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 bg-white p-4 rounded-2xl shadow-lg border border-blue-50"
      >
        <Building2 size={40} className="text-blue-600" />
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, -15, 0],
          x: [0, 5, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 bg-white p-2 rounded-lg shadow-md border border-gray-100"
      >
        <ClipboardCheck size={18} className="text-emerald-500" />
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, 15, 0],
          x: [0, -8, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-2 left-0 bg-white p-2 rounded-lg shadow-md border border-gray-100"
      >
        <Clock size={18} className="text-amber-500" />
      </motion.div>

      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <motion.circle
          cx="64"
          cy="64"
          r="60"
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-blue-600/20"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="60"
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray="380"
          initial={{ strokeDashoffset: 380 }}
          animate={{ strokeDashoffset: [380, 0, 380] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="text-blue-600"
        />
      </svg>
    </div>
  );
};

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[24px] shadow-2xl w-full max-w-[440px] overflow-hidden border border-slate-100"
          >
            <div className="h-1.5 w-full bg-blue-600" />
            
            <div className="p-8 text-center">
              <RegistrationAnimation />

              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-slate-800 mb-3"
              >
                Finalize o cadastro da sua empresa
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-500 text-base leading-relaxed mb-8 px-4"
              >
                Preencha as demais informações da sua empresa e aguarde a aprovação do sindicato.
              </motion.p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200"
              >
                Continuar
                <ArrowRight size={18} />
              </motion.button>
              
              <p className="mt-4 text-xs text-slate-400 uppercase tracking-widest font-medium">
                Gestão Sindical • Sistema Unificado
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegistrationModal;