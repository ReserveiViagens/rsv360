import React, { useState, useEffect } from 'react';
import { 
    DollarSign, 
    CreditCard, 
    Wallet, 
    Users, 
    Building2, 
    Plane, 
    Handshake, 
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
    Calculator,
    Target,
    AlertCircle,
    CheckCircle,
    Clock,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Star,
    TrendingUp,
    TrendingDown,
    Download,
    Upload,
    User,
    Home
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import ProtectedRoute from '../components/ProtectedRoute';

interface Payment {
    id: number;
    type: 'corretor' | 'proprietario' | 'consultor' | 'parceiro' | 'cliente' | 'hospede';
    category: string;
    subcategory: string;
    recipientName: string;
    recipientEmail: string;
    recipientPhone: string;
    description: string;
    totalAmount: number;
    initialPayment: number; // 50% inicial
    remainingBalance: number; // Saldo restante
    paymentMethod: string;
    status: 'pendente' | 'parcial' | 'pago' | 'atrasado' | 'cancelado';
    dueDate: string;
    paymentDate?: string;
    reference: string;
    notes?: string;
    commission?: number;
    propertyName?: string;
    serviceType?: string;
}

interface PaymentCategory {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    subcategories: string[];
}

export default function PagamentosPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
    const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
    const [exportGenerating, setExportGenerating] = useState(false);
    const [showCategoryDetails, setShowCategoryDetails] = useState(false);
    const [showSubcategoryDetails, setShowSubcategoryDetails] = useState(false);
    const [showPeriodDetails, setShowPeriodDetails] = useState(false);
    const [selectedCategoryDetails, setSelectedCategoryDetails] = useState<string>('');
    const [selectedSubcategoryDetails, setSelectedSubcategoryDetails] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<'diario' | 'semanal' | 'mensal' | 'anual'>('mensal');
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [selectedPaymentForHistory, setSelectedPaymentForHistory] = useState<Payment | null>(null);

    // Categorias de pagamento
    const paymentCategories: PaymentCategory[] = [
        {
            id: 'corretor',
            name: 'Corretores',
            icon: <Users className="w-5 h-5" />,
            color: 'bg-blue-100 text-blue-600',
            subcategories: ['Comissão de Vendas', 'Bônus de Performance', 'Incentivos', 'Prêmios']
        },
        {
            id: 'proprietario',
            name: 'Proprietários',
            icon: <Building2 className="w-5 h-5" />,
            color: 'bg-green-100 text-green-600',
            subcategories: ['Comissão de Hospedagem', 'Taxa de Gestão', 'Manutenção', 'Serviços']
        },
        {
            id: 'consultor',
            name: 'Consultores de Viagem',
            icon: <Plane className="w-5 h-5" />,
            color: 'bg-purple-100 text-purple-600',
            subcategories: ['Comissão de Pacotes', 'Taxa de Consultoria', 'Bônus de Cliente', 'Incentivos']
        },
        {
            id: 'parceiro',
            name: 'Parceiros',
            icon: <Handshake className="w-5 h-5" />,
            color: 'bg-orange-100 text-orange-600',
            subcategories: ['Comissão de Parceria', 'Taxa de Afiliação', 'Bônus de Volume', 'Prêmios Especiais']
        },
        {
            id: 'cliente',
            name: 'Clientes',
            icon: <User className="w-5 h-5" />,
            color: 'bg-indigo-100 text-indigo-600',
            subcategories: ['Pacotes de Viagem', 'Ingressos', 'Transporte', 'Seguros', 'Taxas de Serviço', 'Adicionais']
        },
        {
            id: 'hospede',
            name: 'Hóspedes',
            icon: <Home className="w-5 h-5" />,
            color: 'bg-pink-100 text-pink-600',
            subcategories: ['Hospedagem', 'Taxa de Limpeza', 'Taxa de Turismo', 'Estacionamento', 'Wi-Fi Premium', 'Serviços Extras']
        }
    ];

    // Dados mockados de pagamentos
    const mockPayments: Payment[] = [
        {
            id: 1,
            type: 'corretor',
            category: 'Corretores',
            subcategory: 'Comissão de Vendas',
            recipientName: 'João Silva',
            recipientEmail: 'joao.silva@imoveis.com',
            recipientPhone: '(11) 99999-9999',
            description: 'Comissão venda pacote Paris',
            totalAmount: 2250.00,
            initialPayment: 1125.00,
            remainingBalance: 1125.00,
            paymentMethod: 'Transferência',
            status: 'parcial',
            dueDate: '2024-08-15',
            reference: 'PAY-001',
            commission: 5.0,
            notes: 'Pacote vendido para cliente VIP'
        },
        {
            id: 2,
            type: 'proprietario',
            category: 'Proprietários',
            subcategory: 'Comissão de Hospedagem',
            recipientName: 'Carlos Oliveira',
            recipientEmail: 'carlos@hotelmarina.com',
            recipientPhone: '(11) 77777-7777',
            description: 'Comissão hotel Marina - Julho',
            totalAmount: 3500.00,
            initialPayment: 1750.00,
            remainingBalance: 1750.00,
            paymentMethod: 'Cartão de Crédito',
            status: 'pendente',
            dueDate: '2024-08-20',
            reference: 'PAY-002',
            propertyName: 'Hotel Marina',
            notes: 'Comissão referente a 15 reservas'
        },
        {
            id: 3,
            type: 'consultor',
            category: 'Consultores de Viagem',
            subcategory: 'Comissão de Pacotes',
            recipientName: 'Maria Santos',
            recipientEmail: 'maria@consultoria.com',
            recipientPhone: '(21) 88888-8888',
            description: 'Comissão pacote Disney',
            totalAmount: 1800.00,
            initialPayment: 900.00,
            remainingBalance: 900.00,
            paymentMethod: 'PIX',
            status: 'pago',
            dueDate: '2024-08-10',
            paymentDate: '2024-08-05',
            reference: 'PAY-003',
            serviceType: 'Pacote Disney World',
            notes: 'Pacote vendido para família com 4 pessoas'
        },
        {
            id: 4,
            type: 'parceiro',
            category: 'Parceiros',
            subcategory: 'Comissão de Parceria',
            recipientName: 'Empresa ABC Turismo',
            recipientEmail: 'contato@abcturismo.com',
            recipientPhone: '(31) 66666-6666',
            description: 'Comissão parceria trimestral',
            totalAmount: 5000.00,
            initialPayment: 2500.00,
            remainingBalance: 2500.00,
            paymentMethod: 'Transferência',
            status: 'atrasado',
            dueDate: '2024-07-30',
            reference: 'PAY-004',
            notes: 'Comissão referente ao 2º trimestre'
        },
        {
            id: 5,
            type: 'corretor',
            category: 'Corretores',
            subcategory: 'Bônus de Performance',
            recipientName: 'Ana Costa',
            recipientEmail: 'ana.costa@imoveis.com',
            recipientPhone: '(41) 55555-5555',
            description: 'Bônus performance mensal',
            totalAmount: 1200.00,
            initialPayment: 600.00,
            remainingBalance: 600.00,
            paymentMethod: 'Cartão de Débito',
            status: 'pendente',
            dueDate: '2024-08-25',
            reference: 'PAY-005',
            notes: 'Bônus por atingir meta de vendas'
        },
        {
            id: 6,
            type: 'proprietario',
            category: 'Proprietários',
            subcategory: 'Taxa de Gestão',
            recipientName: 'Roberto Almeida',
            recipientEmail: 'roberto@chaletmontanha.com',
            recipientPhone: '(54) 44444-4444',
            description: 'Taxa gestão chalet montanha',
            totalAmount: 800.00,
            initialPayment: 400.00,
            remainingBalance: 400.00,
            paymentMethod: 'Transferência',
            status: 'pago',
            dueDate: '2024-08-05',
            paymentDate: '2024-08-01',
            reference: 'PAY-006',
            propertyName: 'Chalet Montanha',
            notes: 'Taxa de gestão mensal'
        },
        {
            id: 7,
            type: 'cliente',
            category: 'Clientes',
            subcategory: 'Pacotes de Viagem',
            recipientName: 'Fernanda Costa',
            recipientEmail: 'fernanda.costa@email.com',
            recipientPhone: '(11) 33333-3333',
            description: 'Pacote Paris - Família Costa',
            totalAmount: 8500.00,
            initialPayment: 4250.00,
            remainingBalance: 4250.00,
            paymentMethod: 'Cartão de Crédito',
            status: 'parcial',
            dueDate: '2024-08-30',
            reference: 'PAY-007',
            serviceType: 'Pacote Paris 7 dias',
            notes: 'Pacote para família com 4 pessoas'
        },
        {
            id: 8,
            type: 'cliente',
            category: 'Clientes',
            subcategory: 'Ingressos',
            recipientName: 'Pedro Santos',
            recipientEmail: 'pedro.santos@email.com',
            recipientPhone: '(21) 22222-2222',
            description: 'Ingressos Disney World',
            totalAmount: 1200.00,
            initialPayment: 600.00,
            remainingBalance: 600.00,
            paymentMethod: 'PIX',
            status: 'pendente',
            dueDate: '2024-08-25',
            reference: 'PAY-008',
            serviceType: 'Ingressos Disney 2 dias',
            notes: 'Ingressos para casal'
        },
        {
            id: 9,
            type: 'hospede',
            category: 'Hóspedes',
            subcategory: 'Hospedagem',
            recipientName: 'Carlos Mendes',
            recipientEmail: 'carlos.mendes@email.com',
            recipientPhone: '(31) 11111-1111',
            description: 'Hospedagem Hotel Marina - 5 noites',
            totalAmount: 2500.00,
            initialPayment: 1250.00,
            remainingBalance: 1250.00,
            paymentMethod: 'Cartão de Débito',
            status: 'pendente',
            dueDate: '2024-08-28',
            reference: 'PAY-009',
            propertyName: 'Hotel Marina',
            notes: 'Quarto duplo com café da manhã'
        },
        {
            id: 10,
            type: 'hospede',
            category: 'Hóspedes',
            subcategory: 'Taxa de Limpeza',
            recipientName: 'Ana Paula Silva',
            recipientEmail: 'ana.silva@email.com',
            recipientPhone: '(41) 00000-0000',
            description: 'Taxa de limpeza chalet montanha',
            totalAmount: 150.00,
            initialPayment: 75.00,
            remainingBalance: 75.00,
            paymentMethod: 'Transferência',
            status: 'pago',
            dueDate: '2024-08-10',
            paymentDate: '2024-08-08',
            reference: 'PAY-010',
            propertyName: 'Chalet Montanha',
            notes: 'Taxa de limpeza final'
        },
        {
            id: 11,
            type: 'cliente',
            category: 'Clientes',
            subcategory: 'Transporte',
            recipientName: 'Lucas Oliveira',
            recipientEmail: 'lucas.oliveira@email.com',
            recipientPhone: '(51) 99999-9999',
            description: 'Transfer aeroporto - Orlando',
            totalAmount: 180.00,
            initialPayment: 90.00,
            remainingBalance: 90.00,
            paymentMethod: 'Cartão de Crédito',
            status: 'pago',
            dueDate: '2024-08-15',
            paymentDate: '2024-08-12',
            reference: 'PAY-011',
            serviceType: 'Transfer Aeroporto-Hotel',
            notes: 'Transfer para 2 pessoas'
        },
        {
            id: 12,
            type: 'hospede',
            category: 'Hóspedes',
            subcategory: 'Serviços Extras',
            recipientName: 'Mariana Costa',
            recipientEmail: 'mariana.costa@email.com',
            recipientPhone: '(27) 88888-8888',
            description: 'Wi-Fi Premium + Estacionamento',
            totalAmount: 80.00,
            initialPayment: 40.00,
            remainingBalance: 40.00,
            paymentMethod: 'PIX',
            status: 'pendente',
            dueDate: '2024-08-20',
            reference: 'PAY-012',
            propertyName: 'Hotel Marina',
            notes: 'Serviços extras para 3 dias'
        }
    ];

    useEffect(() => {
        const loadPayments = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setPayments(mockPayments);
            } catch (error) {
                console.error('Erro ao carregar pagamentos:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPayments();
    }, []);

    // Métricas de pagamentos
    const getPaymentMetrics = () => {
        const totalPayments = payments.reduce((acc, p) => acc + p.totalAmount, 0);
        const totalPaid = payments
            .filter(p => p.status === 'pago')
            .reduce((acc, p) => acc + p.totalAmount, 0);
        const totalPending = payments
            .filter(p => p.status === 'pendente')
            .reduce((acc, p) => acc + p.remainingBalance, 0);
        const totalOverdue = payments
            .filter(p => p.status === 'atrasado')
            .reduce((acc, p) => acc + p.remainingBalance, 0);

        return [
            {
                name: 'Total de Pagamentos',
                value: totalPayments,
                change: 8.5,
                changeType: 'increase' as const,
                icon: <DollarSign className="w-6 h-6" />,
                color: 'bg-blue-100 text-blue-600'
            },
            {
                name: 'Pagamentos Realizados',
                value: totalPaid,
                change: 12.3,
                changeType: 'increase' as const,
                icon: <CheckCircle className="w-6 h-6" />,
                color: 'bg-green-100 text-green-600'
            },
            {
                name: 'Pagamentos Pendentes',
                value: totalPending,
                change: -5.2,
                changeType: 'decrease' as const,
                icon: <Clock className="w-6 h-6" />,
                color: 'bg-yellow-100 text-yellow-600'
            },
            {
                name: 'Pagamentos Atrasados',
                value: totalOverdue,
                change: 15.7,
                changeType: 'increase' as const,
                icon: <AlertCircle className="w-6 h-6" />,
                color: 'bg-red-100 text-red-600'
            }
        ];
    };

    // Funções de gestão
    const handleNewPayment = () => {
        setShowNewPaymentModal(true);
    };

    const handleEditPayment = (payment: Payment) => {
        setEditingPayment(payment);
        setShowEditPaymentModal(true);
    };

    const handleDeletePayment = (paymentId: number) => {
        if (confirm('Tem certeza que deseja excluir este pagamento?')) {
            setPayments(payments.filter(p => p.id !== paymentId));
        }
    };

    const handleViewPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowPaymentDetails(true);
    };

    const handleMakePayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowPaymentModal(true);
    };

    const handleExportReport = () => {
        setShowExportModal(true);
    };

    const handleExportSubmit = async () => {
        setExportGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const filename = `relatorio-pagamentos-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
            const content = `Relatório de Pagamentos - ${new Date().toLocaleDateString()}\n\n`;
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setShowExportModal(false);
            alert('Relatório exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            alert('Erro ao exportar relatório. Tente novamente.');
        } finally {
            setExportGenerating(false);
        }
    };

    // Funções para cards clicáveis
    const handleMetricClick = (metricName: string) => {
        setSelectedCategoryDetails(metricName);
        setShowCategoryDetails(true);
    };

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategoryDetails(categoryId);
        setShowCategoryDetails(true);
    };

    const handleSubcategoryClick = (subcategory: string) => {
        setSelectedSubcategoryDetails(subcategory);
        setShowSubcategoryDetails(true);
    };

    const handlePeriodClick = (period: 'diario' | 'semanal' | 'mensal' | 'anual') => {
        setSelectedPeriod(period);
        setShowPeriodDetails(true);
    };

    const handlePaymentCardClick = (payment: Payment) => {
        setSelectedPaymentForHistory(payment);
        setShowPaymentHistory(true);
    };

    // Funções auxiliares
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pago': return 'bg-green-100 text-green-800';
            case 'pendente': return 'bg-yellow-100 text-yellow-800';
            case 'parcial': return 'bg-blue-100 text-blue-800';
            case 'atrasado': return 'bg-red-100 text-red-800';
            case 'cancelado': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        const category = paymentCategories.find(c => c.id === type);
        return category ? category.color : 'bg-gray-100 text-gray-600';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Funções auxiliares para dados filtrados
    const getPaymentsByCategory = (categoryId: string) => {
        return payments.filter(payment => payment.type === categoryId);
    };

    const getPaymentsBySubcategory = (subcategory: string) => {
        return payments.filter(payment => payment.subcategory === subcategory);
    };

    const getPaymentsByPeriod = (period: 'diario' | 'semanal' | 'mensal' | 'anual') => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return payments.filter(payment => {
            const paymentDate = new Date(payment.dueDate);
            
            switch (period) {
                case 'diario':
                    return paymentDate.toDateString() === today.toDateString();
                case 'semanal':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return paymentDate >= weekAgo && paymentDate <= today;
                case 'mensal':
                    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                    return paymentDate >= monthAgo && paymentDate <= today;
                case 'anual':
                    const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
                    return paymentDate >= yearAgo && paymentDate <= today;
                default:
                    return true;
            }
        });
    };

    const getCategoryStats = (categoryId: string) => {
        const categoryPayments = getPaymentsByCategory(categoryId);
        const total = categoryPayments.reduce((acc, p) => acc + p.totalAmount, 0);
        const paid = categoryPayments.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.totalAmount, 0);
        const pending = categoryPayments.filter(p => p.status === 'pendente').reduce((acc, p) => acc + p.remainingBalance, 0);
        const overdue = categoryPayments.filter(p => p.status === 'atrasado').reduce((acc, p) => acc + p.remainingBalance, 0);
        
        return { total, paid, pending, overdue, count: categoryPayments.length };
    };

    const getSubcategoryStats = (subcategory: string) => {
        const subcategoryPayments = getPaymentsBySubcategory(subcategory);
        const total = subcategoryPayments.reduce((acc, p) => acc + p.totalAmount, 0);
        const paid = subcategoryPayments.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.totalAmount, 0);
        const pending = subcategoryPayments.filter(p => p.status === 'pendente').reduce((acc, p) => acc + p.remainingBalance, 0);
        const overdue = subcategoryPayments.filter(p => p.status === 'atrasado').reduce((acc, p) => acc + p.remainingBalance, 0);
        
        return { total, paid, pending, overdue, count: subcategoryPayments.length };
    };

    const getPeriodStats = (period: 'diario' | 'semanal' | 'mensal' | 'anual') => {
        const periodPayments = getPaymentsByPeriod(period);
        const total = periodPayments.reduce((acc, p) => acc + p.totalAmount, 0);
        const paid = periodPayments.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.totalAmount, 0);
        const pending = periodPayments.filter(p => p.status === 'pendente').reduce((acc, p) => acc + p.remainingBalance, 0);
        const overdue = periodPayments.filter(p => p.status === 'atrasado').reduce((acc, p) => acc + p.remainingBalance, 0);
        
        return { total, paid, pending, overdue, count: periodPayments.length };
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = selectedType === 'all' || payment.type === selectedType;
        const matchesCategory = selectedCategory === 'all' || payment.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
        
        return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Carregando pagamentos...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const metrics = getPaymentMetrics();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Gestão de Pagamentos</h1>
                                <p className="text-gray-600">Controle de pagamentos para corretores, proprietários, consultores e parceiros</p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleExportReport}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Exportar
                                </button>
                                <button
                                    onClick={handleNewPayment}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Novo Pagamento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Métricas de Pagamentos */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {metrics.map((metric, index) => (
                            <div 
                                key={index} 
                                className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleMetricClick(metric.name)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(metric.value)}</p>
                                        <div className="flex items-center mt-1">
                                            <span className={`text-sm ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                                {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                                            </span>
                                            <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${metric.color}`}>
                                        {metric.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Categorias e Filtros */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4">Categorias</h3>
                                
                                {/* Filtros */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                                        <select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">Todos os tipos</option>
                                            <option value="corretor">Corretores</option>
                                            <option value="proprietario">Proprietários</option>
                                            <option value="consultor">Consultores</option>
                                            <option value="parceiro">Parceiros</option>
                                            <option value="cliente">Clientes</option>
                                            <option value="hospede">Hóspedes</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">Todos os status</option>
                                            <option value="pendente">Pendente</option>
                                            <option value="parcial">Parcial</option>
                                            <option value="pago">Pago</option>
                                            <option value="atrasado">Atrasado</option>
                                            <option value="cancelado">Cancelado</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Categorias Expandíveis */}
                                <div className="space-y-2">
                                    {paymentCategories.map((category) => (
                                        <div key={category.id} className="border rounded-lg">
                                            <button
                                                onClick={() => toggleCategory(category.id)}
                                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded-lg ${category.color}`}>
                                                        {category.icon}
                                                    </div>
                                                    <span className="ml-3 text-sm font-medium">{category.name}</span>
                                                </div>
                                                {expandedCategories.includes(category.id) ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </button>
                                            
                                            {expandedCategories.includes(category.id) && (
                                                <div className="px-4 pb-3">
                                                    <div className="space-y-1">
                                                        {category.subcategories.map((subcategory, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => setSelectedCategory(subcategory)}
                                                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                                                    selectedCategory === subcategory
                                                                        ? 'bg-blue-50 text-blue-700'
                                                                        : 'text-gray-600 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                {subcategory}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Lista de Pagamentos */}
                        <div className="lg:col-span-3">
                            {/* Busca */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-64">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Buscar pagamentos..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cards de Pagamentos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredPayments.map((payment) => (
                                    <div 
                                        key={payment.id} 
                                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handlePaymentCardClick(payment)}
                                    >
                                        <div className="p-6">
                                            {/* Header do Card */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded-lg ${getTypeColor(payment.type)}`}>
                                                        {paymentCategories.find(c => c.id === payment.type)?.icon}
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="font-semibold text-gray-900">{payment.recipientName}</h3>
                                                        <p className="text-sm text-gray-600">{payment.category}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </div>

                                            {/* Informações do Pagamento */}
                                            <div className="space-y-3 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Descrição</p>
                                                    <p className="text-sm font-medium text-gray-900">{payment.description}</p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Valor Total</p>
                                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(payment.totalAmount)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Saldo Restante</p>
                                                        <p className="text-lg font-bold text-blue-600">{formatCurrency(payment.remainingBalance)}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Entrada (50%)</p>
                                                        <p className="text-sm font-medium text-green-600">{formatCurrency(payment.initialPayment)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Vencimento</p>
                                                        <p className="text-sm font-medium text-gray-900">{formatDate(payment.dueDate)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ações */}
                                            <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleViewPayment(payment)}
                                                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Visualizar
                                                </button>
                                                <button
                                                    onClick={() => handleMakePayment(payment)}
                                                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1"
                                                >
                                                    <DollarSign className="w-4 h-4" />
                                                    Pagar
                                                </button>
                                                <button
                                                    onClick={() => handleEditPayment(payment)}
                                                    className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePayment(payment.id)}
                                                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                                    title="Excluir"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredPayments.length === 0 && (
                                <div className="text-center py-12">
                                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Nenhum pagamento encontrado</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modais de Detalhes */}
                
                {/* Modal de Detalhes da Categoria */}
                {showCategoryDetails && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Detalhes: {selectedCategoryDetails}
                                </h2>
                                <button
                                    onClick={() => setShowCategoryDetails(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {['diario', 'semanal', 'mensal', 'anual'].map((period) => {
                                    const stats = getPeriodStats(period as any);
                                    return (
                                        <div 
                                            key={period}
                                            className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handlePeriodClick(period as any)}
                                        >
                                            <h3 className="font-semibold text-gray-900 capitalize">{period}</h3>
                                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total)}</p>
                                            <p className="text-sm text-gray-600">{stats.count} pagamentos</p>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900">Subcategorias</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {paymentCategories
                                        .find(c => c.id === selectedCategoryDetails)
                                        ?.subcategories.map((subcategory, index) => {
                                            const stats = getSubcategoryStats(subcategory);
                                            return (
                                                <div 
                                                    key={index}
                                                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() => handleSubcategoryClick(subcategory)}
                                                >
                                                    <h4 className="font-medium text-gray-900">{subcategory}</h4>
                                                    <p className="text-lg font-bold text-blue-600">{formatCurrency(stats.total)}</p>
                                                    <p className="text-sm text-gray-600">{stats.count} pagamentos</p>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Detalhes da Subcategoria */}
                {showSubcategoryDetails && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Detalhes: {selectedSubcategoryDetails}
                                </h2>
                                <button
                                    onClick={() => setShowSubcategoryDetails(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {['diario', 'semanal', 'mensal', 'anual'].map((period) => {
                                    const periodPayments = getPaymentsByPeriod(period as any);
                                    const subcategoryPayments = periodPayments.filter(p => p.subcategory === selectedSubcategoryDetails);
                                    const total = subcategoryPayments.reduce((acc, p) => acc + p.totalAmount, 0);
                                    return (
                                        <div 
                                            key={period}
                                            className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handlePeriodClick(period as any)}
                                        >
                                            <h3 className="font-semibold text-gray-900 capitalize">{period}</h3>
                                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</p>
                                            <p className="text-sm text-gray-600">{subcategoryPayments.length} pagamentos</p>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900">Pagamentos</h3>
                                <div className="space-y-2">
                                    {getPaymentsBySubcategory(selectedSubcategoryDetails).map((payment) => (
                                        <div key={payment.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{payment.recipientName}</h4>
                                                    <p className="text-sm text-gray-600">{payment.description}</p>
                                                    <p className="text-sm text-gray-500">{formatDate(payment.dueDate)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{formatCurrency(payment.totalAmount)}</p>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                        {payment.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Detalhes por Período */}
                {showPeriodDetails && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Detalhes: {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                                </h2>
                                <button
                                    onClick={() => setShowPeriodDetails(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {paymentCategories.map((category) => {
                                    const categoryPayments = getPaymentsByCategory(category.id);
                                    const periodPayments = getPaymentsByPeriod(selectedPeriod);
                                    const filteredPayments = categoryPayments.filter(p => 
                                        periodPayments.some(pp => pp.id === p.id)
                                    );
                                    const total = filteredPayments.reduce((acc, p) => acc + p.totalAmount, 0);
                                    return (
                                        <div 
                                            key={category.id}
                                            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => handleCategoryClick(category.id)}
                                        >
                                            <div className="flex items-center mb-2">
                                                <div className={`p-2 rounded-lg ${category.color}`}>
                                                    {category.icon}
                                                </div>
                                                <h3 className="font-semibold text-gray-900 ml-2">{category.name}</h3>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</p>
                                            <p className="text-sm text-gray-600">{filteredPayments.length} pagamentos</p>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900">Pagamentos do Período</h3>
                                <div className="space-y-2">
                                    {getPaymentsByPeriod(selectedPeriod).map((payment) => (
                                        <div key={payment.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{payment.recipientName}</h4>
                                                    <p className="text-sm text-gray-600">{payment.description}</p>
                                                    <p className="text-sm text-gray-500">{formatDate(payment.dueDate)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{formatCurrency(payment.totalAmount)}</p>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                        {payment.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Histórico do Pagamento */}
                {showPaymentHistory && selectedPaymentForHistory && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Histórico: {selectedPaymentForHistory.recipientName}
                                </h2>
                                <button
                                    onClick={() => setShowPaymentHistory(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Informações do Pagamento</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Valor Total</p>
                                            <p className="font-bold text-gray-900">{formatCurrency(selectedPaymentForHistory.totalAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Entrada (50%)</p>
                                            <p className="font-bold text-green-600">{formatCurrency(selectedPaymentForHistory.initialPayment)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Saldo Restante</p>
                                            <p className="font-bold text-blue-600">{formatCurrency(selectedPaymentForHistory.remainingBalance)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPaymentForHistory.status)}`}>
                                                {selectedPaymentForHistory.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Detalhes</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm text-gray-600">Descrição</p>
                                            <p className="text-gray-900">{selectedPaymentForHistory.description}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Categoria</p>
                                            <p className="text-gray-900">{selectedPaymentForHistory.category} - {selectedPaymentForHistory.subcategory}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Método de Pagamento</p>
                                            <p className="text-gray-900">{selectedPaymentForHistory.paymentMethod}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Data de Vencimento</p>
                                            <p className="text-gray-900">{formatDate(selectedPaymentForHistory.dueDate)}</p>
                                        </div>
                                        {selectedPaymentForHistory.paymentDate && (
                                            <div>
                                                <p className="text-sm text-gray-600">Data do Pagamento</p>
                                                <p className="text-gray-900">{formatDate(selectedPaymentForHistory.paymentDate)}</p>
                                            </div>
                                        )}
                                        {selectedPaymentForHistory.notes && (
                                            <div>
                                                <p className="text-sm text-gray-600">Observações</p>
                                                <p className="text-gray-900">{selectedPaymentForHistory.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleMakePayment(selectedPaymentForHistory)}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Realizar Pagamento
                                    </button>
                                    <button
                                        onClick={() => handleEditPayment(selectedPaymentForHistory)}
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
} 
