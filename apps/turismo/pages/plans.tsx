import React, { useState } from 'react';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Printer,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  Star,
  MessageSquare,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  Users,
  Percent,
  Shield,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Cloud,
  Zap,
  Target,
  Award,
  Trophy,
  Medal,
  Crown,
  Flag,
  CheckSquare,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  CreditCard,
  Gift,
  Crown as CrownIcon,
  Zap as ZapIcon,
  Star as StarIcon,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Grin,
  Wink,
  Wink2,
  Tongue,
  Tongue2,
  Disappointed,
  Confused,
  Astonished,
  Flushed,
  Sunglasses,
  Dizzy,
  Expressionless,
  NoMouth,
  Mask,
  Thermometer,
  Droplet,
  Umbrella,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  CloudDrizzle,
  CloudFog,
  Wind,
  Hurricane,
  Tornado,
  Snowflake,
  ThermometerSun,
  ThermometerSnowflake
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  limitations: string[];
  status: 'active' | 'inactive' | 'draft';
  category: 'basic' | 'premium' | 'enterprise' | 'custom';
  maxUsers: number;
  maxStorage: number;
  maxProjects: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  subscribers: number;
  revenue: number;
  conversionRate: number;
}

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 'PLAN001',
      name: 'Básico',
      description: 'Ideal para pequenas empresas e startups',
      price: 99.00,
      billingCycle: 'monthly',
      features: [
        'Até 5 usuários',
        '10GB de armazenamento',
        'Suporte por email',
        'Relatórios básicos',
        'Integração com APIs'
      ],
      limitations: [
        'Sem suporte prioritário',
        'Relatórios limitados',
        'Sem personalização avançada'
      ],
      status: 'active',
      category: 'basic',
      maxUsers: 5,
      maxStorage: 10,
      maxProjects: 10,
      priority: 'low',
      tags: ['Básico', 'Iniciante', 'Pequenas empresas'],
      createdAt: '2025-01-01',
      updatedAt: '2025-07-25',
      subscribers: 150,
      revenue: 14850.00,
      conversionRate: 12.5
    },
    {
      id: 'PLAN002',
      name: 'Premium',
      description: 'Perfeito para empresas em crescimento',
      price: 299.00,
      billingCycle: 'monthly',
      features: [
        'Até 25 usuários',
        '100GB de armazenamento',
        'Suporte prioritário',
        'Relatórios avançados',
        'Integração completa',
        'Personalização avançada',
        'API dedicada'
      ],
      limitations: [
        'Sem suporte 24/7',
        'Limite de projetos'
      ],
      status: 'active',
      category: 'premium',
      maxUsers: 25,
      maxStorage: 100,
      maxProjects: 50,
      priority: 'medium',
      tags: ['Premium', 'Crescimento', 'Médias empresas'],
      createdAt: '2025-01-01',
      updatedAt: '2025-07-25',
      subscribers: 75,
      revenue: 22425.00,
      conversionRate: 8.2
    },
    {
      id: 'PLAN003',
      name: 'Enterprise',
      description: 'Solução completa para grandes empresas',
      price: 999.00,
      billingCycle: 'monthly',
      features: [
        'Usuários ilimitados',
        'Armazenamento ilimitado',
        'Suporte 24/7',
        'Relatórios personalizados',
        'Integração completa',
        'Personalização total',
        'API dedicada',
        'SLA garantido',
        'Treinamento incluído'
      ],
      limitations: [],
      status: 'active',
      category: 'enterprise',
      maxUsers: -1,
      maxStorage: -1,
      maxProjects: -1,
      priority: 'high',
      tags: ['Enterprise', 'Grandes empresas', 'Ilimitado'],
      createdAt: '2025-01-01',
      updatedAt: '2025-07-25',
      subscribers: 25,
      revenue: 24975.00,
      conversionRate: 3.1
    }
  ]);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800'
  };

  const categoryColors = {
    basic: 'bg-blue-100 text-blue-800',
    premium: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-green-100 text-green-800',
    custom: 'bg-orange-100 text-orange-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const filteredPlans = plans.filter(plan => {
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || plan.category === filterCategory;
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const stats = {
    total: plans.length,
    active: plans.filter(p => p.status === 'active').length,
    inactive: plans.filter(p => p.status === 'inactive').length,
    draft: plans.filter(p => p.status === 'draft').length,
    totalSubscribers: plans.reduce((sum, p) => sum + p.subscribers, 0),
    totalRevenue: plans.reduce((sum, p) => sum + p.revenue, 0),
    averageConversionRate: plans.reduce((sum, p) => sum + p.conversionRate, 0) / plans.length
  };

  const handleStatusChange = (planId: string, newStatus: Plan['status']) => {
    setPlans(prev => prev.map(p => 
      p.id === planId ? { ...p, status: newStatus } : p
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="mr-3 h-8 w-8 text-blue-600" />
                Gestão de Planos
              </h1>
              <p className="text-gray-600 mt-2">Gerencie planos de assinatura e preços</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center font-medium transition-colors"
            >
              <Plus className="mr-2 h-5 w-5" />
              Novo Plano
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Planos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Assinantes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageConversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou descrição..."
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
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="draft">Rascunho</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as Categorias</option>
                <option value="basic">Básico</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[plan.status]}`}>
                      {plan.status === 'active' && 'Ativo'}
                      {plan.status === 'inactive' && 'Inativo'}
                      {plan.status === 'draft' && 'Rascunho'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[plan.category]}`}>
                      {plan.category === 'basic' && 'Básico'}
                      {plan.category === 'premium' && 'Premium'}
                      {plan.category === 'enterprise' && 'Enterprise'}
                      {plan.category === 'custom' && 'Custom'}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      R$ {plan.price.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      /{plan.billingCycle === 'monthly' && 'mês'}
                      {plan.billingCycle === 'quarterly' && 'trimestre'}
                      {plan.billingCycle === 'yearly' && 'ano'}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Recursos Incluídos</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Limitações</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm text-gray-700">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{plan.subscribers}</div>
                    <div className="text-xs text-gray-500">Assinantes</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      R$ {plan.revenue.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-500">Receita</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{plan.conversionRate}%</div>
                    <div className="text-xs text-gray-500">Conversão</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {plan.tags.map((tag, index) => (
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
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowModal(true);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 inline mr-2" />
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowCreateModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 inline mr-2" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Details Modal */}
        {showModal && selectedPlan && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalhes do Plano - {selectedPlan.name}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Plan Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações do Plano</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nome:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Categoria:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedPlan.category === 'basic' && 'Básico'}
                          {selectedPlan.category === 'premium' && 'Premium'}
                          {selectedPlan.category === 'enterprise' && 'Enterprise'}
                          {selectedPlan.category === 'custom' && 'Custom'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedPlan.status]}`}>
                          {selectedPlan.status === 'active' && 'Ativo'}
                          {selectedPlan.status === 'inactive' && 'Inativo'}
                          {selectedPlan.status === 'draft' && 'Rascunho'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ciclo de Cobrança:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedPlan.billingCycle === 'monthly' && 'Mensal'}
                          {selectedPlan.billingCycle === 'quarterly' && 'Trimestral'}
                          {selectedPlan.billingCycle === 'yearly' && 'Anual'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Stats */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Preço e Estatísticas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Preço:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedPlan.price.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Assinantes:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedPlan.subscribers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Receita:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedPlan.revenue.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taxa de Conversão:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedPlan.conversionRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Limits */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Limites</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Usuários Máximos:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedPlan.maxUsers === -1 ? 'Ilimitado' : selectedPlan.maxUsers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Armazenamento (GB):</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedPlan.maxStorage === -1 ? 'Ilimitado' : selectedPlan.maxStorage}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Projetos Máximos:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedPlan.maxProjects === -1 ? 'Ilimitado' : selectedPlan.maxProjects}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Datas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Criado em:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedPlan.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Atualizado em:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedPlan.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Descrição</h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPlan.description}</p>
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
                    Editar Plano
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

export default PlansPage; 