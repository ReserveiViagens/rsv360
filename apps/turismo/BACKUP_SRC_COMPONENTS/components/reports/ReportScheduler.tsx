'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Mail, 
  Settings, 
  Play, 
  Pause, 
  Edit3, 
  Trash2, 
  Eye,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  template: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number; // 0-6 (domingo-sábado)
  dayOfMonth?: number; // 1-31
  emailRecipients: string[];
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  createdAt: string;
  createdBy: string;
}

interface ReportExecution {
  id: string;
  reportId: string;
  reportName: string;
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  completedAt?: string;
  duration?: number; // em segundos
  fileSize?: number; // em bytes
  error?: string;
  downloadUrl?: string;
}

// ===================================================================
// DADOS MOCK
// ===================================================================

const mockScheduledReports: ScheduledReport[] = [
  {
    id: '1',
    name: 'Relatório Diário de Vendas',
    description: 'Relatório diário com resumo de vendas e métricas principais',
    template: 'daily-sales',
    frequency: 'daily',
    time: '08:00',
    emailRecipients: ['admin@rsv.com', 'vendas@rsv.com'],
    isActive: true,
    lastRun: '2024-01-20T08:00:00Z',
    nextRun: '2024-01-21T08:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'João Silva'
  },
  {
    id: '2',
    name: 'Relatório Semanal de Clientes',
    description: 'Análise semanal de novos clientes e retenção',
    template: 'weekly-customers',
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: 1, // Segunda-feira
    emailRecipients: ['marketing@rsv.com'],
    isActive: true,
    lastRun: '2024-01-15T09:00:00Z',
    nextRun: '2024-01-22T09:00:00Z',
    createdAt: '2024-01-10T14:30:00Z',
    createdBy: 'Maria Santos'
  },
  {
    id: '3',
    name: 'Relatório Mensal Financeiro',
    description: 'Relatório financeiro completo do mês',
    template: 'monthly-financial',
    frequency: 'monthly',
    time: '10:00',
    dayOfMonth: 1,
    emailRecipients: ['financeiro@rsv.com', 'diretor@rsv.com'],
    isActive: false,
    lastRun: '2024-01-01T10:00:00Z',
    nextRun: '2024-02-01T10:00:00Z',
    createdAt: '2023-12-20T16:00:00Z',
    createdBy: 'Pedro Costa'
  }
];

