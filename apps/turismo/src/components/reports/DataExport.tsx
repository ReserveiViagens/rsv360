'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  Calendar,
  Filter,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Share2,
  Mail,
  Database,
  BarChart3,
  PieChart,
  TrendingUp
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface ExportConfig {
  id: string;
  name: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  dataSource: string;
  fields: string[];
  filters: Record<string, any>;
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
  chartTypes: string[];
  emailRecipients: string[];
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  };
}

interface ExportJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: string;
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
}

// ===================================================================
// DADOS MOCK
// ===================================================================

const exportTemplates = [
  {
    id: 'customer-export',
    name: 'Exportação de Clientes',
    description: 'Exporta dados completos dos clientes',
    icon: <Database className="w-5 h-5" />,
    format: 'excel',
    fields: ['nome', 'email', 'telefone', 'data_cadastro', 'total_reservas']
  },
  {
    id: 'booking-export',
    name: 'Exportação de Reservas',
    description: 'Exporta dados de reservas com filtros',
    icon: <Calendar className="w-5 h-5" />,
    format: 'csv',
    fields: ['id', 'cliente', 'destino', 'data_viagem', 'valor', 'status']
  },
  {
    id: 'financial-export',
    name: 'Exportação Financeira',
    description: 'Exporta dados financeiros e relatórios',
    icon: <BarChart3 className="w-5 h-5" />,
    format: 'pdf',
    fields: ['receita', 'despesas', 'lucro', 'margem', 'período']
  }
];

