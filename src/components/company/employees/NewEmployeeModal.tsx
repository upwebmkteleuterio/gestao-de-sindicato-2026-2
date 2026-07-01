"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNewEmployeeForm } from "@/hooks/useNewEmployeeForm";
import { Eye, EyeOff, Loader2, ShieldCheck, MapPin, ClipboardList, Plus, Trash2, Users } from "lucide-react";
import { BRAZILIAN_STATES } from "@/utils/validationUtils";

interface NewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: any | null;
}

const NewEmployeeModal: React.FC<NewEmployeeModalProps> = ({ isOpen, onClose, employeeToEdit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { 
    formData, 
    dependents, 
    updateField, 
    addDependent, 
    removeDependent, 
    updateDependent, 
    handleSubmit, 
    isSubmitting 
  } = useNewEmployeeForm(employeeToEdit, onClose);

  const isAssociate = formData.status === "Associado";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div>
            <DialogTitle className="text-2xl font-bold">
              {employeeToEdit ? "Editar Funcionário" : "Novo Funcionário"}
            </DialogTitle>
            <DialogDescription>
              Cadastre as informações completas do colaborador no banco de dados do sindicato.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-8 no-scrollbar">
          <form id="new-employee-form" onSubmit={handleSubmit} className="space-y-8">
            {/* DADOS PESSOAIS */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1">Dados Pessoais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Ex: Lucas Vieira da Vitória" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mother_name">Nome da Mãe</Label>
                  <Input id="mother_name" value={formData.mother_name} onChange={(e) => updateField('mother_name', e.target.value)} placeholder="Nome completo da mãe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birth_place">Naturalidade (Cidade/UF)</Label>
                  <Input id="birth_place" value={formData.birth_place} onChange={(e) => updateField('birth_place', e.target.value)} placeholder="Ex: São Paulo/SP" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input id="cpf" value={formData.cpf} onChange={(e) => updateField('cpf', e.target.value)} placeholder="000.000.000-00" />
                </div>
                <div className="grid gap-2">
                  <Label>Estado Civil</Label>
                  <Select value={formData.marital_status} onValueChange={(v) => updateField('marital_status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                      <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                      <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                      <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SEÇÃO DE DEPENDENTES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Dependentes</h4>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addDependent}
                  className="h-7 px-2 gap-1.5 text-[10px] font-black uppercase border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Plus size={14} /> Adicionar
                </Button>
              </div>

              {dependents.length > 0 ? (
                <div className="space-y-3">
                  {dependents.map((dep, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_180px_40px] gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-1">
                      <div className="grid gap-1.5">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Nome Completo</Label>
                        <Input 
                          placeholder="Nome do dependente" 
                          value={dep.name} 
                          onChange={(e) => updateDependent(index, "name", e.target.value)}
                          className="bg-white h-9 text-sm"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">CPF</Label>
                        <Input 
                          placeholder="000.000.000-00" 
                          value={dep.cpf} 
                          onChange={(e) => updateDependent(index, "cpf", e.target.value)}
                          className="bg-white h-9 text-sm"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeDependent(index)}
                        className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-400 font-medium italic">Nenhum dependente adicionado.</p>
                </div>
              )}
            </div>

            {/* DADOS PROFISSIONAIS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                <ClipboardList className="size-4 text-blue-600" />
                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Dados Profissionais</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Cargo *</Label>
                  <Input id="role" value={formData.role} onChange={(e) => updateField('role', e.target.value)} placeholder="Analista" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ctps">CTPS (Número/Série)</Label>
                  <Input id="ctps" value={formData.ctps} onChange={(e) => updateField('ctps', e.target.value)} placeholder="0000000 / 000-0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="salary">Salário Base</Label>
                  <Input 
                    id="salary" 
                    placeholder="R$ 0,00" 
                    value={formData.salary} 
                    onChange={(e) => updateField('salary', e.target.value)}
                    className="text-right font-mono"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admission_date">Data da Admissão *</Label>
                  <Input id="admission_date" type="date" value={formData.admission_date} onChange={(e) => updateField('admission_date', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Status Sindical</Label>
                  <Select value={formData.status} onValueChange={(v) => updateField('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Associado">Associado</SelectItem>
                      <SelectItem value="Não Associado">Não Associado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Situação do Contrato</Label>
                  <Select value={formData.contract_status} onValueChange={(v) => updateField('contract_status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Afastado">Afastado</SelectItem>
                      <SelectItem value="Licença Médica">Licença Médica</SelectItem>
                      <SelectItem value="Licença Maternidade">Licença Maternidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ENDEREÇO RESIDENCIAL */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                <MapPin className="size-4 text-blue-600" />
                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Endereço Residencial</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input id="zip_code" value={formData.zip_code} onChange={(e) => updateField('zip_code', e.target.value)} placeholder="00000-000" />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="street">Logradouro (Rua/Av)</Label>
                  <Input id="street" value={formData.street} onChange={(e) => updateField('street', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" value={formData.number} onChange={(e) => updateField('number', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" value={formData.neighborhood} onChange={(e) => updateField('neighborhood', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={formData.city} onChange={(e) => updateField('city', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.value} - {s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ACESSO AO PORTAL */}
            {!employeeToEdit && isAssociate && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="size-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Acesso ao Portal do Funcionário</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail de Acesso</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="email@funcionario.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha Temporária</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        value={formData.password} 
                        onChange={(e) => updateField('password', e.target.value)} 
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <DialogFooter className="p-6 border-t border-slate-100 bg-white">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button 
            type="submit" 
            form="new-employee-form" 
            className="bg-blue-600 hover:bg-blue-700 font-bold px-8"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
            {employeeToEdit ? "Salvar Alterações" : "Salvar Cadastro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewEmployeeModal;