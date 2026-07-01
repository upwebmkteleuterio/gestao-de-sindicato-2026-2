import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CompanyDashboardStats from "@/components/company/dashboard/CompanyDashboardStats";
import ActiveInvoice from "@/components/company/dashboard/ActiveInvoice";
import HomologationPromo from "@/components/company/dashboard/HomologationPromo";
import NewEmployeeModal from "@/components/company/employees/NewEmployeeModal";
import { useCompany } from "@/hooks/useCompany";
import { Loader2 } from "lucide-react";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { company, isLoading } = useCompany();
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  useEffect(() => {
    // Redireciona para completar cadastro se não houver dados de localização (rua/cep)
    if (!isLoading && company && (!company.street || !company.zip_code)) {
      navigate("/empresa/minha-empresa");
    }
  }, [company, isLoading, navigate]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600 size-10" />
    </div>
  );

  return (
    <div className="p-6 lg:p-10 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Painel da Empresa</h1>
            <p className="text-slate-500 mt-1">Bem-vindo ao Portal Administrativo de {company?.name || "sua empresa"}.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/empresa/agendar-homologacao" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">event_note</span>
              Agendar Homologação
            </Link>
          </div>
        </div>

        <CompanyDashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ActiveInvoice />
          </div>

          <div className="space-y-6">
            <HomologationPromo />
          </div>
        </div>
      </div>

      <NewEmployeeModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
      />
    </div>
  );
};

export default CompanyDashboard;