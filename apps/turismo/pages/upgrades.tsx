import React, { useState } from 'react';
import { 
  TrendingUp, 
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
  ArrowUp,
  ArrowDown,
  RefreshCw,
  RotateCcw,
  Move,
  Copy,
  Paste,
  Scissors,
  Link,
  Unlink,
  ExternalLink,
  Upload,
  Download as DownloadIcon,
  Trash2,
  Save,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Bookmark,
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

interface Upgrade {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  currentPlan: string;
  targetPlan: string;
  upgradeType: 'upgrade' | 'downgrade' | 'sidegrade';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  currentPrice: number;
  newPrice: number;
  priceDifference: number;
  effectiveDate: string;
  completedDate?: string;
  reason: string;
  benefits: string[];
  features: string[];
  limitations: string[];
  notes: string;
  autoRenewal: boolean;
  proration: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  processedBy?: string;
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

const UpgradesPage: React.FC = () => {
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: 'UPG001',
      customerName: 'Maria Silva',
      customerEmail: 'maria.silva@email.com',
      customerPhone: '(11) 99999-9999',
      currentPlan: 'Básico',
      targetPlan: 'Premium',
      upgradeType: 'upgrade',
      status: 'completed',
      currentPrice: 99.00,
      newPrice: 299.00,
      priceDifference: 200.00,
      effectiveDate: '2025-08-01',
      completedDate: '2025-07-30',
      reason: 'Necessidade de mais recursos e funcionalidades avançadas',
      benefits: [
        'Mais usuários (25 vs 5)',
        'Armazenamento maior (100GB vs 10GB)',
        'Suporte prioritário',
        'Relatórios avançados',
        'API dedicada'
      ],
      features: [
        'Integração completa',
        'Personalização avançada',
        'Relatórios customizados',
        'Suporte 24/7'
      ],
      limitations: [],
      notes: 'Upgrade realizado com sucesso. Cliente satisfeito com os novos recursos.',
      autoRenewal: true,
      proration: 150.00,
      totalCost: 200.00,
      createdAt: '2025-07-25',
      updatedAt: '2025-07-30',
      processedBy: 'Sistema Automático',
      approvalRequired: false
    },
    {
      id: 'UPG002',
      customerName: 'Carlos Oliveira',
      customerEmail: 'carlos.oliveira@email.com',
      customerPhone: '(21) 88888-8888',
      currentPlan: 'Premium',
      targetPlan: 'Enterprise',
      upgradeType: 'upgrade',
      status: 'pending',
      currentPrice: 299.00,
      newPrice: 999.00,
      priceDifference: 700.00,
      effectiveDate: '2025-08-15',
      reason: 'Crescimento da empresa e necessidade de recursos ilimitados',
      benefits: [
        'Usuários ilimitados',
        'Armazenamento ilimitado',
        'SLA garantido',
        'Treinamento incluído',
        'Suporte dedicado'
      ],
      features: [
        'Personalização total',
        'API dedicada',
        'SLA garantido',
        'Treinamento incluído'
      ],
      limitations: [],
      notes: 'Aguardando aprovação do cliente',
      autoRenewal: true,
      proration: 0.00,
      totalCost: 700.00,
      createdAt: '2025-07-26',
      updatedAt: '2025-07-26',
      approvalRequired: true
    },
    {
      id: 'UPG003',
      customerName: 'Patrícia Lima',
      customerEmail: 'patricia.lima@email.com',
      customerPhone: '(31) 77777-7777',
      currentPlan: 'Enterprise',
      targetPlan: 'Premium',
      upgradeType: 'downgrade',
      status: 'processing',
      currentPrice: 999.00,
      newPrice: 299.00,
      priceDifference: -700.00,
      effectiveDate: '2025-08-01',
      reason: 'Redução de custos devido à crise econômica',
      benefits: [
        'Redução significativa de custos',
        'Mantém funcionalidades essenciais',
        'Suporte adequado'
      ],
      features: [
        'Até 25 usuários',
        '100GB de armazenamento',
        'Suporte prioritário',
        'Relatórios avançados'
      ],
      limitations: [
        'Menos usuários (25 vs ilimitado)',
        'Armazenamento limitado (100GB vs ilimitado)',
        'Sem SLA garantido',
        'Sem treinamento incluído'
      ],
      notes: 'Downgrade em processamento. Cliente informado sobre limitações.',
      autoRenewal: true,
      proration: -350.00,
      totalCost: -700.00,
      createdAt: '2025-07-27',
      updatedAt: '2025-07-27',
      processedBy: 'João Santos',
      approvalRequired: false
    }
  ]);

  const [selectedUpgrade, setSelectedUpgrade] = useState<Upgrade | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  const typeColors = {
    upgrade: 'bg-green-100 text-green-800',
    downgrade: 'bg-orange-100 text-orange-800',
    sidegrade: 'bg-blue-100 text-blue-800'
  };

  const filteredUpgrades = upgrades.filter(upgrade => {
    const matchesStatus = filterStatus === 'all' || upgrade.status === filterStatus;
    const matchesType = filterType === 'all' || upgrade.upgradeType === filterType;
    const matchesSearch = upgrade.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upgrade.currentPlan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upgrade.targetPlan.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    total: upgrades.length,
    pending: upgrades.filter(u => u.status === 'pending').length,
    processing: upgrades.filter(u => u.status === 'processing').length,
    completed: upgrades.filter(u => u.status === 'completed').length,
    failed: upgrades.filter(u => u.status === 'failed').length,
    cancelled: upgrades.filter(u => u.status === 'cancelled').length,
    upgrades: upgrades.filter(u => u.upgradeType === 'upgrade').length,
    downgrades: upgrades.filter(u => u.upgradeType === 'downgrade').length,
    totalRevenue: upgrades.filter(u => u.status === 'completed' && u.priceDifference > 0).reduce((sum, u) => sum + u.priceDifference, 0)
  };

  const handleStatusChange = (upgradeId: string, newStatus: Upgrade['status']) => {
    setUpgrades(prev => prev.map(u => 
      u.id === upgradeId ? { ...u, status: newStatus } : u
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
                <TrendingUp className="mr-3 h-8 w-8 text-blue-600" />
                Gestão de Upgrades
              </h1>
              <p className="text-gray-600 mt-2">Gerencie upgrades e downgrades de planos</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center font-medium transition-colors"
            >
              <Plus className="mr-2 h-5 w-5" />
              Novo Upgrade
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Upgrades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upgrades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upgrades}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ArrowDown className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Downgrades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.downgrades}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Adicional</p>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente ou planos..."
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
                <option value="processing">Processando</option>
                <option value="completed">Concluído</option>
                <option value="failed">Falhou</option>
                <option value="cancelled">Cancelado</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Tipos</option>
                <option value="upgrade">Upgrade</option>
                <option value="downgrade">Downgrade</option>
                <option value="sidegrade">Sidegrade</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upgrades List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Migração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diferença
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Efetiva
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUpgrades.map((upgrade) => (
                  <tr key={upgrade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{upgrade.customerName}</div>
                        <div className="text-sm text-gray-500">{upgrade.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {upgrade.currentPlan} → {upgrade.targetPlan}
                        </div>
                        <div className="text-sm text-gray-500">
                          R$ {upgrade.currentPrice} → R$ {upgrade.newPrice}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeColors[upgrade.upgradeType]}`}>
                        {upgrade.upgradeType === 'upgrade' && 'Upgrade'}
                        {upgrade.upgradeType === 'downgrade' && 'Downgrade'}
                        {upgrade.upgradeType === 'sidegrade' && 'Sidegrade'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        upgrade.priceDifference > 0 ? 'text-green-600' : 
                        upgrade.priceDifference < 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {upgrade.priceDifference > 0 ? '+' : ''}R$ {upgrade.priceDifference.toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[upgrade.status]}`}>
                        {upgrade.status === 'pending' && 'Pendente'}
                        {upgrade.status === 'processing' && 'Processando'}
                        {upgrade.status === 'completed' && 'Concluído'}
                        {upgrade.status === 'failed' && 'Falhou'}
                        {upgrade.status === 'cancelled' && 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(upgrade.effectiveDate).toLocaleDateString('pt-BR')}
                      </div>
                      {upgrade.completedDate && (
                        <div className="text-sm text-gray-500">
                          Concluído: {new Date(upgrade.completedDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUpgrade(upgrade);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUpgrade(upgrade);
                            setShowCreateModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {upgrade.status === 'pending' && (
                          <button className="text-purple-600 hover:text-purple-900">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upgrade Details Modal */}
        {showModal && selectedUpgrade && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalhes do Upgrade - {selectedUpgrade.id}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações do Cliente</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nome:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedUpgrade.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedUpgrade.customerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Telefone:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedUpgrade.customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações do Upgrade</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tipo:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeColors[selectedUpgrade.upgradeType]}`}>
                          {selectedUpgrade.upgradeType === 'upgrade' && 'Upgrade'}
                          {selectedUpgrade.upgradeType === 'downgrade' && 'Downgrade'}
                          {selectedUpgrade.upgradeType === 'sidegrade' && 'Sidegrade'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedUpgrade.status]}`}>
                          {selectedUpgrade.status === 'pending' && 'Pendente'}
                          {selectedUpgrade.status === 'processing' && 'Processando'}
                          {selectedUpgrade.status === 'completed' && 'Concluído'}
                          {selectedUpgrade.status === 'failed' && 'Falhou'}
                          {selectedUpgrade.status === 'cancelled' && 'Cancelado'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Aprovação:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedUpgrade.approvalRequired ? 'Requerida' : 'Não Requerida'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações dos Planos</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Plano Atual:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedUpgrade.currentPlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Plano Destino:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedUpgrade.targetPlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Preço Atual:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedUpgrade.currentPrice.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Novo Preço:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedUpgrade.newPrice.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações Financeiras</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Diferença:</span>
                        <span className={`text-sm font-medium ${
                          selectedUpgrade.priceDifference > 0 ? 'text-green-600' : 
                          selectedUpgrade.priceDifference < 0 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {selectedUpgrade.priceDifference > 0 ? '+' : ''}R$ {selectedUpgrade.priceDifference.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Proração:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedUpgrade.proration.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Custo Total:</span>
                        <span className="text-sm font-bold text-gray-900">
                          R$ {selectedUpgrade.totalCost.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits and Features */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Benefícios e Recursos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Benefícios</h5>
                      <ul className="space-y-1">
                        {selectedUpgrade.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Recursos</h5>
                      <ul className="space-y-1">
                        {selectedUpgrade.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Star className="h-4 w-4 text-blue-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Limitations */}
                {selectedUpgrade.limitations.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Limitações</h4>
                    <ul className="space-y-1">
                      {selectedUpgrade.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dates */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Datas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Data Efetiva:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedUpgrade.effectiveDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {selectedUpgrade.completedDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Concluído em:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedUpgrade.completedDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Criado em:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedUpgrade.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Atualizado em:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedUpgrade.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Observações</h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedUpgrade.notes}</p>
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
                    <Edit className="h-4 w-4 inline mr-2" />
                    Editar
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

export default UpgradesPage; 