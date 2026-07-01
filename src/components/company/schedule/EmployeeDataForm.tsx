"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCompany } from "@/hooks/useCompany";
import { useEmployees } from "@/hooks/useEmployees";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

interface EmployeeDataFormProps {
  onNext: (employeeData: any) => void;
}

const EmployeeDataForm: React.FC<EmployeeDataFormProps> = ({ onNext }) => {
  const { company } = useCompany();
  const { employees, isLoading } = useEmployees(company?.id);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    cpf: "",
    role: "",
    salary: "",
    admission_date: "", 
    zip_code: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    terminationDate: new Date().toISOString().split('T')[0],
    terminationType: "Demissão sem justa causa"
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Só mostramos resultados se o termo de busca for diferente do nome já selecionado no formulário
    if (searchTerm.length >= 3 && employees && searchTerm !== formData.name) {
      const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.cpf.includes(searchTerm)
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm, employees, formData.name]);

  const handleSelectEmployee = (emp: any) => {
    setFormData({
      ...formData,
      id: emp.id,
      name: emp.name || "",
      cpf: emp.cpf || "",
      role: emp.role || "",
      salary: emp.salary || "",
      admission_date: emp.admission_date || "",
      zip_code: emp.zip_code || "",
      street: emp.street || "",
      number: emp.number || "",
      neighborhood: emp.neighborhood || "",
      city: emp.city || "",
      state: emp.state || "",
    });
    setSearchTerm(emp.name);
    setShowResults(false);
    toast.success(`Dados de ${emp.name} carregados!`);
  };

  const handleNextStep = () => {
    if (!formData.id) {
      toast.error("Selecione um funcionário da lista antes de prosseguir.");
      return;
    }
    onNext(formData);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-xl font-bold text-slate-900">Dados do Funcionário</h3>
        <p className="text-slate-500 text-sm mt-1">Busque o colaborador para preencher automaticamente os dados do contrato e endereço.</p>
      </div>
      <div className="p-6 space-y-8">
        {/* Campo de Busca Autocomplete */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Puxar dados do cadastro</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Search size={20} />}
            </span>
            <input 
              className="w-full pl-10 pr-4 py-3 bg-blue-50/30 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-slate-900 placeholder-slate-400 transition-shadow" 
              placeholder="Digite o nome ou CPF do funcionário cadastrado..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.length >= 3 && searchTerm !== formData.name && setShowResults(true)}
            />
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {searchResults.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 text-left transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {emp.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{emp.name}</p>
                    <p className="text-xs text-slate-500 truncate">CPF: {emp.cpf} • {emp.role}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {showResults && searchTerm.length >= 3 && searchResults.length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-4 text-center">
              <p className="text-sm text-slate-500">Nenhum funcionário encontrado.</p>
            </div>
          )}
        </div>

        {/* Informações Profissionais (Auto-preenchidas) */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1">Dados Profissionais</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-1.5 opacity-80">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
              <input 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-medium cursor-default" 
                type="text" value={formData.name} readOnly placeholder="---"
              />
            </div>
            <div className="grid gap-1.5 opacity-80">
              <label className="text-xs font-bold text-slate-500 uppercase">CPF</label>
              <input 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-medium cursor-default" 
                type="text" value={formData.cpf} readOnly placeholder="---"
              />
            </div>
            <div className="grid gap-1.5 opacity-80">
              <label className="text-xs font-bold text-slate-500 uppercase">Cargo</label>
              <input 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-medium cursor-default" 
                type="text" value={formData.role} readOnly placeholder="---"
              />
            </div>
            <div className="grid gap-1.5 opacity-80">
              <label className="text-xs font-bold text-slate-500 uppercase">Salário Base</label>
              <input 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-medium cursor-default" 
                type="text" value={formData.salary ? `R$ ${formData.salary}` : ""} readOnly placeholder="---"
              />
            </div>
          </div>
        </div>

        {/* Endereço (Auto-preenchido) */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1">Endereço Residencial</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-80">
            <div className="md:col-span-2 grid gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Rua</label>
              <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-default" type="text" value={formData.street} readOnly placeholder="---" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Número</label>
              <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-default" type="text" value={formData.number} readOnly placeholder="---" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Bairro</label>
              <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-default" type="text" value={formData.neighborhood} readOnly placeholder="---" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Cidade</label>
              <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-default" type="text" value={formData.city} readOnly placeholder="---" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
              <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-default" type="text" value={formData.state} readOnly placeholder="---" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1">Dados do Desligamento</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700">Data de Desligamento</label>
              <input 
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-slate-900" 
                type="date" 
                value={formData.terminationDate}
                onChange={(e) => setFormData({...formData, terminationDate: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700">Tipo de Rescisão</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-slate-900"
                value={formData.terminationType}
                onChange={(e) => setFormData({...formData, terminationType: e.target.value})}
              >
                <option>Demissão sem justa causa</option>
                <option>Demissão por justa causa</option>
                <option>Pedido de demissão</option>
                <option>Acordo Mútuo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end items-center rounded-b-xl">
        <button 
          onClick={handleNextStep}
          className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
        >
          Próxima Etapa
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeDataForm;