import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  ui: {
    openModals: Record<string, boolean>;
    formSteps: Record<string, number>;
    sidebarOpen: boolean;
    currentAgendaDate: string;
    currentJuridicoDate: string;
  };
  formData: Record<string, any>;
  companyAuth: {
    status: 'Incomplete' | 'Awaiting' | 'Approved' | 'Rejected';
    lastApprovedData: any;
    currentData: any;
  };
  data: {
    companies: any[];
    employees: any[];
    approvals: any[];
    financialRecords: any[];
    agendaSlots: any[];
    juridicoSlots: any[];
    homologations: any[];
    jurisdictions: any[];
  };
  setModal: (id: string, isOpen: boolean) => void;
  setStep: (id: string, step: number) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  updateForm: (pageId: string, data: any) => void;
  setCompanyStatus: (status: AppState['companyAuth']['status']) => void;
  setLastApprovedData: (data: any) => void;
  setAgendaDate: (date: Date) => void;
  setJuridicoDate: (date: Date) => void;
  addItem: (key: string, item: any) => void;
  updateItem: (key: string, id: string, updatedItem: any) => void;
  removeItem: (key: string, id: string) => void;
  setCollection: (key: string, items: any[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ui: {
        openModals: {},
        formSteps: {},
        sidebarOpen: true,
        currentAgendaDate: new Date().toISOString(),
        currentJuridicoDate: new Date().toISOString(),
      },
      formData: {},
      companyAuth: {
        status: 'Incomplete',
        lastApprovedData: null,
        currentData: null,
      },
      data: {
        companies: [],
        employees: [],
        approvals: [],
        financialRecords: [],
        agendaSlots: [],
        juridicoSlots: [],
        homologations: [],
        jurisdictions: [],
      },
      setModal: (id, isOpen) => 
        set((state) => ({ ui: { ...state.ui, openModals: { ...state.ui.openModals, [id]: isOpen } } })),
      setStep: (id, step) => 
        set((state) => ({ ui: { ...state.ui, formSteps: { ...state.ui.formSteps, [id]: step } } })),
      setSidebarOpen: (isOpen) => 
        set((state) => ({ ui: { ...state.ui, sidebarOpen: isOpen } })),
      updateForm: (pageId, data) => 
        set((state) => ({ 
          formData: { ...state.formData, [pageId]: { ...(state.formData[pageId] || {}), ...data } } 
        })),
      setCompanyStatus: (status) => 
        set((state) => ({ companyAuth: { ...state.companyAuth, status } })),
      setLastApprovedData: (data) => 
        set((state) => ({ companyAuth: { ...state.companyAuth, lastApprovedData: data } })),
      setAgendaDate: (date) =>
        set((state) => ({ ui: { ...state.ui, currentAgendaDate: date.toISOString() } })),
      setJuridicoDate: (date) =>
        set((state) => ({ ui: { ...state.ui, currentJuridicoDate: date.toISOString() } })),
      addItem: (key, item) => 
        set((state) => ({ 
          data: { ...state.data, [key as keyof AppState['data']]: [item, ...(state.data[key as keyof AppState['data']] || [])] } 
        })),
      updateItem: (key, id, updatedItem) =>
        set((state) => ({
          data: {
            ...state.data,
            [key as keyof AppState['data']]: (state.data[key as keyof AppState['data']] || []).map((item: any) => 
              item.id === id ? { ...item, ...updatedItem } : item
            )
          }
        })),
      removeItem: (key, id) =>
        set((state) => ({
          data: {
            ...state.data,
            [key as keyof AppState['data']]: (state.data[key as keyof AppState['data']] || []).filter((item: any) => item.id !== id)
          }
        })),
      setCollection: (key, items) => 
        set((state) => ({ data: { ...state.data, [key]: items } })),
    }),
    { name: 'sindicato-storage' }
  )
);