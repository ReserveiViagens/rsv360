import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Star,
  Heart,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Award,
  FileText,
  Camera,
  Settings,
  Bell,
  Globe,
  Building,
  Plane,
  Car,
  Bus,
  Train,
  Ship,
  Bike,
  Footprints
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  birthDate: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  preferences: string[];
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  status: 'active' | 'inactive' | 'vip' | 'new';
  notes: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  documents?: {
    id: string;
    name: string;
    type: 'passport' | 'id' | 'visa' | 'other';
    url: string;
    uploadedAt: string;
  }[];
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  vipCustomers: number;
  newCustomers: number;
  averageSpending: number;
  topDestination: string;
}

export default function CustomersRSV() {
  const { user } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  // Dados simulados - em produção viriam da API
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-9999',
        document: '123.456.789-00',
        birthDate: '1985-03-15',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil',
        preferences: ['Praia', 'Família', 'Águas termais', 'Caldas Novas'],
        totalBookings: 5,
        totalSpent: 8500,
        lastBooking: '2025-01-15',
        status: 'vip',
        notes: 'Cliente fiel, sempre viaja com família. Prefere Caldas Novas.',
        createdAt: '2020-01-15T10:30:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
        emergencyContact: {
          name: 'Maria Silva',
          phone: '(11) 88888-8888',
          relationship: 'Esposa'
        },
        documents: [
          {
            id: '1',
            name: 'CPF',
            type: 'id',
            url: '/documents/cpf-joao-silva.pdf',
            uploadedAt: '2020-01-15T10:30:00Z'
          }
        ]
      },
      {
        id: '2',
        name: 'Ana Oliveira',
        email: 'ana.oliveira@email.com',
        phone: '(11) 88888-8888',
        document: '987.654.321-00',
        birthDate: '1990-07-22',
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        country: 'Brasil',
        preferences: ['Romance', 'Praia', 'Luxo', 'Porto de Galinhas'],
        totalBookings: 3,
        totalSpent: 5200,
        lastBooking: '2025-01-16',
        status: 'active',
        notes: 'Cliente que gosta de viagens românticas e luxuosas.',
        createdAt: '2022-03-10T14:20:00Z',
        updatedAt: '2025-01-16T14:20:00Z',
        emergencyContact: {
          name: 'Carlos Oliveira',
          phone: '(11) 77777-7777',
          relationship: 'Marido'
        }
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        phone: '(11) 77777-7777',
        document: '456.789.123-00',
        birthDate: '1988-11-05',
        address: 'Rua Augusta, 500',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01212-000',
        country: 'Brasil',
        preferences: ['Aventura', 'Natureza', 'Fernando de Noronha'],
        totalBookings: 2,
        totalSpent: 4500,
        lastBooking: '2025-01-17',
        status: 'active',
        notes: 'Cliente aventureiro, gosta de destinos exóticos.',
        createdAt: '2023-06-20T09:15:00Z',
        updatedAt: '2025-01-17T09:15:00Z'
      },
      {
        id: '4',
        name: 'Lucia Ferreira',
        email: 'lucia.ferreira@email.com',
        phone: '(11) 66666-6666',
        document: '789.123.456-00',
        birthDate: '1975-12-18',
        address: 'Rua Oscar Freire, 200',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01426-000',
        country: 'Brasil',
        preferences: ['Cultura', 'História', 'Europa'],
        totalBookings: 0,
        totalSpent: 0,
        lastBooking: '',
        status: 'new',
        notes: 'Cliente novo, interessada em viagens culturais para Europa.',
        createdAt: '2025-01-18T16:45:00Z',
        updatedAt: '2025-01-18T16:45:00Z'
      }
    ];

    setCustomers(mockCustomers);
    setFilteredCustomers(mockCustomers);
  }, []);

  // Filtros e busca
  useEffect(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Customer];
      let bValue: any = b[sortBy as keyof Customer];

      if (sortBy === 'totalSpent' || sortBy === 'totalBookings') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter, sortBy, sortOrder]);

  const stats: CustomerStats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active' || c.status === 'vip').length,
    vipCustomers: customers.filter(c => c.status === 'vip').length,
    newCustomers: customers.filter(c => c.status === 'new').length,
    averageSpending: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0,
    topDestination: 'Caldas Novas'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'vip': return 'VIP';
      case 'new': return 'Novo';
      case 'inactive': return 'Inativo';
      default: return status;
    }
  };

  const handleCreateCustomer = () => {
    setShowCreateModal(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCreateModal(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setCustomers(customers.filter(c => c.id !== customerId));
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/dashboard-rsv" className="text-gray-400 hover:text-gray-500 mr-4">
                  ← Voltar ao Dashboard
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h1>
                  <p className="text-sm text-gray-500">Gerencie todos os clientes da Reservei Viagens</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCreateCustomer}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Novo Cliente
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">VIP</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.vipCustomers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Novos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newCustomers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Média</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {Math.round(stats.averageSpending).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Top Destino</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.topDestination}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros e Controles */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="active">Ativos</option>
                    <option value="vip">VIP</option>
                    <option value="new">Novos</option>
                    <option value="inactive">Inativos</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        viewMode === 'list' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Lista
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        viewMode === 'cards' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Cards
                    </button>
                  </div>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Clientes */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Clientes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center hover:text-gray-700"
                        >
                          Cliente
                          {sortBy === 'name' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localização
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('totalBookings')}
                          className="flex items-center hover:text-gray-700"
                        >
                          Reservas
                          {sortBy === 'totalBookings' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('totalSpent')}
                          className="flex items-center hover:text-gray-700"
                        >
                          Total Gasto
                          {sortBy === 'totalSpent' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.document}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{customer.city}, {customer.state}</div>
                            <div className="text-sm text-gray-500">{customer.country}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{customer.totalBookings}</div>
                          <div className="text-sm text-gray-500">
                            Última: {customer.lastBooking ? new Date(customer.lastBooking).toLocaleDateString('pt-BR') : 'Nunca'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">R$ {customer.totalSpent.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                            {getStatusText(customer.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewCustomer(customer)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditCustomer(customer)}
                              className="text-green-600 hover:text-green-900"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="text-red-600 hover:text-red-900"
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
            </div>
          )}

          {/* Visualização em Cards */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                            {getStatusText(customer.status)}
                          </span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {customer.city}, {customer.state}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reservas: <span className="font-medium text-gray-900">{customer.totalBookings}</span></span>
                        <span className="text-gray-600">Total: <span className="font-medium text-gray-900">R$ {customer.totalSpent.toLocaleString()}</span></span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button 
                        onClick={() => handleViewCustomer(customer)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Ver Detalhes
                      </button>
                      <button 
                        onClick={() => handleEditCustomer(customer)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Criação/Edição de Cliente */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedCustomer(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="text-center py-8">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Formulário de Cliente</h3>
                  <p className="text-gray-500">Formulário completo será implementado em breve</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização de Cliente */}
        {showViewModal && selectedCustomer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Perfil do Cliente</h3>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedCustomer(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="text-center py-8">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedCustomer.name}</h3>
                  <p className="text-gray-500">Perfil detalhado será implementado em breve</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
