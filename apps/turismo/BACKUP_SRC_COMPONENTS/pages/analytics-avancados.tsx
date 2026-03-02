'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import {
  BarChart3,
  TrendingUp,
  Download,
  Settings,
  Filter,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Star,
  Target,
  Activity,
  Zap,
  Brain,
  Eye,
  RefreshCw,
  PlayCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Mock data para demonstração
const generateMockData = (type: string) => {
  switch (type) {
    case 'revenue_trend':
      return Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
        receita: Math.floor(Math.random() * 50000) + 20000,
        meta: 40000,
        crescimento: Math.floor(Math.random() * 20) + 5
      }));

    case 'customer_segments':
      return [
        { segmento: 'Premium', valor: 35, clientes: 150, receita: 245000 },
        { segmento: 'Standard', valor: 45, clientes: 320, receita: 180000 },
        { segmento: 'Basic', valor: 20, clientes: 280, receita: 95000 }
      ];

    case 'destination_performance':
      return [
        { destino: 'Caldas Novas', vendas: 125, receita: 185000, satisfacao: 4.8 },
        { destino: 'Rio Quente', vendas: 98, receita: 145000, satisfacao: 4.6 },
        { destino: 'Pirenópolis', vendas: 76, receita: 112000, satisfacao: 4.7 },
        { destino: 'Chapada dos Veadeiros', vendas: 54, receita: 98000, satisfacao: 4.9 },
        { destino: 'Brasília', vendas: 43, receita: 76000, satisfacao: 4.5 }
      ];

    case 'seasonal_trends':
      return Array.from({ length: 12 }, (_, i) => ({
        mes: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
        vendas: Math.floor(Math.random() * 100) + 30,
        ocupacao: Math.floor(Math.random() * 30) + 60,
        preco_medio: Math.floor(Math.random() * 500) + 800
      }));

    case 'customer_journey':
      return [
        { etapa: 'Descoberta', conversao: 100, abandono: 0 },
        { etapa: 'Interesse', conversao: 75, abandono: 25 },
        { etapa: 'Consideração', conversao: 45, abandono: 30 },
        { etapa: 'Reserva', conversao: 25, abandono: 20 },
        { etapa: 'Pagamento', conversao: 20, abandono: 5 }
      ];

    default:
      return [];
  }
};

