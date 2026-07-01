import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col shadow-sm">
          <div className="items-start justify-between mb-4 flex">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsSkeleton;