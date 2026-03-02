import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Mail,
  MessageSquare,
  Share2,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import { useToast } from '../components/ToastContainer';

interface MarketingMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalReach: number;
  totalImpressions: number;
  totalClicks: number;
  conversionRate: number;
  clickThroughRate: number;
  costPerClick: number;
  totalSpent: number;
  roi: number;
  campaigns: Array<{
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed';
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    spent: number;
    revenue: number;
    startDate: string;
    endDate: string;
  }>;
  channels: {
    email: number;
    social_media: number;
    google_ads: number;
    facebook_ads: number;
    influencer: number;
    affiliate: number;
  };
  audienceDemographics: {
    age_groups: {
      '18-24': number;
      '25-34': number;
      '35-44': number;
      '45-54': number;
      '55+': number;
    };
    locations: Array<{
      city: string;
      percentage: number;
    }>;
  };
  topPerformingContent: Array<{
    title: string;
    type: string;
    reach: number;
    engagement: number;
    conversions: number;
  }>;
}

const MarketingDashboard: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [metrics, setMetrics] = useState<MarketingMetrics>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalReach: 0,
    totalImpressions: 0,
    totalClicks: 0,
    conversionRate: 0,
    clickThroughRate: 0,
    costPerClick: 0,
    totalSpent: 0,
    roi: 0,
    campaigns: [],
    channels: {
      email: 0,
      social_media: 0,
      google_ads: 0,
      facebook_ads: 0,
      influencer: 0,
      affiliate: 0
    },
    audienceDemographics: {
      age_groups: {
        '18-24': 0,
        '25-34': 0,
        '35-44': 0,
        '45-54': 0,
        '55+': 0
      },
      locations: []
    },
    topPerformingContent: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadMarketingData();
  }, [dateRange, filter]);

  const loadMarketingData = async () => {
    try {
      setLoading(true);
      // Simular dados de marketing (em produÃ§Ã£o, viria da API)
      const mockData: MarketingMetrics = {
        totalCampaigns: 24,
        activeCampaigns: 8,
        totalReach: 1250000,
        totalImpressions: 3500000,
        totalClicks: 87500,
        conversionRate: 3.2,
        clickThroughRate: 2.5,
        costPerClick: 1.85,
        totalSpent: 161875,
        roi: 4.2,
        campaigns: [
          {
            id: '1',
            name: 'Black Friday Disney',
            status: 'active',
            reach: 250000,
            impressions: 750000,
            clicks: 18750,
            conversions: 600,
            spent: 34687.50,
            revenue: 180000,
            startDate: '2024-11-20',
            endDate: '2024-11-30'
          },
          {
            id: '2',
            name: 'VerÃ£o Universal',
            status: 'active',
            reach: 180000,
            impressions: 540000,
            clicks: 13500,
            conversions: 432,
            spent: 24975,
            revenue: 129600,
            startDate: '2024-12-01',
            endDate: '2024-12-31'
          },
          {
            id: '3',
            name: 'Email Newsletter Q4',
            status: 'active',
            reach: 50000,
            impressions: 50000,
            clicks: 2500,
            conversions: 125,
            spent: 500,
            revenue: 18750,
            startDate: '2024-10-01',
            endDate: '2024-12-31'
          }
        ],
        channels: {
          email: 15,
          social_media: 25,
          google_ads: 30,
          facebook_ads: 20,
          influencer: 8,
          affiliate: 2
        },
        audienceDemographics: {
          age_groups: {
            '18-24': 20,
            '25-34': 35,
            '35-44': 25,
            '45-54': 15,
            '55+': 5
          },
          locations: [
            { city: 'SÃ£o Paulo', percentage: 30 },
            { city: 'Rio de Janeiro', percentage: 20 },
            { city: 'Belo Horizonte', percentage: 15 },
            { city: 'BrasÃ­lia', percentage: 12 },
            { city: 'Salvador', percentage: 8 },
            { city: 'Outros', percentage: 15 }
          ]
        },
        topPerformingContent: [
          {
            title: 'Guia Completo Disney World',
            type: 'Blog Post',
            reach: 45000,
            engagement: 12.5,
            conversions: 180
          },
          {
            title: 'PromoÃ§Ã£o Black Friday',
            type: 'Email Campaign',
            reach: 25000,
            engagement: 8.2,
            conversions: 205
          },
          {
            title: 'Tour Virtual Universal',
            type: 'Video',
            reach: 35000,
            engagement: 15.8,
            conversions: 140
          },
          {
            title: 'Dicas de Viagem Miami',
            type: 'Social Post',
            reach: 28000,
            engagement: 6.5,
            conversions: 95
          },
          {
            title: 'Pacote FamÃ­lia Disney',
            type: 'Landing Page',
            reach: 15000,
            engagement: 22.1,
            conversions: 330
          }
        ]
      };
      
      setMetrics(mockData);
      showSuccess('Sucesso', 'Dados de marketing carregados com sucesso');
    } catch (error) {
      showError('Erro', 'Falha ao carregar dados de marketing');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Carregando dados de marketing...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Marketing</h1>
          <p className="text-gray-600">AnÃ¡lise de campanhas, conversÃµes e performance de marketing</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas as campanhas</option>
            <option value="active">Campanhas ativas</option>
            <option value="completed">Campanhas finalizadas</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Ãšltimos 7 dias</option>
            <option value="30d">Ãšltimos 30 dias</option>
            <option value="90d">Ãšltimos 90 dias</option>
            <option value="1y">Ãšltimo ano</option>
          </select>
          <button
            onClick={loadMarketingData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* MÃ©tricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alcance Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalReach)}</p>
              <p className="text-sm text-gray-500 mt-1">Pessoas alcanÃ§adas</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de ConversÃ£o</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.conversionRate)}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(0.5)}
                <span className="text-sm font-medium ml-1 text-green-600">+0.5%</span>
              </div>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.roi.toFixed(1)}x</p>
              <p className="text-sm text-gray-500 mt-1">Retorno sobre investimento</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Custo por Clique</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.costPerClick)}</p>
              <p className="text-sm text-gray-500 mt-1">CPC mÃ©dio</p>
            </div>
            <MousePointer className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* MÃ©tricas SecundÃ¡rias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campanhas</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{metrics.totalCampaigns}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ativas</span>
              <span className="font-semibold text-green-600">{metrics.activeCampaigns}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa de AtivaÃ§Ã£o</span>
              <span className="font-semibold">{formatPercentage((metrics.activeCampaigns / metrics.totalCampaigns) * 100)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engajamento</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">ImpressÃµes</span>
              <span className="font-semibold">{formatNumber(metrics.totalImpressions)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cliques</span>
              <span className="font-semibold">{formatNumber(metrics.totalClicks)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CTR</span>
              <span className="font-semibold">{formatPercentage(metrics.clickThroughRate)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investimento</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Gasto</span>
              <span className="font-semibold text-red-600">{formatCurrency(metrics.totalSpent)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Receita Gerada</span>
              <span className="font-semibold text-green-600">{formatCurrency(metrics.totalSpent * metrics.roi)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lucro</span>
              <span className="font-semibold text-blue-600">{formatCurrency((metrics.totalSpent * metrics.roi) - metrics.totalSpent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canais de Marketing */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">DistribuiÃ§Ã£o por Canal</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(metrics.channels).map(([channel, percentage]) => (
            <div key={channel} className="text-center">
              <div className="bg-blue-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
                <div className="text-sm font-medium text-gray-700 capitalize mt-1">
                  {channel.replace('_', ' ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campanhas Ativas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campanhas Ativas</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campanha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alcance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ConversÃµes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gasto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.campaigns.filter(c => c.status === 'active').map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-sm text-gray-500">{campaign.startDate} - {campaign.endDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(campaign.reach)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.conversions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(campaign.spent)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(campaign.revenue / campaign.spent).toFixed(1)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demografia da AudiÃªncia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Faixa EtÃ¡ria</h3>
          <div className="space-y-3">
            {Object.entries(metrics.audienceDemographics.age_groups).map(([age, percentage]) => (
              <div key={age} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{age} anos</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">LocalizaÃ§Ã£o</h3>
          <div className="space-y-3">
            {metrics.audienceDemographics.locations.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{location.city}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${location.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{location.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ConteÃºdo com Melhor Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ConteÃºdo com Melhor Performance</h3>
        <div className="space-y-4">
          {metrics.topPerformingContent.map((content, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{content.title}</h4>
                <p className="text-xs text-gray-500 capitalize">{content.type}</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{formatNumber(content.reach)}</p>
                  <p className="text-xs text-gray-500">Alcance</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{formatPercentage(content.engagement)}</p>
                  <p className="text-xs text-gray-500">Engajamento</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{content.conversions}</p>
                  <p className="text-xs text-gray-500">ConversÃµes</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AÃ§Ãµes RÃ¡pidas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AÃ§Ãµes RÃ¡pidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <Target className="h-4 w-4" />
            <span>Nova Campanha</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <BarChart3 className="h-4 w-4" />
            <span>RelatÃ³rio de ROI</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            <Users className="h-4 w-4" />
            <span>AnÃ¡lise de AudiÃªncia</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <Calendar className="h-4 w-4" />
            <span>Agendar Campanha</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard; 