export default function AnalyticsAvancados() {
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>({});
  const [predictions, setPredictions] = useState<any>([]);

  useEffect(() => {
    loadAnalyticsData();
    generatePredictions();
  }, [selectedPeriod, selectedSegment]);

  const loadAnalyticsData = async () => {
    setRefreshing(true);

    // Simular carregamento de dados
    await new Promise(resolve => setTimeout(resolve, 1000));

    setData({
      revenue_trend: generateMockData('revenue_trend'),
      customer_segments: generateMockData('customer_segments'),
      destination_performance: generateMockData('destination_performance'),
      seasonal_trends: generateMockData('seasonal_trends'),
      customer_journey: generateMockData('customer_journey')
    });

    setRefreshing(false);
  };

  const generatePredictions = () => {
    // Simular predições baseadas em IA
    const predictions = [
      {
        tipo: 'Receita',
        predicao: 'Crescimento de 15% no próximo trimestre',
        confianca: 87,
        trend: 'up'
      },
      {
        tipo: 'Demanda',
        predicao: 'Pico de reservas em Julho (Férias)',
        confianca: 92,
        trend: 'up'
      },
      {
        tipo: 'Preços',
        predicao: 'Oportunidade de aumento de 8% em pacotes Premium',
        confianca: 78,
        trend: 'up'
      },
      {
        tipo: 'Churn',
        predicao: 'Possível perda de 12 clientes Premium',
        confianca: 83,
        trend: 'down'
      }
    ];
    setPredictions(predictions);
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  const handleExport = (format: string) => {
    console.log(`Exportando dados em formato ${format}`);
    // Implementar lógica de exportação
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header com Controles */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Analytics Avançados RSV 360
            </h1>
            <p className="text-gray-600">
              Business Intelligence com IA Preditiva para Turismo
            </p>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2">
              <Label htmlFor="period">Período:</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="6m">6 meses</SelectItem>
                  <SelectItem value="12m">12 meses</SelectItem>
                  <SelectItem value="2y">2 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="segment">Segmento:</Label>
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* KPIs Avançados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Revenue Score</p>
                  <p className="text-2xl font-bold text-blue-900">8.7/10</p>
                  <p className="text-blue-700 text-xs">+12% vs período anterior</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">NPS Score</p>
                  <p className="text-2xl font-bold text-green-900">72</p>
                  <p className="text-green-700 text-xs">+5 pontos este mês</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Conversão</p>
                  <p className="text-2xl font-bold text-orange-900">18.5%</p>
                  <p className="text-orange-700 text-xs">+2.3% vs meta</p>
                </div>
                <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">LTV/CAC</p>
                  <p className="text-2xl font-bold text-purple-900">4.2x</p>
                  <p className="text-purple-700 text-xs">Excelente saúde</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="insights">
              <Brain className="h-4 w-4 mr-2" />
              IA Insights
            </TabsTrigger>
            <TabsTrigger value="trends">
              <TrendingUp className="h-4 w-4 mr-2" />
              Tendências
            </TabsTrigger>
            <TabsTrigger value="segments">
              <Users className="h-4 w-4 mr-2" />
              Segmentação
            </TabsTrigger>
            <TabsTrigger value="geo">
              <MapPin className="h-4 w-4 mr-2" />
              Geo Analytics
            </TabsTrigger>
            <TabsTrigger value="journey">
              <Eye className="h-4 w-4 mr-2" />
              Customer Journey
            </TabsTrigger>
          </TabsList>

          {/* IA Insights */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span>Predições IA</span>
                  </CardTitle>
                  <CardDescription>
                    Insights preditivos baseados em machine learning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.map((pred, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{pred.tipo}</h4>
                          <Badge variant={pred.trend === 'up' ? 'default' : 'destructive'}>
                            {pred.confianca}% confiança
                          </Badge>
                        </div>
                        <p className="text-gray-700 text-sm">{pred.predicao}</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${pred.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${pred.confianca}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendações Inteligentes</CardTitle>
                  <CardDescription>Ações sugeridas para otimização</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <h4 className="font-semibold text-blue-900 mb-2">📈 Oportunidade de Receita</h4>
                      <p className="text-blue-800 text-sm">
                        Implementar preços dinâmicos pode aumentar receita em até 15%
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <h4 className="font-semibold text-green-900 mb-2">🎯 Otimização de Marketing</h4>
                      <p className="text-green-800 text-sm">
                        Focar campanhas em clientes Premium durante férias de julho
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                      <h4 className="font-semibold text-orange-900 mb-2">⚠️ Risco de Churn</h4>
                      <p className="text-orange-800 text-sm">
                        12 clientes com alto risco de cancelamento identificados
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                      <h4 className="font-semibold text-purple-900 mb-2">🚀 Expansão de Mercado</h4>
                      <p className="text-purple-800 text-sm">
                        Demanda crescente por turismo ecológico na região
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tendências */}
          <TabsContent value="trends">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Tendências de Receita</CardTitle>
                  <CardDescription>Evolução da receita com predições futuras</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data.revenue_trend || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [`R$ ${value?.toLocaleString()}`, name]} />
                        <Area type="monotone" dataKey="receita" fill="#8884d8" fillOpacity={0.3} />
                        <Line type="monotone" dataKey="receita" stroke="#8884d8" strokeWidth={3} />
                        <Line type="monotone" dataKey="meta" stroke="#ff7300" strokeDasharray="5 5" />
                        <Bar dataKey="crescimento" fill="#82ca9d" yAxisId="right" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sazonalidade e Ocupação</CardTitle>
                  <CardDescription>Padrões sazonais de demanda e preços</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data.seasonal_trends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="vendas" fill="#8884d8" />
                        <Line yAxisId="right" type="monotone" dataKey="ocupacao" stroke="#ff7300" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="preco_medio" stroke="#00ff00" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Segmentação */}
          <TabsContent value="segments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Segmentação de Clientes</CardTitle>
                  <CardDescription>Distribuição por segmento de valor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.customer_segments || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ segmento, valor }) => `${segmento}: ${valor}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="valor"
                        >
                          {(data.customer_segments || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance por Segmento</CardTitle>
                  <CardDescription>Receita e quantidade de clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.customer_segments || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="segmento" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value, name) => [
                          name === 'receita' ? `R$ ${value?.toLocaleString()}` : value,
                          name
                        ]} />
                        <Bar yAxisId="left" dataKey="receita" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="clientes" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Geo Analytics */}
          <TabsContent value="geo">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Destino</CardTitle>
                <CardDescription>Análise geográfica de vendas e satisfação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={data.destination_performance || []}>
                      <CartesianGrid />
                      <XAxis dataKey="vendas" name="Vendas" />
                      <YAxis dataKey="receita" name="Receita" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter dataKey="satisfacao" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(data.destination_performance || []).map((dest: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">{dest.destino}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Vendas:</span>
                          <span className="font-medium">{dest.vendas}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Receita:</span>
                          <span className="font-medium">R$ {dest.receita?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Satisfação:</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="font-medium">{dest.satisfacao}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Journey */}
          <TabsContent value="journey">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Customer Journey</CardTitle>
                <CardDescription>Funil de conversão e pontos de abandono</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.customer_journey || []} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="etapa" type="category" />
                      <Tooltip />
                      <Bar dataKey="conversao" fill="#8884d8" />
                      <Bar dataKey="abandono" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Oportunidades de Otimização</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                        <strong>Alto abandono na consideração:</strong> Simplificar processo de comparação
                      </div>
                      <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <strong>Gargalo no pagamento:</strong> Adicionar mais opções de pagamento
                      </div>
                      <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                        <strong>Boa conversão inicial:</strong> Manter estratégia de atração atual
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Métricas do Funil</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Taxa de Conversão Geral:</span>
                        <Badge variant="default">20%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tempo Médio no Funil:</span>
                        <Badge variant="outline">5.2 dias</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Valor Médio por Conversão:</span>
                        <Badge variant="default">R$ 1.850</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>ROI de Marketing:</span>
                        <Badge variant="default">320%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Ações Rápidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => handleExport('pdf')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button onClick={() => handleExport('excel')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
              <Button onClick={() => handleExport('dashboard')} variant="outline">
                <PlayCircle className="h-4 w-4 mr-2" />
                Agendar Relatório
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurar Alertas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
