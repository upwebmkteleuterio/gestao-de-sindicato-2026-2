import React, { useState } from "react";
import Sidebar from "../Sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8f9fc]">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div 
          className={`hidden lg:block h-full shrink-0 transition-all duration-300 relative ${
            isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}
        >
          <Sidebar isCollapsed={isSidebarCollapsed} />
          
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-24 z-50 bg-white border shadow-md rounded-full p-1 text-slate-400 hover:text-blue-600 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      )}

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
        <div id="scroll-container" className="flex-1 overflow-y-auto no-scrollbar relative">
          <div className="p-4 lg:p-8 min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
