import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Mail, Target, Calendar, Download, RefreshCw, Filter, Eye, PieChart, Activity, DollarSign, Share2, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../components/ui/Button';
import { Select, SelectOption } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { cn } from '../../utils/cn';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, ComposedChart } from 'recharts';

export interface MarketingMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  convertedLeads: number;
  emailOpenRate: number;
  emailClickRate: number;
  socialMediaReach: number;
  socialMediaEngagement: number;
  roi: number;
  costPerLead: number;
}

export interface CampaignPerformance {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roi: number;
  ctr: number;
  cpc: number;
}

export interface LeadSourceData {
  source: string;
  leads: number;
  conversions: number;
  conversionRate: number;
  cost: number;
  revenue: number;
}

export interface SocialMediaData {
  platform: string;
  followers: number;
  reach: number;
  engagement: number;
  clicks: number;
  conversions: number;
}

export interface MarketingAnalyticsProps {
  className?: string;
}

const timeRangeOptions: SelectOption[] = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '1y', label: 'Último ano' }
];

const chartTypeOptions: SelectOption[] = [
  { value: 'bar', label: 'Gráfico de Barras' },
  { value: 'line', label: 'Gráfico de Linha' },
  { value: 'area', label: 'Gráfico de Área' },
  { value: 'pie', label: 'Gráfico de Pizza' }
];

const mockCampaignPerformance: CampaignPerformance[] = [
  { name: 'Black Friday', impressions: 125000, clicks: 8750, conversions: 438, spend: 2500, revenue: 21900, roi: 8.76, ctr: 7.0, cpc: 0.29 },
  { name: 'Instagram Ads', impressions: 89000, clicks: 6230, conversions: 312, spend: 1800, revenue: 15600, roi: 8.67, ctr: 7.0, cpc: 0.29 },
  { name: 'Google Ads', impressions: 156000, clicks: 10920, conversions: 546, spend: 3200, revenue: 27300, roi: 8.53, ctr: 7.0, cpc: 0.29 },
  { name: 'Newsletter', impressions: 45000, clicks: 3150, conversions: 158, spend: 200, revenue: 7900, roi: 38.5, ctr: 7.0, cpc: 0.13 },
  { name: 'Facebook Ads', impressions: 98000, clicks: 6860, conversions: 343, spend: 2100, revenue: 17150, roi: 8.17, ctr: 7.0, cpc: 0.31 }
];

const mockLeadSourceData: LeadSourceData[] = [
  { source: 'Google Ads', leads: 1250, conversions: 156, conversionRate: 12.5, cost: 3200, revenue: 15600 },
  { source: 'Facebook Ads', leads: 890, conversions: 98, conversionRate: 11.0, cost: 2100, revenue: 9800 },
  { source: 'Instagram Ads', leads: 720, conversions: 89, conversionRate: 12.4, cost: 1800, revenue: 8900 },
  { source: 'Email Marketing', leads: 650, conversions: 78, conversionRate: 12.0, cost: 200, revenue: 7800 },
  { source: 'Organic Search', leads: 420, conversions: 52, conversionRate: 12.4, cost: 0, revenue: 5200 },
  { source: 'Referral', leads: 280, conversions: 35, conversionRate: 12.5, cost: 0, revenue: 3500 }
];

