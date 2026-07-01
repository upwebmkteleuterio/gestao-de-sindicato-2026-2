"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CompaniesTableSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Empresa / CNPJ</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Membros</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Saúde Cadastral</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status Cobrança</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Dívida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-8" />
                  </div>
                </td>
                <td className="p-4">
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="p-4">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompaniesTableSkeleton;