import React, { useState } from "react";
import FinancialHeader from "@/components/admin/financial/FinancialHeader";
import FinancialStats from "@/components/admin/financial/FinancialStats";
import FinancialTable from "@/components/admin/financial/FinancialTable";
import FinancialPagination from "@/components/admin/financial/FinancialPagination";
import { useAppStore } from "@/store/useAppStore";

const FinancialLegal = () => {
  const [showKpis, setShowKpis] = useState(false);
  
  // Vinculando ao store real para remover dados demonstrativos
  const records = useAppStore((state) => state.data.financialRecords) || [];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
      <FinancialHeader showKpis={showKpis} onToggleKpis={() => setShowKpis(!showKpis)} />
      
      <FinancialStats isVisible={showKpis} onToggle={() => setShowKpis(!showKpis)} />

      <main className="flex-1 overflow-hidden p-6 bg-[#f8f9fc] flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col h-full">
          {records.length > 0 ? (
            <>
              <FinancialTable records={records} />
              <FinancialPagination currentRange={`1-${records.length}`} totalCount={records.length} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">payments</span>
              <p className="text-slate-500 font-medium">Nenhum registro financeiro ou jurídico encontrado.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FinancialLegal;