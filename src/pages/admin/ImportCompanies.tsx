import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, ClipboardPaste, X, Check, Loader2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ColumnMapping {
  name: string;
  cnpj: string;
  accounting_email: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

const DEFAULT_MAPPING: ColumnMapping = {
  name: "",
  cnpj: "",
  accounting_email: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  zip_code: "",
};

const FIELDS = [
  { id: "name", label: "Razão Social / Nome" },
  { id: "cnpj", label: "CNPJ" },
  { id: "accounting_email", label: "Email Contabilidade / Admin" },
  { id: "street", label: "Logradouro / Rua" },
  { id: "number", label: "Número" },
  { id: "neighborhood", label: "Bairro" },
  { id: "city", label: "Cidade" },
  { id: "state", label: "Estado (UF)" },
  { id: "zip_code", label: "CEP" },
];

const ImportCompanies = () => {
  const [rawData, setRawData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>(DEFAULT_MAPPING);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importLogs, setImportLogs] = useState<{ cnpj: string; status: 'success' | 'error'; message?: string }[]>([]);
  const [pastedText, setPastedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPastedText(text);
    if (!text) return;

    const rows = text.split("\n").map(row => row.split("\t").map(cell => cell.trim()));
    if (rows.length > 0) {
      setHeaders(rows[0]);
      setRawData(rows.slice(1).filter(row => row.some(cell => cell !== "")));
      
      // Auto-mapping attempt
      const newMapping = { ...DEFAULT_MAPPING };
      rows[0].forEach((header, index) => {
        const h = header.toLowerCase();
        if (h.includes("cnpj")) newMapping.cnpj = index.toString();
        if (h.includes("razão") || h.includes("nome") || h.includes("social")) newMapping.name = index.toString();
        if (h.includes("email") || h.includes("contabilidade") || h.includes("contato")) newMapping.accounting_email = index.toString();
        if (h.includes("rua") || h.includes("logradouro") || h.includes("endereço")) newMapping.street = index.toString();
        if (h.includes("nº") || h.includes("número") || h.includes("numero")) newMapping.number = index.toString();
        if (h.includes("bairro")) newMapping.neighborhood = index.toString();
        if (h.includes("cidade")) newMapping.city = index.toString();
        if (h.includes("estado") || h.includes("uf")) newMapping.state = index.toString();
        if (h.includes("cep")) newMapping.zip_code = index.toString();
      });
      setMapping(newMapping);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      // Basic CSV/TSV detection
      const delimiter = content.includes("\t") ? "\t" : ";";
      const rows = content.split("\n").map(row => row.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, '')));
      
      if (rows.length > 0) {
        setHeaders(rows[0]);
        setRawData(rows.slice(1).filter(row => row.some(cell => cell !== "")));
        setPastedText(content);
      }
    };
    reader.readAsText(file);
  };

  const getMappedData = () => {
    return rawData.map(row => {
      const company: any = {};
      Object.entries(mapping).forEach(([field, index]) => {
        if (index !== "") {
          company[field] = row[parseInt(index)];
        }
      });
      return company;
    });
  };

  const startImport = async () => {
    const dataToImport = getMappedData();
    if (dataToImport.length === 0) {
      toast.error("Nenhum dado mapeado para importar.");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportLogs([]);
    setIsPreviewOpen(false);

    // Split into chunks of 50 to avoid timeouts and keep logs readable
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < dataToImport.length; i += chunkSize) {
      chunks.push(dataToImport.slice(i, i + chunkSize));
    }

    let totalSuccess = 0;
    let totalError = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const { data, error } = await supabase.functions.invoke('batch-import-companies', {
          body: { companies: chunk }
        });

        if (error) throw error;

        const results = data.results || [];
        results.forEach((res: any) => {
          if (res.status === 'success') totalSuccess++;
          else totalError++;
        });

        setImportLogs(prev => [...prev, ...results]);
        setImportProgress(Math.round(((i + 1) / chunks.length) * 100));
        
        // Small delay to respect rate limits even further and allow UI to breathe
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err: any) {
        console.error("Erro no chunk:", err);
        setImportLogs(prev => [...prev, ...chunk.map(c => ({ 
          cnpj: c.cnpj, 
          status: 'error', 
          message: err.message || "Erro desconhecido na função" 
        }))]);
      }
    }

    setIsImporting(false);
    toast.success(`Importação finalizada: ${totalSuccess} sucessos, ${totalError} erros.`);
  };

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Importação de Empresas</h1>
          <p className="text-slate-500">Migre dados de planilhas de forma massiva com criação automática de acesso.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Anexar Planilha
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".csv,.txt,.tsv"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Input Data */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardPaste className="h-5 w-5 text-blue-600" />
              1. Cole os dados da planilha
            </CardTitle>
            <CardDescription>
              Copie as células do Excel ou Google Sheets (incluindo o cabeçalho) e cole abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-64 p-4 text-sm font-mono border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
              placeholder="Cole aqui... Exemplo:&#10;Razão Social	CNPJ	Cidade	...&#10;Minha Empresa	12.345.678/0001-99	São Paulo	..."
              value={pastedText}
              onChange={handlePaste}
            />
            {rawData.length > 0 && (
              <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <span className="text-sm text-blue-700 font-medium">
                  {rawData.length} linhas detectadas (excluindo cabeçalho).
                </span>
                <Button variant="ghost" size="sm" onClick={() => { setRawData([]); setPastedText(""); }} className="text-blue-600 hover:text-blue-800">
                  <X className="h-4 w-4 mr-1" /> Limpar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Mapping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              2. Sincronizar Campos
            </CardTitle>
            <CardDescription>
              Relacione as colunas da sua planilha com os campos do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {headers.length === 0 ? (
              <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-xl">
                Aguardando dados...
              </div>
            ) : (
              FIELDS.map(field => (
                <div key={field.id} className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-slate-500">{field.label}</Label>
                  <Select 
                    value={mapping[field.id as keyof ColumnMapping]} 
                    onValueChange={(val) => setMapping(prev => ({ ...prev, [field.id]: val }))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione a coluna..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Não importar --</SelectItem>
                      {headers.map((h, i) => (
                        <SelectItem key={i} value={i.toString()}>{h || `Coluna ${i + 1}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))
            )}
            
            <Button 
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700" 
              disabled={rawData.length === 0 || !mapping.cnpj || !mapping.name}
              onClick={() => setIsPreviewOpen(true)}
            >
              Revisar Importação
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Logs Section */}
      {(isImporting || importLogs.length > 0) && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Progresso da Importação</CardTitle>
              <Badge variant={isImporting ? "outline" : "default"} className={isImporting ? "animate-pulse" : "bg-green-600"}>
                {isImporting ? "Importando..." : "Concluído"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando {importLogs.length} de {rawData.length}</span>
                <span className="font-bold">{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2 bg-slate-200" />
            </div>

            <div className="bg-white rounded-xl border p-4">
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" /> Logs de Retorno
              </h4>
              <ScrollArea className="h-64 rounded-md">
                <div className="space-y-2">
                  {importLogs.map((log, i) => (
                    <div key={i} className={`text-xs p-2 rounded-lg flex items-center justify-between ${log.status === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                      <div className="flex flex-col">
                        <span className="font-bold">CNPJ: {log.cnpj}</span>
                        {log.message && <span className="opacity-80 italic">{log.message}</span>}
                      </div>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-[10px]">
                        {log.status === 'success' ? 'SUCESSO' : 'ERRO'}
                      </Badge>
                    </div>
                  ))}
                  {importLogs.length === 0 && <p className="text-slate-400 text-center py-8">Os logs aparecerão aqui durante o envio.</p>}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Revisão de Dados (Preview)</DialogTitle>
            <DialogDescription>
              Verifique se as informações abaixo estão corretas antes de confirmar o envio para o banco de dados.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden border rounded-xl my-4">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    {FIELDS.map(f => (
                      <TableHead key={f.id} className="text-[10px] font-bold uppercase whitespace-nowrap">{f.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getMappedData().slice(0, 50).map((company, i) => (
                    <TableRow key={i}>
                      {FIELDS.map(f => (
                        <TableCell key={f.id} className="text-xs truncate max-w-[150px]">
                          {company[f.id] || "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rawData.length > 50 && (
                <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 border-t italic">
                  Mostrando apenas as primeiras 50 linhas de {rawData.length}...
                </div>
              )}
            </ScrollArea>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 font-bold">Atenção</AlertTitle>
            <AlertDescription className="text-amber-700 text-sm">
              Esta ação criará usuários e empresas no sistema. A senha inicial será os 6 primeiros dígitos do CNPJ.
              Os e-mails de acesso serão gerados automaticamente como <code className="bg-amber-100 px-1 rounded">cnpj@gestaosindicato.com.br</code>.
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>Cancelar</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 px-8" onClick={startImport} disabled={isImporting}>
              {isImporting ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-4 w-4" />}
              Confirmar e Importar {rawData.length} Empresas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImportCompanies;
