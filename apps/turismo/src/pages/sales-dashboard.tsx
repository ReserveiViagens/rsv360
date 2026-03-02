import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Filter,
  Star
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import { useToast } from '../components/ToastContainer';

interface SalesMetrics {
  totalSales: number;
  monthlySales: number;
  salesGrowth: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  salesFunnel: {
    leads: number;
    prospects: number;
    opportunities: number;
    closed: number;
    lost: number;
  };
  topProducts: Array<{
    name: string;
    sales: number;
    quantity: number;
    revenue: number;
    rating: number;
  }>;
  salesByCategory: {
    attractions: number;
    hotels: number;
    packages: number;
    transportation: number;
    insurance: number;
  };
  salesByRegion: Array<{
    region: string;
    sales: number;
    percentage: number;
  }>;
  salesTeam: Array<{
    name: string;
    sales: number;
    target: number;
    performance: number;
    deals: number;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    product: string;
    amount: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    date: string;
  }>;
}

const SalesDashboard: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalSales: 0,
    monthlySales: 0,
    salesGrowth: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    salesFunnel: {
      leads: 0,
      prospects: 0,
      opportunities: 0,
      closed: 0,
      lost: 0
    },
    topProducts: [],
    salesByCategory: {
      attractions: 0,
      hotels: 0,
      packages: 0,
      transportation: 0,
      insurance: 0
    },
    salesByRegion: [],
    salesTeam: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadSalesData();
  }, [dateRange, filter]);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      // Simular dados de vendas (em produção, viria da API)
      const mockData: SalesMetrics = {
        totalSales: 1850000.75,
        monthlySales: 125000.50,
        salesGrowth: 18.5,
        totalOrders: 2340,
        averageOrderValue: 790.60,
        conversionRate: 15.2,
        salesFunnel: {
          leads: 5000,
          prospects: 2500,
          opportunities: 1200,
          closed: 2340,
          lost: 800
        },
        topProducts: [
          {
            name: 'Pacote Disney Completo',
            sales: 450,
            quantity: 450,
            revenue: 225000,
            rating: 4.8
          },
          {
            name: 'Ingressos Universal Studios',
            sales: 380,
            quantity: 380,
            revenue: 152000,
            rating: 4.6
          },
          {
            name: 'Hotel Premium Miami Beach',
            sales: 320,
            quantity: 320,
            revenue: 128000,
            rating: 4.7
          },
          {
            name: 'Cruzeiro Caribe 7 dias',
            sales: 180,
            quantity: 180,
            revenue: 162000,
            rating: 4.9
          },
          {
            name: 'City Tour Nova York',
            sales: 280,
            quantity: 280,
            revenue: 84000,
            rating: 4.5
          }
        ],
        salesByCategory: {
          attractions: 35,
          hotels: 25,
          packages: 30,
          transportation: 8,
          insurance: 2
        },
        salesByRegion: [
          { region: 'Sudeste', sales: 925000, percentage: 50 },
          { region: 'Sul', sales: 555000, percentage: 30 },
          { region: 'Nordeste', sales: 277500, percentage: 15 },
          { region: 'Centro-Oeste', sales: 92500, percentage: 5 }
        ],
        salesTeam: [
          {
            name: 'João Silva',
            sales: 250000,
            target: 200000,
            performance: 125,
            deals: 45
          },
          {
            name: 'Maria Santos',
            sales: 220000,
            target: 200000,
            performance: 110,
            deals: 38
          },
          {
            name: 'Pedro Costa',
            sales: 195000,
            target: 200000,
            performance: 97.5,
            deals: 32
          },
          {
            name: 'Ana Oliveira',
            sales: 180000,
            target: 200000,
            performance: 90,
            deals: 28
          }
        ],
        recentOrders: [
          {
            id: 'ORD-001',
            customer: 'Carlos Mendes',
            product: 'Pacote Disney',
            amount: 2500,
            status: 'confirmed',
            date: '2024-12-15'
          },
          {
            id: 'ORD-002',
            customer: 'Fernanda Lima',
            product: 'Hotel Miami',
            amount: 1800,
            status: 'completed',
            date: '2024-12-14'
          },
          {
            id: 'ORD-003',
            customer: 'Roberto Alves',
            product: 'Universal Studios',
            amount: 1200,
            status: 'pending',
            date: '2024-12-14'
          },
          {
            id: 'ORD-004',
            customer: 'Lucia Ferreira',
            product: 'Cruzeiro Caribe',
            amount: 3500,
            status: 'completed',
            date: '2024-12-13'
          },
          {
            id: 'ORD-005',
            customer: 'Marcos Souza',
            product: 'City Tour NY',
            amount: 800,
            status: 'cancelled',
            date: '2024-12-13'
          }
        ]
      };
      
      setMetrics(mockData);
      showSuccess('Sucesso', 'Dados de vendas carregados com sucesso');
    } catch (error) {
      showError('Erro', 'Falha ao carregar dados de vendas');
    } finally {
      setLoading(false);
    }
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

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 100) return 'text-green-600';
    if (performance >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Carregando dados de vendas...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Vendas</h1>
          <p className="text-gray-600">Análise de performance de vendas e funil de conversão</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas as vendas</option>
            <option value="completed">Vendas finalizadas</option>
            <option value="pending">Vendas pendentes</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <button
            onClick={loadSalesData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendas Totais</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalSales)}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(metrics.salesGrowth)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(metrics.salesGrowth)}`}>
                  {formatPercentage(metrics.salesGrowth)}
                </span>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendas Mensais</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.monthlySales)}</p>
              <p className="text-sm text-gray-500 mt-1">Este mês</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Total de pedidos</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageOrderValue)}</p>
              <p className="text-sm text-gray-500 mt-1">Por pedido</p>
            </div>
            <Target className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Funil de Vendas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Funil de Vendas</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 rounded-lg p-4">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-blue-600">{metrics.salesFunnel.leads.toLocaleString()}</p>
              <p className="text-sm font-medium text-gray-700">Leads</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 rounded-lg p-4">
              <Target className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-yellow-600">{metrics.salesFunnel.prospects.toLocaleString()}</p>
              <p className="text-sm font-medium text-gray-700">Prospects</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 rounded-lg p-4">
              <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-orange-600">{metrics.salesFunnel.opportunities.toLocaleString()}</p>
              <p className="text-sm font-medium text-gray-700">Oportunidades</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-lg p-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-green-600">{metrics.salesFunnel.closed.toLocaleString()}</p>
              <p className="text-sm font-medium text-gray-700">Fechadas</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-red-100 rounded-lg p-4">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-red-600">{metrics.salesFunnel.lost.toLocaleString()}</p>
              <p className="text-sm font-medium text-gray-700">Perdidas</p>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Taxa de Conversão: <span className="font-semibold">{formatPercentage(metrics.conversionRate)}</span>
          </p>
        </div>
      </div>

      {/* Produtos Mais Vendidos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Mais Vendidos</h3>
        <div className="space-y-4">
          {metrics.topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">{product.quantity} vendas</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500 ml-1">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                <p className="text-xs text-gray-500">{product.sales} unidades</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendas por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Categoria</h3>
          <div className="space-y-3">
            {Object.entries(metrics.salesByCategory).map(([category, percentage]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Região</h3>
          <div className="space-y-3">
            {metrics.salesByRegion.map((region, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{region.region}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{region.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipe de Vendas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance da Equipe</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negócios</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.salesTeam.map((member, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(member.sales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(member.target)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${getPerformanceColor(member.performance)}`}>
                      {member.performance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.deals}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pedidos Recentes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Recentes</h3>
        <div className="space-y-3">
          {metrics.recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{order.customer}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{order.product}</p>
                  <p className="text-xs text-gray-400">{order.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.amount)}</p>
                <p className="text-xs text-gray-500">{order.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <ShoppingCart className="h-4 w-4" />
            <span>Nova Venda</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <BarChart3 className="h-4 w-4" />
            <span>Relatório de Vendas</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            <Users className="h-4 w-4" />
            <span>Gestão de Leads</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <Target className="h-4 w-4" />
            <span>Definir Metas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard; 
