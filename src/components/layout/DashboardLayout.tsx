import React, { useState } from "react";
import Sidebar from "../Sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8f9fc]">
      {/* Desktop Sidebar - Fixed Width and Height */}
      <div className="hidden lg:block w-64 h-full shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-2xl">shield_person</span>
            <span className="font-bold">Gestão Sindical</span>
          </div>
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de Navegação</SheetTitle>
                <SheetDescription>Acesse as áreas do sistema</SheetDescription>
              </SheetHeader>
              <Sidebar onClose={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Page Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;