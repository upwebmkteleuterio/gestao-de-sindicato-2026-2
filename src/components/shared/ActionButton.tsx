import React from "react";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(({ className, variant = "primary", icon, children, ...props }, ref) => (
  <button ref={ref} className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-all active:scale-[0.98]", variant === "primary" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50", className)} {...props}>{icon}{children}</button>
));
ActionButton.displayName = "ActionButton";
export default ActionButton;
