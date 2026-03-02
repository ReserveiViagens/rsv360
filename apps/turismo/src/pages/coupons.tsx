import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';

interface Coupon {
    id: number;
    code: string;
    name: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    min_purchase: number;
    max_uses: number;
    used_count: number;
    status: 'active' | 'inactive' | 'expired';
    start_date: string;
    end_date: string;
    applicable_products: string[];
    description: string;
    created_at: string;
}

interface CouponCategory {
    name: string;
    icon: string;
    color: string;
    description: string;
    count: number;
    total_value: number;
}

export default function Coupons() {
    const { user } = useAuth();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Categorias de cupons
    const categories: CouponCategory[] = [
        {
            name: 'Cupons Ativos',
            icon: '✅',
            color: 'green',
            description: 'Cupons disponíveis para uso',
            count: 15,
            total_value: 25000
        },
        {
            name: 'Cupons Expirados',
            icon: '⏰',
            color: 'red',
            description: 'Cupons com prazo vencido',
            count: 8,
            total_value: 12000
        },
        {
            name: 'Cupons Inativos',
            icon: '⏸️',
            color: 'yellow',
            description: 'Cupons temporariamente desabilitados',
            count: 3,
            total_value: 5000
        },
        {
            name: 'Cupons Esgotados',
            icon: '🔚',
            color: 'gray',
            description: 'Cupons com limite atingido',
            count: 5,
            total_value: 8000
        }
    ];

    // Dados mock de cupons
    const mockCoupons: Coupon[] = [
        {
            id: 1,
            code: 'BLACKFRIDAY2024',
            name: 'Black Friday - 20% OFF',
            type: 'percentage',
            value: 20,
            min_purchase: 100,
            max_uses: 1000,
            used_count: 450,
            status: 'active',
            start_date: '2024-11-20',
            end_date: '2024-11-30',
            applicable_products: ['Viagens', 'Pacotes'],
            description: 'Desconto de 20% em todas as viagens',
            created_at: '2024-11-15'
        },
        {
            id: 2,
            code: 'WELCOME50',
            name: 'Bem-vindo - R$ 50 OFF',
            type: 'fixed',
            value: 50,
            min_purchase: 200,
            max_uses: 500,
            used_count: 320,
            status: 'active',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            applicable_products: ['Todos os produtos'],
            description: 'Desconto de R$ 50 para novos clientes',
            created_at: '2024-01-01'
        },
        {
            id: 3,
            code: 'FREESHIP',
            name: 'Frete Grátis',
            type: 'free_shipping',
            value: 0,
            min_purchase: 150,
            max_uses: 200,
            used_count: 180,
            status: 'active',
            start_date: '2024-10-01',
            end_date: '2024-12-31',
            applicable_products: ['Produtos físicos'],
            description: 'Frete grátis para compras acima de R$ 150',
            created_at: '2024-09-15'
        }
    ];

    useEffect(() => {
        // Simular carregamento de dados
        setTimeout(() => {
            setCoupons(mockCoupons);
            setLoading(false);
        }, 1000);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-yellow-100 text-yellow-800';
            case 'expired': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'percentage': return 'bg-blue-100 text-blue-800';
            case 'fixed': return 'bg-purple-100 text-purple-800';
            case 'free_shipping': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getUsagePercentage = (used: number, max: number) => {
        return Math.round((used / max) * 100);
    };

    const isExpired = (endDate: string) => {
        return new Date(endDate) < new Date();
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
                        <h1 className="text-3xl font-bold text-gray-900">🎫 Cupons</h1>
                        <p className="text-gray-600 mt-2">Gestão de cupons e promoções</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            + Novo Cupom
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            ← Voltar ao Dashboard
                        </button>
                    </div>
                </div>

                {/* Estatísticas Gerais */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">🎫</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total de Cupons</p>
                                <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Cupons Ativos</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {coupons.filter(c => c.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(coupons.reduce((sum, c) => sum + c.value, 0))}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Taxa de Uso</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {Math.round(coupons.reduce((sum, c) => sum + getUsagePercentage(c.used_count, c.max_uses), 0) / coupons.length)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categorias de Cupons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {categories.map((category) => (
                        <div key={category.name} className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">{category.icon}</span>
                                        <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        {selectedCategory === category.name ? '▼' : '▶'}
                                    </button>
                                </div>
                                
                                <p className="text-gray-600 mb-4">{category.description}</p>
                                
                                {selectedCategory === category.name && (
                                    <div className="space-y-3">
                                        {coupons.filter(coupon => {
                                            switch (category.name) {
                                                case 'Cupons Ativos': return coupon.status === 'active' && !isExpired(coupon.end_date);
                                                case 'Cupons Expirados': return isExpired(coupon.end_date);
                                                case 'Cupons Inativos': return coupon.status === 'inactive';
                                                case 'Cupons Esgotados': return coupon.used_count >= coupon.max_uses;
                                                default: return true;
                                            }
                                        }).map((coupon) => (
                                            <div key={coupon.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{coupon.name}</h3>
                                                        <p className="text-sm text-gray-600">Código: {coupon.code}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon.status)}`}>
                                                        {coupon.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mb-2">{coupon.description}</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Valor:</span>
                                                        <span className="ml-1 font-medium">
                                                            {coupon.type === 'percentage' ? `${coupon.value}%` : 
                                                             coupon.type === 'fixed' ? formatCurrency(coupon.value) : 'Frete Grátis'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Uso:</span>
                                                        <span className="ml-1 font-medium">{coupon.used_count}/{coupon.max_uses}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Mínimo:</span>
                                                        <span className="ml-1 font-medium">{formatCurrency(coupon.min_purchase)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Válido até:</span>
                                                        <span className="ml-1 font-medium">{formatDate(coupon.end_date)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        {category.count} cupons nesta categoria
                                    </span>
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        Ver Todos →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lista de Cupons */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">📋 Todos os Cupons</h2>
                            <div className="flex space-x-2">
                                <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Todos os tipos</option>
                                    <option value="percentage">Porcentagem</option>
                                    <option value="fixed">Valor fixo</option>
                                    <option value="free_shipping">Frete grátis</option>
                                </select>
                                <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Todos os status</option>
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                    <option value="expired">Expirado</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cupom
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Valor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Uso
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Validade
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {coupons.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{coupon.name}</div>
                                                    <div className="text-sm text-gray-500">{coupon.code}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(coupon.type)}`}>
                                                    {coupon.type === 'percentage' ? 'Porcentagem' :
                                                     coupon.type === 'fixed' ? 'Valor Fixo' : 'Frete Grátis'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {coupon.type === 'percentage' ? `${coupon.value}%` : 
                                                 coupon.type === 'fixed' ? formatCurrency(coupon.value) : 'Frete Grátis'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm text-gray-900">{coupon.used_count}/{coupon.max_uses}</div>
                                                    <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                                                        <div
                                                            className="bg-blue-600 h-1 rounded-full"
                                                            style={{ width: `${getUsagePercentage(coupon.used_count, coupon.max_uses)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(coupon.end_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon.status)}`}>
                                                    {coupon.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                                                <button className="text-red-600 hover:text-red-900">Desativar</button>
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
                                <div className="text-2xl mb-2">🎫</div>
                                <p className="text-sm font-medium">Criar Cupom</p>
                            </button>
                            
                            <button className="p-4 border rounded-lg hover:bg-green-50 transition-colors text-center">
                                <div className="text-2xl mb-2">📊</div>
                                <p className="text-sm font-medium">Relatórios</p>
                            </button>
                            
                            <button className="p-4 border rounded-lg hover:bg-purple-50 transition-colors text-center">
                                <div className="text-2xl mb-2">📧</div>
                                <p className="text-sm font-medium">Enviar</p>
                            </button>
                            
                            <button className="p-4 border rounded-lg hover:bg-orange-50 transition-colors text-center">
                                <div className="text-2xl mb-2">📈</div>
                                <p className="text-sm font-medium">Analytics</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
} 