import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Download,
  Printer,
  Share2,
  Star,
  MessageSquare,
  FileText,
  CalendarDays,
  UserCheck,
  CreditCard as CreditCardIcon,
  DollarSign,
  Percent,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertCircle as AlertCircleIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Eye as EyeIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Printer as PrinterIcon,
  Share2 as Share2Icon,
  Star as StarIcon,
  MessageSquare as MessageSquareIcon,
  FileText as FileTextIcon,
  CalendarDays as CalendarDaysIcon,
  UserCheck as UserCheckIcon,
  DollarSign as DollarSignIcon,
  Percent as PercentIcon,
  TrendingUp as TrendingUpIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  Activity as ActivityIcon
} from 'lucide-react';

interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  notes: string;
  specialRequests: string;
  agent: string;
  commission: number;
  source: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'RES001',
      customerName: 'Maria Silva',
      customerEmail: 'maria.silva@email.com',
      customerPhone: '(11) 99999-9999',
      serviceType: 'Hotel',
      destination: 'Rio de Janeiro',
      checkIn: '2025-08-15',
      checkOut: '2025-08-20',
      guests: 2,
      totalAmount: 2500.00,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2025-07-25',
      notes: 'Cliente VIP, quarto com vista para o mar',
      specialRequests: 'Quarto com vista para o mar, cama king-size',
      agent: 'João Santos',
      commission: 125.00,
      source: 'Website',
      priority: 'high',
      tags: ['VIP', 'Praia', 'Premium']
    },
    {
      id: 'RES002',
      customerName: 'Carlos Oliveira',
      customerEmail: 'carlos.oliveira@email.com',
      customerPhone: '(21) 88888-8888',
      serviceType: 'Pacote',
      destination: 'Fernando de Noronha',
      checkIn: '2025-09-10',
      checkOut: '2025-09-15',
      guests: 4,
      totalAmount: 4500.00,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: '2025-07-26',
      notes: 'Pacote completo com passeios',
      specialRequests: 'Passeios de barco incluídos',
      agent: 'Ana Costa',
      commission: 225.00,
      source: 'Telefone',
      priority: 'medium',
      tags: ['Pacote', 'Ilha', 'Passeios']
    },
    {
      id: 'RES003',
      customerName: 'Patrícia Lima',
      customerEmail: 'patricia.lima@email.com',
      customerPhone: '(31) 77777-7777',
      serviceType: 'Voo',
      destination: 'São Paulo',
      checkIn: '2025-08-05',
      checkOut: '2025-08-05',
      guests: 1,
      totalAmount: 800.00,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: '2025-07-20',
      notes: 'Voo executivo',
      specialRequests: 'Assento na janela',
      agent: 'Pedro Alves',
      commission: 40.00,
      source: 'App Mobile',
      priority: 'low',
      tags: ['Voo', 'Executivo']
    }
  ]);

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  const paymentStatusColors = {
    pending: 'bg-orange-100 text-orange-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-purple-100 text-purple-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    const matchesSearch = reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    switch (sortBy) {
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'totalAmount':
        return b.totalAmount - a.totalAmount;
      case 'customerName':
        return a.customerName.localeCompare(b.customerName);
      case 'checkIn':
        return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
      default:
        return 0;
    }
  });

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    totalRevenue: reservations.reduce((sum, r) => sum + r.totalAmount, 0),
    totalCommission: reservations.reduce((sum, r) => sum + r.commission, 0)
  };

  const handleStatusChange = (reservationId: string, newStatus: Reservation['status']) => {
    setReservations(prev => prev.map(r => 
      r.id === reservationId ? { ...r, status: newStatus } : r
    ));
  };

  const handlePaymentStatusChange = (reservationId: string, newStatus: Reservation['paymentStatus']) => {
    setReservations(prev => prev.map(r => 
      r.id === reservationId ? { ...r, paymentStatus: newStatus } : r
    ));
  };

  const handleDeleteReservation = (reservationId: string) => {
    setReservations(prev => prev.filter(r => r.id !== reservationId));
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <CalendarDays className="mr-3 h-8 w-8 text-blue-600" />
                Gestão de Reservas
              </h1>
              <p className="text-gray-600 mt-2">Gerencie todas as reservas e agendamentos</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center font-medium transition-colors"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Nova Reserva
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSignIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, destino ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Data de Criação</option>
                <option value="totalAmount">Valor</option>
                <option value="customerName">Cliente</option>
                <option value="checkIn">Check-in</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reserva
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
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
                {sortedReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reservation.id}</div>
                        <div className="text-sm text-gray-500">{reservation.serviceType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                        <div className="text-sm text-gray-500">{reservation.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{reservation.destination}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{new Date(reservation.checkIn).toLocaleDateString('pt-BR')}</div>
                        <div className="text-gray-500">até {new Date(reservation.checkOut).toLocaleDateString('pt-BR')}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {reservation.totalAmount.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm text-gray-500">{reservation.guests} hóspedes</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[reservation.status]}`}>
                        {reservation.status === 'pending' && 'Pendente'}
                        {reservation.status === 'confirmed' && 'Confirmada'}
                        {reservation.status === 'completed' && 'Concluída'}
                        {reservation.status === 'cancelled' && 'Cancelada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[reservation.paymentStatus]}`}>
                        {reservation.paymentStatus === 'pending' && 'Pendente'}
                        {reservation.paymentStatus === 'paid' && 'Pago'}
                        {reservation.paymentStatus === 'refunded' && 'Reembolsado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowCreateModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReservation(reservation.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reservation Details Modal */}
        {showModal && selectedReservation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalhes da Reserva - {selectedReservation.id}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações do Cliente</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <UserCheckIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedReservation.customerName}</span>
                      </div>
                      <div className="flex items-center">
                        <MailIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedReservation.customerEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedReservation.customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Detalhes da Reserva</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(selectedReservation.checkIn).toLocaleDateString('pt-BR')} - {new Date(selectedReservation.checkOut).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedReservation.guests} hóspedes</span>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{selectedReservation.destination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações Financeiras</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor Total:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedReservation.totalAmount.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Comissão:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedReservation.commission.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Agente:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedReservation.agent}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status da Reserva:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedReservation.status]}`}>
                          {selectedReservation.status === 'pending' && 'Pendente'}
                          {selectedReservation.status === 'confirmed' && 'Confirmada'}
                          {selectedReservation.status === 'completed' && 'Concluída'}
                          {selectedReservation.status === 'cancelled' && 'Cancelada'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status do Pagamento:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[selectedReservation.paymentStatus]}`}>
                          {selectedReservation.paymentStatus === 'pending' && 'Pendente'}
                          {selectedReservation.paymentStatus === 'paid' && 'Pago'}
                          {selectedReservation.paymentStatus === 'refunded' && 'Reembolsado'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Prioridade:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[selectedReservation.priority]}`}>
                          {selectedReservation.priority === 'low' && 'Baixa'}
                          {selectedReservation.priority === 'medium' && 'Média'}
                          {selectedReservation.priority === 'high' && 'Alta'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes and Special Requests */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Observações e Solicitações Especiais</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observações:</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReservation.notes}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Solicitações Especiais:</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReservation.specialRequests}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReservation.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowCreateModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Reservation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedReservation ? 'Editar Reserva' : 'Nova Reserva'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedReservation(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações do Cliente</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                        <input
                          type="text"
                          defaultValue={selectedReservation?.customerName || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          defaultValue={selectedReservation?.customerEmail || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input
                          type="tel"
                          defaultValue={selectedReservation?.customerPhone || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Detalhes da Reserva</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Serviço</label>
                        <select
                          defaultValue={selectedReservation?.serviceType || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecione...</option>
                          <option value="Hotel">Hotel</option>
                          <option value="Pacote">Pacote</option>
                          <option value="Voo">Voo</option>
                          <option value="Carro">Carro</option>
                          <option value="Passeio">Passeio</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                        <input
                          type="text"
                          defaultValue={selectedReservation?.destination || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                          <input
                            type="date"
                            defaultValue={selectedReservation?.checkIn || ''}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                          <input
                            type="date"
                            defaultValue={selectedReservation?.checkOut || ''}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações Financeiras</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={selectedReservation?.totalAmount || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Hóspedes</label>
                        <input
                          type="number"
                          defaultValue={selectedReservation?.guests || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Agente</label>
                        <input
                          type="text"
                          defaultValue={selectedReservation?.agent || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status da Reserva</label>
                        <select
                          defaultValue={selectedReservation?.status || 'pending'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pendente</option>
                          <option value="confirmed">Confirmada</option>
                          <option value="completed">Concluída</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status do Pagamento</label>
                        <select
                          defaultValue={selectedReservation?.paymentStatus || 'pending'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pendente</option>
                          <option value="paid">Pago</option>
                          <option value="refunded">Reembolsado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                        <select
                          defaultValue={selectedReservation?.priority || 'medium'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="low">Baixa</option>
                          <option value="medium">Média</option>
                          <option value="high">Alta</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes and Special Requests */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Observações e Solicitações Especiais</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                      <textarea
                        rows={3}
                        defaultValue={selectedReservation?.notes || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Solicitações Especiais</label>
                      <textarea
                        rows={3}
                        defaultValue={selectedReservation?.specialRequests || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedReservation(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedReservation(null);
                    }}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {selectedReservation ? 'Atualizar' : 'Criar'} Reserva
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage; 