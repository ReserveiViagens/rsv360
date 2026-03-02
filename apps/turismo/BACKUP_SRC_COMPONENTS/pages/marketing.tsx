import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    Mail, 
    Smartphone, 
    DollarSign, 
    BarChart3, 
    Users, 
    Target, 
    Calendar,
    Plus,
    Edit,
    Trash,
    Play,
    Pause,
    Eye,
    Download,
    Share2,
    Settings,
    Filter,
    Search,
    X,
    Save,
    CheckCircle,
    AlertCircle,
    Clock,
    Star,
    Zap,
    Globe,
    MessageSquare,
    Image,
    Video,
    FileText,
    Link,
    Bell,
    Heart,
    ThumbsUp,
    Share,
    ArrowUp,
    ArrowDown,
    Minus,
    Percent,
    Activity,
    PieChart,
    LineChart,
    BarChart,
    TrendingDown
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';

interface Campaign {
    id: number;
    name: string;
    type: 'email' | 'social' | 'ads' | 'content' | 'influencer' | 'seo';
    status: 'active' | 'paused' | 'completed' | 'draft' | 'scheduled';
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    start_date: string;
    end_date: string;
    target_audience: string;
    description: string;
    roi: number;
    ctr: number;
    cpc: number;
    engagement_rate: number;
    reach: number;
    frequency: number;
    platform?: string;
    content_type?: string;
    tags?: string[];
    performance_score?: number;
}

interface MarketingMetric {
    name: string;
    value: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    icon: React.ReactNode;
    color: string;
    description: string;
}

interface MarketingService {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    status: 'active' | 'inactive' | 'maintenance';
    metrics: {
        campaigns: number;
        reach: number;
        engagement: number;
        conversion: number;
    };
}

