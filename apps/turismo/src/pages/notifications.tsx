import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  BellOff,
  BellRing,
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
  RefreshCw,
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
  Lock,
  Unlock,
  Key,
  UserCheck,
  Users,
  UserPlus,
  UserX,
  UserCog,
  UserMinus,
  UserSearch,
  UserCheck2,
  UserX2,
  UserCog2,
  UserMinus2,
  Folder,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  BookOpen,
  Bookmark,
  BookmarkPlus,
  BookmarkMinus,
  BookmarkX,
  BookmarkCheck,
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
  Star as StarIcon
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  recipient: string;
  sender: string;
  created_at: string;
  read_at?: string;
  archived_at?: string;
  category: string;
  tags: string[];
  action_url?: string;
  expires_at?: string;
  is_scheduled: boolean;
  scheduled_for?: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Dados simulados
  const [stats] = useState({
    total_notifications: 1247,
    unread_notifications: 89,
    read_notifications: 1156,
    archived_notifications: 2,
    sent_today: 45,
    scheduled_notifications: 23,
    success_rate: 98.5,
    average_open_rate: 67.3,
    total_recipients: 2847,
    active_campaigns: 12
  });

  // Cards clicáveis de estatísticas
  const statsCards = [
    {
      id: 'total_notifications',
      title: 'Total de Notificações',
      value: stats.total_notifications.toString(),
      icon: <Bell className="h-6 w-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Notificações no sistema'
    },
    {
      id: 'unread_notifications',
      title: 'Não Lidas',
      value: stats.unread_notifications.toString(),
      icon: <BellRing className="h-6 w-6" />,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      description: 'Notificações pendentes'
    },
    {
      id: 'sent_today',
      title: 'Enviadas Hoje',
      value: stats.sent_today.toString(),
      icon: <Send className="h-6 w-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Notificações enviadas hoje'
    },
    {
      id: 'success_rate',
      title: 'Taxa de Sucesso',
      value: `${stats.success_rate}%`,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Taxa de entrega'
    },
    {
      id: 'open_rate',
      title: 'Taxa de Abertura',
      value: `${stats.average_open_rate}%`,
      icon: <Eye className="h-6 w-6" />,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Taxa média de abertura'
    },
    {
      id: 'active_campaigns',
      title: 'Campanhas Ativas',
      value: stats.active_campaigns.toString(),
      icon: <Target className="h-6 w-6" />,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      description: 'Campanhas em andamento'
    }
  ];

  const [notifications] = useState<Notification[]>([
    {
      id: 'NOT001',
      title: 'Nova Reserva Confirmada',
      message: 'Sua reserva para o Hotel Copacabana Palace foi confirmada para 15/02/2024.',
      type: 'success',
      priority: 'high',
      status: 'unread',
      recipient: 'joao.silva@email.com',
      sender: 'sistema@reserveiviagens.com',
      created_at: '2024-01-15T10:30:00',
      category: 'Reservas',
      tags: ['reserva', 'hotel', 'confirmação'],
      action_url: '/reservations/NOT001',
      expires_at: '2024-02-15T23:59:59',
      is_scheduled: false
    },
    {
      id: 'NOT002',
      title: 'Promoção Especial - Paris',
      message: 'Desconto de 20% em pacotes para Paris. Válido até 31/01/2024.',
      type: 'promotion',
      priority: 'medium',
      status: 'read',
      recipient: 'maria.santos@email.com',
      sender: 'marketing@reserveiviagens.com',
      created_at: '2024-01-15T09:15:00',
      read_at: '2024-01-15T09:20:00',
      category: 'Promoções',
      tags: ['promoção', 'paris', 'desconto'],
      action_url: '/promotions/paris-special',
      expires_at: '2024-01-31T23:59:59',
      is_scheduled: false
    },
    {
      id: 'NOT003',
      title: 'Lembrete de Voo',
      message: 'Seu voo para São Paulo parte em 2 horas. Confirme seu check-in online.',
      type: 'warning',
      priority: 'urgent',
      status: 'unread',
      recipient: 'pedro.costa@email.com',
      sender: 'voos@reserveiviagens.com',
      created_at: '2024-01-15T08:45:00',
      category: 'Voos',
      tags: ['voo', 'check-in', 'lembrete'],
      action_url: '/flights/check-in',
      expires_at: '2024-01-15T12:00:00',
      is_scheduled: false
    },
    {
      id: 'NOT004',
      title: 'Avaliação Pendente',
      message: 'Não se esqueça de avaliar sua experiência no Hotel Ipanema. Sua opinião é importante!',
      type: 'info',
      priority: 'low',
      status: 'read',
      recipient: 'ana.oliveira@email.com',
      sender: 'feedback@reserveiviagens.com',
      created_at: '2024-01-14T16:30:00',
      read_at: '2024-01-14T17:00:00',
      category: 'Feedback',
      tags: ['avaliação', 'hotel', 'feedback'],
      action_url: '/reviews/create',
      expires_at: '2024-01-21T23:59:59',
      is_scheduled: false
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'unread', name: 'Não Lidas', icon: BellRing },
    { id: 'read', name: 'Lidas', icon: CheckCircle },
    { id: 'archived', name: 'Arquivadas', icon: ArchiveIcon },
    { id: 'scheduled', name: 'Agendadas', icon: Clock }
  ];

  const handleCardClick = (cardId: string) => {
    setSelectedNotification(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada card
  };

  const handleQuickAction = (action: string) => {
    setSelectedNotification(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada ação
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'promotion':
        return 'bg-purple-100 text-purple-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'success':
        return 'Sucesso';
      case 'warning':
        return 'Aviso';
      case 'error':
        return 'Erro';
      case 'promotion':
        return 'Promoção';
      case 'info':
        return 'Informação';
      default:
        return 'Desconhecido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unread':
        return 'Não Lida';
      case 'read':
        return 'Lida';
      case 'archived':
        return 'Arquivada';
      default:
        return 'Desconhecido';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'promotion':
        return <Award className="h-5 w-5 text-purple-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
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

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || notification.status === selectedFilter;
    
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
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Notificações</h1>
              <p className="mt-2 text-gray-600">
                Gerencie notificações e comunicações com clientes
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
                Nova Notificação
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
                  onClick={() => handleQuickAction('send')}
                  className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Send className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Enviar Agora</span>
                </button>
                <button
                  onClick={() => handleQuickAction('schedule')}
                  className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Clock className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Agendar</span>
                </button>
                <button
                  onClick={() => handleQuickAction('template')}
                  className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <FileText className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-700">Templates</span>
                </button>
                <button
                  onClick={() => handleQuickAction('campaign')}
                  className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Target className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-700">Campanhas</span>
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Notificações Recentes</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar notificações..."
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
                      <option value="unread">Não Lidas</option>
                      <option value="read">Lidas</option>
                      <option value="archived">Arquivadas</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destinatário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNotifications.map((notification) => (
                      <tr key={notification.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTypeIcon(notification.type)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                              {getTypeText(notification.type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {notification.recipient}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                            {getStatusText(notification.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(notification.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <XCircle className="h-4 w-4" />
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
                {selectedNotification ? 'Detalhes da Notificação' : 'Ação do Sistema'}
              </h3>
              {selectedNotification ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Título</p>
                    <p className="text-sm text-gray-900">{selectedNotification.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mensagem</p>
                    <p className="text-sm text-gray-900">{selectedNotification.message}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedNotification.type)}`}>
                      {getTypeText(selectedNotification.type)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Destinatário</p>
                    <p className="text-sm text-gray-900">{selectedNotification.recipient}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedNotification.status)}`}>
                      {getStatusText(selectedNotification.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Categoria</p>
                    <p className="text-sm text-gray-900">{selectedNotification.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Criação</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedNotification.created_at)}</p>
                  </div>
                  {selectedNotification.action_url && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">URL de Ação</p>
                      <p className="text-sm text-gray-900">{selectedNotification.action_url}</p>
                    </div>
                  )}
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