const mockExportJobs: ExportJob[] = [
  {
    id: '1',
    name: 'Relatório de Clientes - Janeiro 2024',
    status: 'completed',
    format: 'excel',
    progress: 100,
    createdAt: '2024-01-20T10:00:00Z',
    completedAt: '2024-01-20T10:05:00Z',
    downloadUrl: '#'
  },
  {
    id: '2',
    name: 'Análise Financeira - Q4 2023',
    status: 'processing',
    format: 'pdf',
    progress: 65,
    createdAt: '2024-01-20T11:00:00Z'
  },
  {
    id: '3',
    name: 'Exportação de Reservas - Dezembro 2023',
    status: 'failed',
    format: 'csv',
    progress: 0,
    createdAt: '2024-01-20T09:00:00Z',
    error: 'Erro ao processar dados: timeout na consulta'
  }
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const DataExport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'history'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    id: '',
    name: '',
    format: 'excel',
    dataSource: 'customers',
    fields: [],
    filters: {},
    dateRange: { start: '', end: '' },
    includeCharts: false,
    chartTypes: [],
    emailRecipients: []
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>(mockExportJobs);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setExportConfig(prev => ({
      ...prev,
      name: template.name,
      format: template.format,
      fields: template.fields
    }));
  };

  const handleFieldToggle = (field: string) => {
    setExportConfig(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field]
    }));
  };

  const handleFormatChange = (format: ExportConfig['format']) => {
    setExportConfig(prev => ({ ...prev, format }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simular processo de exportação
    const newJob: ExportJob = {
      id: `job-${Date.now()}`,
      name: exportConfig.name,
      status: 'processing',
      format: exportConfig.format,
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    setExportJobs(prev => [newJob, ...prev]);
    
    // Simular progresso
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setExportJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, progress: i }
          : job
      ));
    }
    
    // Finalizar
    setExportJobs(prev => prev.map(job => 
      job.id === newJob.id 
        ? { 
            ...job, 
            status: 'completed', 
            progress: 100,
            completedAt: new Date().toISOString(),
            downloadUrl: '#'
          }
        : job
    ));
    
    setIsExporting(false);
    alert('Exportação concluída com sucesso!');
  };

  const handleDownload = (job: ExportJob) => {
    if (job.downloadUrl) {
      // Simular download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${job.name}.${job.format}`;
      link.click();
    }
  };

  const handleScheduleExport = () => {
    alert('Funcionalidade de agendamento será implementada em breve!');
  };

  const handleEmailExport = () => {
    alert('Funcionalidade de envio por email será implementada em breve!');
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Exportação de Dados
          </h1>
          <p className="text-gray-600">
            Exporte dados em diferentes formatos e agende exportações automáticas
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" /> },
                { id: 'custom', label: 'Exportação Customizada', icon: <Settings className="w-4 h-4" /> },
                { id: 'history', label: 'Histórico', icon: <Clock className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Templates de Exportação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exportTemplates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`border rounded-lg p-6 cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          {template.icon}
                        </div>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {template.format.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {template.fields.length} campos
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Configuração: {selectedTemplate.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Campos a exportar
                        </label>
                        <div className="space-y-2">
                          {selectedTemplate.fields.map((field: string) => (
                            <label key={field} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={exportConfig.fields.includes(field)}
                                onChange={() => handleFieldToggle(field)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-900 capitalize">
                                {field.replace('_', ' ')}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Período
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={exportConfig.dateRange.start}
                            onChange={(e) => setExportConfig(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, start: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Data de início"
                          />
                          <input
                            type="date"
                            value={exportConfig.dateRange.end}
                            onChange={(e) => setExportConfig(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, end: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Data de fim"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {isExporting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Exportando...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Exportar</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleScheduleExport}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Agendar</span>
                      </button>
                      <button
                        onClick={handleEmailExport}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Enviar por Email</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Custom Export Tab */}
            {activeTab === 'custom' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Exportação Customizada
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Configurações Básicas</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome da Exportação
                        </label>
                        <input
                          type="text"
                          value={exportConfig.name}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Relatório de Vendas - Janeiro 2024"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="Nome para identificar a exportação"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fonte de Dados
                        </label>
                        <select
                          value={exportConfig.dataSource}
                          onChange={(e) => setExportConfig(prev => ({ ...prev, dataSource: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="Selecione a fonte de dados"
                        >
                          <option value="customers">Clientes</option>
                          <option value="bookings">Reservas</option>
                          <option value="payments">Pagamentos</option>
                          <option value="products">Produtos</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Formato de Exportação
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
                            { value: 'csv', label: 'CSV', icon: <File className="w-4 h-4" /> },
                            { value: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" /> },
                            { value: 'json', label: 'JSON', icon: <Database className="w-4 h-4" /> }
                          ].map(format => (
                            <button
                              key={format.value}
                              onClick={() => handleFormatChange(format.value as any)}
                              className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                                exportConfig.format === format.value
                                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {format.icon}
                              <span className="text-sm font-medium">{format.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Filtros e Opções</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Período
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={exportConfig.dateRange.start}
                            onChange={(e) => setExportConfig(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, start: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Data de início"
                          />
                          <input
                            type="date"
                            value={exportConfig.dateRange.end}
                            onChange={(e) => setExportConfig(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, end: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Data de fim"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={exportConfig.includeCharts}
                            onChange={(e) => setExportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900">Incluir gráficos</span>
                        </label>
                      </div>
                      {exportConfig.includeCharts && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipos de Gráficos
                          </label>
                          <div className="space-y-2">
                            {[
                              { value: 'bar', label: 'Barras', icon: <BarChart3 className="w-4 h-4" /> },
                              { value: 'pie', label: 'Pizza', icon: <PieChart className="w-4 h-4" /> },
                              { value: 'line', label: 'Linha', icon: <TrendingUp className="w-4 h-4" /> }
                            ].map(chart => (
                              <label key={chart.value} className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={exportConfig.chartTypes.includes(chart.value)}
                                  onChange={(e) => {
                                    const newTypes = e.target.checked
                                      ? [...exportConfig.chartTypes, chart.value]
                                      : exportConfig.chartTypes.filter(t => t !== chart.value);
                                    setExportConfig(prev => ({ ...prev, chartTypes: newTypes }));
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div className="flex items-center space-x-2">
                                  {chart.icon}
                                  <span className="text-sm text-gray-900">{chart.label}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleExport}
                    disabled={isExporting || !exportConfig.name}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Exportando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Iniciar Exportação</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Histórico de Exportações
                </h3>
                <div className="space-y-4">
                  {exportJobs.map(job => (
                    <div key={job.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-lg">
                            {job.format === 'excel' && <FileSpreadsheet className="w-5 h-5 text-green-600" />}
                            {job.format === 'csv' && <File className="w-5 h-5 text-blue-600" />}
                            {job.format === 'pdf' && <FileText className="w-5 h-5 text-red-600" />}
                            {job.format === 'json' && <Database className="w-5 h-5 text-purple-600" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{job.name}</h4>
                            <p className="text-sm text-gray-600">
                              Criado em {new Date(job.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {job.status === 'completed' && (
                            <button
                              onClick={() => handleDownload(job)}
                              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                          )}
                          <div className="flex items-center space-x-2">
                            {job.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {job.status === 'processing' && <Clock className="w-5 h-5 text-blue-600" />}
                            {job.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-600" />}
                            <span className={`text-sm font-medium ${
                              job.status === 'completed' ? 'text-green-600' :
                              job.status === 'processing' ? 'text-blue-600' :
                              'text-red-600'
                            }`}>
                              {job.status === 'completed' ? 'Concluído' :
                               job.status === 'processing' ? 'Processando' :
                               'Falhou'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {job.status === 'processing' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Progresso</span>
                            <span>{job.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {job.error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{job.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
