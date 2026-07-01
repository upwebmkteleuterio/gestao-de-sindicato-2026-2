"use client";

import React, { useState, useEffect } from "react";
import LegalScheduleHeader from "@/components/employee/legal/LegalScheduleHeader";
import LegalProblemForm from "@/components/employee/legal/LegalProblemForm";
import LegalScheduleSummary from "@/components/employee/legal/LegalScheduleSummary";
import LegalCalendarSelection from "@/components/employee/legal/LegalCalendarSelection";
import VerifiedCompanyCard from "@/components/company/schedule/VerifiedCompanyCard";
import SupportCard from "@/components/company/schedule/SupportCard";
import { useJuridico } from "@/hooks/useJuridico";
import { useSessionContext } from "@/contexts/SessionContext";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const LegalScheduling = () => {
  const navigate = useNavigate();
  const { user } = useSessionContext();
  const { updateSlot } = useJuridico();
  
  const [currentStep, setCurrentStep] = useState(2);
  const [problem, setProblem] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<{ company_id?: string; cpf?: string }>({});
  
  // Buscar dados adicionais do funcionário logado (CPF e Empresa)
  useEffect(() => {
    const fetchEmpData = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('employees')
        .select('company_id, cpf')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) setEmployeeInfo(data);
    };
    fetchEmpData();
  }, [user?.id]);

  const loggedEmployee = {
    name: user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : user?.email?.split('@')[0] || "Funcionário",
    cpf: employeeInfo.cpf || user?.user_metadata?.cpf || "---",
    id: user?.id
  };

  const handleFinalize = async (slot: any) => {
    if (!user?.id) return;

    try {
      const protocol = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Salva com o vínculo da empresa do funcionário
      await updateSlot.mutateAsync({
        id: slot.id,
        status: "Marcado",
        employee_id: user.id,
        company_id: employeeInfo.company_id,
        protocol: protocol,
        notes: problem
      });

      setSelectedSlot({ ...slot, protocol });
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success("Consulta agendada com sucesso!");
    } catch (error: any) {
      toast.error("Falha ao salvar agendamento.");
    }
  };

  return (
    <div className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8 bg-[#f8f9fc] animate-in fade-in duration-500">
      <div className="flex flex-col max-w-[1200px] w-full gap-8">
        <LegalScheduleHeader currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 2 && (
              <>
                <VerifiedCompanyCard company={{ name: user?.user_metadata?.company_name || "Empresa Associada", status: 'Approved' }} />
                <LegalProblemForm onNext={(desc) => {
                  setProblem(desc);
                  setCurrentStep(3);
                }} />
              </>
            )}
            
            {currentStep === 3 && (
              <LegalCalendarSelection 
                onNext={handleFinalize} 
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
                <div className="size-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl">verified</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Agendamento Confirmado!</h2>
                  <p className="text-slate-500 mt-2">Sua consulta com o advogado foi marcada com sucesso.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 w-full max-w-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase">Protocolo do Atendimento</p>
                  <p className="text-xl font-black text-slate-900">#{selectedSlot?.protocol}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => navigate('/funcionario/jurisdicoes')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">list_alt</span>
                    Ver Minhas Jurisdições
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentStep(2);
                      setProblem("");
                      setSelectedSlot(null);
                    }}
                    className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Novo Agendamento
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <LegalScheduleSummary 
                employee={loggedEmployee} 
                problem={problem} 
                slot={selectedSlot} 
              />
              <SupportCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalScheduling;