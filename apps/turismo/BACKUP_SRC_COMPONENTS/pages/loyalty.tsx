import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { 
  Star, 
  Gift, 
  Users, 
  TrendingUp, 
  Award, 
  Crown,
  Plus,
  Edit,
  Trash,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface LoyaltyTier {
  id: number;
  name: string;
  description: string;
  min_points: number;
  max_points?: number;
  discount_percentage: number;
  benefits: string[];
  color: string;
  icon: string;
}

interface UserLoyalty {
  id: number;
  user_id: number;
  tier_id: number;
  points_balance: number;
  lifetime_points: number;
  tier_name: string;
  tier_color: string;
  tier_icon: string;
  next_tier_points: number;
  progress_percentage: number;
}

interface LoyaltyCampaign {
  id: number;
  name: string;
  description: string;
  points_multiplier: number;
  bonus_points: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  applicable_tiers: string[];
}

export default function LoyaltyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Dados simulados - em produção viriam da API
  const [loyaltyTiers] = useState<LoyaltyTier[]>([
    {
      id: 1,
      name: 'Bronze',
      description: 'Nível inicial de fidelidade',
      min_points: 0,
      max_points: 999,
      discount_percentage: 5,
      benefits: ['5% de desconto', 'Suporte básico'],
      color: 'bg-amber-500',
      icon: '🥉'
    },
    {
      id: 2,
      name: 'Prata',
      description: 'Nível intermediário',
      min_points: 1000,
      max_points: 4999,
      discount_percentage: 10,
      benefits: ['10% de desconto', 'Suporte prioritário', 'Frete grátis'],
      color: 'bg-gray-400',
      icon: '🥈'
    },
    {
      id: 3,
      name: 'Ouro',
      description: 'Nível avançado',
      min_points: 5000,
      max_points: 19999,
      discount_percentage: 15,
      benefits: ['15% de desconto', 'Suporte VIP', 'Frete grátis', 'Check-in antecipado'],
      color: 'bg-yellow-500',
      icon: '🥇'
    },
    {
      id: 4,
      name: 'Platina',
      description: 'Nível premium',
      min_points: 20000,
      max_points: 49999,
      discount_percentage: 20,
      benefits: ['20% de desconto', 'Suporte VIP 24h', 'Frete grátis', 'Check-in antecipado', 'Upgrade automático'],
      color: 'bg-purple-500',
      icon: '💎'
    },
    {
      id: 5,
      name: 'Diamante',
      description: 'Nível exclusivo',
      min_points: 50000,
      discount_percentage: 25,
      benefits: ['25% de desconto', 'Suporte VIP 24h', 'Frete grátis', 'Check-in antecipado', 'Upgrade automático', 'Concierge personalizado'],
      color: 'bg-blue-500',
      icon: '💎'
    }
  ]);

  const [userLoyalty] = useState<UserLoyalty>({
    id: 1,
    user_id: 1,
    tier_id: 2,
    points_balance: 2500,
    lifetime_points: 8500,
    tier_name: 'Prata',
    tier_color: 'bg-gray-400',
    tier_icon: '🥈',
    next_tier_points: 2500,
    progress_percentage: 50
  });

  const [loyaltyCampaigns] = useState<LoyaltyCampaign[]>([
    {
      id: 1,
      name: 'Promoção de Verão',
      description: 'Ganhe pontos extras em todas as reservas',
      points_multiplier: 1.5,
      bonus_points: 500,
      start_date: '2025-01-01',
      end_date: '2025-03-31',
      is_active: true,
      applicable_tiers: ['Bronze', 'Prata', 'Ouro', 'Platina']
    },
    {
      id: 2,
      name: 'Black Friday',
      description: 'Pontos duplos em compras',
      points_multiplier: 2.0,
      bonus_points: 1000,
      start_date: '2025-11-20',
      end_date: '2025-11-30',
      is_active: false,
      applicable_tiers: ['Ouro', 'Platina']
    }
  ]);

  const [stats] = useState({
    total_users: 15420,
    active_users: 12350,
    total_points_distributed: 2500000,
    average_points_per_user: 162,
    top_tier_users: 1250,
    conversion_rate: 78.5,
    total_campaigns: 8,
    active_campaigns: 3,
    total_rewards: 1250,
    pending_rewards: 45
  });

  // Cards clicáveis de estatísticas
  const statsCards = [
    {
      id: 'total_users',
      title: 'Total de Usuários',
      value: stats.total_users,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500',
      description: 'Usuários cadastrados no programa',
      onClick: () => handleCardClick('users')
    },
    {
      id: 'active_users',
      title: 'Usuários Ativos',
      value: stats.active_users,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-green-500',
      description: 'Usuários com atividade recente',
      onClick: () => handleCardClick('active_users')
    },
    {
      id: 'total_points',
      title: 'Pontos Distribuídos',
      value: stats.total_points_distributed.toLocaleString(),
      icon: <Star className="h-6 w-6" />,
      color: 'bg-yellow-500',
      description: 'Total de pontos distribuídos',
      onClick: () => handleCardClick('points')
    },
    {
      id: 'conversion_rate',
      title: 'Taxa de Conversão',
      value: `${stats.conversion_rate}%`,
      icon: <Award className="h-6 w-6" />,
      color: 'bg-purple-500',
      description: 'Taxa de conversão do programa',
      onClick: () => handleCardClick('conversion')
    },
    {
      id: 'total_campaigns',
      title: 'Campanhas Ativas',
      value: stats.active_campaigns,
      icon: <Gift className="h-6 w-6" />,
      color: 'bg-pink-500',
      description: 'Campanhas em andamento',
      onClick: () => handleCardClick('campaigns')
    },
    {
      id: 'total_rewards',
      title: 'Recompensas',
      value: stats.total_rewards,
      icon: <Crown className="h-6 w-6" />,
      color: 'bg-indigo-500',
      description: 'Total de recompensas concedidas',
      onClick: () => handleCardClick('rewards')
    }
  ];

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleCardClick = (cardType: string) => {
    setModalType(cardType);
    setShowModal(true);
    setShowDetails(true);
  };

  const handleTierClick = (tier: LoyaltyTier) => {
    setSelectedItem(tier);
    setModalType('tier_details');
    setShowModal(true);
  };

  const handleCampaignClick = (campaign: LoyaltyCampaign) => {
    setSelectedItem(campaign);
    setModalType('campaign_details');
    setShowModal(true);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new_tier':
        setModalType('new_tier');
        setShowModal(true);
        break;
      case 'new_campaign':
        setModalType('new_campaign');
        setShowModal(true);
        break;
      case 'export_data':
        handleExportData();
        break;
      case 'import_data':
        handleImportData();
        break;
      default:
        break;
    }
  };

  const handleExportData = () => {
    // Simular exportação de dados
    const data = {
      tiers: loyaltyTiers,
      campaigns: loyaltyCampaigns,
      stats: stats
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loyalty_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    // Simular importação de dados
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            console.log('Dados importados:', data);
            // Aqui você processaria os dados importados
          } catch (error) {
            console.error('Erro ao importar dados:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const filteredTiers = loyaltyTiers.filter(tier =>
    tier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tier.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCampaigns = loyaltyCampaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sistema de Fidelidade</h1>
                    <p className="text-sm text-gray-500">Gerencie programas de fidelidade e recompensas</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <NavigationButtons className="mr-4" />
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Visão Geral', icon: '📊' },
                { id: 'tiers', name: 'Níveis', icon: '🏆' },
                { id: 'campaigns', name: 'Campanhas', icon: '🎯' },
                { id: 'users', name: 'Usuários', icon: '👥' },
                { id: 'reports', name: 'Relatórios', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statsCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={card.onClick}
                    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 ${card.color.replace('bg-', 'bg-').replace('-500', '-100')} rounded-lg`}>
                          <div className={`${card.color.replace('bg-', 'text-')}`}>
                            {card.icon}
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">{card.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                      </div>
                      <div className="text-gray-400 hover:text-gray-600">
                        <span className="text-xs">Clique para detalhes</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => handleQuickAction('new_tier')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Novo Nível</p>
                      <p className="text-sm text-gray-500">Criar nível de fidelidade</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('new_campaign')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Gift className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Nova Campanha</p>
                      <p className="text-sm text-gray-500">Criar campanha promocional</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('export_data')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <Download className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Exportar Dados</p>
                      <p className="text-sm text-gray-500">Baixar relatórios</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction('import_data')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Upload className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Importar Dados</p>
                      <p className="text-sm text-gray-500">Carregar informações</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* User Loyalty Status */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Seu Status de Fidelidade</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full ${userLoyalty.tier_color} mr-4`}>
                        <span className="text-2xl">{userLoyalty.tier_icon}</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{userLoyalty.tier_name}</h4>
                        <p className="text-gray-500">Nível atual</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{userLoyalty.points_balance.toLocaleString()}</p>
                      <p className="text-gray-500">Pontos atuais</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progresso para próximo nível</span>
                      <span>{userLoyalty.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${userLoyalty.progress_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Faltam {userLoyalty.next_tier_points.toLocaleString()} pontos para o próximo nível
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Atividade Recente</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { action: 'Reserva realizada', points: '+150', date: 'Hoje, 14:30' },
                      { action: 'Avaliação enviada', points: '+50', date: 'Ontem, 16:45' },
                      { action: 'Check-in antecipado', points: '+25', date: '2 dias atrás' },
                      { action: 'Compra de pacote', points: '+300', date: '1 semana atrás' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-500">{activity.date}</p>
                          </div>
                        </div>
                        <span className="text-green-600 font-semibold">{activity.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tiers' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar níveis..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todos os níveis</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Nível
                </button>
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTiers.map((tier) => (
                  <div 
                    key={tier.id} 
                    onClick={() => handleTierClick(tier)}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200"
                  >
                    <div className={`p-6 ${tier.color} rounded-t-lg`}>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{tier.icon}</span>
                        <div className="flex space-x-2">
                          <button className="p-1 bg-white/20 rounded hover:bg-white/30 transition-colors">
                            <Edit className="h-4 w-4 text-white" />
                          </button>
                          <button className="p-1 bg-white/20 rounded hover:bg-white/30 transition-colors">
                            <Trash className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-4">{tier.name}</h3>
                      <p className="text-white/80 text-sm mt-1">{tier.description}</p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Pontos necessários:</span>
                          <span className="font-semibold">{tier.min_points.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Desconto:</span>
                          <span className="font-semibold text-green-600">{tier.discount_percentage}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Benefícios:</span>
                          <ul className="mt-2 space-y-1">
                            {tier.benefits.map((benefit, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <div className="w-1 h-1 bg-purple-500 rounded-full mr-2"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar campanhas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </button>
              </div>

              {/* Campaigns List */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Campanhas Ativas</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => (
                    <div 
                      key={campaign.id} 
                      onClick={() => handleCampaignClick(campaign)}
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              campaign.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.is_active ? 'Ativa' : 'Inativa'}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-1">{campaign.description}</p>
                          <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                            <span>Multiplicador: {campaign.points_multiplier}x</span>
                            <span>Bônus: +{campaign.bonus_points} pontos</span>
                            <span>Válida até: {new Date(campaign.end_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Usuários do Programa de Fidelidade</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Relatórios de Fidelidade</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500">Funcionalidade em desenvolvimento...</p>
              </div>
            </div>
          )}
        </div>

        {/* Modais */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalType === 'users' && 'Detalhes dos Usuários'}
                  {modalType === 'active_users' && 'Usuários Ativos'}
                  {modalType === 'points' && 'Pontos Distribuídos'}
                  {modalType === 'conversion' && 'Taxa de Conversão'}
                  {modalType === 'campaigns' && 'Campanhas Ativas'}
                  {modalType === 'rewards' && 'Recompensas'}
                  {modalType === 'tier_details' && 'Detalhes do Nível'}
                  {modalType === 'campaign_details' && 'Detalhes da Campanha'}
                  {modalType === 'new_tier' && 'Novo Nível'}
                  {modalType === 'new_campaign' && 'Nova Campanha'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                {modalType === 'users' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900">Total de Usuários</h3>
                        <p className="text-2xl font-bold text-blue-600">{stats.total_users.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-900">Usuários Ativos</h3>
                        <p className="text-2xl font-bold text-green-600">{stats.active_users.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Distribuição por Nível</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Bronze</span>
                          <span className="font-semibold">8,450 usuários</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prata</span>
                          <span className="font-semibold">4,200 usuários</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ouro</span>
                          <span className="font-semibold">2,100 usuários</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platina</span>
                          <span className="font-semibold">670 usuários</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'points' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-900">Pontos Distribuídos</h3>
                      <p className="text-2xl font-bold text-yellow-600">{stats.total_points_distributed.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900">Média por Usuário</h3>
                        <p className="text-xl font-bold text-gray-600">{stats.average_points_per_user}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900">Pontos Pendentes</h3>
                        <p className="text-xl font-bold text-gray-600">45,230</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Distribuição Mensal</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Janeiro</span>
                          <span className="font-semibold">125,000 pontos</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fevereiro</span>
                          <span className="font-semibold">98,500 pontos</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Março</span>
                          <span className="font-semibold">156,200 pontos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'tier_details' && selectedItem && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">{selectedItem.icon}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{selectedItem.name}</h3>
                        <p className="text-gray-500">{selectedItem.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900">Desconto</h4>
                        <p className="text-xl font-bold text-gray-600">{selectedItem.discount_percentage}%</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900">Pontos Necessários</h4>
                        <p className="text-xl font-bold text-gray-600">{selectedItem.min_points.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Benefícios</h4>
                      <ul className="space-y-1">
                        {selectedItem.benefits.map((benefit: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <span className="text-green-500 mr-2">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {modalType === 'campaign_details' && selectedItem && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedItem.name}</h3>
                      <p className="text-gray-500">{selectedItem.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900">Multiplicador</h4>
                        <p className="text-xl font-bold text-gray-600">{selectedItem.points_multiplier}x</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900">Bônus</h4>
                        <p className="text-xl font-bold text-gray-600">+{selectedItem.bonus_points} pontos</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Período</h4>
                      <div className="flex justify-between">
                        <span>Início: {new Date(selectedItem.start_date).toLocaleDateString('pt-BR')}</span>
                        <span>Fim: {new Date(selectedItem.end_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Níveis Aplicáveis</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.applicable_tiers.map((tier: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {tier}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'new_tier' && (
                  <div className="space-y-4">
                    <p className="text-gray-600">Formulário para criar novo nível de fidelidade...</p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Criar Nível
                      </button>
                    </div>
                  </div>
                )}

                {modalType === 'new_campaign' && (
                  <div className="space-y-4">
                    <p className="text-gray-600">Formulário para criar nova campanha...</p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Criar Campanha
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 