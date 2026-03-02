import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  MessageCircle, 
  Camera, 
  Heart,
  Star,
  Award,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  User,
  Bell,
  Search,
  Menu,
  X,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  port: number;
  status: 'online' | 'offline' | 'warning';
  icon: string;
  description: string;
}

interface Category {
  name: string;
  icon: string;
  color: string;
  services: ServiceStatus[];
}

interface CompanyInfo {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    whatsapp: string;
  };
}

export default function Dashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);

    // Informações da empresa
    const companyInfo: CompanyInfo = {
        name: 'Reservei Viagens',
        logo: '/logos/reservei-viagens-logo.png',
        address: 'Rua das Viagens, 123 - Centro, São Paulo - SP',
        phone: '(11) 99999-9999',
        email: 'contato@reserveiviagens.com',
        website: 'www.reserveiviagens.com',
        description: 'Sua agência de viagens completa com os melhores destinos e preços.',
        socialMedia: {
            facebook: 'https://facebook.com/reserveiviagens',
            instagram: 'https://instagram.com/reserveiviagens',
            twitter: 'https://twitter.com/reserveiviagens',
            linkedin: 'https://linkedin.com/company/reserveiviagens',
            youtube: 'https://youtube.com/reserveiviagens',
            whatsapp: 'https://wa.me/5511999999999'
        }
    };

    // Categorias e serviços organizados
    const categories: Category[] = [
        {
            name: 'Turismo',
            icon: '🏖️',
            color: 'blue',
            services: [
                { name: 'Viagens', port: 5001, status: 'online', icon: '✈️', description: 'Gestão de viagens e reservas' },
                { name: 'Atrações', port: 5002, status: 'online', icon: '🎡', description: 'Atrações turísticas' },
                { name: 'Parques', port: 5003, status: 'online', icon: '🎢', description: 'Parques e entretenimento' },
                { name: 'Ingressos', port: 5004, status: 'online', icon: '🎫', description: 'Venda de ingressos' }
            ]
        },
        {
            name: 'Marketing',
            icon: '📢',
            color: 'purple',
            services: [
                { name: 'Campanhas', port: 5005, status: 'online', icon: '📈', description: 'Campanhas de marketing' },
                { name: 'Analytics', port: 5006, status: 'online', icon: '📊', description: 'Análises e relatórios' },
                { name: 'SEO', port: 5007, status: 'online', icon: '🔍', description: 'Otimização para motores de busca' },
                { name: 'Recomendações', port: 5008, status: 'online', icon: '💡', description: 'Sistema de recomendações' }
            ]
        },
        {
            name: 'Fidelização',
            icon: '🎁',
            color: 'green',
            services: [
                { name: 'Fidelidade', port: 5009, status: 'online', icon: '⭐', description: 'Programa de fidelidade' },
                { name: 'Recompensas', port: 5010, status: 'online', icon: '🏆', description: 'Sistema de recompensas' },
                { name: 'Cupons', port: 5011, status: 'online', icon: '🎫', description: 'Gestão de cupons' },
                { name: 'Cartões Presente', port: 5012, status: 'online', icon: '🎁', description: 'Cartões presente' }
            ]
        },
        {
            name: 'E-commerce',
            icon: '🛒',
            color: 'orange',
            services: [
                { name: 'Vendas', port: 5013, status: 'online', icon: '💰', description: 'Gestão de vendas' },
                { name: 'Produtos', port: 5014, status: 'online', icon: '📦', description: 'Produtos e estoque' },
                { name: 'Estoque', port: 5015, status: 'online', icon: '📋', description: 'Controle de estoque' },
                { name: 'E-commerce', port: 5016, status: 'online', icon: '🛍️', description: 'Comércio eletrônico' }
            ]
        },
        {
            name: 'Financeiro',
            icon: '💼',
            color: 'yellow',
            services: [
                { name: 'Finanças', port: 5017, status: 'online', icon: '📊', description: 'Gestão financeira' },
                { name: 'Relatórios', port: 5018, status: 'online', icon: '📈', description: 'Relatórios financeiros' }
            ]
        },
        {
            name: 'Conteúdo',
            icon: '📝',
            color: 'pink',
            services: [
                { name: 'Fotos', port: 5019, status: 'online', icon: '📸', description: 'Gestão de fotos' },
                { name: 'Vídeos', port: 5020, status: 'online', icon: '🎥', description: 'Gestão de vídeos' },
                { name: 'Avaliações', port: 5021, status: 'online', icon: '⭐', description: 'Sistema de avaliações' },
                { name: 'Multilíngue', port: 5022, status: 'online', icon: '🌐', description: 'Suporte multilíngue' }
            ]
        },
        {
            name: 'Automação',
            icon: '🤖',
            color: 'indigo',
            services: [
                { name: 'Chatbots', port: 5023, status: 'online', icon: '💬', description: 'Chatbots inteligentes' },
                { name: 'Notificações', port: 5024, status: 'online', icon: '🔔', description: 'Sistema de notificações' }
            ]
        }
    ];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-100 text-green-800';
            case 'offline': return 'bg-red-100 text-red-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (color: string) => {
        const colors = {
            blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
            purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
            green: 'bg-green-50 border-green-200 hover:bg-green-100',
            orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
            yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
            pink: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
            indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
            teal: 'bg-teal-50 border-teal-200 hover:bg-teal-100'
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    const totalServices = categories.reduce((acc, cat) => acc + cat.services.length, 0);
    const onlineServices = categories.reduce((acc, cat) => 
        acc + cat.services.filter(s => s.status === 'online').length, 0
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header Personalizado */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            {/* Logo e Nome da Empresa */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Building className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{companyInfo.name}</h1>
                                        <p className="text-sm text-gray-600">{companyInfo.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Informações de Contato */}
                            <div className="hidden md:flex items-center space-x-6">
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">{companyInfo.address}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-sm">{companyInfo.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{companyInfo.email}</span>
                                </div>
                            </div>

                            {/* Redes Sociais */}
                            <div className="hidden lg:flex items-center space-x-3">
                                <a 
                                    href={companyInfo.socialMedia.facebook} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a 
                                    href={companyInfo.socialMedia.instagram} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
                                >
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a 
                                    href={companyInfo.socialMedia.twitter} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-600 hover:text-blue-400 transition-colors"
                                >
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a 
                                    href={companyInfo.socialMedia.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-600 hover:text-blue-700 transition-colors"
                                >
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a 
                                    href={companyInfo.socialMedia.youtube} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                >
                                    <Youtube className="w-5 h-5" />
                                </a>
                                <a 
                                    href={companyInfo.socialMedia.whatsapp} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                </a>
                            </div>

                            {/* Menu Mobile */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    className="p-2 text-gray-600 hover:text-gray-900"
                                >
                                    {showSidebar ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Sidebar Mobile */}
                {showSidebar && (
                    <div className="md:hidden fixed inset-0 z-50">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)} />
                        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">Informações da Empresa</h3>
                                    <button onClick={() => setShowSidebar(false)}>
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm">{companyInfo.address}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm">{companyInfo.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm">{companyInfo.email}</span>
                                    </div>
                                    
                                    <div className="pt-4 border-t">
                                        <h4 className="text-sm font-medium mb-3">Redes Sociais</h4>
                                        <div className="flex space-x-3">
                                            <a href={companyInfo.socialMedia.facebook} target="_blank" className="p-2 bg-blue-600 text-white rounded">
                                                <Facebook className="w-4 h-4" />
                                            </a>
                                            <a href={companyInfo.socialMedia.instagram} target="_blank" className="p-2 bg-pink-600 text-white rounded">
                                                <Instagram className="w-4 h-4" />
                                            </a>
                                            <a href={companyInfo.socialMedia.whatsapp} target="_blank" className="p-2 bg-green-600 text-white rounded">
                                                <MessageSquare className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Conteúdo Principal */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Seção de Boas-vindas */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Bem-vindo ao {companyInfo.name}!
                                </h2>
                                <p className="text-blue-100 text-lg">
                                    Sistema de Gestão Turística Completo
                                </p>
                                <div className="mt-4 flex items-center space-x-4 text-blue-100">
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-5 h-5" />
                                        <span>+1.500 clientes</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Globe className="w-5 h-5" />
                                        <span>+50 destinos</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Star className="w-5 h-5" />
                                        <span>4.8/5 avaliações</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <Award className="w-12 h-12 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Estatísticas Rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Vendas do Mês</p>
                                    <p className="text-2xl font-bold text-gray-900">R$ 125.000</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
                                    <p className="text-2xl font-bold text-gray-900">+45</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Reservas Ativas</p>
                                    <p className="text-2xl font-bold text-gray-900">89</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                                    <p className="text-2xl font-bold text-gray-900">R$ 2.5M</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo Original do Dashboard */}
                    <div className="space-y-6">
                        {/* Ações Rápidas */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4">🚀 Ações Rápidas</h2>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <button
                                        onClick={() => router.push('/travel')}
                                        className="p-4 border rounded-lg hover:bg-blue-50 transition-colors text-center"
                                    >
                                        <div className="text-2xl mb-2">🏖️</div>
                                        <p className="text-sm font-medium">Nova Viagem</p>
                                    </button>
                                    
                                    <button
                                        onClick={() => router.push('/marketing')}
                                        className="p-4 border rounded-lg hover:bg-purple-50 transition-colors text-center"
                                    >
                                        <div className="text-2xl mb-2">📢</div>
                                        <p className="text-sm font-medium">Nova Campanha</p>
                                    </button>
                                    
                                    <button
                                        onClick={() => router.push('/analytics')}
                                        className="p-4 border rounded-lg hover:bg-green-50 transition-colors text-center"
                                    >
                                        <div className="text-2xl mb-2">📊</div>
                                        <p className="text-sm font-medium">Ver Relatórios</p>
                                    </button>
                                    
                                    <button
                                        onClick={() => router.push('/coupons')}
                                        className="p-4 border rounded-lg hover:bg-yellow-50 transition-colors text-center"
                                    >
                                        <div className="text-2xl mb-2">🎫</div>
                                        <p className="text-sm font-medium">Criar Cupom</p>
                                    </button>

                                    <button
                                        onClick={() => router.push('/cadastros')}
                                        className="p-4 border rounded-lg hover:bg-teal-50 transition-colors text-center"
                                    >
                                        <div className="text-2xl mb-2">👔</div>
                                        <p className="text-sm font-medium">Cadastros</p>
                                    </button>
                                    <button
                                        onClick={() => router.push('/pagamentos')}
                                        className="p-4 border rounded-lg hover:bg-green-50 transition-colors text-center"
                                    >
                                        <div className="text-2xl mb-2">💰</div>
                                        <p className="text-sm font-medium">Pagamentos</p>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Todas as Funcionalidades */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-6">🎯 Todas as Funcionalidades</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    
                                    {/* Turismo */}
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">🏖️</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Turismo</h3>
                                                <p className="text-sm text-gray-600">Gestão de viagens</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/travel')}
                                                className="w-full text-left p-2 rounded hover:bg-blue-200 transition-colors"
                                            >
                                                <span className="text-sm">✈️ Viagens</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/attractions')}
                                                className="w-full text-left p-2 rounded hover:bg-blue-200 transition-colors"
                                            >
                                                <span className="text-sm">🎡 Atrações</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/parks')}
                                                className="w-full text-left p-2 rounded hover:bg-blue-200 transition-colors"
                                            >
                                                <span className="text-sm">🎢 Parques</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/tickets')}
                                                className="w-full text-left p-2 rounded hover:bg-blue-200 transition-colors"
                                            >
                                                <span className="text-sm">🎫 Ingressos</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Marketing */}
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">📢</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Marketing</h3>
                                                <p className="text-sm text-gray-600">Campanhas e analytics</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/marketing')}
                                                className="w-full text-left p-2 rounded hover:bg-purple-200 transition-colors"
                                            >
                                                <span className="text-sm">📈 Campanhas</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/analytics')}
                                                className="w-full text-left p-2 rounded hover:bg-purple-200 transition-colors"
                                            >
                                                <span className="text-sm">📊 Analytics</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/seo')}
                                                className="w-full text-left p-2 rounded hover:bg-purple-200 transition-colors"
                                            >
                                                <span className="text-sm">🔍 SEO</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/recommendations')}
                                                className="w-full text-left p-2 rounded hover:bg-purple-200 transition-colors"
                                            >
                                                <span className="text-sm">💡 Recomendações</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Fidelização */}
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">🎁</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Fidelização</h3>
                                                <p className="text-sm text-gray-600">Programa de fidelidade</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/loyalty')}
                                                className="w-full text-left p-2 rounded hover:bg-green-200 transition-colors"
                                            >
                                                <span className="text-sm">⭐ Fidelidade</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/rewards')}
                                                className="w-full text-left p-2 rounded hover:bg-green-200 transition-colors"
                                            >
                                                <span className="text-sm">🏆 Recompensas</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/coupons')}
                                                className="w-full text-left p-2 rounded hover:bg-green-200 transition-colors"
                                            >
                                                <span className="text-sm">🎫 Cupons</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/giftcards')}
                                                className="w-full text-left p-2 rounded hover:bg-green-200 transition-colors"
                                            >
                                                <span className="text-sm">🎁 Cartões Presente</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* E-commerce */}
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">🛒</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">E-commerce</h3>
                                                <p className="text-sm text-gray-600">Vendas e produtos</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/sales')}
                                                className="w-full text-left p-2 rounded hover:bg-orange-200 transition-colors"
                                            >
                                                <span className="text-sm">💰 Vendas</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/products')}
                                                className="w-full text-left p-2 rounded hover:bg-orange-200 transition-colors"
                                            >
                                                <span className="text-sm">📦 Produtos</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/inventory')}
                                                className="w-full text-left p-2 rounded hover:bg-orange-200 transition-colors"
                                            >
                                                <span className="text-sm">📋 Estoque</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/ecommerce')}
                                                className="w-full text-left p-2 rounded hover:bg-orange-200 transition-colors"
                                            >
                                                <span className="text-sm">🛍️ E-commerce</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Financeiro */}
                                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">💼</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Financeiro</h3>
                                                <p className="text-sm text-gray-600">Gestão financeira</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/finance')}
                                                className="w-full text-left p-2 rounded hover:bg-yellow-200 transition-colors"
                                            >
                                                <span className="text-sm">📊 Finanças</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/reports')}
                                                className="w-full text-left p-2 rounded hover:bg-yellow-200 transition-colors"
                                            >
                                                <span className="text-sm">📈 Relatórios</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/payments')}
                                                className="w-full text-left p-2 rounded hover:bg-yellow-200 transition-colors"
                                            >
                                                <span className="text-sm">💳 Pagamentos</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/refunds')}
                                                className="w-full text-left p-2 rounded hover:bg-yellow-200 transition-colors"
                                            >
                                                <span className="text-sm">↩️ Reembolsos</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6 border border-pink-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">📝</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Conteúdo</h3>
                                                <p className="text-sm text-gray-600">Mídia e avaliações</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/photos')}
                                                className="w-full text-left p-2 rounded hover:bg-pink-200 transition-colors"
                                            >
                                                <span className="text-sm">📸 Fotos</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/videos')}
                                                className="w-full text-left p-2 rounded hover:bg-pink-200 transition-colors"
                                            >
                                                <span className="text-sm">🎥 Vídeos</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/reviews')}
                                                className="w-full text-left p-2 rounded hover:bg-pink-200 transition-colors"
                                            >
                                                <span className="text-sm">⭐ Avaliações</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/multilingual')}
                                                className="w-full text-left p-2 rounded hover:bg-pink-200 transition-colors"
                                            >
                                                <span className="text-sm">🌐 Multilíngue</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Automação */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border border-indigo-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">🤖</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Automação</h3>
                                                <p className="text-sm text-gray-600">Chatbots e notificações</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/chatbots')}
                                                className="w-full text-left p-2 rounded hover:bg-indigo-200 transition-colors"
                                            >
                                                <span className="text-sm">💬 Chatbots</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/notifications')}
                                                className="w-full text-left p-2 rounded hover:bg-indigo-200 transition-colors"
                                            >
                                                <span className="text-sm">🔔 Notificações</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/automation')}
                                                className="w-full text-left p-2 rounded hover:bg-indigo-200 transition-colors"
                                            >
                                                <span className="text-sm">⚙️ Automação</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/workflows')}
                                                className="w-full text-left p-2 rounded hover:bg-indigo-200 transition-colors"
                                            >
                                                <span className="text-sm">🔄 Workflows</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Vouchers */}
                                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6 border border-teal-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">🎫</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Vouchers</h3>
                                                <p className="text-sm text-gray-600">Gestão de vouchers</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/vouchers')}
                                                className="w-full text-left p-2 rounded hover:bg-teal-200 transition-colors"
                                            >
                                                <span className="text-sm">🎫 Vouchers</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/voucher-editor')}
                                                className="w-full text-left p-2 rounded hover:bg-teal-200 transition-colors"
                                            >
                                                <span className="text-sm">✏️ Editor</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/reservations')}
                                                className="w-full text-left p-2 rounded hover:bg-teal-200 transition-colors"
                                            >
                                                <span className="text-sm">📋 Reservas</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/validation')}
                                                className="w-full text-left p-2 rounded hover:bg-teal-200 transition-colors"
                                            >
                                                <span className="text-sm">✅ Validação</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Gestão */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">👔</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Gestão</h3>
                                                <p className="text-sm text-gray-600">Administração</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/gestao')}
                                                className="w-full text-left p-2 rounded hover:bg-gray-200 transition-colors"
                                            >
                                                <span className="text-sm">📝 Cadastros</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/users')}
                                                className="w-full text-left p-2 rounded hover:bg-gray-200 transition-colors"
                                            >
                                                <span className="text-sm">👤 Usuários</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/permissions')}
                                                className="w-full text-left p-2 rounded hover:bg-gray-200 transition-colors"
                                            >
                                                <span className="text-sm">🔐 Permissões</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/settings')}
                                                className="w-full text-left p-2 rounded hover:bg-gray-200 transition-colors"
                                            >
                                                <span className="text-sm">⚙️ Configurações</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Documentos */}
                                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">📄</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Documentos</h3>
                                                <p className="text-sm text-gray-600">Gestão documental</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/documents')}
                                                className="w-full text-left p-2 rounded hover:bg-red-200 transition-colors"
                                            >
                                                <span className="text-sm">📄 Documentos</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/contracts')}
                                                className="w-full text-left p-2 rounded hover:bg-red-200 transition-colors"
                                            >
                                                <span className="text-sm">📋 Contratos</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/insurance')}
                                                className="w-full text-left p-2 rounded hover:bg-red-200 transition-colors"
                                            >
                                                <span className="text-sm">🛡️ Seguros</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/visa')}
                                                className="w-full text-left p-2 rounded hover:bg-red-200 transition-colors"
                                            >
                                                <span className="text-sm">🛂 Vistos</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Viagens */}
                                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-6 border border-cyan-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">✈️</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Viagens</h3>
                                                <p className="text-sm text-gray-600">Logística e transporte</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/travel')}
                                                className="w-full text-left p-2 rounded hover:bg-cyan-200 transition-colors"
                                            >
                                                <span className="text-sm">✈️ Viagens</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/hotels')}
                                                className="w-full text-left p-2 rounded hover:bg-cyan-200 transition-colors"
                                            >
                                                <span className="text-sm">🏨 Hotéis</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/transport')}
                                                className="w-full text-left p-2 rounded hover:bg-cyan-200 transition-colors"
                                            >
                                                <span className="text-sm">🚗 Transporte</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/maps')}
                                                className="w-full text-left p-2 rounded hover:bg-cyan-200 transition-colors"
                                            >
                                                <span className="text-sm">🗺️ Mapas</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subscrições */}
                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                                                <span className="text-2xl">📦</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Subscrições</h3>
                                                <p className="text-sm text-gray-600">Planos e assinaturas</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => router.push('/subscriptions')}
                                                className="w-full text-left p-2 rounded hover:bg-emerald-200 transition-colors"
                                            >
                                                <span className="text-sm">📦 Subscrições</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/plans')}
                                                className="w-full text-left p-2 rounded hover:bg-emerald-200 transition-colors"
                                            >
                                                <span className="text-sm">📋 Planos</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/billing')}
                                                className="w-full text-left p-2 rounded hover:bg-emerald-200 transition-colors"
                                            >
                                                <span className="text-sm">💳 Cobrança</span>
                                            </button>
                                            <button
                                                onClick={() => router.push('/upgrades')}
                                                className="w-full text-left p-2 rounded hover:bg-emerald-200 transition-colors"
                                            >
                                                <span className="text-sm">⬆️ Upgrades</span>
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Status dos Serviços */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Status dos Serviços</h2>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                        {onlineServices}/{totalServices} online
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sair</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map((category) => (
                                    <div
                                        key={category.name}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${getCategoryColor(category.color)}`}
                                        onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-2xl">{category.icon}</span>
                                                <h3 className="font-medium">{category.name}</h3>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {category.services.filter(s => s.status === 'online').length}/{category.services.length}
                                            </span>
                                        </div>
                                        
                                        {selectedCategory === category.name && (
                                            <div className="mt-4 space-y-2">
                                                {category.services.map((service) => (
                                                    <div key={service.name} className="flex items-center justify-between p-2 bg-white rounded border">
                                                        <div className="flex items-center space-x-2">
                                                            <span>{service.icon}</span>
                                                            <span className="text-sm font-medium">{service.name}</span>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                                                            {service.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Informações do Usuário */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4">👤 Informações do Perfil</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                                        <p className="mt-1 text-sm text-gray-900">{user?.full_name || 'N/A'}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="mt-1 text-sm text-gray-900">{user?.email || 'N/A'}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Permissões</label>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {user?.permissions?.map((permission, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {permission === 'admin' ? 'Administrador' : 
                                                     permission === 'usuario' ? 'Usuário' : permission}
                                                </span>
                                            )) || <span className="text-gray-500">Nenhuma permissão definida</span>}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Ativo
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sobre a Reservei Viagens */}
                        <div className="bg-white rounded-lg shadow mb-8">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Sobre a {companyInfo.name}</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Nossa História</h4>
                                        <p className="text-gray-600 mb-4">
                                            A {companyInfo.name} é uma agência de viagens completa, especializada em criar 
                                            experiências únicas e memoráveis. Com anos de experiência no mercado turístico, 
                                            oferecemos os melhores destinos, preços competitivos e atendimento personalizado.
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <MapPin className="w-5 h-5 text-gray-500" />
                                                <span className="text-sm text-gray-600">{companyInfo.address}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Phone className="w-5 h-5 text-gray-500" />
                                                <span className="text-sm text-gray-600">{companyInfo.phone}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-5 h-5 text-gray-500" />
                                                <span className="text-sm text-gray-600">{companyInfo.email}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Globe className="w-5 h-5 text-gray-500" />
                                                <span className="text-sm text-gray-600">{companyInfo.website}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Conecte-se Conosco</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <a 
                                                href={companyInfo.socialMedia.facebook} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Facebook className="w-5 h-5" />
                                                <span className="text-sm font-medium">Facebook</span>
                                            </a>
                                            <a 
                                                href={companyInfo.socialMedia.instagram} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-3 p-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                            >
                                                <Instagram className="w-5 h-5" />
                                                <span className="text-sm font-medium">Instagram</span>
                                            </a>
                                            <a 
                                                href={companyInfo.socialMedia.twitter} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-3 p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                                            >
                                                <Twitter className="w-5 h-5" />
                                                <span className="text-sm font-medium">Twitter</span>
                                            </a>
                                            <a 
                                                href={companyInfo.socialMedia.whatsapp} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-3 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                                <span className="text-sm font-medium">WhatsApp</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
