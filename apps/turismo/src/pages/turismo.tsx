import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import {
  Plane,
  MapPin,
  Calendar,
  Hotel,
  Car,
  Mountain,
  Ticket,
  Star,
  TrendingUp,
  Users,
  Globe,
  Heart,
  Plus,
  Search,
  Filter,
  Settings,
  Bell,
  X,
  Edit,
  Trash,
  Eye,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  DollarSign,
  UserPlus,
  FileText,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

// Interfaces para tipagem
interface ServiceCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  status: 'online' | 'offline' | 'warning';
  color: string;
  count?: number;
  revenue?: number;
}

interface TurismoData {
  viagensAtivas: number;
  reservasHoje: number;
  clientes: number;
  receita: number;
  servicos: ServiceCard[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

// Componente Modal reutilizável
function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Notificação
function NotificationToast({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${getBgColor()} shadow-lg max-w-sm`}>
      <div className="flex items-start">
        {getIcon()}
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        </div>
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Turismo() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Estados para funcionalidades avançadas
  const [turismoData, setTurismoData] = useState<TurismoData>({
    viagensAtivas: 1234,
    reservasHoje: 89,
    clientes: 5678,
    receita: 45600,
    servicos: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showNewTravel, setShowNewTravel] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notificationCounter, setNotificationCounter] = useState(0);

  // Dados dos serviços de turismo
  const turismoServices: ServiceCard[] = [
    {
      id: 'travel',
      name: 'Viagens',
      description: 'Gestão completa de viagens e reservas',
      icon: <Plane className="h-8 w-8" />,
      href: '/travel',
      status: 'online',
      color: 'bg-blue-500',
      count: 1234,
      revenue: 25000
    },
    {
      id: 'attractions',
      name: 'Atrações',
      description: 'Pontos turísticos e atividades',
      icon: <Mountain className="h-8 w-8" />,
      href: '/attractions',
      status: 'online',
      color: 'bg-green-500',
      count: 567,
      revenue: 12000
    },
    {
      id: 'parks',
      name: 'Parques',
      description: 'Parques temáticos e naturais',
      icon: <MapPin className="h-8 w-8" />,
      href: '/parks',
      status: 'online',
      color: 'bg-purple-500',
      count: 234,
      revenue: 8000
    },
    {
      id: 'tickets',
      name: 'Ingressos',
      description: 'Venda e gestão de ingressos',
      icon: <Ticket className="h-8 w-8" />,
      href: '/tickets',
      status: 'online',
      color: 'bg-orange-500',
      count: 1890,
      revenue: 15000
    },
    {
      id: 'hotels',
      name: 'Hotéis',
      description: 'Reservas de hospedagem',
      icon: <Hotel className="h-8 w-8" />,
      href: '/hotels',
      status: 'online',
      color: 'bg-indigo-500',
      count: 456,
      revenue: 18000
    },
    {
      id: 'transport',
      name: 'Transporte',
      description: 'Serviços de transporte',
      icon: <Car className="h-8 w-8" />,
      href: '/transport',
      status: 'online',
      color: 'bg-red-500',
      count: 789,
      revenue: 9500
    }
  ];

  // Simular carregamento de dados
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTurismoData(prev => ({ ...prev, servicos: turismoServices }));
      setIsLoading(false);
      addNotification('success', 'Dados carregados', 'Informações de turismo atualizadas com sucesso!');
    };
    
    loadData();
  }, []);

  // Funções utilitárias
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return 'ðŸŸ¢';
      case 'offline': return 'ðŸ”´';
      case 'warning': return 'ðŸŸ¡';
      default: return 'âšª';
    }
  };

  // Sistema de notificações com keys únicas
  const addNotification = (type: Notification['type'], title: string, message: string) => {
    const newId = `notification-${Date.now()}-${notificationCounter}`;
    setNotificationCounter(prev => prev + 1);
    
    const newNotification: Notification = {
      id: newId,
      type,
      title,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      removeNotification(newId);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Funções de ação
  const handleNewTravel = () => {
    setShowNewTravel(true);
  };

  const handleNewTicket = () => {
    setShowNewTicket(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addNotification('info', 'Dados atualizados', 'Informações foram atualizadas!');
    }, 1000);
  };

  const handleExport = () => {
    addNotification('success', 'Exportação', 'Relatório exportado com sucesso!');
  };

  // Filtros
  const filteredServices = turismoServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || service.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Formulário de Nova Viagem
  const NewTravelForm = () => {
    const [formData, setFormData] = useState({
      destino: '',
      dataInicio: '',
      dataFim: '',
      passageiros: 1,
      tipo: 'lazer'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addNotification('success', 'Viagem criada', 'Nova viagem registrada com sucesso!');
      setShowNewTravel(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
          <input
            type="text"
            value={formData.destino}
            onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={formData.dataInicio}
              onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={formData.dataFim}
              onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passageiros</label>
            <input
              type="number"
              min="1"
              value={formData.passageiros}
              onChange={(e) => setFormData(prev => ({ ...prev, passageiros: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lazer">Lazer</option>
              <option value="negocio">Negócio</option>
              <option value="evento">Evento</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setShowNewTravel(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Criar Viagem
          </button>
        </div>
      </form>
    );
  };

  // Formulário de Novo Ingresso
  const NewTicketForm = () => {
    const [formData, setFormData] = useState({
      evento: '',
      data: '',
      quantidade: 1,
      tipo: 'padrao',
      preco: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addNotification('success', 'Ingresso vendido', 'Venda de ingresso registrada com sucesso!');
      setShowNewTicket(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Evento/Atração</label>
          <input
            type="text"
            value={formData.evento}
            onChange={(e) => setFormData(prev => ({ ...prev, evento: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
            <input
              type="number"
              min="1"
              value={formData.quantidade}
              onChange={(e) => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="padrao">Padrão</option>
              <option value="vip">VIP</option>
              <option value="familia">Família</option>
              <option value="estudante">Estudante</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setShowNewTicket(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
          >
            Vender Ingresso
          </button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">Carregando dados de turismo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Notificações */}
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      {/* Header com funcionalidades avançadas */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b border-gray-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Turismo
              </h1>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Sistema completo de gestão turística
              </p>
            </div>
            
            {/* Barra de ferramentas */}
            <div className="flex items-center space-x-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900'
                  }`}
                />
              </div>
              
              {/* Filtros */}
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900'
                }`}
              >
                <option value="all">Todos</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="warning">Atenção</option>
              </select>
              
              {/* Botões de ação */}
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleExport}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Exportar relatório"
              >
                <Download className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Configurações"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <div className="flex items-center">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mr-2`}>
                  Bem-vindo,
                </span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user?.full_name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview com dados dinâmicos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Viagens Ativas
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {turismoData.viagensAtivas.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Reservas Hoje
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {turismoData.reservasHoje}
                </p>
              </div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Clientes
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {turismoData.clientes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Receita
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  R$ {(turismoData.receita / 1000).toFixed(1)}k
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid com funcionalidades avançadas */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Serviços de Turismo
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                  Acesse todos os módulos do sistema turístico
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {filteredServices.length} serviços
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={`border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => router.push(service.href)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${service.color} text-white`}>
                      {service.icon}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)} {service.status}
                    </span>
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {service.name}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {service.description}
                  </p>
                  
                  {/* Estatísticas do serviço */}
                  {service.count && (
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total: {service.count.toLocaleString()}
                      </span>
                      {service.revenue && (
                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          R$ {(service.revenue / 1000).toFixed(1)}k
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-blue-600 font-medium">
                    Acessar
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions com popups */}
        <div className={`mt-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Ações Rápidas
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleNewTravel}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plane className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Nova Viagem</span>
              </button>
              
              <button
                onClick={handleNewTicket}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Ticket className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Vender Ingresso</span>
              </button>
              
              <button
                onClick={() => router.push('/attractions')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mountain className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Gerenciar Atrações</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      <Modal
        isOpen={showNewTravel}
        onClose={() => setShowNewTravel(false)}
        title="Nova Viagem"
      >
        <NewTravelForm />
      </Modal>

      <Modal
        isOpen={showNewTicket}
        onClose={() => setShowNewTicket(false)}
        title="Vender Ingresso"
      >
        <NewTicketForm />
      </Modal>

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Configurações"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 
