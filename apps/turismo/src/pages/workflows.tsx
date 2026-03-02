import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Workflow,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Eye,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  Heart,
  Share,
  Edit,
  Trash2,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  AlertTriangle,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Globe,
  Settings,
  Database,
  Server,
  Zap,
  Target,
  Award,
  Star,
  ThumbsUp,
  MessageSquare,
  Bell,
  Lock,
  Unlock,
  Key,
  UserCheck,
  Users,
  UserPlus,
  UserX,
  Folder,
  FileText,
  Video,
  Music,
  Archive,
  BookOpen,
  Bookmark,
  Clock,
  Volume2,
  VolumeX,
  Volume1,
  Volume,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus as PlusIcon,
  Send,
  Inbox,
  Archive as ArchiveIcon,
  Star as StarIcon,
  GitBranch,
  Square,
  GitCommit,
  GitMerge,
  GitPullRequest,
  GitCompare
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'stopped' | 'draft';
  type: 'automation' | 'approval' | 'notification' | 'data_processing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_by: string;
  created_at: string;
  updated_at: string;
  last_executed?: string;
  next_execution?: string;
  execution_count: number;
  success_rate: number;
  average_duration: string;
  triggers: string[];
  actions: string[];
  conditions: string[];
  category: string;
  tags: string[];
  is_scheduled: boolean;
  schedule?: string;
  recipients: string[];
  error_count: number;
  last_error?: string;
}

