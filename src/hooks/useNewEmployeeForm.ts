import { useState, useEffect } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import { isValidCPF, maskCPF, maskCurrency, maskCEP } from "@/utils/validationUtils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useNewEmployeeForm = (employeeToEdit: any | null, onClose: () => void) => {
  const queryClient = useQueryClient();
  const { company } = useCompany();
  const effectiveCompanyId = employeeToEdit?.company_id || company?.id;
  const { saveEmployee } = useEmployees(effectiveCompanyId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    role: "",
    salary: "",
    admission_date: "",
    status: "Associado",
    contract_status: "Ativo",
    marital_status: "Solteiro(a)",
    mother_name: "",
    birth_place: "",
    ctps: "",
    zip_code: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [dependents, setDependents] = useState<{ name: string; cpf: string }[]>([]);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData(prev => ({
        ...prev,
        ...employeeToEdit,
        salary: employeeToEdit.salary ? maskCurrency(employeeToEdit.salary.replace(/\D/g, "")) : "",
        password: "",
      }));

      const fetchDependents = async () => {
        const { data } = await supabase
          .from("employee_dependents")
          .select("name, cpf")
          .eq("employee_id", employeeToEdit.id);
        if (data) setDependents(data);
      };
      fetchDependents();
    }
  }, [employeeToEdit]);

  const addDependent = () => {
    setDependents([...dependents, { name: "", cpf: "" }]);
  };

  const removeDependent = (index: number) => {
    setDependents(dependents.filter((_, i) => i !== index));
  };

  const updateDependent = (index: number, field: "name" | "cpf", value: string) => {
    const newDeps = [...dependents];
    newDeps[index][field] = field === "cpf" ? maskCPF(value) : value;
    setDependents(newDeps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.cpf || !formData.role || !formData.admission_date) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    if (!isValidCPF(formData.cpf)) {
      toast.error("CPF do funcionário é inválido.");
      return;
    }

    for (const dep of dependents) {
      if (dep.cpf && !isValidCPF(dep.cpf)) {
        toast.error(`CPF do dependente ${dep.name || ""} é inválido.`);
        return;
      }
      if (!dep.name || !dep.cpf) {
        toast.error("Preencha todos os campos dos dependentes ou remova-os.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const finalUserId = employeeToEdit?.id;
      const validColumns = [
        'name', 'email', 'cpf', 'role', 'salary', 'admission_date', 
        'status', 'contract_status', 'marital_status', 'mother_name', 'birth_place', 
        'ctps', 'zip_code', 'street', 'number', 'neighborhood', 'city', 'state'
      ];

      const payload: any = {
        id: finalUserId,
        company_id: effectiveCompanyId
      };

      validColumns.forEach(col => {
        if (formData[col as keyof typeof formData] !== undefined) {
          payload[col] = formData[col as keyof typeof formData];
        }
      });

      if (formData.status !== 'Associado') {
        payload.email = null;
      }

      // 1. Salvar funcionário
      const savedEmployee = await saveEmployee.mutateAsync(payload);

      // 2. Lidar com dependentes
      if (employeeToEdit) {
        await supabase.from("employee_dependents").delete().eq("employee_id", savedEmployee.id);
      }

      if (dependents.length > 0) {
        const depsPayload = dependents.map(d => ({
          ...d,
          employee_id: savedEmployee.id
        }));
        const { error: depError } = await supabase.from("employee_dependents").insert(depsPayload);
        if (depError) throw depError;
      }

      // 3. Invalidação manual dos caches para atualização instantânea
      queryClient.invalidateQueries({ queryKey: ["employee-dependents", savedEmployee.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-employee-dependents", savedEmployee.id] });

      onClose();
    } catch (err: any) {
      console.error("FALHA CRÍTICA:", err);
      toast.error(err.message || "Erro ao salvar dados.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (field === 'cpf') value = maskCPF(value);
    if (field === 'zip_code') value = maskCEP(value);
    if (field === 'salary') value = maskCurrency(value);
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    dependents,
    updateField,
    addDependent,
    removeDependent,
    updateDependent,
    handleSubmit,
    isSubmitting: isSubmitting || saveEmployee.isPending,
  };
};