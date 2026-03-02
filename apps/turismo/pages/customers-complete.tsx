import React, { useState, useEffect } from 'react';
import {
  User, Users, Search, Filter, Plus, Edit, Trash2, Eye, Mail, Phone,
  MapPin, Calendar, Star, DollarSign, Download, Upload, FileText,
  Heart, MessageCircle, Gift, CreditCard, Clock, CheckCircle, AlertCircle,
  X, Save, Loader, UserPlus, UserCheck, UserX, Building, Camera,
  Briefcase, Globe, Shield, Award, Target, TrendingUp, BarChart3
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Customer {
  id?: number;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: 'M' | 'F' | 'Other';
    nationality: string;
    profession: string;
    company?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  documents: {
    cpf: string;
    rg: string;
    passport?: string;
    driverLicense?: string;
  };
  preferences: {
    travelType: string[];
    budget: string;
    accommodation: string[];
    activities: string[];
    dietary: string[];
    accessibility: string[];
  };
  loyaltyProgram: {
    status: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    points: number;
    totalSpent: number;
    joinDate: string;
    benefits: string[];
  };
  bookingHistory: {
    totalBookings: number;
    totalSpent: number;
    averageRating: number;
    lastBooking: string;
    favoriteDestinations: string[];
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  marketingPreferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    promotionalOffers: boolean;
    newsletter: boolean;
  };
  status: 'active' | 'inactive' | 'blocked' | 'vip';
  tags: string[];
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

const initialCustomerData: Customer = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'M',
    nationality: 'Brasileira',
    profession: '',
    company: ''
  },
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil'
  },
  documents: {
    cpf: '',
    rg: '',
    passport: '',
    driverLicense: ''
  },
  preferences: {
    travelType: [],
    budget: 'medium',
    accommodation: [],
    activities: [],
    dietary: [],
    accessibility: []
  },
  loyaltyProgram: {
    status: 'Bronze',
    points: 0,
    totalSpent: 0,
    joinDate: new Date().toISOString().split('T')[0],
    benefits: []
  },
  bookingHistory: {
    totalBookings: 0,
    totalSpent: 0,
    averageRating: 0,
    lastBooking: '',
    favoriteDestinations: []
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
    email: ''
  },
  marketingPreferences: {
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    promotionalOffers: true,
    newsletter: true
  },
  status: 'active',
  tags: [],
  notes: ''
};

