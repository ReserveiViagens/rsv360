// ===================================================================
// CUSTOMER MANAGEMENT - SISTEMA COMPLETO DE GESTÃO DE CLIENTES
// ===================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Users,
  UserCheck,
  UserX,
  Download,
  Upload,
  MoreVertical,
  Heart,
  MessageSquare,
  CreditCard,
  History,
  FileText,
  Camera,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    destinations: string[];
    travelStyle: 'budget' | 'luxury' | 'adventure' | 'relaxation' | 'cultural';
    accommodation: 'hotel' | 'resort' | 'hostel' | 'apartment';
    activities: string[];
  };
  status: 'active' | 'inactive' | 'vip' | 'blocked';
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalBookings: number;
  totalSpent: number;
  lastBooking?: Date;
  nextBooking?: Date;
  notes: string;
  tags: string[];
  documents: CustomerDocument[];
  communicationHistory: Communication[];
  createdAt: Date;
  updatedAt: Date;
}

interface CustomerDocument {
  id: string;
  type: 'passport' | 'id' | 'cpf' | 'rg' | 'other';
  name: string;
  url: string;
  uploadDate: Date;
  expiryDate?: Date;
}

interface Communication {
  id: string;
  type: 'email' | 'phone' | 'whatsapp' | 'sms' | 'meeting';
  subject: string;
  content: string;
  date: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  direction: 'inbound' | 'outbound';
}

// ===================================================================
// COMPONENTE DE CARD DE CLIENTE
// ===================================================================

