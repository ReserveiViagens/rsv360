// ===================================================================
// RESERVATIONS RSV PAGE - PÁGINA DEDICADA PARA GESTÃO DE RESERVAS
// ===================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../src/context/AuthContext';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NotificationProvider } from '../src/context/NotificationContext';
import { NotificationBell, NotificationToastContainer } from '../src/components/notifications';
import { BookingCalendar, BookingModal, BookingViewModal } from '../src/components/bookings';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Settings,
  Menu,
  X,
  LogOut,
  BarChart3,
  Users,
  MapPin,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Clock,
  FileText
} from 'lucide-react';

// ===================================================================
// TIPOS
// ===================================================================

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  destination: string;
  checkIn: Date;
  checkOut: Date;
  value: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  guests: number;
  notes?: string;
}

// ===================================================================
// COMPONENTE DE LISTA DE RESERVAS
// ===================================================================

interface BookingsListTabProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking | string) => void;
  onView: (booking: Booking) => void;
}

const BookingsListTab: React.FC<BookingsListTabProps> = ({ bookings, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = 
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [bookings, searchTerm, statusFilter, paymentFilter]);

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const icons = {
      confirmed: <CheckCircle className="w-4 h-4" />,
      pending: <AlertCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    const labels = {
      confirmed: 'Confirmada',
      pending: 'Pendente',
      cancelled: 'Cancelada'
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    const labels = {
      paid: 'Pago',
      pending: 'Pendente',
      failed: 'Falhou'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (filteredBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
        <p className="text-gray-600">Tente ajustar os filtros ou criar uma nova reserva.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, destino ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os Status</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Canceladas</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os Pagamentos</option>
            <option value="paid">Pagos</option>
            <option value="pending">Pendentes</option>
            <option value="failed">Falhados</option>
          </select>
        </div>
      </div>

      {/* Tabela de Reservas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destino
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hóspedes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                      <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.destination}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.checkIn).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      até {new Date(booking.checkOut).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.guests} pessoa{booking.guests !== 1 ? 's' : ''}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      R$ {booking.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getPaymentBadge(booking.paymentStatus)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(booking)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(booking)}
                        className="text-yellow-600 hover:text-yellow-900 p-1"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(booking)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{filteredBookings.length}</span> de{' '}
            <span className="font-medium">{bookings.length}</span> reservas
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// COMPONENTE DE ANALYTICS
// ===================================================================

interface AnalyticsTabProps {
  bookings: Booking[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ bookings }) => {
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' && b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.value, 0);
    const pendingRevenue = bookings
      .filter(b => b.status === 'confirmed' && b.paymentStatus === 'pending')
      .reduce((sum, b) => sum + b.value, 0);
    const avgBookingValue = totalBookings > 0
      ? bookings.reduce((sum, b) => sum + b.value, 0) / totalBookings
      : 0;
    const totalGuests = bookings.reduce((sum, b) => sum + b.guests, 0);
    const avgGuestsPerBooking = totalBookings > 0 ? totalGuests / totalBookings : 0;
    
    const statusDistribution = {
      confirmed: confirmedBookings,
      pending: pendingBookings,
      cancelled: cancelledBookings
    };

    const paymentDistribution = {
      paid: bookings.filter(b => b.paymentStatus === 'paid').length,
      pending: bookings.filter(b => b.paymentStatus === 'pending').length,
      failed: bookings.filter(b => b.paymentStatus === 'failed').length
    };

    const monthlyRevenue = bookings
      .filter(b => b.status === 'confirmed' && b.paymentStatus === 'paid')
      .reduce((acc, b) => {
        const month = new Date(b.checkIn).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + b.value;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      pendingRevenue,
      avgBookingValue,
      totalGuests,
      avgGuestsPerBooking,
      statusDistribution,
      paymentDistribution,
      monthlyRevenue
    };
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Reservas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita Total</p>
              <p className="text-3xl font-bold text-gray-900">R$ {stats.totalRevenue.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Valor Médio</p>
              <p className="text-3xl font-bold text-gray-900">R$ {Math.round(stats.avgBookingValue).toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Hóspedes Totais</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalGuests}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Distribuições */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Status</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Confirmadas</span>
                <span className="text-sm text-gray-600">{stats.statusDistribution.confirmed} ({stats.totalBookings > 0 ? ((stats.statusDistribution.confirmed / stats.totalBookings) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalBookings > 0 ? (stats.statusDistribution.confirmed / stats.totalBookings) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Pendentes</span>
                <span className="text-sm text-gray-600">{stats.statusDistribution.pending} ({stats.totalBookings > 0 ? ((stats.statusDistribution.pending / stats.totalBookings) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalBookings > 0 ? (stats.statusDistribution.pending / stats.totalBookings) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Canceladas</span>
                <span className="text-sm text-gray-600">{stats.statusDistribution.cancelled} ({stats.totalBookings > 0 ? ((stats.statusDistribution.cancelled / stats.totalBookings) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalBookings > 0 ? (stats.statusDistribution.cancelled / stats.totalBookings) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Pagamento</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Pagos</span>
                <span className="text-sm text-gray-600">{stats.paymentDistribution.paid} ({stats.totalBookings > 0 ? ((stats.paymentDistribution.paid / stats.totalBookings) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalBookings > 0 ? (stats.paymentDistribution.paid / stats.totalBookings) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Pendentes</span>
                <span className="text-sm text-gray-600">{stats.paymentDistribution.pending} ({stats.totalBookings > 0 ? ((stats.paymentDistribution.pending / stats.totalBookings) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalBookings > 0 ? (stats.paymentDistribution.pending / stats.totalBookings) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Falhados</span>
                <span className="text-sm text-gray-600">{stats.paymentDistribution.failed} ({stats.totalBookings > 0 ? ((stats.paymentDistribution.failed / stats.totalBookings) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalBookings > 0 ? (stats.paymentDistribution.failed / stats.totalBookings) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Reservas Confirmadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita Pendente</p>
              <p className="text-2xl font-bold text-gray-900">R$ {stats.pendingRevenue.toLocaleString('pt-BR')}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Média de Hóspedes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgGuestsPerBooking.toFixed(1)}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function ReservationsRSVPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'analytics'>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [bookings, setBookings] = useState<Booking[]>([]);

  // ===================================================================
  // DADOS MOCK
  // ===================================================================

  useEffect(() => {
    // Simular carregamento de reservas
    const mockBookings: Booking[] = [
      {
        id: '1',
        customerName: 'João Silva',
        customerEmail: 'joao.silva@email.com',
        customerPhone: '(11) 99999-9999',
        destination: 'Caldas Novas - GO',
        checkIn: new Date('2024-02-15'),
        checkOut: new Date('2024-02-18'),
        value: 1500,
        status: 'confirmed',
        paymentStatus: 'paid',
        guests: 4,
        notes: 'Cliente preferiu quarto com vista para a piscina'
      },
      {
        id: '2',
        customerName: 'Pedro Costa',
        customerEmail: 'pedro.costa@email.com',
        customerPhone: '(11) 77777-7777',
        destination: 'Fernando de Noronha - PE',
        checkIn: new Date('2024-03-01'),
        checkOut: new Date('2024-03-06'),
        value: 4500,
        status: 'confirmed',
        paymentStatus: 'paid',
        guests: 2,
        notes: 'Pacote completo com mergulho incluído'
      },
      {
        id: '3',
        customerName: 'Maria Santos',
        customerEmail: 'maria.santos@email.com',
        customerPhone: '(11) 88888-8888',
        destination: 'Gramado - RS',
        checkIn: new Date('2024-06-15'),
        checkOut: new Date('2024-06-19'),
        value: 7200,
        status: 'pending',
        paymentStatus: 'pending',
        guests: 4,
        notes: 'Reserva aguardando confirmação'
      }
    ];
    setBookings(mockBookings);
  }, []);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingBooking(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (booking: Booking | any) => {
    // Converter do tipo do BookingCalendar para o tipo da página
    const convertedBooking: Booking = {
      id: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail || '',
      customerPhone: booking.customerPhone || '',
      destination: booking.destination,
      checkIn: booking.checkIn instanceof Date ? booking.checkIn : new Date(booking.checkIn),
      checkOut: booking.checkOut instanceof Date ? booking.checkOut : new Date(booking.checkOut),
      value: booking.value,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      guests: booking.guests,
      notes: booking.notes || ''
    };
    setModalMode('edit');
    setEditingBooking(convertedBooking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBooking(null);
  };

  const handleSaveBooking = (booking: Booking) => {
    if (modalMode === 'create') {
      const newBooking: Booking = {
        ...booking,
        id: Date.now().toString()
      };
      setBookings([...bookings, newBooking]);
    } else {
      setBookings(bookings.map(b => b.id === booking.id ? booking : b));
    }
    handleCloseModal();
  };

  const handleDeleteBooking = (booking: Booking | string) => {
    const bookingId = typeof booking === 'string' ? booking : booking.id;
    if (confirm('Tem certeza que deseja excluir esta reserva?')) {
      setBookings(bookings.filter(b => b.id !== bookingId));
    }
  };

  const handleViewBooking = (booking: Booking | any) => {
    // Converter do tipo do BookingCalendar para o tipo da página
    const convertedBooking: Booking = {
      id: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail || '',
      customerPhone: booking.customerPhone || '',
      destination: booking.destination,
      checkIn: booking.checkIn instanceof Date ? booking.checkIn : new Date(booking.checkIn),
      checkOut: booking.checkOut instanceof Date ? booking.checkOut : new Date(booking.checkOut),
      value: booking.value,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      guests: booking.guests,
      notes: booking.notes || ''
    };
    setViewingBooking(convertedBooking);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingBooking(null);
  };

  const handleEditFromView = () => {
    if (viewingBooking) {
      setIsViewModalOpen(false);
      setModalMode('edit');
      setEditingBooking(viewingBooking);
      setIsModalOpen(true);
    }
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <ProtectedRoute>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
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
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestão de Reservas</h1>
                    <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Sistema completo de reservas com drag & drop</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                  <NotificationBell />
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500">{user?.role || 'Agente'}</p>
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

          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
              showSidebar ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className="h-full flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
                    title="Fechar menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                  <Link 
                    href="/dashboard-rsv" 
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 mr-3" />
                    Voltar ao Dashboard
                  </Link>
                  
                  <div className="pt-4">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Reservas
                    </h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('calendar');
                          setShowSidebar(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'calendar'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Calendar className="w-5 h-5 mr-3" />
                        Calendário
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveTab('list');
                          setShowSidebar(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'list'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Users className="w-5 h-5 mr-3" />
                        Lista de Reservas
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveTab('analytics');
                          setShowSidebar(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'analytics'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <BarChart3 className="w-5 h-5 mr-3" />
                        Analytics
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Outros
                    </h3>
                    <div className="space-y-1">
                      <Link 
                        href="/customers-rsv" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Users className="w-5 h-5 mr-3" />
                        Clientes
                      </Link>
                      <Link 
                        href="/travel-catalog-rsv" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <MapPin className="w-5 h-5 mr-3" />
                        Catálogo de Viagens
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Settings className="w-5 h-5 mr-3" />
                        Configurações
                      </Link>
                    </div>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Overlay para mobile */}
            {showSidebar && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setShowSidebar(false)}
              />
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Tab Navigation */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="border-b border-gray-200 flex-1">
                      <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
                        <button
                          onClick={() => setActiveTab('calendar')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                            activeTab === 'calendar'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Calendário</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab('list')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                            activeTab === 'list'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Lista</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab('analytics')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                            activeTab === 'analytics'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>Analytics</span>
                          </div>
                        </button>
                      </nav>
                    </div>
                    
                    <button
                      onClick={handleOpenCreateModal}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nova Reserva</span>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'calendar' && (
                  <BookingCalendar
                    bookings={bookings}
                    onBookingsChange={setBookings}
                    onView={handleViewBooking}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteBooking}
                  />
                )}
                {activeTab === 'list' && (
                  <BookingsListTab
                    bookings={bookings}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteBooking}
                    onView={handleViewBooking}
                  />
                )}
                {activeTab === 'analytics' && (
                  <AnalyticsTab bookings={bookings} />
                )}
              </div>
            </main>
          </div>
          
          {/* Modal de Visualização */}
          <BookingViewModal
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
            booking={viewingBooking}
            onEdit={handleEditFromView}
          />

          {/* Modal de Reserva (Criar/Editar) */}
          <BookingModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveBooking}
            booking={editingBooking}
            mode={modalMode}
          />
          
          <NotificationToastContainer />
        </div>
      </NotificationProvider>
    </ProtectedRoute>
  );
}