const mockSocialMediaData: SocialMediaData[] = [
  { platform: 'Instagram', followers: 12500, reach: 45000, engagement: 8.5, clicks: 3200, conversions: 156 },
  { platform: 'Facebook', followers: 18900, reach: 67000, engagement: 6.2, clicks: 4100, conversions: 198 },
  { platform: 'Twitter', followers: 8200, reach: 28000, engagement: 4.8, clicks: 1800, conversions: 89 },
  { platform: 'LinkedIn', followers: 6500, reach: 22000, engagement: 7.1, clicks: 1200, conversions: 67 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const MarketingAnalytics: React.FC<MarketingAnalyticsProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('bar');
  const [activeTab, setActiveTab] = useState('overview');

  const totalMetrics = useMemo(() => {
    const totalSpend = mockCampaignPerformance.reduce((acc, campaign) => acc + campaign.spend, 0);
    const totalRevenue = mockCampaignPerformance.reduce((acc, campaign) => acc + campaign.revenue, 0);
    const totalLeads = mockLeadSourceData.reduce((acc, source) => acc + source.leads, 0);
    const totalConversions = mockLeadSourceData.reduce((acc, source) => acc + source.conversions, 0);

    return {
      totalSpend,
      totalRevenue,
      totalLeads,
      totalConversions,
      overallROI: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0,
      conversionRate: totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0
    };
  }, []);

  const getSocialMediaIcon = (platform: string) => {
    const icons = {
      Instagram: Instagram,
      Facebook: Facebook,
      Twitter: Twitter,
      LinkedIn: Linkedin
    };
    return icons[platform as keyof typeof icons] || Share2;
  };

  const getSocialMediaColor = (platform: string) => {
    const colors = {
      Instagram: 'text-pink-600',
      Facebook: 'text-blue-600',
      Twitter: 'text-blue-400',
      LinkedIn: 'text-blue-700'
    };
    return colors[platform as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics de Marketing</h2>
          <p className="text-gray-600">Análise detalhada de campanhas e performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            className="w-40"
          >
            {timeRangeOptions.map(option => (
              <SelectOption key={option.value} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalMetrics.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            +12% este período
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI Geral</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalMetrics.overallROI.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            +2.3% este período
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads Capturados</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalMetrics.totalLeads.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            +8.7% este período
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalMetrics.conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            +1.2% este período
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-14">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Campanhas
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Fontes de Leads
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Redes Sociais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Geral</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Receita vs. Investimento</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={mockCampaignPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="spend" fill="#EF4444" name="Investimento" />
                        <Bar dataKey="revenue" fill="#10B981" name="Receita" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">ROI por Campanha</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mockCampaignPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="roi" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Engajamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {mockCampaignPerformance.reduce((acc, c) => acc + c.ctr, 0) / mockCampaignPerformance.length}%
                    </div>
                    <p className="text-sm text-gray-600">CTR Médio</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      R$ {(mockCampaignPerformance.reduce((acc, c) => acc + c.cpc, 0) / mockCampaignPerformance.length).toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">CPC Médio</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {totalMetrics.conversionRate.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Taxa de Conversão</p>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Performance das Campanhas</h3>
                <Select
                  value={chartType}
                  onValueChange={setChartType}
                  className="w-40"
                >
                  {chartTypeOptions.map(option => (
                    <SelectOption key={option.value} value={option.value}>
                      {option.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>

              <Card className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  {chartType === 'bar' && (
                    <BarChart data={mockCampaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impressions" fill="#3B82F6" name="Impressões" />
                      <Bar dataKey="clicks" fill="#10B981" name="Cliques" />
                      <Bar dataKey="conversions" fill="#8B5CF6" name="Conversões" />
                    </BarChart>
                  )}
                  {chartType === 'line' && (
                    <LineChart data={mockCampaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="roi" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="ctr" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  )}
                  {chartType === 'area' && (
                    <AreaChart data={mockCampaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" />
                      <Area type="monotone" dataKey="spend" stackId="1" stroke="#EF4444" fill="#EF4444" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </Card>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Campanha</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Impressões</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Cliques</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Conversões</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Investimento</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Receita</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCampaignPerformance.map((campaign) => (
                      <tr key={campaign.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{campaign.name}</td>
                        <td className="py-4 px-4">{campaign.impressions.toLocaleString()}</td>
                        <td className="py-4 px-4">{campaign.clicks.toLocaleString()}</td>
                        <td className="py-4 px-4">{campaign.conversions.toLocaleString()}</td>
                        <td className="py-4 px-4">R$ {campaign.spend.toLocaleString()}</td>
                        <td className="py-4 px-4">R$ {campaign.revenue.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <Badge variant={campaign.roi > 8 ? 'success' : 'warning'}>
                            {campaign.roi.toFixed(1)}x
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Fontes de Leads</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Leads por Fonte</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockLeadSourceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="leads" fill="#3B82F6" name="Leads" />
                      <Bar dataKey="conversions" fill="#10B981" name="Conversões" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Taxa de Conversão por Fonte</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockLeadSourceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="conversionRate" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              <Card className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Distribuição de Leads</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockLeadSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percentage }) => `${source}: ${percentage?.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="leads"
                    >
                      {mockLeadSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Redes Sociais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockSocialMediaData.map((platform) => {
                  const IconComponent = getSocialMediaIcon(platform.platform);
                  return (
                    <Card key={platform.platform} className="p-6 text-center">
                      <div className={`mx-auto mb-3 p-3 rounded-full bg-gray-100 w-fit`}>
                        <IconComponent className={`w-6 h-6 ${getSocialMediaColor(platform.platform)}`} />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">{platform.platform}</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{platform.followers.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Seguidores</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-blue-600">{platform.engagement}%</p>
                          <p className="text-sm text-gray-600">Engajamento</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{platform.conversions}</p>
                          <p className="text-sm text-gray-600">Conversões</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Alcance por Plataforma</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockSocialMediaData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="reach" fill="#3B82F6" name="Alcance" />
                      <Bar dataKey="clicks" fill="#10B981" name="Cliques" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Engajamento vs. Conversões</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={mockSocialMediaData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="platform" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="engagement" fill="#8B5CF6" name="Engajamento (%)" />
                      <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#EF4444" strokeWidth={2} name="Conversões" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export { MarketingAnalytics };
export type { MarketingMetrics, CampaignPerformance, LeadSourceData, SocialMediaData, MarketingAnalyticsProps };
