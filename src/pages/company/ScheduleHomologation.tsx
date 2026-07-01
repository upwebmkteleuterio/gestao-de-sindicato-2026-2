import React, { useState } from "react";
import ScheduleHeader from "@/components/company/schedule/ScheduleHeader";
import VerifiedCompanyCard from "@/components/company/schedule/VerifiedCompanyCard";
import EmployeeDataForm from "@/components/company/schedule/EmployeeDataForm";
import ScheduleSummary from "@/components/company/schedule/ScheduleSummary";
import SupportCard from "@/components/company/schedule/SupportCard";
import CalendarSelection from "@/components/company/schedule/CalendarPreview";
import ScheduleSuccess from "@/components/company/schedule/ScheduleSuccess";
import CalendarPlaceholder from "@/components/company/schedule/CalendarPlaceholder";
import { useCompany } from "@/hooks/useCompany";
import { useAgenda } from "@/hooks/useAgenda";
import { toast } from "sonner";

const ScheduleHomologation = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  
  const { company } = useCompany();
  const { bookSlot } = useAgenda(company?.id);

  const handleFinalize = async (slot: any) => {
    if (!company || !selectedEmployee) return;

    try {
      const protocol = Math.floor(100000 + Math.random() * 900000).toString();
      
      await bookSlot.mutateAsync({
        id: slot.id,
        company_id: company.id,
        employee_id: selectedEmployee.id,
        protocol: protocol,
        type: "Homologação"
      });

      setSelectedSlot({ ...slot, protocol });
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      toast.error(error.message || "Erro ao reservar horário.");
    }
  };

  return (
    <div className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8 bg-[#f8f9fc] animate-in fade-in duration-500">
      <div className="flex flex-col max-w-[1200px] w-full gap-8">
        <ScheduleHeader currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            <VerifiedCompanyCard company={company} />
            
            {/* Passo 2: Dados do Funcionário */}
            {currentStep === 2 && (
              <EmployeeDataForm onNext={(data) => {
                setSelectedEmployee(data);
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            )}
            
            {/* Passo 3: Calendário */}
            {currentStep === 3 && (
              <CalendarSelection onNext={handleFinalize} />
            )}

            {/* Passo 4: Sucesso */}
            {currentStep === 4 && (
              <ScheduleSuccess 
                employeeName={selectedEmployee?.name} 
                protocol={selectedSlot?.protocol} 
              />
            )}
            
            {/* Placeholder quando o calendário não está disponível */}
            {currentStep < 3 && <CalendarPlaceholder />}
          </div>

          {/* Sidebar de Resumo */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <ScheduleSummary 
                employee={selectedEmployee} 
                slot={selectedSlot} 
                company={company} 
              />
              <SupportCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleHomologation;