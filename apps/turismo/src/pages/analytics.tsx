import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';

interface AnalyticsMetric {
    name: string;
    value: number;
    change: number;
    icon: string;
    color: string;
    format: 'number' | 'currency' | 'percentage';
}

interface ChartData {
    label: string;
    value: number;
    color: string;
}

interface AnalyticsCategory {
    name: string;
    icon: string;
    color: string;
    description: string;
    metrics: AnalyticsMetric[];
}

export default function Analytics() {
    const { user } = useAuth();
    const router = useRouter();
    const [selectedPeriod, setSelectedPeriod] = useState('30d');
    const [loading, setLoading] = useState(true);

    // Métricas principais
    const mainMetrics: AnalyticsMetric[] = [
        {
            name: 'Receita Total',
            value: 125000,
            change: 12.5,
            icon: '💰',
            color: 'green',
            format: 'currency'
        },
        {
            name: 'Usuários Ativos',
            value: 15420,
            change: 8.3,
            icon: '👥',
            color: 'blue',
            format: 'number'
        },
        {
            name: 'Taxa de Conversão',
            value: 3.2,
            change: -1.1,
            icon: '📈',
            color: 'purple',
            format: 'percentage'
        },
        {
            name: 'Sessões',
            value: 45600,
            change: 15.7,
            icon: '🔄',
            color: 'orange',
            format: 'number'
        }
    ];

    // Dados de gráfico de vendas
    const salesData: ChartData[] = [
        { label: 'Jan', value: 12000, color: '#3B82F6' },
        { label: 'Fev', value: 15000, color: '#3B82F6' },
        { label: 'Mar', value: 18000, color: '#3B82F6' },
        { label: 'Abr', value: 14000, color: '#3B82F6' },
        { label: 'Mai', value: 22000, color: '#3B82F6' },
        { label: 'Jun', value: 25000, color: '#3B82F6' },
        { label: 'Jul', value: 28000, color: '#3B82F6' },
        { label: 'Ago', value: 32000, color: '#3B82F6' },
        { label: 'Set', value: 35000, color: '#3B82F6' },
        { label: 'Out', value: 38000, color: '#3B82F6' },
        { label: 'Nov', value: 42000, color: '#3B82F6' },
        { label: 'Dez', value: 45000, color: '#3B82F6' }
    ];

    // Dados de tráfego por fonte
    const trafficSources: ChartData[] = [
        { label: 'Google', value: 45, color: '#10B981' },
        { label: 'Facebook', value: 25, color: '#3B82F6' },
        { label: 'Instagram', value: 15, color: '#8B5CF6' },
        { label: 'Email', value: 10, color: '#F59E0B' },
        { label: 'Direto', value: 5, color: '#EF4444' }
    ];

    // Categorias de analytics
    const categories: AnalyticsCategory[] = [
        {
            name: 'Vendas',
            icon: '💰',
            color: 'green',
            description: 'Métricas de vendas e receita',
            metrics: [
                { name: 'Vendas Totais', value: 125000, change: 12.5, icon: '💵', color: 'green', format: 'currency' },
                { name: 'Pedidos', value: 1250, change: 8.2, icon: '📦', color: 'blue', format: 'number' },
                { name: 'Ticket Médio', value: 100, change: 3.8, icon: '🎫', color: 'purple', format: 'currency' }
            ]
        },
        {
            name: 'Marketing',
            icon: '📢',
            color: 'purple',
            description: 'Performance de campanhas',
            metrics: [
                { name: 'Impressões', value: 450000, change: 15.3, icon: '👁️', color: 'blue', format: 'number' },
                { name: 'Cliques', value: 12500, change: 22.1, icon: '🖱️', color: 'green', format: 'number' },
                { name: 'CTR', value: 2.8, change: 5.9, icon: '📊', color: 'orange', format: 'percentage' }
            ]
        },
        {
            name: 'Usuários',
            icon: '👥',
            color: 'blue',
            description: 'Comportamento dos usuários',
            metrics: [
                { name: 'Usuários Ativos', value: 15420, change: 8.3, icon: '👤', color: 'blue', format: 'number' },
                { name: 'Sessões', value: 45600, change: 15.7, icon: '🔄', color: 'green', format: 'number' },
                { name: 'Tempo Médio', value: 4.2, change: -2.1, icon: '⏱️', color: 'purple', format: 'number' }
            ]
        }
    ];

    useEffect(() => {
        // Simular carregamento de dados
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    const formatValue = (value: number, format: string) => {
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(value);
            case 'percentage':
                return `${value.toFixed(1)}%`;
            case 'number':
                return new Intl.NumberFormat('pt-BR').format(value);
            default:
                return value.toString();
        }
    };

    const getChangeColor = (change: number) => {
        return change >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const getChangeIcon = (change: number) => {
        return change >= 0 ? '↗' : '↘';
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">📊 Analytics</h1>
                        <p className="text-gray-600 mt-2">Análises e relatórios detalhados</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="7d">Últimos 7 dias</option>
                            <option value="30d">Últimos 30 dias</option>
                            <option value="90d">Últimos 90 dias</option>
                            <option value="1y">Último ano</option>
                        </select>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            ← Voltar ao Dashboard
                        </button>
                    </div>
                </div>

                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mainMetrics.map((metric) => (
                        <div key={metric.name} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatValue(metric.value, metric.format)}
                                    </p>
                                </div>
                                <div className={`p-2 bg-${metric.color}-100 rounded-lg`}>
                                    <span className="text-2xl">{metric.icon}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center">
                                <span className={`text-sm font-medium ${getChangeColor(metric.change)}`}>
                                    {getChangeIcon(metric.change)} {Math.abs(metric.change)}%
                                </span>
                                <span className="text-sm text-gray-500 ml-2">vs período anterior</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico de Vendas */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">📈 Vendas Mensais</h2>
                            <div className="h-64 flex items-end justify-between space-x-1">
                                {salesData.map((item, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div
                                            className="w-8 rounded-t"
                                            style={{
                                                height: `${(item.value / 45000) * 200}px`,
                                                backgroundColor: item.color
                                            }}
                                        ></div>
                                        <span className="text-xs text-gray-500 mt-2">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-600">
                                    Receita total: {formatValue(salesData.reduce((sum, item) => sum + item.value, 0), 'currency')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Tráfego */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">🌐 Tráfego por Fonte</h2>
                            <div className="space-y-4">
                                {trafficSources.map((source, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div
                                                className="w-4 h-4 rounded-full mr-3"
                                                style={{ backgroundColor: source.color }}
                                            ></div>
                                            <span className="text-sm font-medium">{source.label}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full"
                                                    style={{
                                                        width: `${source.value}%`,
                                                        backgroundColor: source.color
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium w-8">{source.value}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categorias de Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <div key={category.name} className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-2xl mr-3">{category.icon}</span>
                                    <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                                </div>
                                
                                <p className="text-gray-600 mb-4">{category.description}</p>
                                
                                <div className="space-y-4">
                                    {category.metrics.map((metric) => (
                                        <div key={metric.name} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-3">{metric.icon}</span>
                                                <div>
                                                    <p className="font-medium text-gray-900">{metric.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatValue(metric.value, metric.format)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-sm font-medium ${getChangeColor(metric.change)}`}>
                                                    {getChangeIcon(metric.change)} {Math.abs(metric.change)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabela de Performance */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">📋 Performance Detalhada</h2>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Métrica
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Valor Atual
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Período Anterior
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Variação
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {mainMetrics.map((metric) => (
                                        <tr key={metric.name} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-lg mr-3">{metric.icon}</span>
                                                    <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatValue(metric.value, metric.format)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatValue(metric.value / (1 + metric.change / 100), metric.format)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-medium ${getChangeColor(metric.change)}`}>
                                                    {getChangeIcon(metric.change)} {Math.abs(metric.change)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    metric.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {metric.change >= 0 ? 'Crescimento' : 'Queda'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Ações Rápidas */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">⚡ Ações Rápidas</h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button className="p-4 border rounded-lg hover:bg-blue-50 transition-colors text-center">
                                <div className="text-2xl mb-2">📊</div>
                                <p className="text-sm font-medium">Relatório</p>
                            </button>
                            
                            <button className="p-4 border rounded-lg hover:bg-green-50 transition-colors text-center">
                                <div className="text-2xl mb-2">📈</div>
                                <p className="text-sm font-medium">Exportar</p>
                            </button>
                            
                            <button className="p-4 border rounded-lg hover:bg-purple-50 transition-colors text-center">
                                <div className="text-2xl mb-2">🎯</div>
                                <p className="text-sm font-medium">Metas</p>
                            </button>
                            
                            <button className="p-4 border rounded-lg hover:bg-orange-50 transition-colors text-center">
                                <div className="text-2xl mb-2">📧</div>
                                <p className="text-sm font-medium">Compartilhar</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
} 