interface CustomerCardProps {
  customer: Customer;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onContact: (customer: Customer) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onView,
  onEdit,
  onDelete,
  onContact
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoyaltyColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTravelStyleIcon = (style: string) => {
    switch (style) {
      case 'budget': return <DollarSign className="w-4 h-4" />;
      case 'luxury': return <Star className="w-4 h-4" />;
      case 'adventure': return <MapPin className="w-4 h-4" />;
      case 'relaxation': return <Heart className="w-4 h-4" />;
      case 'cultural': return <FileText className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Header do Card */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                customer.status === 'active' ? 'bg-green-500' :
                customer.status === 'vip' ? 'bg-purple-500' :
                customer.status === 'blocked' ? 'bg-red-500' : 'bg-gray-500'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{customer.name}</h3>
              <p className="text-sm text-gray-600">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onView(customer)}
              className="p-1 text-gray-400 hover:text-blue-600"
              title="Visualizar"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(customer)}
              className="p-1 text-gray-400 hover:text-green-600"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onContact(customer)}
              className="p-1 text-gray-400 hover:text-purple-600"
              title="Contatar"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(customer)}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 space-y-3">
        {/* Status e Loyalty */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
            {customer.status === 'active' ? 'Ativo' :
             customer.status === 'inactive' ? 'Inativo' :
             customer.status === 'vip' ? 'VIP' : 'Bloqueado'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLoyaltyColor(customer.loyaltyLevel)}`}>
            {customer.loyaltyLevel.charAt(0).toUpperCase() + customer.loyaltyLevel.slice(1)}
          </span>
        </div>

        {/* Informações de Contato */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{customer.address.city}, {customer.address.state}</span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{customer.totalBookings}</div>
            <div className="text-xs text-gray-600">Reservas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              R$ {customer.totalSpent.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Gasto</div>
          </div>
        </div>

        {/* Preferências */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              {getTravelStyleIcon(customer.preferences.travelStyle)}
              <span className="ml-1 capitalize">{customer.preferences.travelStyle}</span>
            </div>
            {customer.lastBooking && (
              <div className="flex items-center text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                <span>
                  {new Date(customer.lastBooking).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {customer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {customer.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {customer.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{customer.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loyaltyFilter, setLoyaltyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'totalBookings' | 'lastBooking'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // ===================================================================
  // DADOS MOCK
  // ===================================================================

  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-9999',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'male',
        address: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil'
        },
        preferences: {
          destinations: ['Caldas Novas', 'Porto de Galinhas'],
          travelStyle: 'family',
          accommodation: 'resort',
          activities: ['piscina', 'spa', 'restaurante']
        },
        status: 'active',
        loyaltyLevel: 'gold',
        totalBookings: 8,
        totalSpent: 15600,
        lastBooking: new Date('2024-01-15'),
        nextBooking: new Date('2024-03-20'),
        notes: 'Cliente fiel, sempre viaja com a família. Prefere resorts com piscina.',
        tags: ['Família', 'Fiel', 'Caldas Novas'],
        documents: [],
        communicationHistory: [],
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(11) 88888-8888',
        dateOfBirth: new Date('1990-07-22'),
        gender: 'female',
        address: {
          street: 'Av. Paulista, 1000',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          country: 'Brasil'
        },
        preferences: {
          destinations: ['Fernando de Noronha', 'Búzios'],
          travelStyle: 'luxury',
          accommodation: 'hotel',
          activities: ['mergulho', 'spa', 'gastronomia']
        },
        status: 'vip',
        loyaltyLevel: 'platinum',
        totalBookings: 15,
        totalSpent: 45000,
        lastBooking: new Date('2024-01-10'),
        nextBooking: new Date('2024-04-15'),
        notes: 'Cliente VIP, gosta de destinos exclusivos e experiências de luxo.',
        tags: ['VIP', 'Luxo', 'Mergulho'],
        documents: [],
        communicationHistory: [],
        createdAt: new Date('2022-06-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        phone: '(11) 77777-7777',
        dateOfBirth: new Date('1988-11-08'),
        gender: 'male',
        address: {
          street: 'Rua Augusta, 500',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01305-000',
          country: 'Brasil'
        },
        preferences: {
          destinations: ['Gramado', 'Campos do Jordão'],
          travelStyle: 'adventure',
          accommodation: 'hotel',
          activities: ['trilha', 'gastronomia', 'cultura']
        },
        status: 'active',
        loyaltyLevel: 'silver',
        totalBookings: 5,
        totalSpent: 8500,
        lastBooking: new Date('2023-12-20'),
        notes: 'Gosta de destinos de montanha e atividades ao ar livre.',
        tags: ['Aventura', 'Montanha'],
        documents: [],
        communicationHistory: [],
        createdAt: new Date('2023-03-20'),
        updatedAt: new Date('2023-12-20')
      }
    ];

    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);
  }, []);

  // ===================================================================
  // FILTROS E BUSCA
  // ===================================================================

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Busca por texto
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.address.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    // Filtro por loyalty level
    if (loyaltyFilter !== 'all') {
      filtered = filtered.filter(customer => customer.loyaltyLevel === loyaltyFilter);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'totalBookings':
          return b.totalBookings - a.totalBookings;
        case 'lastBooking':
          if (!a.lastBooking && !b.lastBooking) return 0;
          if (!a.lastBooking) return 1;
          if (!b.lastBooking) return -1;
          return new Date(b.lastBooking).getTime() - new Date(a.lastBooking).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [customers, searchTerm, statusFilter, loyaltyFilter, sortBy]);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleViewCustomer = (customer: Customer) => {
    console.log('Visualizar cliente:', customer);
    // Implementar modal de visualização
  };

  const handleEditCustomer = (customer: Customer) => {
    console.log('Editar cliente:', customer);
    // Implementar modal de edição
  };

  const handleDeleteCustomer = (customer: Customer) => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${customer.name}?`)) {
      setCustomers(customers.filter(c => c.id !== customer.id));
    }
  };

  const handleContactCustomer = (customer: Customer) => {
    console.log('Contatar cliente:', customer);
    // Implementar sistema de comunicação
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes e relacionamentos</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes VIP</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.status === 'vip').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email, telefone ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
            title="Filtrar por status"
            aria-label="Filtrar clientes por status"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="vip">VIP</option>
            <option value="blocked">Bloqueados</option>
          </select>
          <select
            value={loyaltyFilter}
            onChange={(e) => setLoyaltyFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
            title="Filtrar por nível de fidelidade"
            aria-label="Filtrar clientes por nível de fidelidade"
          >
            <option value="all">Todos os Níveis</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Prata</option>
            <option value="gold">Ouro</option>
            <option value="platinum">Platina</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2"
            title="Ordenar clientes"
            aria-label="Ordenar lista de clientes"
          >
            <option value="name">Nome</option>
            <option value="totalSpent">Maior Gasto</option>
            <option value="totalBookings">Mais Reservas</option>
            <option value="lastBooking">Última Reserva</option>
          </select>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">
          {filteredCustomers.length} clientes encontrados
        </p>
      </div>

      {/* Grid de Clientes */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {filteredCustomers.map(customer => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onView={handleViewCustomer}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            onContact={handleContactCustomer}
          />
        ))}
      </div>

      {/* Mensagem quando não há resultados */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum cliente encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
