import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Calendar,
  User,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  BarChart3,
  Settings,
  Bell,
  Heart,
  Car,
  Plane,
  Home,
  Briefcase,
  Umbrella,
  Zap,
  XCircle
} from 'lucide-react';

interface InsurancePolicy {
  id: number;
  policy_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  insurance_type: 'travel' | 'health' | 'auto' | 'life' | 'property' | 'business';
  coverage_amount: number;
  premium_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  agent: string;
  created_at: string;
  documents: string[];
  claims_count: number;
  last_claim_date?: string;
  notes: string;
}

interface InsuranceClaim {
  id: number;
  policy_id: number;
  policy_number: string;
  client_name: string;
  claim_type: 'medical' | 'accident' | 'theft' | 'damage' | 'cancellation';
  description: string;
  amount_claimed: number;
  amount_approved?: number;
  status: 'pending' | 'investigating' | 'approved' | 'rejected' | 'paid';
  incident_date: string;
  claim_date: string;
  resolution_date?: string;
  documents: string[];
  notes: string;
  investigator?: string;
}

interface InsuranceType {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  coverage_options: string[];
  average_premium: number;
  claims_frequency: number;
  customer_satisfaction: number;
}

export default function InsurancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('policies');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPolicyModal, setShowNewPolicyModal] = useState(false);

  // Dados simulados - em produção viriam da API
  const [policies] = useState<InsurancePolicy[]>([
    {
      id: 1,
      policy_number: 'POL-2024-001',
      client_name: 'João Silva',
      client_email: 'joao.silva@email.com',
      client_phone: '+55 11 99999-9999',
      insurance_type: 'travel',
      coverage_amount: 50000.00,
      premium_amount: 250.00,
      start_date: '2024-01-15T00:00:00Z',
      end_date: '2024-12-15T00:00:00Z',
      status: 'active',
      agent: 'Maria Santos',
      created_at: '2024-01-10T10:30:00Z',
      documents: ['Apolice.pdf', 'Termos.pdf'],
      claims_count: 0,
      notes: 'Seguro de viagem para Europa'
    },
    {
      id: 2,
      policy_number: 'POL-2024-002',
      client_name: 'Ana Oliveira',
      client_email: 'ana.oliveira@email.com',
      client_phone: '+55 11 88888-8888',
      insurance_type: 'health',
      coverage_amount: 100000.00,
      premium_amount: 180.00,
      start_date: '2024-01-01T00:00:00Z',
      end_date: '2024-12-31T00:00:00Z',
      status: 'active',
      agent: 'Pedro Costa',
      created_at: '2023-12-20T14:20:00Z',
      documents: ['Apolice.pdf', 'Cobertura.pdf'],
      claims_count: 1,
      last_claim_date: '2024-01-20T09:15:00Z',
      notes: 'Plano de saúde empresarial'
    },
    {
      id: 3,
      policy_number: 'POL-2024-003',
      client_name: 'Carlos Ferreira',
      client_email: 'carlos.ferreira@email.com',
      client_phone: '+55 11 77777-7777',
      insurance_type: 'auto',
      coverage_amount: 75000.00,
      premium_amount: 320.00,
      start_date: '2024-01-01T00:00:00Z',
      end_date: '2024-12-31T00:00:00Z',
      status: 'active',
      agent: 'João Silva',
      created_at: '2023-12-15T16:45:00Z',
      documents: ['Apolice.pdf', 'Vistoria.pdf'],
      claims_count: 2,
      last_claim_date: '2024-01-25T11:30:00Z',
      notes: 'Seguro auto completo'
    }
  ]);

  const [claims] = useState<InsuranceClaim[]>([
    {
      id: 1,
      policy_id: 2,
      policy_number: 'POL-2024-002',
      client_name: 'Ana Oliveira',
      claim_type: 'medical',
      description: 'Consulta médica de emergência durante viagem',
      amount_claimed: 1500.00,
      amount_approved: 1200.00,
      status: 'paid',
      incident_date: '2024-01-18T14:30:00Z',
      claim_date: '2024-01-20T09:15:00Z',
      resolution_date: '2024-01-25T16:00:00Z',
      documents: ['Atestado.pdf', 'Receitas.pdf'],
      notes: 'Aprovado com desconto de 20%',
      investigator: 'Dr. Roberto Lima'
    },
    {
      id: 2,
      policy_id: 3,
      policy_number: 'POL-2024-003',
      client_name: 'Carlos Ferreira',
      claim_type: 'accident',
      description: 'Colisão traseira em semáforo',
      amount_claimed: 8500.00,
      status: 'investigating',
      incident_date: '2024-01-25T08:15:00Z',
      claim_date: '2024-01-25T11:30:00Z',
      documents: ['BO.pdf', 'Fotos.pdf', 'Orcamento.pdf'],
      notes: 'Aguardando vistoria',
      investigator: 'Eng. Paulo Santos'
    }
  ]);

  const [insuranceTypes] = useState<InsuranceType[]>([
    {
      id: 1,
      name: 'Seguro de Viagem',
      description: 'Cobertura para viagens nacionais e internacionais',
      icon: '✈️',
      color: 'bg-blue-100 text-blue-800',
      coverage_options: ['Assistência médica', 'Bagagem', 'Cancelamento', 'Acidentes'],
      average_premium: 250.00,
      claims_frequency: 0.15,
      customer_satisfaction: 4.8
    },
    {
      id: 2,
      name: 'Seguro de Saúde',
      description: 'Planos de saúde individuais e empresariais',
      icon: '🏥',
      color: 'bg-green-100 text-green-800',
      coverage_options: ['Consultas', 'Exames', 'Cirurgias', 'Medicamentos'],
      average_premium: 180.00,
      claims_frequency: 0.25,
      customer_satisfaction: 4.6
    },
    {
      id: 3,
      name: 'Seguro Auto',
      description: 'Proteção completa para veículos',
      icon: '🚗',
      color: 'bg-purple-100 text-purple-800',
      coverage_options: ['Colisão', 'Roubo', 'Terceiros', 'Assistência 24h'],
      average_premium: 320.00,
      claims_frequency: 0.08,
      customer_satisfaction: 4.7
    },
    {
      id: 4,
      name: 'Seguro de Vida',
      description: 'Proteção financeira para a família',
      icon: '💝',
      color: 'bg-red-100 text-red-800',
      coverage_options: ['Morte', 'Invalidez', 'Doenças graves', 'Aposentadoria'],
      average_premium: 150.00,
      claims_frequency: 0.02,
      customer_satisfaction: 4.9
    }
  ]);

  const [stats] = useState({
    total_policies: 234,
    active_policies: 198,
    total_premium: 45600.00,
    total_claims: 45,
    pending_claims: 12,
    total_payout: 125000.00,
    average_processing_time: 8.5,
    customer_satisfaction: 4.7
  });

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const getInsuranceIcon = (type: string) => {
    switch (type) {
      case 'travel': return <Plane className="h-6 w-6 text-blue-500" />;
      case 'health': return <Heart className="h-6 w-6 text-green-500" />;
      case 'auto': return <Car className="h-6 w-6 text-purple-500" />;
      case 'life': return <Heart className="h-6 w-6 text-red-500" />;
      case 'property': return <Home className="h-6 w-6 text-orange-500" />;
      case 'business': return <Briefcase className="h-6 w-6 text-indigo-500" />;
      default: return <Shield className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'expired': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || policy.insurance_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || policy.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
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
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <Shield className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Seguros</h1>
                    <p className="text-sm text-gray-500">Sistema completo de apólices e sinistros</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowNewPolicyModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Apólice
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
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total de Apólices</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_policies}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Apólices Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active_policies}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Prêmios Totais</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_premium)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Sinistros Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending_claims}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Visão Geral de Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.total_claims}</div>
                <div className="text-sm text-gray-500">Total de Sinistros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_payout)}</div>
                <div className="text-sm text-gray-500">Total Pago</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.average_processing_time} dias</div>
                <div className="text-sm text-gray-500">Tempo Médio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.customer_satisfaction}/5</div>
                <div className="text-sm text-gray-500">Satisfação</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'policies', name: 'Apólices', icon: '📋' },
                  { id: 'claims', name: 'Sinistros', icon: '🚨' },
                  { id: 'types', name: 'Tipos de Seguro', icon: '🏷️' },
                  { id: 'analytics', name: 'Analytics', icon: '📊' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
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
              {activeTab === 'policies' && (
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Buscar apólices..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="all">Todos os tipos</option>
                      <option value="travel">Viagem</option>
                      <option value="health">Saúde</option>
                      <option value="auto">Auto</option>
                      <option value="life">Vida</option>
                      <option value="property">Propriedade</option>
                      <option value="business">Empresarial</option>
                    </select>

                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="all">Todos os status</option>
                      <option value="active">Ativa</option>
                      <option value="expired">Expirada</option>
                      <option value="cancelled">Cancelada</option>
                      <option value="pending">Pendente</option>
                    </select>
                  </div>

                  {/* Policies List */}
                  <div className="space-y-4">
                    {filteredPolicies.map((policy) => (
                      <div key={policy.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            {getInsuranceIcon(policy.insurance_type)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">{policy.client_name}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(policy.status)}`}>
                                  {policy.status}
                                </span>
                                <span className="text-sm text-gray-500">{policy.policy_number}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Tipo:</span> {policy.insurance_type}
                                </div>
                                <div>
                                  <span className="font-medium">Cobertura:</span> {formatCurrency(policy.coverage_amount)}
                                </div>
                                <div>
                                  <span className="font-medium">Prêmio:</span> {formatCurrency(policy.premium_amount)}
                                </div>
                                <div>
                                  <span className="font-medium">Agente:</span> {policy.agent}
                                </div>
                                <div>
                                  <span className="font-medium">Válido até:</span> {formatDate(policy.end_date)}
                                </div>
                                <div>
                                  <span className="font-medium">Sinistros:</span> {policy.claims_count}
                                </div>
                              </div>
                              
                              {policy.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-700">{policy.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
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

              {activeTab === 'claims' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {claims.map((claim) => (
                      <div key={claim.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{claim.client_name}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${getClaimStatusColor(claim.status)}`}>
                                {claim.status}
                              </span>
                              <span className="text-sm text-gray-500">{claim.policy_number}</span>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{claim.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Tipo:</span> {claim.claim_type}
                              </div>
                              <div>
                                <span className="font-medium">Solicitado:</span> {formatCurrency(claim.amount_claimed)}
                              </div>
                              {claim.amount_approved && (
                                <div>
                                  <span className="font-medium">Aprovado:</span> {formatCurrency(claim.amount_approved)}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Data:</span> {formatDate(claim.incident_date)}
                              </div>
                            </div>
                            
                            {claim.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{claim.notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
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
                    {insuranceTypes.map((type) => (
                      <div key={type.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{type.icon}</span>
                            <div>
                              <h3 className="font-medium text-gray-900">{type.name}</h3>
                              <p className="text-sm text-gray-500">{type.description}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${type.color}`}>
                            {formatCurrency(type.average_premium)}
                          </span>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Frequência de Sinistros:</span>
                            <span className="font-medium">{(type.claims_frequency * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Satisfação:</span>
                            <span className="font-medium">{type.customer_satisfaction}/5</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Coberturas:</h4>
                          <ul className="space-y-1">
                            {type.coverage_options.map((option, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <div className="w-1 h-1 bg-indigo-500 rounded-full mr-2"></div>
                                {option}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics de Seguros</h3>
                  <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Policy Modal */}
        {showNewPolicyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Apólice de Seguro</h3>
              <p className="text-gray-500 mb-4">Funcionalidade em desenvolvimento...</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewPolicyModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Criar Apólice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 