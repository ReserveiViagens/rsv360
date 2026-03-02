'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Star,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  MessageSquare
} from 'lucide-react';

interface BookingStats {
  totalBookings: number;
  monthlyRevenue: number;
  activeCustomers: number;
  popularDestination: string;
  conversionRate: number;
  averageBookingValue: number;
}

interface RecentBooking {
  id: string;
  customerName: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  value: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

export default function DashboardRSV() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Dados simulados - em produção viriam da API
  const [stats] = useState<BookingStats>({
    totalBookings: 1247,
    monthlyRevenue: 156800,
    activeCustomers: 892,
    popularDestination: 'Caldas Novas',
    conversionRate: 23.4,
    averageBookingValue: 1258
  });

  const [recentBookings] = useState<RecentBooking[]>([
    {
      id: '1',
      customerName: 'João Silva',
      destination: 'Caldas Novas - GO',
      checkIn: '2025-08-15',
      checkOut: '2025-08-18',
      value: 1500,
      status: 'confirmed',
      paymentStatus: 'paid'
    },
    {
      id: '2',
      customerName: 'Maria Santos',
      destination: 'Porto de Galinhas - PE',
      checkIn: '2025-08-20',
      checkOut: '2025-08-25',
      value: 2200,
      status: 'pending',
      paymentStatus: 'pending'
    },
    {
      id: '3',
      customerName: 'Pedro Costa',
      destination: 'Fernando de Noronha - PE',
      checkIn: '2025-09-01',
      checkOut: '2025-09-07',
      value: 4500,
      status: 'confirmed',
      paymentStatus: 'paid'
    },
    {
      id: '4',
      customerName: 'Ana Oliveira',
      destination: 'Gramado - RS',
      checkIn: '2025-08-30',
      checkOut: '2025-09-02',
      value: 1800,
      status: 'cancelled',
      paymentStatus: 'failed'
    }
  ]);

  const quickActions: QuickAction[] = [
    {
      title: 'Nova Reserva',
      description: 'Criar nova reserva para cliente',
      icon: <Plus className="w-6 h-6" />,
      action: () => window.location.href = '/minhas-reservas',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Adicionar Cliente',
      description: 'Cadastrar novo cliente',
      icon: <Users className="w-6 h-6" />,
      action: () => window.location.href = '/crm',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'CRM - Atendimento',
      description: 'Sistema de gestão de clientes',
      icon: <UserCheck className="w-6 h-6" />,
      action: () => window.location.href = '/crm',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Relatório Mensal',
      description: 'Gerar relatório de vendas',
      icon: <BarChart3 className="w-6 h-6" />,
      action: () => window.location.href = '/dashboard-estatisticas',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Configurações',
      description: 'Configurar sistema',
      icon: <Settings className="w-6 h-6" />,
      action: () => window.location.href = '/admin/profile',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    // Implementar logout
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                title="Abrir menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-2xl font-bold text-gray-900">Reservei Viagens</h1>
                <p className="text-sm text-gray-500">Dashboard de Gestão</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500 relative" title="Notificações">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Usuário Admin</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
                title="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              <Link href="/dashboard-rsv" className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                <Activity className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              <Link href="/minhas-reservas" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <Calendar className="w-5 h-5 mr-3" />
                Reservas
              </Link>
              <Link href="/crm" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <Users className="w-5 h-5 mr-3" />
                Clientes
              </Link>
              <Link href="/crm" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <UserCheck className="w-5 h-5 mr-3" />
                CRM - Atendimento
              </Link>
              <Link href="/trips" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <MapPin className="w-5 h-5 mr-3" />
                Viagens
              </Link>
              <Link href="/dashboard-estatisticas" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <BarChart3 className="w-5 h-5 mr-3" />
                Relatórios
              </Link>
              <Link href="/admin/profile" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <Settings className="w-5 h-5 mr-3" />
                Configurações
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">Visão geral do seu negócio de viagens</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% este mês
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                    <p className="text-2xl font-bold text-gray-900">R$ {stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8% este mês
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5% este mês
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Destino Popular</p>
                    <p className="text-lg font-semibold text-gray-900">{stats.popularDestination}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  Mais reservado
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Ações Rápidas</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`${action.color} text-white p-4 rounded-lg text-left transition-colors duration-200`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm opacity-90 mt-1">{action.description}</p>
                        </div>
                        {action.icon}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Reservas Recentes</h2>
                  <Link href="/minhas-reservas" className="text-sm text-blue-600 hover:text-blue-500 flex items-center">
                    Ver todas <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destino
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pagamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.destination}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(booking.checkIn).toLocaleDateString('pt-BR')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(booking.checkOut).toLocaleDateString('pt-BR')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">R$ {booking.value.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status === 'confirmed' ? 'Confirmada' :
                             booking.status === 'pending' ? 'Pendente' : 'Cancelada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus === 'paid' ? 'Pago' :
                             booking.paymentStatus === 'pending' ? 'Pendente' : 'Falhou'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900" title="Visualizar reserva">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900" title="Editar reserva">
                              <Edit className="w-4 h-4" />
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
        </div>
      </div>
    </div>
  );
}