export default function WorkflowsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Dados simulados
  const [stats] = useState({
    total_workflows: 156,
    active_workflows: 89,
    paused_workflows: 23,
    stopped_workflows: 12,
    draft_workflows: 32,
    total_executions: 1247,
    success_rate: 94.5,
    average_duration: '2.3 min',
    error_count: 67,
    scheduled_workflows: 45,
    automation_workflows: 78,
    approval_workflows: 34,
    notification_workflows: 28,
    data_processing_workflows: 16
  });

  // Cards clicáveis de estatísticas
  const statsCards = [
    {
      id: 'total_workflows',
      title: 'Total de Workflows',
      value: stats.total_workflows.toString(),
      icon: <Workflow className="h-6 w-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Workflows no sistema'
    },
    {
      id: 'active_workflows',
      title: 'Ativos',
      value: stats.active_workflows.toString(),
      icon: <Play className="h-6 w-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Workflows em execução'
    },
    {
      id: 'total_executions',
      title: 'Execuções',
      value: stats.total_executions.toString(),
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Total de execuções'
    },
    {
      id: 'success_rate',
      title: 'Taxa de Sucesso',
      value: `${stats.success_rate}%`,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Taxa de sucesso'
    },
    {
      id: 'average_duration',
      title: 'Duração Média',
      value: stats.average_duration,
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      description: 'Tempo médio de execução'
    },
    {
      id: 'error_count',
      title: 'Erros',
      value: stats.error_count.toString(),
      icon: <XCircle className="h-6 w-6" />,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      description: 'Total de erros'
    }
  ];

  const [workflows] = useState<Workflow[]>([
    {
      id: 'WF001',
      name: 'Aprovação de Reservas',
      description: 'Workflow automático para aprovação de reservas com valor superior a R$ 5.000',
      status: 'active',
      type: 'approval',
      priority: 'high',
      created_by: 'João Silva',
      created_at: '2024-01-15T10:30:00',
      updated_at: '2024-01-16T14:20:00',
      last_executed: '2024-01-16T15:30:00',
      next_execution: '2024-01-17T09:00:00',
      execution_count: 45,
      success_rate: 98.2,
      average_duration: '1.5 min',
      triggers: ['Nova reserva criada', 'Valor > R$ 5.000'],
      actions: ['Notificar gerente', 'Criar ticket de aprovação', 'Enviar email'],
      conditions: ['Valor > R$ 5.000', 'Cliente não VIP'],
      category: 'Aprovações',
      tags: ['reserva', 'aprovação', 'gerente'],
      is_scheduled: true,
      schedule: 'Diário às 09:00',
      recipients: ['gerente@reserveiviagens.com'],
      error_count: 1,
      last_error: '2024-01-15T11:30:00'
    },
    {
      id: 'WF002',
      name: 'Notificação de Check-in',
      description: 'Envio automático de lembretes de check-in 24h antes do voo',
      status: 'active',
      type: 'notification',
      priority: 'medium',
      created_by: 'Maria Santos',
      created_at: '2024-01-14T09:15:00',
      updated_at: '2024-01-15T16:45:00',
      last_executed: '2024-01-16T08:00:00',
      next_execution: '2024-01-17T08:00:00',
      execution_count: 156,
      success_rate: 95.8,
      average_duration: '30 seg',
      triggers: ['Voo em 24h', 'Check-in não realizado'],
      actions: ['Enviar email', 'Enviar SMS', 'Notificar app'],
      conditions: ['Voo confirmado', 'Check-in pendente'],
      category: 'Notificações',
      tags: ['check-in', 'voo', 'lembrete'],
      is_scheduled: true,
      schedule: 'Diário às 08:00',
      recipients: ['clientes'],
      error_count: 7,
      last_error: '2024-01-16T08:15:00'
    },
    {
      id: 'WF003',
      name: 'Processamento de Pagamentos',
      description: 'Automação do processamento de pagamentos e confirmações',
      status: 'paused',
      type: 'automation',
      priority: 'critical',
      created_by: 'Pedro Costa',
      created_at: '2024-01-13T14:20:00',
      updated_at: '2024-01-16T10:30:00',
      last_executed: '2024-01-16T09:45:00',
      next_execution: '2024-01-17T09:45:00',
      execution_count: 89,
      success_rate: 99.1,
      average_duration: '45 seg',
      triggers: ['Pagamento recebido', 'Gateway confirmado'],
      actions: ['Confirmar reserva', 'Enviar confirmação', 'Atualizar estoque'],
      conditions: ['Pagamento aprovado', 'Reserva válida'],
      category: 'Pagamentos',
      tags: ['pagamento', 'confirmação', 'gateway'],
      is_scheduled: true,
      schedule: 'A cada 5 minutos',
      recipients: ['financeiro@reserveiviagens.com'],
      error_count: 1,
      last_error: '2024-01-16T09:50:00'
    },
    {
      id: 'WF004',
      name: 'Relatório Diário',
      description: 'Geração e envio de relatórios diários de vendas',
      status: 'active',
      type: 'data_processing',
      priority: 'low',
      created_by: 'Ana Oliveira',
      created_at: '2024-01-12T11:00:00',
      updated_at: '2024-01-15T17:30:00',
      last_executed: '2024-01-16T06:00:00',
      next_execution: '2024-01-17T06:00:00',
      execution_count: 23,
      success_rate: 100.0,
      average_duration: '3.2 min',
      triggers: ['Fim do dia', 'Dados disponíveis'],
      actions: ['Gerar relatório', 'Enviar email', 'Salvar arquivo'],
      conditions: ['Dados completos', 'Horário 06:00'],
      category: 'Relatórios',
      tags: ['relatório', 'vendas', 'diário'],
      is_scheduled: true,
      schedule: 'Diário às 06:00',
      recipients: ['gerencia@reserveiviagens.com'],
      error_count: 0
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'active', name: 'Ativos', icon: Play },
    { id: 'paused', name: 'Pausados', icon: Pause },
    { id: 'stopped', name: 'Parados', icon: Square },
    { id: 'draft', name: 'Rascunhos', icon: FileText }
  ];

  const handleCardClick = (cardId: string) => {
    setSelectedWorkflow(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada card
  };

  const handleQuickAction = (action: string) => {
    setSelectedWorkflow(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada ação
  };

  const handleWorkflowClick = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'stopped':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'paused':
        return 'Pausado';
      case 'stopped':
        return 'Parado';
      case 'draft':
        return 'Rascunho';
      default:
        return 'Desconhecido';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'automation':
        return 'bg-blue-100 text-blue-800';
      case 'approval':
        return 'bg-green-100 text-green-800';
      case 'notification':
        return 'bg-purple-100 text-purple-800';
      case 'data_processing':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'automation':
        return 'Automação';
      case 'approval':
        return 'Aprovação';
      case 'notification':
        return 'Notificação';
      case 'data_processing':
        return 'Processamento';
      default:
        return 'Desconhecido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || workflow.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationButtons />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Workflows</h1>
              <p className="mt-2 text-gray-600">
                Gerencie automações e processos de negócio
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleQuickAction('export')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button
                onClick={() => handleQuickAction('new')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Workflow
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statsCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 ${card.bgColor} rounded-lg`}>
                        <div className={card.textColor}>
                          {card.icon}
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      </div>
                    </div>
                    <div className="text-gray-400 hover:text-gray-600">
                      <span className="text-xs">Clique para detalhes</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => handleQuickAction('start')}
                  className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Play className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Iniciar</span>
                </button>
                <button
                  onClick={() => handleQuickAction('pause')}
                  className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <Pause className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-700">Pausar</span>
                </button>
                <button
                  onClick={() => handleQuickAction('stop')}
                  className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                                              <Square className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-700">Parar</span>
                </button>
                <button
                  onClick={() => handleQuickAction('duplicate')}
                  className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Copy className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Duplicar</span>
                </button>
              </div>
            </div>

            {/* Workflows List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Workflows Recentes</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar workflows..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="active">Ativos</option>
                      <option value="paused">Pausados</option>
                      <option value="stopped">Parados</option>
                      <option value="draft">Rascunhos</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Execuções
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Execução
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWorkflows.map((workflow) => (
                      <tr key={workflow.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleWorkflowClick(workflow)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{workflow.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(workflow.type)}`}>
                            {getTypeText(workflow.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                            {getStatusText(workflow.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workflow.execution_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {workflow.last_executed ? formatDate(workflow.last_executed) : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Play className="h-4 w-4" />
                            </button>
                            <button className="text-yellow-600 hover:text-yellow-900">
                              <Pause className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                                                              <Square className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h3>
            <p className="text-gray-600">
              Conteúdo específico para a aba {tabs.find(tab => tab.id === activeTab)?.name} será implementado aqui.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedWorkflow ? 'Detalhes do Workflow' : 'Ação do Sistema'}
              </h3>
              {selectedWorkflow ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome</p>
                    <p className="text-sm text-gray-900">{selectedWorkflow.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Descrição</p>
                    <p className="text-sm text-gray-900">{selectedWorkflow.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedWorkflow.type)}`}>
                      {getTypeText(selectedWorkflow.type)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedWorkflow.status)}`}>
                      {getStatusText(selectedWorkflow.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Execuções</p>
                    <p className="text-sm text-gray-900">{selectedWorkflow.execution_count}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Taxa de Sucesso</p>
                    <p className="text-sm text-gray-900">{selectedWorkflow.success_rate}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duração Média</p>
                    <p className="text-sm text-gray-900">{selectedWorkflow.average_duration}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Criado por</p>
                    <p className="text-sm text-gray-900">{selectedWorkflow.created_by}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Funcionalidade em desenvolvimento. Esta ação será implementada em breve.
                </p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 