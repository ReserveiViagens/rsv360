import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  ShoppingCart, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import { useToast } from '../components/ToastContainer';

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  totalTransactions: number;
  averageTransactionValue: number;
  paymentMethods: {
    credit_card: number;
    debit_card: number;
    pix: number;
    bank_transfer: number;
    gift_card: number;
  };
  topProducts: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  refunds: {
    total: number;
    percentage: number;
  };
  pendingPayments: number;
  failedPayments: number;
}

const FinanceDashboard: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    paymentMethods: {
      credit_card: 0,
      debit_card: 0,
      pix: 0,
      bank_transfer: 0,
      gift_card: 0
    },
    topProducts: [],
    revenueByMonth: [],
    refunds: { total: 0, percentage: 0 },
    pendingPayments: 0,
    failedPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      // Simular dados financeiros (em produção, viria da API)
      const mockData: FinancialMetrics = {
        totalRevenue: 1250000.50,
        monthlyRevenue: 85000.75,
        revenueGrowth: 12.5,
        totalTransactions: 15420,
        averageTransactionValue: 81.15,
        paymentMethods: {
          credit_card: 45,
          debit_card: 25,
          pix: 20,
          bank_transfer: 8,
          gift_card: 2
        },
        topProducts: [
          { name: 'Pacote Disney', revenue: 250000, quantity: 1250 },
          { name: 'Ingressos Universal', revenue: 180000, quantity: 900 },
          { name: 'City Tour Miami', revenue: 120000, quantity: 800 },
          { name: 'Cruzeiro Caribe', revenue: 95000, quantity: 190 },
          { name: 'Hotel Premium', revenue: 85000, quantity: 425 }
        ],
        revenueByMonth: [
          { month: 'Jan', revenue: 75000, transactions: 920 },
          { month: 'Fev', revenue: 82000, transactions: 1010 },
          { month: 'Mar', revenue: 78000, transactions: 950 },
          { month: 'Abr', revenue: 85000, transactions: 1040 },
          { month: 'Mai', revenue: 92000, transactions: 1120 },
          { month: 'Jun', revenue: 88000, transactions: 1080 }
        ],
        refunds: { total: 12500, percentage: 1.0 },
        pendingPayments: 8500,
        failedPayments: 2300
      };
      
      setMetrics(mockData);
      showSuccess('Sucesso', 'Dados financeiros carregados com sucesso');
    } catch (error) {
      showError('Erro', 'Falha ao carregar dados financeiros');
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
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Carregando dados financeiros...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <p className="text-gray-600">Visão geral das métricas financeiras e performance de vendas</p>
        </div>
        <div className="flex items-center space-x-4">
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
            onClick={loadFinancialData}
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
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(metrics.revenueGrowth)}
                <span className={`text-sm font-medium ml-1 ${getGrowthColor(metrics.revenueGrowth)}`}>
                  {formatPercentage(metrics.revenueGrowth)}
                </span>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.monthlyRevenue)}</p>
              <p className="text-sm text-gray-500 mt-1">Este mês</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transações</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalTransactions.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Total de vendas</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageTransactionValue)}</p>
              <p className="text-sm text-gray-500 mt-1">Por transação</p>
            </div>
            <CreditCard className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reembolsos</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold text-red-600">{formatCurrency(metrics.refunds.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Percentual</span>
              <span className="font-semibold">{metrics.refunds.percentage}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagamentos Pendentes</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Valor</span>
              <span className="font-semibold text-yellow-600">{formatCurrency(metrics.pendingPayments)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pendente</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagamentos Falhados</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Valor</span>
              <span className="font-semibold text-red-600">{formatCurrency(metrics.failedPayments)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Falhou</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métodos de Pagamento */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
          <div className="space-y-3">
            {Object.entries(metrics.paymentMethods).map(([method, percentage]) => (
              <div key={method} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {method.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Mais Vendidos</h3>
          <div className="space-y-3">
            {metrics.topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.quantity} vendas</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 ml-4">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Receita por Mês */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita por Mês</h3>
        <div className="grid grid-cols-6 gap-4">
          {metrics.revenueByMonth.map((month, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">{month.month}</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(month.revenue)}</p>
                <p className="text-xs text-gray-500">{month.transactions} trans.</p>
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
            <BarChart3 className="h-4 w-4" />
            <span>Relatório de Vendas</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <PieChart className="h-4 w-4" />
            <span>Análise de Receita</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            <Activity className="h-4 w-4" />
            <span>Métricas de Performance</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <Calendar className="h-4 w-4" />
            <span>Projeções</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard; 