export default function CustomersComplete() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLoyalty, setSelectedLoyalty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('personalInfo.firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Customer>(initialCustomerData);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Carregar clientes completos na inicialização
  useEffect(() => {
    loadCustomersComplete();
  }, []);

  const loadCustomersComplete = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockCustomers: Customer[] = [
        {
          id: 1,
          personalInfo: {
            firstName: "Ana",
            lastName: "Silva Santos",
            email: "ana.silva@email.com",
            phone: "(11) 99888-7777",
            dateOfBirth: "1985-03-15",
            gender: "F",
            nationality: "Brasileira",
            profession: "Advogada",
            company: "Silva & Associados"
          },
          address: {
            street: "Rua das Flores, 123, Apt 45",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567",
            country: "Brasil"
          },
          documents: {
            cpf: "123.456.789-00",
            rg: "12.345.678-9",
            passport: "BR123456",
            driverLicense: "12345678900"
          },
          preferences: {
            travelType: ["Negócios", "Lazer", "Família"],
            budget: "high",
            accommodation: ["Hotel 5 estrelas", "Resort", "Pousada Boutique"],
            activities: ["Spa", "Turismo Cultural", "Gastronomia", "Compras"],
            dietary: ["Vegetariana"],
            accessibility: []
          },
          loyaltyProgram: {
            status: "Gold",
            points: 15750,
            totalSpent: 45000,
            joinDate: "2023-01-15",
            benefits: ["Check-in prioritário", "Upgrade gratuito", "Wi-Fi premium"]
          },
          bookingHistory: {
            totalBookings: 12,
            totalSpent: 45000,
            averageRating: 4.8,
            lastBooking: "2024-12-15",
            favoriteDestinations: ["Caldas Novas", "Campos do Jordão", "Fernando de Noronha"]
          },
          emergencyContact: {
            name: "Carlos Silva Santos",
            relationship: "Esposo",
            phone: "(11) 99777-6666",
            email: "carlos.santos@email.com"
          },
          marketingPreferences: {
            emailNotifications: true,
            smsNotifications: false,
            whatsappNotifications: true,
            promotionalOffers: true,
            newsletter: true
          },
          status: "vip",
          tags: ["VIP", "Cliente Frequente", "Alta Receita"],
          notes: "Cliente premium com preferência por destinos exclusivos. Sempre viaja em família nas férias escolares.",
          createdAt: "2023-01-15",
          updatedAt: "2024-12-20"
        },
        {
          id: 2,
          personalInfo: {
            firstName: "João",
            lastName: "Oliveira",
            email: "joao.oliveira@email.com",
            phone: "(11) 98765-4321",
            dateOfBirth: "1990-07-22",
            gender: "M",
            nationality: "Brasileira",
            profession: "Engenheiro",
            company: "TechSolutions Ltda"
          },
          address: {
            street: "Av. Paulista, 1000, Sala 15",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
            country: "Brasil"
          },
          documents: {
            cpf: "987.654.321-00",
            rg: "98.765.432-1",
            passport: "",
            driverLicense: "98765432100"
          },
          preferences: {
            travelType: ["Aventura", "Ecoturismo"],
            budget: "medium",
            accommodation: ["Pousada", "Camping", "Hostel"],
            activities: ["Trilha", "Rapel", "Mergulho", "Ciclismo"],
            dietary: [],
            accessibility: []
          },
          loyaltyProgram: {
            status: "Silver",
            points: 5200,
            totalSpent: 12000,
            joinDate: "2023-06-10",
            benefits: ["Desconto 10%", "Check-in online"]
          },
          bookingHistory: {
            totalBookings: 6,
            totalSpent: 12000,
            averageRating: 4.5,
            lastBooking: "2024-11-30",
            favoriteDestinations: ["Chapada Diamantina", "Bonito", "Alto Paraíso"]
          },
          emergencyContact: {
            name: "Maria Oliveira",
            relationship: "Mãe",
            phone: "(11) 97654-3210",
            email: "maria.oliveira@email.com"
          },
          marketingPreferences: {
            emailNotifications: true,
            smsNotifications: true,
            whatsappNotifications: true,
            promotionalOffers: true,
            newsletter: false
          },
          status: "active",
          tags: ["Aventureiro", "Jovem", "Sustentabilidade"],
          notes: "Cliente interessado em turismo sustentável e aventuras. Prefere destinos nacionais.",
          createdAt: "2023-06-10",
          updatedAt: "2024-11-30"
        }
      ];

      setCustomers(mockCustomers);
      setSuccess(`${mockCustomers.length} clientes carregados com sucesso!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(`Erro ao carregar clientes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setFormData(initialCustomerData);
    setCurrentStep(1);
    setShowAddModal(true);
    setError('');
    setSuccess('');
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setCurrentStep(1);
    setShowAddModal(true);
    setError('');
    setSuccess('');
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleStatsCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowStatsModal(true);
  };

  const handleSaveCustomer = async () => {
    try {
      setSaving(true);
      setError('');

      // Validação por step
      if (currentStep === 1) {
        if (!formData.personalInfo.firstName || !formData.personalInfo.lastName || !formData.personalInfo.email) {
          setError('Preencha todos os campos obrigatórios');
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (selectedCustomer && selectedCustomer.id) {
        setCustomers(prev => prev.map(c =>
          c.id === selectedCustomer.id ? { ...formData, id: selectedCustomer.id, updatedAt: new Date().toISOString() } : c
        ));
        setSuccess('Cliente atualizado com sucesso!');
      } else {
        const newCustomer = {
          ...formData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setCustomers(prev => [...prev, newCustomer]);
        setSuccess('Cliente criado com sucesso!');
      }

      setTimeout(() => {
        setShowAddModal(false);
        setSuccess('');
      }, 2000);

    } catch (error: any) {
      setError(`Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      setSuccess('Cliente excluído com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(`Erro ao excluir: ${error.message}`);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    setFormData(prev => {
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleArrayToggle = (field: string, value: string) => {
    const keys = field.split('.');
    setFormData(prev => {
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      const array = current[keys[keys.length - 1]] as string[];
      if (array.includes(value)) {
        current[keys[keys.length - 1]] = array.filter(item => item !== value);
      } else {
        current[keys[keys.length - 1]] = [...array, value];
      }
      return updated;
    });
  };

  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const fullName = `${customer.personalInfo.firstName} ${customer.personalInfo.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                           customer.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.personalInfo.phone.includes(searchTerm);
      const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
      const matchesLoyalty = selectedLoyalty === 'all' || customer.loyaltyProgram.status === selectedLoyalty;
      return matchesSearch && matchesStatus && matchesLoyalty;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortBy.includes('.')) {
        const keys = sortBy.split('.');
        aValue = keys.reduce((obj, key) => obj[key], a);
        bValue = keys.reduce((obj, key) => obj[key], b);
      } else {
        aValue = a[sortBy as keyof Customer];
        bValue = b[sortBy as keyof Customer];
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoyaltyColor = (status: string) => {
    switch (status) {
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="w-4 h-4" />;
      case 'inactive': return <UserX className="w-4 h-4" />;
      case 'blocked': return <Shield className="w-4 h-4" />;
      case 'vip': return <Award className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationButtons />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">👥 Sistema Completo de Clientes</h1>
                <p className="text-sm text-gray-500">Gestão completa com todas as funcionalidades CRM</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <FileText className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={loadCustomersComplete}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                {loading ? 'Carregando...' : 'Atualizar'}
              </button>

              <button
                onClick={handleCreateCustomer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Novo Cliente
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes VIP</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'vip').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {customers.reduce((acc, c) => acc + c.loyaltyProgram.totalSpent, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'active' || c.status === 'vip').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Avançados */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="blocked">Bloqueado</option>
              <option value="vip">VIP</option>
            </select>

            <select
              value={selectedLoyalty}
              onChange={(e) => setSelectedLoyalty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os níveis</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="personalInfo.firstName">Ordenar por Nome</option>
              <option value="loyaltyProgram.totalSpent">Ordenar por Gasto</option>
              <option value="loyaltyProgram.points">Ordenar por Pontos</option>
              <option value="createdAt">Ordenar por Data</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
            >
              {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            </button>
          </div>
        </div>

        {/* Lista de Clientes */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-gray-600">Carregando clientes...</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedCustomers.map((customer) => (
                  <div key={customer.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative">
                      <div className="text-center text-white">
                        <User className="w-12 h-12 mx-auto mb-2" />
                        <div className="text-lg font-semibold">
                          {customer.personalInfo.firstName} {customer.personalInfo.lastName}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(customer.status)} flex items-center`}>
                          {getStatusIcon(customer.status)}
                          <span className="ml-1">{customer.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Mail className="w-4 h-4 mr-2" />
                          {customer.personalInfo.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Phone className="w-4 h-4 mr-2" />
                          {customer.personalInfo.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          {customer.address.city}, {customer.address.state}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {customer.personalInfo.profession}
                        </div>
                      </div>

                      {/* Programa de Fidelidade */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getLoyaltyColor(customer.loyaltyProgram.status)}`}>
                            {customer.loyaltyProgram.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            {customer.loyaltyProgram.points} pts
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Total gasto: R$ {customer.loyaltyProgram.totalSpent.toLocaleString()}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {customer.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{customer.tags.length - 3}</span>
                          )}
                        </div>
                      </div>

                      {/* Histórico de Reservas */}
                      <div className="mb-4 p-3 bg-gray-50 rounded">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Reservas:</span>
                            <span className="font-medium ml-1">{customer.bookingHistory.totalBookings}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Avaliação:</span>
                            <div className="flex items-center ml-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="font-medium ml-1">{customer.bookingHistory.averageRating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </button>
                        <button
                          onClick={() => handleStatsCustomer(customer)}
                          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm"
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Stats
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => customer.id && handleDeleteCustomer(customer.id)}
                          className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Lista View
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fidelidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gasto Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.personalInfo.firstName} {customer.personalInfo.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{customer.personalInfo.profession}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{customer.personalInfo.email}</div>
                          <div className="text-sm text-gray-500">{customer.personalInfo.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(customer.status)} flex items-center w-fit`}>
                            {getStatusIcon(customer.status)}
                            <span className="ml-1">{customer.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getLoyaltyColor(customer.loyaltyProgram.status)}`}>
                            {customer.loyaltyProgram.status}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">{customer.loyaltyProgram.points} pts</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {customer.loyaltyProgram.totalSpent.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewCustomer(customer)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => customer.id && handleDeleteCustomer(customer.id)}
                              className="text-red-600 hover:text-red-900"
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
            )}
          </>
        )}

        {filteredAndSortedCustomers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
            <p className="text-gray-600 mb-4">Tente ajustar os filtros ou criar um novo cliente</p>
            <button
              onClick={handleCreateCustomer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center mx-auto"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Criar Primeiro Cliente
            </button>
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição - Multistep será implementado aqui */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedCustomer ? 'Editar Cliente' : 'Novo Cliente'} - Informações Básicas
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Formulário simplificado para demonstração */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo.firstName}
                      onChange={(e) => handleInputChange('personalInfo.firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Ana"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sobrenome *
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo.lastName}
                      onChange={(e) => handleInputChange('personalInfo.lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Silva Santos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) => handleInputChange('personalInfo.email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: ana.silva@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      value={formData.personalInfo.phone}
                      onChange={(e) => handleInputChange('personalInfo.phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: (11) 99888-7777"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.personalInfo.dateOfBirth}
                      onChange={(e) => handleInputChange('personalInfo.dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profissão
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo.profession}
                      onChange={(e) => handleInputChange('personalInfo.profession', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Advogada"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="blocked">Bloqueado</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Informações adicionais sobre o cliente..."
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCustomer}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Cliente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização (simplificado) */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 flex items-center">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  {selectedCustomer.personalInfo.firstName} {selectedCustomer.personalInfo.lastName}
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Informações Pessoais</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><strong>Email:</strong> {selectedCustomer.personalInfo.email}</div>
                    <div><strong>Telefone:</strong> {selectedCustomer.personalInfo.phone}</div>
                    <div><strong>Profissão:</strong> {selectedCustomer.personalInfo.profession}</div>
                    <div><strong>Data de Nascimento:</strong> {selectedCustomer.personalInfo.dateOfBirth}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Programa de Fidelidade</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><strong>Status:</strong>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getLoyaltyColor(selectedCustomer.loyaltyProgram.status)}`}>
                        {selectedCustomer.loyaltyProgram.status}
                      </span>
                    </div>
                    <div><strong>Pontos:</strong> {selectedCustomer.loyaltyProgram.points}</div>
                    <div><strong>Total Gasto:</strong> R$ {selectedCustomer.loyaltyProgram.totalSpent.toLocaleString()}</div>
                    <div><strong>Membro desde:</strong> {selectedCustomer.loyaltyProgram.joinDate}</div>
                  </div>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Observações</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedCustomer.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
