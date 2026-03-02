import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Calendar,
  MapPin,
  User,
  CreditCard,
  Mail,
  Phone,
  Globe,
  Flag,
  TrendingUp,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';

interface VisaApplication {
  id: number;
  applicant_name: string;
  passport_number: string;
  nationality: string;
  destination_country: string;
  visa_type: 'tourist' | 'business' | 'student' | 'work' | 'transit';
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'expired';
  application_date: string;
  expected_completion: string;
  actual_completion?: string;
  fee: number;
  documents_required: string[];
  documents_submitted: string[];
  notes: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  agent: string;
  email: string;
  phone: string;
}

interface VisaType {
  id: number;
  name: string;
  country: string;
  type: string;
  processing_time: string;
  fee: number;
  requirements: string[];
  validity: string;
  icon: string;
  color: string;
}

export default function VisaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);

  // Dados simulados - em produção viriam da API
  const [applications] = useState<VisaApplication[]>([
    {
      id: 1,
      applicant_name: 'João Silva',
      passport_number: 'BR123456789',
      nationality: 'Brasil',
      destination_country: 'Estados Unidos',
      visa_type: 'tourist',
      status: 'processing',
      application_date: '2024-01-15T10:30:00Z',
      expected_completion: '2024-02-15T10:30:00Z',
      fee: 160.00,
      documents_required: ['Passaporte', 'Foto 5x7', 'Comprovante de renda', 'Extrato bancário'],
      documents_submitted: ['Passaporte', 'Foto 5x7', 'Comprovante de renda'],
      notes: 'Aguardando extrato bancário',
      priority: 'medium',
      agent: 'Maria Santos',
      email: 'joao.silva@email.com',
      phone: '+55 11 99999-9999'
    },
    {
      id: 2,
      applicant_name: 'Ana Oliveira',
      passport_number: 'BR987654321',
      nationality: 'Brasil',
      destination_country: 'Canadá',
      visa_type: 'student',
      status: 'approved',
      application_date: '2024-01-10T14:20:00Z',
      expected_completion: '2024-02-10T14:20:00Z',
      actual_completion: '2024-01-25T09:15:00Z',
      fee: 150.00,
      documents_required: ['Passaporte', 'Carta de aceitação', 'Comprovante financeiro'],
      documents_submitted: ['Passaporte', 'Carta de aceitação', 'Comprovante financeiro'],
      notes: 'Visto aprovado com sucesso',
      priority: 'high',
      agent: 'Pedro Costa',
      email: 'ana.oliveira@email.com',
      phone: '+55 11 88888-8888'
    },
    {
      id: 3,
      applicant_name: 'Carlos Ferreira',
      passport_number: 'BR456789123',
      nationality: 'Brasil',
      destination_country: 'Reino Unido',
      visa_type: 'business',
      status: 'pending',
      application_date: '2024-01-20T16:45:00Z',
      expected_completion: '2024-02-20T16:45:00Z',
      fee: 95.00,
      documents_required: ['Passaporte', 'Carta da empresa', 'Comprovante de viagem'],
      documents_submitted: ['Passaporte'],
      notes: 'Aguardando documentos da empresa',
      priority: 'urgent',
      agent: 'João Silva',
      email: 'carlos.ferreira@email.com',
      phone: '+55 11 77777-7777'
    }
  ]);

  const [visaTypes] = useState<VisaType[]>([
    {
      id: 1,
      name: 'Visto de Turismo',
      country: 'Estados Unidos',
      type: 'B1/B2',
      processing_time: '15-20 dias úteis',
      fee: 160.00,
      requirements: ['Passaporte válido', 'Foto 5x7', 'Comprovante de renda', 'Extrato bancário'],
      validity: '10 anos',
      icon: '🇺🇸',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 2,
      name: 'Visto de Estudante',
      country: 'Canadá',
      type: 'Study Permit',
      processing_time: '20-30 dias úteis',
      fee: 150.00,
      requirements: ['Passaporte válido', 'Carta de aceitação', 'Comprovante financeiro'],
      validity: 'Duração do curso',
      icon: '🇨🇦',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 3,
      name: 'Visto de Negócios',
      country: 'Reino Unido',
      type: 'Business Visa',
      processing_time: '10-15 dias úteis',
      fee: 95.00,
      requirements: ['Passaporte válido', 'Carta da empresa', 'Comprovante de viagem'],
      validity: '6 meses',
      icon: '🇬🇧',
      color: 'bg-purple-100 text-purple-800'
    }
  ]);

  const [stats] = useState({
    total_applications: 156,
    pending: 23,
    processing: 45,
    approved: 78,
    rejected: 10,
    total_revenue: 24800.00,
    average_processing_time: 18.5,
    success_rate: 88.6
  });

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing': return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired': return <XCircle className="h-5 w-5 text-gray-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.passport_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.destination_country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    const matchesCountry = selectedCountry === 'all' || app.destination_country === selectedCountry;
    
    return matchesSearch && matchesStatus && matchesCountry;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <button
                  onClick={handleBackToDashboard}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ← Voltar
                </button>
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                                                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Processamento de Vistos</h1>
                    <p className="text-sm text-gray-500">Gestão completa de aplicações de visto</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowNewApplicationModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Aplicação
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total de Aplicações</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_applications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Taxa de Aprovação</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.success_rate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tempo Médio</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.average_processing_time} dias</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status das Aplicações</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-500">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                <div className="text-sm text-gray-500">Processando</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-gray-500">Aprovadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-gray-500">Rejeitadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.total_applications}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'applications', name: 'Aplicações', icon: '📋' },
                  { id: 'types', name: 'Tipos de Visto', icon: '🏷️' },
                  { id: 'analytics', name: 'Analytics', icon: '📊' },
                  { id: 'settings', name: 'Configurações', icon: '⚙️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'applications' && (
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Buscar aplicações..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">Todos os status</option>
                      <option value="pending">Pendente</option>
                      <option value="processing">Processando</option>
                      <option value="approved">Aprovado</option>
                      <option value="rejected">Rejeitado</option>
                    </select>

                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">Todos os países</option>
                      <option value="Estados Unidos">Estados Unidos</option>
                      <option value="Canadá">Canadá</option>
                      <option value="Reino Unido">Reino Unido</option>
                    </select>
                  </div>

                  {/* Applications List */}
                  <div className="space-y-4">
                    {filteredApplications.map((app) => (
                      <div key={app.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            {getStatusIcon(app.status)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">{app.applicant_name}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(app.status)}`}>
                                  {app.status}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(app.priority)}`}>
                                  {app.priority}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Passaporte:</span> {app.passport_number}
                                </div>
                                <div>
                                  <span className="font-medium">Destino:</span> {app.destination_country}
                                </div>
                                <div>
                                  <span className="font-medium">Tipo:</span> {app.visa_type}
                                </div>
                                <div>
                                  <span className="font-medium">Agente:</span> {app.agent}
                                </div>
                                <div>
                                  <span className="font-medium">Taxa:</span> {formatCurrency(app.fee)}
                                </div>
                                <div>
                                  <span className="font-medium">Aplicação:</span> {formatDate(app.application_date)}
                                </div>
                              </div>
                              
                              {app.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-700">{app.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'types' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visaTypes.map((type) => (
                      <div key={type.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{type.icon}</span>
                            <div>
                              <h3 className="font-medium text-gray-900">{type.name}</h3>
                              <p className="text-sm text-gray-500">{type.country}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${type.color}`}>
                            {type.type}
                          </span>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tempo de Processamento:</span>
                            <span className="font-medium">{type.processing_time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Taxa:</span>
                            <span className="font-medium">{formatCurrency(type.fee)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Validade:</span>
                            <span className="font-medium">{type.validity}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Requisitos:</h4>
                          <ul className="space-y-1">
                            {type.requirements.map((req, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics de Vistos</h3>
                  <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações</h3>
                  <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Application Modal */}
        {showNewApplicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Aplicação de Visto</h3>
              <p className="text-gray-500 mb-4">Funcionalidade em desenvolvimento...</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewApplicationModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Criar Aplicação
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 