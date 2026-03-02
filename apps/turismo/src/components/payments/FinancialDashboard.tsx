import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Users, Calendar, BarChart3, PieChart, Activity, Download, RefreshCw, Eye, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select, SelectOption } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { cn } from '../../utils/cn';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export interface FinancialMetrics {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  revenueGrowth: number;
  transactionGrowth: number;
  conversionRate: number;
  refundRate: number;
  netRevenue: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
  refunds: number;
  netRevenue: number;
  growth: number;
}

export interface PaymentMethodData {
  method: string;
  revenue: number;
  transactions: number;
  percentage: number;
  growth: number;
}

export interface GatewayPerformance {
  gateway: string;
  revenue: number;
  transactions: number;
  successRate: number;
  averageResponseTime: number;
  fees: number;
}

export interface FinancialDashboardProps {
  className?: string;
}

const timeRangeOptions: SelectOption[] = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '1y', label: 'Último ano' }
];

const chartTypeOptions: SelectOption[] = [
  { value: 'revenue', label: 'Receita', icon: '💰' },
  { value: 'transactions', label: 'Transações', icon: '📊' },
  { value: 'growth', label: 'Crescimento', icon: '📈' }
];

const mockRevenueData: RevenueData[] = [
  { date: '01/08', revenue: 12500, transactions: 45, refunds: 750, netRevenue: 11750, growth: 12.5 },
  { date: '02/08', revenue: 13800, transactions: 52, refunds: 920, netRevenue: 12880, growth: 10.4 },
  { date: '03/08', revenue: 15200, transactions: 58, refunds: 1100, netRevenue: 14100, growth: 9.5 },
  { date: '04/08', revenue: 16800, transactions: 64, refunds: 1250, netRevenue: 15550, growth: 10.3 },
  { date: '05/08', revenue: 18500, transactions: 71, refunds: 1380, netRevenue: 17120, growth: 10.1 },
  { date: '06/08', revenue: 20300, transactions: 78, refunds: 1520, netRevenue: 18780, growth: 9.7 },
  { date: '07/08', revenue: 22100, transactions: 85, refunds: 1650, netRevenue: 20450, growth: 8.9 }
];

const mockPaymentMethodData: PaymentMethodData[] = [
  { method: 'Cartão de Crédito', revenue: 125000, transactions: 450, percentage: 65, growth: 12.5 },
  { method: 'PIX', revenue: 45000, transactions: 180, percentage: 23, growth: 25.8 },
  { method: 'Boleto', revenue: 15000, transactions: 60, percentage: 8, growth: -5.2 },
  { method: 'Transferência', revenue: 8000, transactions: 25, percentage: 4, growth: 8.1 }
];

