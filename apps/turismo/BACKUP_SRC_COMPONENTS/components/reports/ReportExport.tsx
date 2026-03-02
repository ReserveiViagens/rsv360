import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileBarChart, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Settings,
  Filter
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useUIStore } from '../../stores/useUIStore';

interface ExportJob {
  id: string;
  reportName: string;
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'xml';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileSize?: string;
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  requestedBy: string;
  parameters: Record<string, any>;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'xml';
  isDefault: boolean;
  parameters: {
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'boolean';
    required: boolean;
    options?: string[];
    defaultValue?: any;
  }[];
}

interface ReportExportProps {
  onExportRequested?: (exportJob: ExportJob) => void;
  onExportCompleted?: (exportJob: ExportJob) => void;
}

const ReportExport: React.FC<ReportExportProps> = ({ 
  onExportRequested,
  onExportCompleted 
}) => {
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [exportTemplates, setExportTemplates] = useState<ExportTemplate[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [exportParameters, setExportParameters] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('recent');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { showNotification } = useUIStore();

  // Templates de exportação padrão
  const defaultExportTemplates: ExportTemplate[] = [
    {
      id: 'sales-report-pdf',
      name: 'Relatório de Vendas - PDF',
      description: 'Relatório de vendas formatado para impressão e compartilhamento',
      format: 'pdf',
      isDefault: true,
      parameters: [
        { name: 'Período', type: 'select', required: true, options: ['Mês atual', 'Último mês', 'Último trimestre', 'Último ano'] },
        { name: 'Incluir gráficos', type: 'boolean', required: false, defaultValue: true },
        { name: 'Incluir tabelas', type: 'boolean', required: false, defaultValue: true },
        { name: 'Orientação', type: 'select', required: false, options: ['Retrato', 'Paisagem'], defaultValue: 'Retrato' }
      ]
    },
    {
      id: 'financial-summary-excel',
      name: 'Resumo Financeiro - Excel',
      description: 'Dados financeiros em formato de planilha para análise',
      format: 'excel',
      isDefault: true,
      parameters: [
        { name: 'Ano', type: 'select', required: true, options: ['2024', '2025', '2026'] },
        { name: 'Incluir fórmulas', type: 'boolean', required: false, defaultValue: true },
        { name: 'Incluir gráficos', type: 'boolean', required: false, defaultValue: false },
        { name: 'Formato de moeda', type: 'select', required: false, options: ['BRL (R$)', 'USD ($)', 'EUR (€)'], defaultValue: 'BRL (R$)' }
      ]
    },
    {
      id: 'customer-data-csv',
      name: 'Dados de Clientes - CSV',
      description: 'Exportação de dados de clientes para sistemas externos',
      format: 'csv',
      isDefault: true,
      parameters: [
        { name: 'Segmento', type: 'select', required: false, options: ['Todos', 'Ativos', 'VIP', 'Inativos'] },
        { name: 'Campos', type: 'select', required: true, options: ['Básicos', 'Completos', 'Personalizados'], defaultValue: 'Básicos' },
        { name: 'Separador', type: 'select', required: false, options: ['Vírgula', 'Ponto e vírgula', 'Tab'], defaultValue: 'Vírgula' },
        { name: 'Encoding', type: 'select', required: false, options: ['UTF-8', 'ISO-8859-1'], defaultValue: 'UTF-8' }
      ]
    },
    {
      id: 'analytics-json',
      name: 'Analytics - JSON',
      description: 'Dados analíticos em formato JSON para integração com APIs',
      format: 'json',
      isDefault: true,
      parameters: [
        { name: 'Métricas', type: 'select', required: true, options: ['Vendas', 'Clientes', 'Destinos', 'Todas'], defaultValue: 'Todas' },
        { name: 'Formato de data', type: 'select', required: false, options: ['ISO', 'Timestamp', 'Legível'], defaultValue: 'ISO' },
        { name: 'Incluir metadados', type: 'boolean', required: false, defaultValue: true },
        { name: 'Compactar', type: 'boolean', required: false, defaultValue: false }
      ]
    },
    {
      id: 'operational-xml',
      name: 'Dados Operacionais - XML',
      description: 'Dados operacionais em formato XML para sistemas legados',
      format: 'xml',
      isDefault: true,
      parameters: [
        { name: 'Departamento', type: 'select', required: true, options: ['Vendas', 'Operacional', 'Financeiro', 'Marketing'] },
        { name: 'Schema', type: 'select', required: false, options: ['Simples', 'Completo', 'Personalizado'], defaultValue: 'Simple' },
        { name: 'Incluir DTD', type: 'boolean', required: false, defaultValue: false },
        { name: 'Formatação', type: 'select', required: false, options: ['Compacto', 'Legível'], defaultValue: 'Legível' }
      ]
    }
  ];

  // Jobs de exportação mock
  const mockExportJobs: ExportJob[] = [
    {
      id: 'export-1',
      reportName: 'Relatório de Vendas - Janeiro 2025',
      format: 'pdf',
      status: 'completed',
      progress: 100,
      fileSize: '2.4 MB',
      downloadUrl: '#',
      createdAt: '2025-01-20T10:00:00Z',
      completedAt: '2025-01-20T10:02:30Z',
      requestedBy: 'gerente@reserveiviagens.com.br',
      parameters: { periodo: 'Janeiro 2025', incluirGraficos: true }
    },
    {
      id: 'export-2',
      reportName: 'Dados de Clientes - Q4 2024',
      format: 'excel',
      status: 'completed',
      progress: 100,
      fileSize: '1.8 MB',
      downloadUrl: '#',
      createdAt: '2025-01-19T15:30:00Z',
      completedAt: '2025-01-19T15:32:15Z',
      requestedBy: 'marketing@reserveiviagens.com.br',
      parameters: { ano: '2024', trimestre: 'Q4' }
    },
    {
      id: 'export-3',
      reportName: 'Analytics de Marketing',
      format: 'json',
      status: 'processing',
      progress: 65,
      createdAt: '2025-01-20T11:15:00Z',
      requestedBy: 'analista@reserveiviagens.com.br',
      parameters: { metricas: 'Todas', formatoData: 'ISO' }
    },
    {
      id: 'export-4',
      reportName: 'Relatório Financeiro Anual',
      format: 'pdf',
      status: 'failed',
      progress: 0,
      createdAt: '2025-01-18T09:00:00Z',
      errorMessage: 'Erro ao processar dados financeiros',
      requestedBy: 'financeiro@reserveiviagens.com.br',
      parameters: { ano: '2024', incluirDespesas: true }
    }
  ];

  useEffect(() => {
    setExportTemplates(defaultExportTemplates);
    setExportJobs(mockExportJobs);
  }, []);

  const handleExportRequest = () => {
    if (!selectedTemplate) {
      showNotification('Selecione um template de exportação', 'error');
      return;
    }

    // Validar parâmetros obrigatórios
    const requiredParams = selectedTemplate.parameters.filter(p => p.required);
    const missingParams = requiredParams.filter(p => !exportParameters[p.name]);
    
    if (missingParams.length > 0) {
      showNotification(`Preencha os parâmetros obrigatórios: ${missingParams.map(p => p.name).join(', ')}`, 'error');
      return;
    }

    const exportJob: ExportJob = {
      id: `export-${Date.now()}`,
      reportName: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
      format: selectedTemplate.format,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      requestedBy: 'current-user@reserveiviagens.com.br',
      parameters: exportParameters
    };

    setExportJobs(prev => [exportJob, ...prev]);
    setShowExportModal(false);
    setSelectedTemplate(null);
    setExportParameters({});

    // Simular processamento
    simulateExportProcessing(exportJob.id);

    if (onExportRequested) {
      onExportRequested(exportJob);
    }

    showNotification('Exportação solicitada com sucesso!', 'success');
  };

  const simulateExportProcessing = (jobId: string) => {
    // Simular progresso da exportação
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setExportJobs(prev => prev.map(job => {
          if (job.id === jobId) {
            const completedJob = {
              ...job,
              status: 'completed' as const,
              progress: 100,
              completedAt: new Date().toISOString(),
              fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
              downloadUrl: '#'
            };
            
            if (onExportCompleted) {
              onExportCompleted(completedJob);
            }
            
            return completedJob;
          }
          return job;
        }));
      } else {
        setExportJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, progress, status: 'processing' as const } : job
        ));
      }
    }, 500);
  };

  const handleDownload = (job: ExportJob) => {
    if (job.status === 'completed' && job.downloadUrl) {
      showNotification(`Download iniciado: ${job.reportName}`, 'success');
      // Aqui seria implementada a lógica real de download
    }
  };

  const handleRetry = (jobId: string) => {
    setExportJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'pending', progress: 0, errorMessage: undefined }
        : job
    ));
    
    // Simular nova tentativa
    simulateExportProcessing(jobId);
    showNotification('Nova tentativa de exportação iniciada', 'success');
  };

  const handleDeleteJob = (jobId: string) => {
    setExportJobs(prev => prev.filter(job => job.id !== jobId));
    showNotification('Job de exportação removido', 'success');
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'csv':
        return <FileBarChart className="w-5 h-5 text-blue-600" />;
      case 'json':
        return <FileText className="w-5 h-5 text-yellow-600" />;
      case 'xml':
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'processing':
        return 'Processando';
      case 'failed':
        return 'Falhou';
      default:
        return 'Pendente';
    }
  };

  const filteredJobs = exportJobs.filter(job => {
    if (filterStatus !== 'all' && job.status !== filterStatus) return false;
    if (searchTerm && !job.reportName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exportação de Relatórios</h2>
          <p className="text-gray-600">Exporte relatórios em diferentes formatos</p>
        </div>
        <Button onClick={() => setShowExportModal(true)}>
          <Download className="w-4 h-4 mr-2" />
          Nova Exportação
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Exportações</p>
              <p className="text-2xl font-bold text-gray-900">{exportJobs.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">
                {exportJobs.filter(j => j.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Processando</p>
              <p className="text-2xl font-bold text-gray-900">
                {exportJobs.filter(j => j.status === 'processing').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Falharam</p>
              <p className="text-2xl font-bold text-gray-900">
                {exportJobs.filter(j => j.status === 'failed').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar exportações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="processing">Processando</option>
            <option value="completed">Concluídas</option>
            <option value="failed">Falharam</option>
          </Select>
        </div>
      </div>

      {/* Export Jobs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recentes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Recent Exports Tab */}
        <TabsContent value="recent" className="space-y-4">
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getFormatIcon(job.format)}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{job.reportName}</h3>
                      <p className="text-sm text-gray-600">
                        Solicitado por {job.requestedBy} em {new Date(job.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusText(job.status)}
                    </Badge>
                    <div className="flex space-x-1">
                      {job.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(job)}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      {job.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRetry(job.id)}
                          title="Tentar novamente"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteJob(job.id)}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {job.status === 'processing' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progresso</span>
                      <span>{Math.round(job.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Job Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Formato</p>
                    <p className="font-medium uppercase">{job.format}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium">{getStatusText(job.status)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tamanho</p>
                    <p className="font-medium">{job.fileSize || 'N/A'}</p>
                  </div>
                </div>

                {/* Error Message */}
                {job.status === 'failed' && job.errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">
                      <strong>Erro:</strong> {job.errorMessage}
                    </p>
                  </div>
                )}

                {/* Parameters */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Parâmetros:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(job.parameters).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-600">{key}:</span>
                        <span className="ml-2 font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Download className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma exportação encontrada</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie sua primeira exportação de relatório'
                }
              </p>
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportTemplates.map((template) => (
              <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getFormatIcon(template.format)}
                    <Badge variant="secondary" className="uppercase">{template.format}</Badge>
                    {template.isDefault && (
                      <Badge variant="outline" className="text-xs">Padrão</Badge>
                    )}
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Parâmetros: {template.parameters.length}</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowExportModal(true);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Usar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Histórico de Exportações</h3>
            <p className="text-gray-600">Histórico detalhado de todas as exportações aparecerá aqui</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Nova Exportação"
        size="lg"
      >
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template de Exportação *
            </label>
            <Select
              value={selectedTemplate?.id || ''}
              onValueChange={(value) => {
                const template = exportTemplates.find(t => t.id === value);
                setSelectedTemplate(template || null);
                setExportParameters({});
              }}
            >
              <option value="">Selecione um template</option>
              {exportTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.format.toUpperCase()})
                </option>
              ))}
            </Select>
          </div>

          {/* Parameters */}
          {selectedTemplate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parâmetros de Exportação
              </label>
              <div className="space-y-4">
                {selectedTemplate.parameters.map((param) => (
                  <div key={param.name}>
                    <label className="block text-sm text-gray-600 mb-1">
                      {param.name} {param.required && <span className="text-red-500">*</span>}
                    </label>
                    <div>
                      {param.type === 'select' ? (
                        <Select
                          value={exportParameters[param.name] || ''}
                          onValueChange={(value) => setExportParameters(prev => ({ 
                            ...prev, 
                            [param.name]: value 
                          }))}
                        >
                          <option value="">Selecione...</option>
                          {param.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </Select>
                      ) : param.type === 'boolean' ? (
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={exportParameters[param.name] || param.defaultValue || false}
                            onChange={(e) => setExportParameters(prev => ({ 
                              ...prev, 
                              [param.name]: e.target.checked 
                            }))}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-600">{param.name}</span>
                        </label>
                      ) : param.type === 'date' ? (
                        <Input
                          type="date"
                          value={exportParameters[param.name] || ''}
                          onChange={(e) => setExportParameters(prev => ({ 
                            ...prev, 
                            [param.name]: e.target.value 
                          }))}
                        />
                      ) : param.type === 'number' ? (
                        <Input
                          type="number"
                          value={exportParameters[param.name] || param.defaultValue || ''}
                          onChange={(e) => setExportParameters(prev => ({ 
                            ...prev, 
                            [param.name]: e.target.value 
                          }))}
                          placeholder={param.defaultValue?.toString()}
                        />
                      ) : (
                        <Input
                          value={exportParameters[param.name] || param.defaultValue || ''}
                          onChange={(e) => setExportParameters(prev => ({ 
                            ...prev, 
                            [param.name]: e.target.value 
                          }))}
                          placeholder={param.name}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExportRequest} disabled={!selectedTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Iniciar Exportação
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { ReportExport };
export type { ExportJob, ExportTemplate };
