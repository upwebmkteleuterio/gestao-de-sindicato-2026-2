import { useAppStore } from '../store/useAppStore';

/**
 * dataService centraliza a lógica de persistência.
 * Atualmente utiliza o Zustand Store (localStorage), 
 * mas poderá ser substituído por chamadas de API (Supabase) 
 * mantendo a mesma interface de funções.
 */
export const dataService = {
  // --- Gestão de Empresas ---
  getCompanies: () => useAppStore.getState().data.companies,
  saveCompany: (company: any) => {
    const { data, setCollection, addItem } = useAppStore.getState();
    const index = data.companies.findIndex(c => c.cnpj === company.cnpj);
    
    if (index > -1) {
      const updated = [...data.companies];
      updated[index] = { ...updated[index], ...company };
      setCollection('companies', updated);
    } else {
      addItem('companies', company);
    }
  },

  // --- Gestão de Funcionários ---
  getEmployees: () => useAppStore.getState().data.employees,
  saveEmployee: (employee: any) => {
    const { data, setCollection, addItem } = useAppStore.getState();
    const index = data.employees.findIndex(e => e.id === employee.id);
    
    if (index > -1) {
      const updated = [...data.employees];
      updated[index] = { ...updated[index], ...employee };
      setCollection('employees', updated);
    } else {
      addItem('employees', employee);
    }
  },

  // --- Persistência de Formulários e UI ---
  getFormData: (pageId: string) => useAppStore.getState().formData[pageId] || {},
  updateFormData: (pageId: string, data: any) => useAppStore.getState().updateForm(pageId, data),
  
  getUIState: () => useAppStore.getState().ui,
  setModalState: (id: string, isOpen: boolean) => useAppStore.getState().setModal(id, isOpen),
  setStepState: (id: string, step: number) => useAppStore.getState().setStep(id, step),
};