const mockGatewayPerformance: GatewayPerformance[] = [
  { gateway: 'Stripe', revenue: 98000, transactions: 320, successRate: 98.5, averageResponseTime: 1200, fees: 2842 },
  { gateway: 'PagSeguro', revenue: 52000, transactions: 210, successRate: 95.2, averageResponseTime: 1800, fees: 2074 },
  { gateway: 'MercadoPago', revenue: 28000, transactions: 95, successRate: 96.8, averageResponseTime: 1500, fees: 1392 },
  { gateway: 'PayPal', revenue: 18000, transactions: 65, successRate: 97.1, averageResponseTime: 1400, fees: 522 }
];

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ className }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<SelectOption>(timeRangeOptions[1]);
  const [selectedChartType, setSelectedChartType] = useState<SelectOption>(chartTypeOptions[0]);
  const [currentMetrics, setCurrentMetrics] = useState<FinancialMetrics>({
    totalRevenue: 22100,
    totalTransactions: 85,
    averageTransactionValue: 260.0,
    revenueGrowth: 8.9,
    transactionGrowth: 8.2,
    conversionRate: 12.5,
    refundRate: 7.5,
    netRevenue: 20450
  });

  const previousMetrics: FinancialMetrics = {
    totalRevenue: 20300,
    totalTransactions: 78,
    averageTransactionValue: 260.3,
    revenueGrowth: 9.7,
    transactionGrowth: 9.0,
    conversionRate: 12.3,
    refundRate: 7.8,
    netRevenue: 18780
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const renderRevenueChart = () => {
    const data = mockRevenueData.map(item => ({
      ...item,
      revenue: item.revenue / 1000, // Convert to thousands for better display
      netRevenue: item.netRevenue / 1000
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`R$ ${value}k`, '']}
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stackId="1" 
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.3}
            name="Receita Bruta"
          />
          <Area 
            type="monotone" 
            dataKey="netRevenue" 
            stackId="2" 
            stroke="#10B981" 
            fill="#10B981" 
            fillOpacity={0.3}
            name="Receita Líquida"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderTransactionsChart = () => {
    const data = mockRevenueData.map(item => ({
      date: item.date,
      transactions: item.transactions,
      growth: item.growth
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="transactions" fill="#3B82F6" name="Transações" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderGrowthChart = () => {
    const data = mockRevenueData.map(item => ({
      date: item.date,
      revenueGrowth: item.growth,
      transactionGrowth: item.growth * 0.8 // Simulate transaction growth
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '']} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="revenueGrowth" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Crescimento da Receita"
          />
          <Line 
            type="monotone" 
            dataKey="transactionGrowth" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Crescimento das Transações"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderPaymentMethodsChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mockPaymentMethodData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="method" type="category" width={120} />
          <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
          <Legend />
          <Bar dataKey="revenue" fill="#3B82F6" name="Receita" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderGatewayPerformanceChart = () => {
    const data = mockGatewayPerformance.map(item => ({
      ...item,
      revenue: item.revenue / 1000 // Convert to thousands
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="gateway" />
          <YAxis />
          <Tooltip formatter={(value: number) => [`R$ ${value}k`, '']} />
          <Legend />
          <Bar dataKey="revenue" fill="#3B82F6" name="Receita" />
          <Bar dataKey="fees" fill="#EF4444" name="Taxas" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderSuccessRateChart = () => {
    const data = mockGatewayPerformance.map(item => ({
      gateway: item.gateway,
      successRate: item.successRate,
      responseTime: item.averageResponseTime
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="gateway" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="successRate" fill="#10B981" name="Taxa de Sucesso (%)" />
          <Bar dataKey="responseTime" fill="#F59E0B" name="Tempo de Resposta (ms)" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (selectedChartType.value) {
      case 'revenue':
        return renderRevenueChart();
      case 'transactions':
        return renderTransactionsChart();
      case 'growth':
        return renderGrowthChart();
      default:
        return renderRevenueChart();
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h2>
          <p className="text-gray-600">Análise completa de receita e performance financeira</p>
        </div>
        <div className="flex gap-3">
          <Select
            value={selectedTimeRange}
            options={timeRangeOptions}
            onChange={setSelectedTimeRange}
            placeholder="Selecione o período"
          />
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(currentMetrics.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {getGrowthIcon(currentMetrics.revenueGrowth)}
            <span className={cn('text-sm font-medium', getGrowthColor(currentMetrics.revenueGrowth))}>
              {formatPercentage(currentMetrics.revenueGrowth)}
            </span>
            <span className="text-xs text-gray-500">vs período anterior</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transações</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentMetrics.totalTransactions}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {getGrowthIcon(currentMetrics.transactionGrowth)}
            <span className={cn('text-sm font-medium', getGrowthColor(currentMetrics.transactionGrowth))}>
              {formatPercentage(currentMetrics.transactionGrowth)}
            </span>
            <span className="text-xs text-gray-500">vs período anterior</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(currentMetrics.averageTransactionValue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              {currentMetrics.totalTransactions} transações
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Líquida</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(currentMetrics.netRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Taxa de reembolso: {currentMetrics.refundRate}%
            </p>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentMetrics.conversionRate}%
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {getGrowthIcon(currentMetrics.conversionRate - 12.3)}
              <span className={cn('text-sm', getGrowthColor(currentMetrics.conversionRate - 12.3))}>
                {formatPercentage(currentMetrics.conversionRate - 12.3)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Taxa de Reembolso</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentMetrics.refundRate}%
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {getGrowthIcon(7.8 - currentMetrics.refundRate)}
              <span className={cn('text-sm', getGrowthColor(7.8 - currentMetrics.refundRate))}>
                {formatPercentage(7.8 - currentMetrics.refundRate)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Crescimento da Receita</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercentage(currentMetrics.revenueGrowth)}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {getGrowthIcon(currentMetrics.revenueGrowth - 9.7)}
              <span className={cn('text-sm', getGrowthColor(currentMetrics.revenueGrowth - 9.7))}>
                {formatPercentage(currentMetrics.revenueGrowth - 9.7)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Análise de Tendências</h3>
            <p className="text-sm text-gray-600">Performance ao longo do tempo</p>
          </div>
          <Select
            value={selectedChartType}
            options={chartTypeOptions}
            onChange={setSelectedChartType}
            placeholder="Tipo de gráfico"
          />
        </div>
        {renderChart()}
      </Card>

      {/* Payment Methods Analysis */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Métodos de Pagamento</h3>
            <p className="text-sm text-gray-600">Distribuição por forma de pagamento</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Receita por Método</h4>
            {renderPaymentMethodsChart()}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Estatísticas Detalhadas</h4>
            <div className="space-y-3">
              {mockPaymentMethodData.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{method.method}</p>
                      <p className="text-sm text-gray-600">{method.transactions} transações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(method.revenue)}</p>
                    <div className="flex items-center gap-1">
                      {getGrowthIcon(method.growth)}
                      <span className={cn('text-sm', getGrowthColor(method.growth))}>
                        {formatPercentage(method.growth)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Gateway Performance */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Performance dos Gateways</h3>
            <p className="text-sm text-gray-600">Análise de eficiência e custos</p>
          </div>
        </div>
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Receita & Taxas</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Receita e Taxas por Gateway</h4>
              {renderGatewayPerformanceChart()}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Taxa de Sucesso e Tempo de Resposta</h4>
              {renderSuccessRateChart()}
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Top Gateway por Receita</h4>
                <div className="space-y-3">
                  {mockGatewayPerformance
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((gateway, index) => (
                      <div key={gateway.gateway} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800">#{index + 1}</Badge>
                          <span className="font-medium text-gray-900">{gateway.gateway}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(gateway.revenue)}</p>
                          <p className="text-sm text-gray-600">{gateway.transactions} transações</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Eficiência dos Gateways</h4>
                <div className="space-y-3">
                  {mockGatewayPerformance
                    .sort((a, b) => b.successRate - a.successRate)
                    .map((gateway) => (
                      <div key={gateway.gateway} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{gateway.gateway}</p>
                          <p className="text-sm text-gray-600">{gateway.averageResponseTime}ms</p>
                        </div>
                        <div className="text-right">
                          <Badge className={cn(
                            gateway.successRate >= 98 ? 'bg-green-100 text-green-800' :
                            gateway.successRate >= 95 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          )}>
                            {gateway.successRate}% sucesso
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export { FinancialDashboard };
export type { FinancialMetrics, RevenueData, PaymentMethodData, GatewayPerformance, FinancialDashboardProps };
