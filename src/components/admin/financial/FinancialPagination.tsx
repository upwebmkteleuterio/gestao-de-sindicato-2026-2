import React from "react";

interface FinancialPaginationProps { currentRange: string; totalCount: number; }

const FinancialPagination: React.FC<FinancialPaginationProps> = ({ currentRange, totalCount }) => <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white z-10"><div className="text-sm text-slate-500 font-medium">Exibindo <span className="font-black text-slate-900">{currentRange}</span> de <span className="font-black text-slate-900">{totalCount}</span> resultados</div>{totalCount > 0 && <div className="flex items-center gap-2"><button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-400" disabled>Ant</button><button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg font-black">1</button><button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-400" disabled>Próx</button></div>}</div>;
export default FinancialPagination;
