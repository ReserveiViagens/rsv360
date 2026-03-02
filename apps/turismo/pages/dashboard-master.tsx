import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3, Users, Building, Calendar, DollarSign, TrendingUp,
  Star, MapPin, Bell, Settings, Search, Filter, Download, Upload,
  Plus, Edit, Eye, Trash2, MoreHorizontal, Clock, CheckCircle,
  AlertCircle, XCircle, User, Hotel, Plane, Car, Camera, Gift,
  CreditCard, Phone, Mail, Globe, Shield, Award, Target, Zap,
  Heart, MessageCircle, Share2, Bookmark, Flag, Home, Menu,
  X, ChevronRight, ChevronDown, Layers, Database, Server, Cloud,
  FileText, Lock
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface DashboardStats {
  totalHotels: number;
  totalCustomers: number;
  totalBookings: number;
  totalRevenue: number;
  activeReservations: number;
  completedBookings: number;
  cancelledBookings: number;
  averageRating: number;
  occupancyRate: number;
  monthlyGrowth: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  count?: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'customer' | 'hotel' | 'payment';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
}

export default function DashboardMaster() {
  const [stats, setStats] = useState<DashboardStats>({
    totalHotels: 0,
    totalCustomers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeReservations: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    averageRating: 0,
    occupancyRate: 0,
    monthlyGrowth: 0
  });

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        totalHotels: 25,
        totalCustomers: 1247,
        totalBookings: 3892,
        totalRevenue: 2850000,
        activeReservations: 156,
        completedBookings: 3650,
        cancelledBookings: 86,
        averageRating: 4.7,
        occupancyRate: 78,
        monthlyGrowth: 12.5
      });

      setRecentActivities([
        {
          id: '1',
          type: 'booking',
          title: 'Nova Reserva Confirmada',
          description: 'Ana Silva - Resort Caldas Novas Premium - 3 diárias',
          time: '5 min atrás',
          status: 'success',
          icon: <Calendar className="w-4 h-4" />
        },
        {
          id: '2',
          type: 'customer',
          title: 'Novo Cliente Cadastrado',
          description: 'João Oliveira - Cliente Gold com 5200 pontos',
          time: '15 min atrás',
          status: 'info',
          icon: <Users className="w-4 h-4" />
        },
        {
          id: '3',
          type: 'payment',
          title: 'Pagamento Processado',
          description: 'R$ 2.500,00 - Reserva #RSV-2024-0892',
          time: '32 min atrás',
          status: 'success',
          icon: <CreditCard className="w-4 h-4" />
        },
        {
          id: '4',
          type: 'hotel',
          title: 'Hotel Atualizado',
          description: 'Pousada Familiar Rio Quente - Novas amenidades',
          time: '1 hora atrás',
          status: 'info',
          icon: <Building className="w-4 h-4" />
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'new-booking',
      title: 'Nova Reserva',
      description: 'Criar nova reserva para cliente',
      icon: <Calendar className="w-6 h-6" />,
      href: '/reservations-complete',
      color: 'bg-blue-500 hover:bg-blue-600',
      count: stats.activeReservations
    },
    {
      id: 'new-customer',
      title: 'Novo Cliente',
      description: 'Cadastrar novo cliente no sistema',
      icon: <Users className="w-6 h-6" />,
      href: '/customers-complete',
      color: 'bg-green-500 hover:bg-green-600',
      count: stats.totalCustomers
    },
    {
      id: 'new-hotel',
      title: 'Novo Hotel',
      description: 'Adicionar hotel ao catálogo',
      icon: <Building className="w-6 h-6" />,
      href: '/hotels-complete',
      color: 'bg-purple-500 hover:bg-purple-600',
      count: stats.totalHotels
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Visualizar relatórios e analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/reports-complete',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'finance',
      title: 'Financeiro',
      description: 'Gestão financeira e faturamento',
      icon: <DollarSign className="w-6 h-6" />,
      href: '/finance-complete',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Configurações do sistema',
      icon: <Settings className="w-6 h-6" />,
      href: '/settings-complete',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  const navigationItems = [
    {
      category: 'Dashboard',
      items: [
        { name: 'Dashboard Geral', href: '/dashboard-master', icon: <Home className="w-5 h-5" />, active: true },
        { name: 'Analytics', href: '/analytics-complete', icon: <BarChart3 className="w-5 h-5" /> },
        { name: 'Relatórios', href: '/reports-complete', icon: <FileText className="w-5 h-5" /> }
      ]
    },
    {
      category: 'Gestão Principal',
      items: [
        { name: 'Hotéis Completo', href: '/hotels-complete', icon: <Building className="w-5 h-5" /> },
        { name: 'Clientes Completo', href: '/customers-complete', icon: <Users className="w-5 h-5" /> },
        { name: 'Reservas Completo', href: '/reservations-complete', icon: <Calendar className="w-5 h-5" /> },
        { name: 'Financeiro', href: '/finance-complete', icon: <DollarSign className="w-5 h-5" /> }
      ]
    },
    {
      category: 'Sistemas RSV',
      items: [
        { name: 'Dashboard RSV', href: '/dashboard-rsv', icon: <Layers className="w-5 h-5" /> },
        { name: 'Hotéis RSV', href: '/hotels', icon: <Hotel className="w-5 h-5" /> },
        { name: 'Clientes RSV', href: '/customers-rsv', icon: <User className="w-5 h-5" /> },
        { name: 'Reservas RSV', href: '/reservations-rsv', icon: <Bookmark className="w-5 h-5" /> }
      ]
    },
    {
      category: 'E-commerce & Vendas',
      items: [
        { name: 'Produtos', href: '/products', icon: <Gift className="w-5 h-5" /> },
        { name: 'Pedidos', href: '/orders', icon: <CreditCard className="w-5 h-5" /> },
        { name: 'Estoque', href: '/inventory', icon: <Database className="w-5 h-5" /> },
        { name: 'Cupons', href: '/coupons', icon: <Star className="w-5 h-5" /> }
      ]
    },
    {
      category: 'Turismo & Viagens',
      items: [
        { name: 'Atrações', href: '/attractions', icon: <Camera className="w-5 h-5" /> },
        { name: 'Pacotes', href: '/travel-catalog-rsv', icon: <Plane className="w-5 h-5" /> },
        { name: 'Transportes', href: '/transport', icon: <Car className="w-5 h-5" /> },
        { name: 'Mapas', href: '/maps', icon: <MapPin className="w-5 h-5" /> }
      ]
    },
    {
      category: 'Gestão Avançada',
      items: [
        { name: 'Usuários', href: '/users', icon: <Shield className="w-5 h-5" /> },
        { name: 'Permissões', href: '/permissions', icon: <Lock className="w-5 h-5" /> },
        { name: 'Notificações', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
        { name: 'Configurações', href: '/settings', icon: <Settings className="w-5 h-5" /> }
      ]
    }
  ];

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <Building className="w-8 h-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">RSV 360</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {category.category}
              </div>
              {category.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    item.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className={`mr-3 ${item.active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-400 hover:text-gray-600 mr-4"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">🏢 Dashboard Master - Sistema Completo</h1>
                  <p className="text-sm text-gray-500">Visão geral de todas as funcionalidades do RSV 360</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="7days">Últimos 7 dias</option>
                  <option value="30days">Últimos 30 dias</option>
                  <option value="90days">Últimos 90 dias</option>
                  <option value="1year">Último ano</option>
                </select>

                <button className="relative p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Hotéis</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalHotels}</p>
                  <p className="text-xs text-green-600">+2 este mês</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalCustomers.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+{Math.round(stats.monthlyGrowth)}% crescimento</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reservas Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.activeReservations}</p>
                  <p className="text-xs text-blue-600">{stats.totalBookings} total</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : `R$ ${(stats.totalRevenue / 1000000).toFixed(1)}M`}
                  </p>
                  <p className="text-xs text-green-600">+15% vs mês anterior</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Performance Geral</h3>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Excelente</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.occupancyRate}%</div>
                  <div className="text-sm text-gray-600">Taxa de Ocupação</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: `${stats.occupancyRate}%`}}></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.averageRating}</div>
                  <div className="text-sm text-gray-600">Avaliação Média</div>
                  <div className="flex justify-center mt-2">
                    {[1,2,3,4,5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.floor(stats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((stats.completedBookings / stats.totalBookings) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Taxa de Conclusão</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: `${(stats.completedBookings / stats.totalBookings) * 100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status das Reservas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Confirmadas</span>
                  </div>
                  <span className="text-sm font-medium">{stats.completedBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Ativas</span>
                  </div>
                  <span className="text-sm font-medium">{stats.activeReservations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Canceladas</span>
                  </div>
                  <span className="text-sm font-medium">{stats.cancelledBookings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {quickActions.map((action) => (
                <Link key={action.id} href={action.href}>
                  <div className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 cursor-pointer`}>
                    <div className="flex items-center justify-between mb-2">
                      {action.icon}
                      {action.count && (
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-medium">
                          {action.count}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium mb-1">{action.title}</h4>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activities & Navigation Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Atividades Recentes</h3>
                <Link href="/activities" className="text-sm text-blue-600 hover:text-blue-800">
                  Ver todas
                </Link>
              </div>

              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${getActivityStatusColor(activity.status)}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Quick Links */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Acesso Rápido - Sistemas</h3>

              <div className="space-y-2">
                <div className="border rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Sistemas Completos (100%)</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link href="/hotels-complete" className="text-blue-600 hover:text-blue-800 flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      Hotéis Completo
                    </Link>
                    <Link href="/customers-complete" className="text-blue-600 hover:text-blue-800 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      Clientes Completo
                    </Link>
                    <Link href="/reservations-complete" className="text-blue-600 hover:text-blue-800 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Reservas Completo
                    </Link>
                    <Link href="/analytics-complete" className="text-blue-600 hover:text-blue-800 flex items-center">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Analytics Completo
                    </Link>
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Sistemas RSV Originais</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link href="/dashboard-rsv" className="text-green-600 hover:text-green-800 flex items-center">
                      <Layers className="w-3 h-3 mr-1" />
                      Dashboard RSV
                    </Link>
                    <Link href="/hotels" className="text-green-600 hover:text-green-800 flex items-center">
                      <Hotel className="w-3 h-3 mr-1" />
                      Hotéis RSV
                    </Link>
                    <Link href="/customers-rsv" className="text-green-600 hover:text-green-800 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      Clientes RSV
                    </Link>
                    <Link href="/reservations-rsv" className="text-green-600 hover:text-green-800 flex items-center">
                      <Bookmark className="w-3 h-3 mr-1" />
                      Reservas RSV
                    </Link>
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Sistemas Debug & Teste</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link href="/hotels-debug" className="text-purple-600 hover:text-purple-800 flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Hotéis Debug
                    </Link>
                    <Link href="/hotels-funcional" className="text-purple-600 hover:text-purple-800 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Hotéis Funcional
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