export default function Marketing() {
    const { user } = useAuth();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
    const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);
    const [showCampaignDetails, setShowCampaignDetails] = useState(false);
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
    const [showServiceDetails, setShowServiceDetails] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [selectedService, setSelectedService] = useState<MarketingService | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
    const [exportGenerating, setExportGenerating] = useState(false);

    // ServiÃ§os de Marketing
    const marketingServices: MarketingService[] = [
        {
            id: 'email-marketing',
            name: 'Email Marketing',
            icon: <Mail className="w-6 h-6" />,
            color: 'bg-blue-100 text-blue-600',
            description: 'Campanhas de email automatizadas',
            status: 'active',
            metrics: {
                campaigns: 12,
                reach: 45000,
                engagement: 8.5,
                conversion: 2.3
            }
        },
        {
            id: 'social-media',
            name: 'Redes Sociais',
            icon: <Smartphone className="w-6 h-6" />,
            color: 'bg-purple-100 text-purple-600',
            description: 'Marketing em redes sociais',
            status: 'active',
            metrics: {
                campaigns: 15,
                reach: 125000,
                engagement: 12.8,
                conversion: 3.1
            }
        },
        {
            id: 'paid-ads',
            name: 'AnÃºncios Pagos',
            icon: <DollarSign className="w-6 h-6" />,
            color: 'bg-orange-100 text-orange-600',
            description: 'Campanhas de anÃºncios pagos',
            status: 'active',
            metrics: {
                campaigns: 8,
                reach: 200000,
                engagement: 5.2,
                conversion: 4.8
            }
        },
        {
            id: 'content-marketing',
            name: 'Marketing de ConteÃºdo',
            icon: <FileText className="w-6 h-6" />,
            color: 'bg-green-100 text-green-600',
            description: 'CriaÃ§Ã£o e distribuiÃ§Ã£o de conteÃºdo',
            status: 'active',
            metrics: {
                campaigns: 20,
                reach: 75000,
                engagement: 15.3,
                conversion: 1.8
            }
        },
        {
            id: 'influencer-marketing',
            name: 'Marketing de Influenciadores',
            icon: <Users className="w-6 h-6" />,
            color: 'bg-pink-100 text-pink-600',
            description: 'Parcerias com influenciadores',
            status: 'active',
            metrics: {
                campaigns: 6,
                reach: 180000,
                engagement: 18.7,
                conversion: 5.2
            }
        },
        {
            id: 'seo',
            name: 'SEO',
            icon: <Search className="w-6 h-6" />,
            color: 'bg-indigo-100 text-indigo-600',
            description: 'OtimizaÃ§Ã£o para motores de busca',
            status: 'active',
            metrics: {
                campaigns: 10,
                reach: 95000,
                engagement: 6.4,
                conversion: 2.1
            }
        }
    ];

    // Dados mock de campanhas expandidos
    const mockCampaigns: Campaign[] = [
        {
            id: 1,
            name: 'Black Friday 2024',
            type: 'email',
            status: 'active',
            budget: 5000.00,
            spent: 3200.00,
            impressions: 45000,
            clicks: 2300,
            conversions: 156,
            start_date: '2024-11-20',
            end_date: '2024-11-30',
            target_audience: 'Clientes existentes',
            description: 'Campanha de Black Friday com ofertas especiais',
            roi: 187.5,
            ctr: 5.1,
            cpc: 1.39,
            engagement_rate: 8.5,
            reach: 45000,
            frequency: 2.3,
            platform: 'Mailchimp',
            content_type: 'Promocional',
            tags: ['black-friday', 'promoÃ§Ã£o', 'vendas'],
            performance_score: 85
        },
        {
            id: 2,
            name: 'Instagram Stories',
            type: 'social',
            status: 'active',
            budget: 2000.00,
            spent: 1800.00,
            impressions: 25000,
            clicks: 1200,
            conversions: 89,
            start_date: '2024-11-15',
            end_date: '2024-12-15',
            target_audience: 'Jovens 18-35',
            description: 'Campanha de stories no Instagram',
            roi: 145.0,
            ctr: 4.8,
            cpc: 1.50,
            engagement_rate: 12.8,
            reach: 25000,
            frequency: 1.8,
            platform: 'Instagram',
            content_type: 'Stories',
            tags: ['instagram', 'stories', 'jovens'],
            performance_score: 78
        },
        {
            id: 3,
            name: 'Google Ads - Viagens',
            type: 'ads',
            status: 'active',
            budget: 8000.00,
            spent: 4500.00,
            impressions: 120000,
            clicks: 3400,
            conversions: 234,
            start_date: '2024-11-01',
            end_date: '2024-12-31',
            target_audience: 'Interessados em viagens',
            description: 'Campanha de anÃºncios no Google',
            roi: 208.0,
            ctr: 2.8,
            cpc: 1.32,
            engagement_rate: 5.2,
            reach: 120000,
            frequency: 3.2,
            platform: 'Google Ads',
            content_type: 'Search',
            tags: ['google-ads', 'viagens', 'search'],
            performance_score: 92
        },
        {
            id: 4,
            name: 'Blog Post - Destinos',
            type: 'content',
            status: 'active',
            budget: 1500.00,
            spent: 1200.00,
            impressions: 18000,
            clicks: 900,
            conversions: 45,
            start_date: '2024-11-10',
            end_date: '2024-12-10',
            target_audience: 'Interessados em turismo',
            description: 'Post sobre melhores destinos',
            roi: 75.0,
            ctr: 5.0,
            cpc: 1.33,
            engagement_rate: 15.3,
            reach: 18000,
            frequency: 1.5,
            platform: 'Blog',
            content_type: 'Artigo',
            tags: ['blog', 'destinos', 'conteÃºdo'],
            performance_score: 72
        },
        {
            id: 5,
            name: 'Influencer - Paris',
            type: 'influencer',
            status: 'active',
            budget: 3000.00,
            spent: 2800.00,
            impressions: 35000,
            clicks: 2100,
            conversions: 168,
            start_date: '2024-11-05',
            end_date: '2024-11-25',
            target_audience: 'Seguidores do influenciador',
            description: 'Parceria com influenciador de viagens',
            roi: 200.0,
            ctr: 6.0,
            cpc: 1.33,
            engagement_rate: 18.7,
            reach: 35000,
            frequency: 2.1,
            platform: 'Instagram',
            content_type: 'Post Patrocinado',
            tags: ['influencer', 'paris', 'parceria'],
            performance_score: 88
        },
        {
            id: 6,
            name: 'SEO - Palavras-chave',
            type: 'seo',
            status: 'active',
            budget: 1000.00,
            spent: 800.00,
            impressions: 25000,
            clicks: 1250,
            conversions: 38,
            start_date: '2024-10-01',
            end_date: '2024-12-31',
            target_audience: 'Busca orgÃ¢nica',
            description: 'OtimizaÃ§Ã£o para palavras-chave',
            roi: 95.0,
            ctr: 5.0,
            cpc: 0.64,
            engagement_rate: 6.4,
            reach: 25000,
            frequency: 1.2,
            platform: 'Google',
            content_type: 'SEO',
            tags: ['seo', 'palavras-chave', 'orgÃ¢nico'],
            performance_score: 81
        }
    ];

    useEffect(() => {
        // Simular carregamento de dados
        setTimeout(() => {
            setCampaigns(mockCampaigns);
            setLoading(false);
        }, 1000);
    }, []);

    // MÃ©tricas de marketing
    const getMarketingMetrics = (): MarketingMetric[] => {
        const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
        const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
        const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
        const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
        const avgROI = campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length;
        const avgEngagement = campaigns.reduce((sum, c) => sum + c.engagement_rate, 0) / campaigns.length;

        return [
            {
                name: 'OrÃ§amento Total',
                value: totalBudget,
                change: 12.5,
                changeType: 'increase',
                icon: <DollarSign className="w-6 h-6" />,
                color: 'bg-green-100 text-green-600',
                description: 'OrÃ§amento total das campanhas'
            },
            {
                name: 'Gasto Total',
                value: totalSpent,
                change: 8.3,
                changeType: 'increase',
                icon: <TrendingUp className="w-6 h-6" />,
                color: 'bg-blue-100 text-blue-600',
                description: 'Valor gasto em campanhas'
            },
            {
                name: 'ImpressÃµes',
                value: totalImpressions,
                change: 15.7,
                changeType: 'increase',
                icon: <Eye className="w-6 h-6" />,
                color: 'bg-purple-100 text-purple-600',
                description: 'Total de impressÃµes'
            },
            {
                name: 'ConversÃµes',
                value: totalConversions,
                change: 22.1,
                changeType: 'increase',
                icon: <Target className="w-6 h-6" />,
                color: 'bg-orange-100 text-orange-600',
                description: 'Total de conversÃµes'
            },
            {
                name: 'ROI MÃ©dio',
                value: avgROI,
                change: 5.2,
                changeType: 'increase',
                icon: <Percent className="w-6 h-6" />,
                color: 'bg-indigo-100 text-indigo-600',
                description: 'Retorno sobre investimento mÃ©dio'
            },
            {
                name: 'Engajamento',
                value: avgEngagement,
                change: -2.1,
                changeType: 'decrease',
                icon: <Heart className="w-6 h-6" />,
                color: 'bg-pink-100 text-pink-600',
                description: 'Taxa de engajamento mÃ©dia'
            }
        ];
    };

    // FunÃ§Ãµes de gestÃ£o
    const handleNewCampaign = () => {
        setShowNewCampaignModal(true);
    };

    const handleEditCampaign = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setShowEditCampaignModal(true);
    };

    const handleDeleteCampaign = (campaignId: number) => {
        if (confirm('Tem certeza que deseja excluir esta campanha?')) {
            setCampaigns(campaigns.filter(c => c.id !== campaignId));
        }
    };

    const handleViewCampaign = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setShowCampaignDetails(true);
    };

    const handleViewAnalytics = () => {
        setShowAnalyticsModal(true);
    };

    const handleServiceClick = (service: MarketingService) => {
        setSelectedService(service);
        setShowServiceDetails(true);
    };

    const handleExportReport = () => {
        setShowExportModal(true);
    };

    const handleExportSubmit = async () => {
        setExportGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const filename = `relatorio-marketing-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
            const content = `RelatÃ³rio de Marketing - ${new Date().toLocaleDateString()}\n\n`;
            
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
            alert('RelatÃ³rio exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar relatÃ³rio:', error);
            alert('Erro ao exportar relatÃ³rio. Tente novamente.');
        } finally {
            setExportGenerating(false);
        }
    };

    // FunÃ§Ãµes auxiliares
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'scheduled': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'email': return 'bg-blue-100 text-blue-800';
            case 'social': return 'bg-purple-100 text-purple-800';
            case 'ads': return 'bg-orange-100 text-orange-800';
            case 'content': return 'bg-green-100 text-green-800';
            case 'influencer': return 'bg-pink-100 text-pink-800';
            case 'seo': return 'bg-indigo-100 text-indigo-800';
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

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    const calculateROI = (spent: number, conversions: number) => {
        if (spent === 0) return 0;
        return ((conversions * 100 - spent) / spent * 100).toFixed(2);
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.target_audience.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = selectedType === 'all' || campaign.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
        
        return matchesSearch && matchesType && matchesStatus;
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Carregando marketing...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const metrics = getMarketingMetrics();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">ðŸ“¢ Marketing</h1>
                                <p className="text-gray-600">GestÃ£o de campanhas e estratÃ©gias de marketing</p>
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
                                    onClick={handleViewAnalytics}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Analytics
                                </button>
                                <button
                                    onClick={handleNewCampaign}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nova Campanha
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MÃ©tricas de Marketing */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                        {metrics.map((metric, index) => (
                            <div 
                                key={index} 
                                className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleViewAnalytics()}
                            >
                                <div className="flex items-start justify-between h-full">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-600 truncate">{metric.name}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1 leading-tight">
                                            {metric.name.includes('ROI') || metric.name.includes('Engajamento') 
                                                ? `${metric.value.toFixed(1)}%` 
                                                : metric.name.includes('OrÃ§amento') || metric.name.includes('Gasto')
                                                ? formatCurrency(metric.value)
                                                : formatNumber(metric.value)
                                            }
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <span className={`text-sm font-medium ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                                {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                                            </span>
                                            <span className="text-sm text-gray-500 ml-1">vs mÃªs anterior</span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${metric.color} flex-shrink-0 ml-4 self-start`}>
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            {React.cloneElement(metric.icon as React.ReactElement, { className: 'w-5 h-5' } as any)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ServiÃ§os de Marketing */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4">ServiÃ§os de Marketing</h3>
                                
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
                                            <option value="email">Email Marketing</option>
                                            <option value="social">Redes Sociais</option>
                                            <option value="ads">AnÃºncios Pagos</option>
                                            <option value="content">Marketing de ConteÃºdo</option>
                                            <option value="influencer">Marketing de Influenciadores</option>
                                            <option value="seo">SEO</option>
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
                                            <option value="active">Ativo</option>
                                            <option value="paused">Pausado</option>
                                            <option value="completed">ConcluÃ­do</option>
                                            <option value="draft">Rascunho</option>
                                            <option value="scheduled">Agendado</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Lista de ServiÃ§os */}
                                <div className="space-y-3">
                                    {marketingServices.map((service) => (
                                        <div 
                                            key={service.id}
                                            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => handleServiceClick(service)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded-lg ${service.color}`}>
                                                        {service.icon}
                                                    </div>
                                                    <div className="ml-3">
                                                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                                                        <p className="text-sm text-gray-600">{service.description}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    service.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    service.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {service.status}
                                                </span>
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Campanhas:</span>
                                                    <span className="ml-1 font-medium">{service.metrics.campaigns}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Alcance:</span>
                                                    <span className="ml-1 font-medium">{formatNumber(service.metrics.reach)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Lista de Campanhas */}
                        <div className="lg:col-span-2">
                            {/* Busca */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-64">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Buscar campanhas..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cards de Campanhas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredCampaigns.map((campaign) => (
                                    <div 
                                        key={campaign.id} 
                                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleViewCampaign(campaign)}
                                    >
                                        <div className="p-6">
                                            {/* Header do Card */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded-lg ${getTypeColor(campaign.type)}`}>
                                                        {campaign.type === 'email' && <Mail className="w-4 h-4" />}
                                                        {campaign.type === 'social' && <Smartphone className="w-4 h-4" />}
                                                        {campaign.type === 'ads' && <DollarSign className="w-4 h-4" />}
                                                        {campaign.type === 'content' && <FileText className="w-4 h-4" />}
                                                        {campaign.type === 'influencer' && <Users className="w-4 h-4" />}
                                                        {campaign.type === 'seo' && <Search className="w-4 h-4" />}
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                                                        <p className="text-sm text-gray-600">{campaign.target_audience}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                                    {campaign.status}
                                                </span>
                                            </div>

                                            {/* InformaÃ§Ãµes da Campanha */}
                                            <div className="space-y-3 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">DescriÃ§Ã£o</p>
                                                    <p className="text-sm font-medium text-gray-900">{campaign.description}</p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">OrÃ§amento</p>
                                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(campaign.budget)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Gasto</p>
                                                        <p className="text-lg font-bold text-blue-600">{formatCurrency(campaign.spent)}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">ROI</p>
                                                        <p className="text-sm font-medium text-green-600">{campaign.roi.toFixed(1)}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">ConversÃµes</p>
                                                        <p className="text-sm font-medium text-gray-900">{campaign.conversions}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AÃ§Ãµes */}
                                            <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleViewCampaign(campaign)}
                                                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Visualizar
                                                </button>
                                                <button
                                                    onClick={() => handleEditCampaign(campaign)}
                                                    className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCampaign(campaign.id)}
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

                            {filteredCampaigns.length === 0 && (
                                <div className="text-center py-12">
                                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Nenhuma campanha encontrada</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modais serÃ£o implementados se necessÃ¡rio */}
            </div>
        </ProtectedRoute>
    );
} 
