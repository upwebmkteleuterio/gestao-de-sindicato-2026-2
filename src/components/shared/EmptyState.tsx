"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 bg-white rounded-2xl border border-dashed border-slate-300 text-center animate-in fade-in zoom-in-95 duration-500",
      className
    )}>
      <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <button 
          onClick={action.onClick}
          className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;