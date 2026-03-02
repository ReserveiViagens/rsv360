import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    CreditCard, 
    Wallet, 
    PiggyBank, 
    BarChart3, 
    PieChart, 
    Calendar, 
    Download, 
    Upload, 
    Plus, 
    Edit, 
    Trash, 
    X, 
    Save, 
    Search, 
    Filter,
    Eye,
    FileText,
    Receipt,
    Banknote,
    Coins,
    Calculator,
    Target,
    AlertCircle,
    CheckCircle,
    Clock,
    RefreshCw,
    Trash2
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import ProtectedRoute from '../components/ProtectedRoute';

interface Transaction {
    id: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'cancelled';
    paymentMethod: string;
    reference: string;
    notes?: string;
    customer?: string; // Added for new mock data
}

interface FinancialMetric {
    name: string;
    value: number;
    change: number;
    changeType: 'increase' | 'decrease';
    icon: React.ReactNode;
    color: string;
}

export default function FinanceiroPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showTransactionDetails, setShowTransactionDetails] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
    const [exportGenerating, setExportGenerating] = useState(false);

    // Dados mockados de transações
    const mockTransactions: Transaction[] = [
        {
            id: 1,
            date: '2024-01-15',
            type: 'income',
            amount: 2500.00,
            description: 'Venda pacote Disney',
            category: 'Vendas',
            paymentMethod: 'Cartão de Crédito',
            status: 'completed',
            customer: 'Maria Silva',
            reference: 'DIS-001'
        },
        {
            id: 2,
            date: '2024-01-14',
            type: 'income',
            amount: 1800.00,
            category: 'Comissões',
            description: 'Comissão de venda Disney',
            paymentMethod: 'Transferência',
            status: 'completed',
            customer: 'João Santos',
            reference: 'COM-002'
        },
        {
            id: 3,
            date: '2024-01-13',
            type: 'expense',
            amount: -450.00,
            description: 'Compra passagens aéreas',
            category: 'Transporte',
            paymentMethod: 'Cartão de Débito',
            status: 'completed',
            customer: 'Sistema',
            reference: 'EXP-003'
        },
        {
            id: 4,
            date: '2024-01-12',
            type: 'expense',
            amount: -120.00,
            description: 'Manutenção sistema',
            category: 'Tecnologia',
            paymentMethod: 'Transferência',
            status: 'completed',
            customer: 'Sistema',
            reference: 'EXP-004'
        },
        {
            id: 5,
            date: '2024-01-11',
            type: 'income',
            amount: 3200.00,
            category: 'Hotéis',
            description: 'Comissão hotel Marina',
            paymentMethod: 'Cartão de Crédito',
            status: 'completed',
            customer: 'Ana Costa',
            reference: 'HOT-005'
        }
    ];

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                // Simular carregamento de dados
                await new Promise(resolve => setTimeout(resolve, 1000));
                setTransactions(mockTransactions);
            } catch (error) {
                console.error('Erro ao carregar transações:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTransactions();
    }, []);

    // Métricas financeiras
    const getFinancialMetrics = () => {
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const netProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
        
        return {
            totalIncome,
            totalExpenses,
            netProfit,
            profitMargin,
            totalTransactions: transactions.length
        };
    };

    // Funções de gestão
    const handleAddTransaction = () => {
        setShowAddModal(true);
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setShowEditModal(true);
    };

    const handleDeleteTransaction = (transactionId: number) => {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            setTransactions(transactions.filter(t => t.id !== transactionId));
        }
    };

    const handleExportReport = async () => {
        try {
            // Simular geração de relatório
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const content = `Relatório Financeiro - ${new Date().toLocaleDateString()}\n\n`;
            const report = content + transactions.map(t => 
                `${t.date} - ${t.description} - R$ ${t.amount.toFixed(2)}`
            ).join('\n');
            
            const blob = new Blob([report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'relatorio-financeiro.txt';
            a.click();
            URL.revokeObjectURL(url);
            
            alert('Relatório exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            alert('Erro ao exportar relatório. Tente novamente.');
        }
    };

    // Funções auxiliares
    const getTransactionTypeColor = (type: string) => {
        return type === 'income' ? 'text-green-600' : 'text-red-600';
    };

    const getTransactionTypeIcon = (type: string) => {
        return type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'Concluída';
            case 'pending': return 'Pendente';
            case 'cancelled': return 'Cancelada';
            default: return status;
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             transaction.customer?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || transaction.type === selectedType;
        const matchesPeriod = selectedPeriod === 'all' || 
            (selectedPeriod === 'week' && new Date(transaction.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
            (selectedPeriod === 'month' && new Date(transaction.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
            (selectedPeriod === 'quarter' && new Date(transaction.date) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
            (selectedPeriod === 'year' && new Date(transaction.date) >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
        
        return matchesSearch && matchesType && matchesPeriod;
    });

    const metrics = getFinancialMetrics();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <NavigationButtons />
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="mt-4 text-gray-600">Carregando dados financeiros...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <NavigationButtons />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
                            <p className="text-gray-600">Controle completo de receitas, despesas e relatórios</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleExportReport}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                            >
                                <Download className="w-5 h-5" />
                                <span>Exportar</span>
                            </button>
                            <button
                                onClick={handleAddTransaction}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Nova Transação</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Métricas Financeiras */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                                <p className="text-2xl font-bold text-gray-900">R$ {metrics.totalIncome.toFixed(2)}</p>
                                <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <TrendingDown className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Despesas Totais</p>
                                <p className="text-2xl font-bold text-gray-900">R$ {metrics.totalExpenses.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                                <p className="text-2xl font-bold text-gray-900">R$ {metrics.netProfit.toFixed(2)}</p>
                                <span className="text-sm text-gray-500">{metrics.profitMargin.toFixed(1)}% margem</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Transações</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.totalTransactions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros e Busca */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar transações..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Todas as transações</option>
                                <option value="income">Receitas</option>
                                <option value="expense">Despesas</option>
                            </select>

                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Todos os períodos</option>
                                <option value="week">Última semana</option>
                                <option value="month">Último mês</option>
                                <option value="quarter">Último trimestre</option>
                                <option value="year">Último ano</option>
                            </select>

                            <button
                                onClick={handleAddTransaction}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Nova</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabela de Transações */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Transações ({filteredTransactions.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transação</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-900">{new Date(transaction.date).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                <div className={`mr-2 ${getTransactionTypeColor(transaction.type)}`}>
                                                    {getTransactionTypeIcon(transaction.type)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                                                    <div className="text-sm text-gray-500">{transaction.reference}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-900">{transaction.customer}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-900">{transaction.category}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`text-sm font-medium ${getTransactionTypeColor(transaction.type)}`}>
                                                R$ {transaction.amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                                {getStatusText(transaction.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditTransaction(transaction)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredTransactions.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Nenhuma transação encontrada</p>
                        </div>
                    )}
                </div>

                {/* Modais serão implementados se necessário */}
            </div>
        </div>
    );
} 
