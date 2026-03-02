'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Checkbox } from '@/components/ui/Checkbox';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Calendar, 
  Filter,
  Database,
  Save,
  Trash2,
  Eye,
  Play,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// Tipos para o sistema de exportação
interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  icon: React.ReactNode;
  description: string;
  supported: boolean;
  maxRecords?: number;
}

interface ExportField {
  id: string;
  name: string;
  label: string;
  type: string;
  selected: boolean;
  required: boolean;
}

interface ExportJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  format: string;
  recordCount: number;
  createdAt: Date;
  downloadUrl?: string;
}

// Formatos de exportação disponíveis
const exportFormats: ExportFormat[] = [
  {
    id: 'csv',
    name: 'CSV',
    extension: '.csv',
    icon: <FileText className="h-5 w-5" />,
    description: 'Arquivo separado por vírgulas, ideal para Excel',
    supported: true,
    maxRecords: 1000000
  },
  {
    id: 'excel',
    name: 'Excel',
    extension: '.xlsx',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    description: 'Arquivo Excel com formatação',
    supported: true,
    maxRecords: 1000000
  },
  {
    id: 'json',
    name: 'JSON',
    extension: '.json',
    icon: <FileCode className="h-5 w-5" />,
    description: 'Dados estruturados para APIs',
    supported: true,
    maxRecords: 500000
  }
];

// Campos disponíveis para exportação
const availableFields: ExportField[] = [
  { id: 'id', name: 'id', label: 'ID', type: 'number', selected: true, required: true },
  { id: 'name', name: 'name', label: 'Nome', type: 'string', selected: true, required: true },
  { id: 'email', name: 'email', label: 'Email', type: 'string', selected: true, required: false },
  { id: 'status', name: 'status', label: 'Status', type: 'string', selected: true, required: false },
  { id: 'created_at', name: 'created_at', label: 'Data de Criação', type: 'date', selected: true, required: false }
];

export default function DataExportSystem() {
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');
  const [selectedFields, setSelectedFields] = useState<ExportField[]>(availableFields.filter(f => f.selected));
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [activeTab, setActiveTab] = useState('export');
  const [recordLimit, setRecordLimit] = useState(10000);

  // Atualizar campo selecionado
  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, selected: !field.selected } : field
    ));
  };

  // Iniciar exportação
  const startExport = useCallback(() => {
    if (selectedFields.filter(f => f.selected).length === 0) {
      toast.error('Selecione pelo menos um campo para exportar');
      return;
    }

    const job: ExportJob = {
      id: Date.now().toString(),
      name: `Exportação ${selectedFormat.toUpperCase()} - ${new Date().toLocaleString()}`,
      status: 'pending',
      progress: 0,
      format: selectedFormat,
      recordCount: recordLimit,
      createdAt: new Date()
    };

    setExportJobs(prev => [job, ...prev]);

    // Simular progresso da exportação
    const interval = setInterval(() => {
      setExportJobs(prev => prev.map(j => {
        if (j.id === job.id && j.status === 'pending') {
          const newProgress = j.progress + Math.random() * 20;
          if (newProgress >= 100) {
            clearInterval(interval);
            return {
              ...j,
              status: 'completed',
              progress: 100,
              downloadUrl: '#'
            };
          }
          return { ...j, progress: newProgress, status: 'running' };
        }
        return j;
      }));
    }, 500);

    toast.success('Exportação iniciada!');
  }, [selectedFormat, selectedFields, recordLimit]);

  // Download do arquivo
  const downloadFile = (job: ExportJob) => {
    if (job.status !== 'completed') return;
    
    // Simular download
    const data = {
      format: job.format,
      recordCount: job.recordCount,
      fields: selectedFields.filter(f => f.selected),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${job.format}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Arquivo baixado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Exportação de Dados</h1>
          <p className="text-gray-600 mt-2">
            Exporte dados em múltiplos formatos com filtros avançados
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">Exportação</TabsTrigger>
          <TabsTrigger value="jobs">Trabalhos</TabsTrigger>
        </TabsList>

        {/* Aba de Exportação */}
        <TabsContent value="export" className="space-y-6">
          {/* Seleção de Formato */}
          <Card>
            <CardHeader>
              <CardTitle>Formato de Exportação</CardTitle>
              <CardDescription>
                Escolha o formato mais adequado para sua necessidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exportFormats.map((format) => (
                  <div
                    key={format.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        selectedFormat === format.id ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {format.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{format.name}</h3>
                        <p className="text-sm text-gray-500">{format.extension}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{format.description}</p>
                    {format.maxRecords && (
                      <p className="text-xs text-gray-500">
                        Máximo: {format.maxRecords.toLocaleString()} registros
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Campos */}
          <Card>
            <CardHeader>
              <CardTitle>Campos para Exportação</CardTitle>
              <CardDescription>
                Selecione os campos que deseja incluir na exportação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={field.id}
                      checked={field.selected}
                      onCheckedChange={() => toggleField(field.id)}
                      disabled={field.required}
                    />
                    <div className="flex-1">
                      <label htmlFor={field.id} className="text-sm font-medium cursor-pointer">
                        {field.label}
                      </label>
                      <p className="text-xs text-gray-500">{field.name} • {field.type}</p>
                    </div>
                    {field.required && (
                      <Badge variant="outline" className="text-xs">
                        Obrigatório
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Configure as opções de exportação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Limite de Registros</label>
                  <Input
                    type="number"
                    value={recordLimit}
                    onChange={(e) => setRecordLimit(Number(e.target.value))}
                    min={1}
                    max={1000000}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={startExport}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={selectedFields.filter(f => f.selected).length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Iniciar Exportação
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Trabalhos */}
        <TabsContent value="jobs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Trabalhos de Exportação</h2>
            <Button variant="outline" onClick={() => setExportJobs([])}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Histórico
            </Button>
          </div>
          
          {exportJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Download className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum trabalho</h3>
                <p className="text-gray-500">
                  Os trabalhos de exportação aparecerão aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {exportJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{job.name}</h3>
                        <p className="text-sm text-gray-500">
                          Criado em {job.createdAt.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          job.status === 'completed' ? 'default' :
                          job.status === 'running' ? 'secondary' :
                          'destructive'
                        }>
                          {job.status === 'completed' ? 'Concluído' :
                           job.status === 'running' ? 'Executando' :
                           'Falhou'}
                        </Badge>
                        <Badge variant="outline">{job.format.toUpperCase()}</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progresso:</span>
                        <span>{Math.round(job.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            job.status === 'completed' ? 'bg-green-600' :
                            job.status === 'running' ? 'bg-blue-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Registros:</span>
                          <p className="font-medium">{job.recordCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Formato:</span>
                          <p className="font-medium">{job.format.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      {job.status === 'completed' && (
                        <Button 
                          size="sm" 
                          onClick={() => downloadFile(job)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      )}
                      {job.status === 'running' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          disabled
                        >
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Executando...
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