const mockExecutions: ReportExecution[] = [
  {
    id: '1',
    reportId: '1',
    reportName: 'Relatório Diário de Vendas',
    status: 'success',
    startedAt: '2024-01-20T08:00:00Z',
    completedAt: '2024-01-20T08:02:30Z',
    duration: 150,
    fileSize: 1024000,
    downloadUrl: '#'
  },
  {
    id: '2',
    reportId: '1',
    reportName: 'Relatório Diário de Vendas',
    status: 'success',
    startedAt: '2024-01-19T08:00:00Z',
    completedAt: '2024-01-19T08:01:45Z',
    duration: 105,
    fileSize: 980000,
    downloadUrl: '#'
  },
  {
    id: '3',
    reportId: '2',
    reportName: 'Relatório Semanal de Clientes',
    status: 'failed',
    startedAt: '2024-01-15T09:00:00Z',
    completedAt: '2024-01-15T09:05:00Z',
    duration: 300,
    error: 'Erro ao conectar com o banco de dados'
  }
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const ReportScheduler: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedules' | 'executions' | 'new'>('schedules');
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(mockScheduledReports);
  const [executions, setExecutions] = useState<ReportExecution[]>(mockExecutions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showNewForm, setShowNewForm] = useState(false);

  // ===================================================================
  // FILTROS
  // ===================================================================

  const filteredReports = scheduledReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && report.isActive) ||
                         (statusFilter === 'inactive' && !report.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleToggleActive = (reportId: string) => {
    setScheduledReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, isActive: !report.isActive }
        : report
    ));
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      setScheduledReports(prev => prev.filter(report => report.id !== reportId));
      alert('Agendamento excluído com sucesso!');
    }
  };

  const handleEditReport = (reportId: string) => {
    alert(`Editando agendamento: ${reportId}`);
  };

  const handleViewReport = (reportId: string) => {
    alert(`Visualizando relatório: ${reportId}`);
  };

  const handleRunNow = (reportId: string) => {
    alert(`Executando relatório agora: ${reportId}`);
  };

  const handleDownloadExecution = (execution: ReportExecution) => {
    if (execution.downloadUrl) {
      // Simular download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${execution.reportName}-${execution.startedAt}.pdf`;
      link.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getFrequencyLabel = (frequency: string, dayOfWeek?: number, dayOfMonth?: number) => {
    switch (frequency) {
      case 'daily':
        return 'Diário';
      case 'weekly':
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return `Semanal (${days[dayOfWeek || 0]})`;
      case 'monthly':
        return `Mensal (dia ${dayOfMonth || 1})`;
      default:
        return frequency;
    }
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Agendamento de Relatórios
              </h1>
              <p className="text-gray-600">
                Configure e gerencie relatórios automáticos
              </p>
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'schedules', label: 'Agendamentos', icon: <Calendar className="w-4 h-4" /> },
                { id: 'executions', label: 'Execuções', icon: <Clock className="w-4 h-4" /> },
                { id: 'new', label: 'Novo Agendamento', icon: <Plus className="w-4 h-4" /> }
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
            {/* Schedules Tab */}
            {activeTab === 'schedules' && (
              <div>
                {/* Filtros */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar agendamentos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Buscar agendamentos por nome ou descrição"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Filtrar por status"
                    >
                      <option value="all">Todos</option>
                      <option value="active">Ativos</option>
                      <option value="inactive">Inativos</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-600">
                    {filteredReports.length} de {scheduledReports.length} agendamentos
                  </div>
                </div>

                {/* Lista de Agendamentos */}
                <div className="space-y-4">
                  {filteredReports.map(report => (
                    <div key={report.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                            <div className="flex items-center space-x-2">
                              {report.isActive ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
                                  Ativo
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-1" />
                                  Inativo
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{report.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Frequência:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {getFrequencyLabel(report.frequency, report.dayOfWeek, report.dayOfMonth)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Horário:</span>
                              <span className="ml-2 font-medium text-gray-900">{report.time}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Próxima execução:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {new Date(report.nextRun).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleRunNow(report.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Executar agora"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewReport(report.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Visualizar relatório"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditReport(report.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar agendamento"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(report.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              report.isActive 
                                ? 'text-yellow-600 hover:bg-yellow-100' 
                                : 'text-green-600 hover:bg-green-100'
                            }`}
                            title={report.isActive ? 'Pausar' : 'Ativar'}
                          >
                            {report.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Excluir agendamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div>
                            <span>Destinatários: </span>
                            <span className="font-medium">{report.emailRecipients.join(', ')}</span>
                          </div>
                          <div>
                            <span>Criado por: </span>
                            <span className="font-medium">{report.createdBy}</span>
                            <span className="ml-2">
                              em {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredReports.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum agendamento encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Crie seu primeiro agendamento de relatório.
                    </p>
                    <button
                      onClick={() => setShowNewForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Criar Agendamento
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Executions Tab */}
            {activeTab === 'executions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Histórico de Execuções
                </h3>
                <div className="space-y-4">
                  {executions.map(execution => (
                    <div key={execution.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-lg">
                            {execution.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {execution.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-600" />}
                            {execution.status === 'running' && <Clock className="w-5 h-5 text-blue-600" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{execution.reportName}</h4>
                            <p className="text-sm text-gray-600">
                              Iniciado em {new Date(execution.startedAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {execution.status === 'success' && execution.downloadUrl && (
                            <button
                              onClick={() => handleDownloadExecution(execution)}
                              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              execution.status === 'success' ? 'text-green-600' :
                              execution.status === 'failed' ? 'text-red-600' :
                              'text-blue-600'
                            }`}>
                              {execution.status === 'success' ? 'Sucesso' :
                               execution.status === 'failed' ? 'Falhou' :
                               'Executando'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {execution.completedAt && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span>Duração: </span>
                            <span className="font-medium">
                              {execution.duration ? formatDuration(execution.duration) : '-'}
                            </span>
                          </div>
                          <div>
                            <span>Tamanho: </span>
                            <span className="font-medium">
                              {execution.fileSize ? formatFileSize(execution.fileSize) : '-'}
                            </span>
                          </div>
                          <div>
                            <span>Concluído em: </span>
                            <span className="font-medium">
                              {new Date(execution.completedAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {execution.error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{execution.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Schedule Tab */}
            {activeTab === 'new' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Novo Agendamento
                </h3>
                <div className="max-w-2xl">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Relatório
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Relatório Diário de Vendas"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Nome para identificar o agendamento"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                      </label>
                      <textarea
                        placeholder="Descreva o propósito deste relatório..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Descrição do relatório agendado"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Template
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" title="Selecione o template do relatório">
                          <option value="">Selecione um template</option>
                          <option value="daily-sales">Relatório Diário de Vendas</option>
                          <option value="weekly-customers">Relatório Semanal de Clientes</option>
                          <option value="monthly-financial">Relatório Mensal Financeiro</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frequência
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" title="Selecione a frequência de execução">
                          <option value="daily">Diário</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensal</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário de Execução
                      </label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Horário para execução do relatório"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destinatários (emails separados por vírgula)
                      </label>
                      <input
                        type="text"
                        placeholder="admin@rsv.com, vendas@rsv.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Emails dos destinatários do relatório"
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Criar Agendamento
                      </button>
                      <button 
                        onClick={() => setActiveTab('schedules')}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportScheduler;