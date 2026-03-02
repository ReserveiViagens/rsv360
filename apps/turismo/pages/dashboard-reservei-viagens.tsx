import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Globe, Users, Star, DollarSign, TrendingUp,
  Plane, Camera, Gamepad2, Ticket, Megaphone, BarChart3, Search, Lightbulb,
  Award, Trophy, Gift, ShoppingCart, ShoppingBag, Package, Store,
  Calculator, FileText, CreditCard, RefreshCw, Image, Video, Heart,
  MessageCircle, Bot, Bell, Settings, Zap, Edit3, FileCheck,
  Shield, Passport, Car, Hotel, Map, Subscription, CreditCard as CardIcon,
  Cpu, Activity,
  TrendingUp as UpgradeIcon, User, Lock, UserCheck, Calendar,
  Home, Facebook, Instagram, Twitter, MessageSquare, ExternalLink
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface ReserveiStats {
  vendas: {
    mes: number;
    total: number;
    crescimento: number;
  };
  clientes: {
    total: number;
    novos: number;
    crescimento: number;
  };
  reservas: {
    ativas: number;
    total: number;
    taxa_conclusao: number;
  };
  receita: {
    total: number;
    mes: number;
    crescimento: number;
  };
  avaliacao: number;
  destinos: number;
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  description: string;
}

interface FunctionalityCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  status: string;
  items: {
    name: string;
    href: string;
    icon: React.ReactNode;
    external?: boolean;
  }[];
}

interface ServiceStatus {
  category: string;
  status: string;
  total: number;
  active: number;
  icon: React.ReactNode;
}

export default function DashboardReserveiViagens() {
  const [stats, setStats] = useState<ReserveiStats>({
    vendas: { mes: 125000, total: 2500000, crescimento: 15.2 },
    clientes: { total: 1500, novos: 45, crescimento: 8.5 },
    reservas: { ativas: 89, total: 1250, taxa_conclusao: 94.5 },
    receita: { total: 2500000, mes: 350000, crescimento: 12.8 },
    avaliacao: 4.8,
    destinos: 50
  });

  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadReserveiData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadReserveiData = async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados da Reservei Viagens
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'nova-viagem',
      title: 'Nova Viagem',
      icon: <Plane className="w-6 h-6" />,
      href: '/reservei/viagens/nova',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Criar nova viagem'
    },
    {
      id: 'nova-campanha',
      title: 'Nova Campanha',
      icon: <Megaphone className="w-6 h-6" />,
      href: '/reservei/marketing/campanhas/nova',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Criar campanha marketing'
    },
    {
      id: 'relatorios',
      title: 'Ver Relatórios',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/reservei/relatorios',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Análises e relatórios'
    },
    {
      id: 'cupom',
      title: 'Criar Cupom',
      icon: <Ticket className="w-6 h-6" />,
      href: '/reservei/cupons/novo',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      description: 'Gerar cupom desconto'
    },
    {
      id: 'cadastros',
      title: 'Cadastros',
      icon: <Users className="w-6 h-6" />,
      href: '/reservei/cadastros',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'Gestão de cadastros'
    },
    {
      id: 'pagamentos',
      title: 'Pagamentos',
      icon: <CreditCard className="w-6 h-6" />,
      href: '/reservei/pagamentos',
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Processar pagamentos'
    }
  ];

  const functionalityCategories: FunctionalityCategory[] = [
    {
      id: 'turismo',
      title: 'Turismo',
      icon: <Plane className="w-8 h-8" />,
      description: 'Gestão de viagens',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      status: '4/4',
      items: [
        { name: 'Viagens', href: '/reservei/viagens', icon: <Plane className="w-4 h-4" /> },
        { name: 'Atrações', href: '/reservei/atracoes', icon: <Camera className="w-4 h-4" /> },
        { name: 'Parques', href: '/reservei/parques', icon: <Gamepad2 className="w-4 h-4" /> },
        { name: 'Ingressos', href: '/reservei/ingressos', icon: <Ticket className="w-4 h-4" /> }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing',
      icon: <Megaphone className="w-8 h-8" />,
      description: 'Campanhas e analytics',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      status: '4/4',
      items: [
        { name: 'Campanhas', href: '/reservei/campanhas', icon: <Megaphone className="w-4 h-4" /> },
        { name: 'Analytics', href: '/reservei/analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { name: 'SEO', href: '/reservei/seo', icon: <Search className="w-4 h-4" /> },
        { name: 'Recomendações', href: '/reservei/recomendacoes', icon: <Lightbulb className="w-4 h-4" /> }
      ]
    },
    {
      id: 'fidelizacao',
      title: 'Fidelização',
      icon: <Award className="w-8 h-8" />,
      description: 'Programa de fidelidade',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      status: '4/4',
      items: [
        { name: 'Fidelidade', href: '/reservei/fidelidade', icon: <Award className="w-4 h-4" /> },
        { name: 'Recompensas', href: '/reservei/recompensas', icon: <Trophy className="w-4 h-4" /> },
        { name: 'Cupons', href: '/reservei/cupons', icon: <Gift className="w-4 h-4" /> },
        { name: 'Cartões Presente', href: '/reservei/cartoes-presente', icon: <Gift className="w-4 h-4" /> }
      ]
    },
    {
      id: 'ecommerce',
      title: 'E-commerce',
      icon: <ShoppingCart className="w-8 h-8" />,
      description: 'Vendas e produtos',
      color: 'bg-green-50 border-green-200 text-green-700',
      status: '4/4',
      items: [
        { name: 'Vendas', href: '/reservei/vendas', icon: <DollarSign className="w-4 h-4" /> },
        { name: 'Produtos', href: '/reservei/produtos', icon: <Package className="w-4 h-4" /> },
        { name: 'Estoque', href: '/reservei/estoque', icon: <ShoppingBag className="w-4 h-4" /> },
        { name: 'E-commerce', href: '/reservei/loja', icon: <Store className="w-4 h-4" /> }
      ]
    },
    {
      id: 'financeiro',
      title: 'Financeiro',
      icon: <Calculator className="w-8 h-8" />,
      description: 'Gestão financeira',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      status: '4/4',
      items: [
        { name: 'Finanças', href: '/reservei/financas', icon: <Calculator className="w-4 h-4" /> },
        { name: 'Relatórios', href: '/reservei/relatorios-financeiros', icon: <FileText className="w-4 h-4" /> },
        { name: 'Pagamentos', href: '/reservei/pagamentos', icon: <CreditCard className="w-4 h-4" /> },
        { name: 'Reembolsos', href: '/reservei/reembolsos', icon: <RefreshCw className="w-4 h-4" /> }
      ]
    },
    {
      id: 'conteudo',
      title: 'Conteúdo',
      icon: <Image className="w-8 h-8" />,
      description: 'Mídia e avaliações',
      color: 'bg-pink-50 border-pink-200 text-pink-700',
      status: '4/4',
      items: [
        { name: 'Fotos', href: '/reservei/fotos', icon: <Image className="w-4 h-4" /> },
        { name: 'Vídeos', href: '/reservei/videos', icon: <Video className="w-4 h-4" /> },
        { name: 'Avaliações', href: '/reservei/avaliacoes', icon: <Star className="w-4 h-4" /> },
        { name: 'Multilíngue', href: '/reservei/multilingue', icon: <Globe className="w-4 h-4" /> }
      ]
    },
    {
      id: 'automacao',
      title: 'Automação',
      icon: <Bot className="w-8 h-8" />,
      description: 'Chatbots e notificações',
      color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
      status: '4/4',
      items: [
        { name: 'Chatbots', href: '/reservei/chatbots', icon: <Bot className="w-4 h-4" /> },
        { name: 'Notificações', href: '/reservei/notificacoes', icon: <Bell className="w-4 h-4" /> },
        { name: 'Automação', href: '/reservei/automacao', icon: <Zap className="w-4 h-4" /> },
        { name: 'Workflows', href: '/reservei/workflows', icon: <Settings className="w-4 h-4" /> }
      ]
    },
    {
      id: 'vouchers',
      title: 'Vouchers',
      icon: <Ticket className="w-8 h-8" />,
      description: 'Gestão de vouchers',
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      status: '4/4',
      items: [
        { name: 'Vouchers', href: '/reservei/vouchers', icon: <Ticket className="w-4 h-4" /> },
        { name: 'Editor', href: '/reservei/editor-vouchers', icon: <Edit3 className="w-4 h-4" /> },
        { name: 'Reservas', href: '/reservei/reservas-vouchers', icon: <Calendar className="w-4 h-4" /> },
        { name: 'Validação', href: '/reservei/validacao-vouchers', icon: <FileCheck className="w-4 h-4" /> }
      ]
    },
    {
      id: 'gestao',
      title: 'Gestão',
      icon: <Users className="w-8 h-8" />,
      description: 'Administração',
      color: 'bg-gray-50 border-gray-200 text-gray-700',
      status: '4/4',
      items: [
        { name: 'Cadastros', href: '/reservei/gestao-cadastros', icon: <Users className="w-4 h-4" /> },
        { name: 'Usuários', href: '/reservei/usuarios', icon: <User className="w-4 h-4" /> },
        { name: 'Permissões', href: '/reservei/permissoes', icon: <Lock className="w-4 h-4" /> },
        { name: 'Configurações', href: '/reservei/configuracoes', icon: <Settings className="w-4 h-4" /> }
      ]
    },
    {
      id: 'documentos',
      title: 'Documentos',
      icon: <FileText className="w-8 h-8" />,
      description: 'Gestão documental',
      color: 'bg-slate-50 border-slate-200 text-slate-700',
      status: '4/4',
      items: [
        { name: 'Documentos', href: '/reservei/documentos', icon: <FileText className="w-4 h-4" /> },
        { name: 'Contratos', href: '/reservei/contratos', icon: <FileCheck className="w-4 h-4" /> },
        { name: 'Seguros', href: '/reservei/seguros', icon: <Shield className="w-4 h-4" /> },
        { name: 'Vistos', href: '/reservei/vistos', icon: <Passport className="w-4 h-4" /> }
      ]
    },
    {
      id: 'viagens-logistica',
      title: 'Viagens',
      icon: <Car className="w-8 h-8" />,
      description: 'Logística e transporte',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      status: '4/4',
      items: [
        { name: 'Viagens', href: '/reservei/viagens-logistica', icon: <Plane className="w-4 h-4" /> },
        { name: 'Hotéis', href: '/reservei/hoteis-logistica', icon: <Hotel className="w-4 h-4" /> },
        { name: 'Transporte', href: '/reservei/transporte', icon: <Car className="w-4 h-4" /> },
        { name: 'Mapas', href: '/reservei/mapas', icon: <Map className="w-4 h-4" /> }
      ]
    },
    {
      id: 'subscricoes',
      title: 'Subscrições',
      icon: <Subscription className="w-8 h-8" />,
      description: 'Planos e assinaturas',
      color: 'bg-violet-50 border-violet-200 text-violet-700',
      status: '4/4',
      items: [
        { name: 'Subscrições', href: '/reservei/subscricoes', icon: <Subscription className="w-4 h-4" /> },
        { name: 'Planos', href: '/reservei/planos', icon: <Package className="w-4 h-4" /> },
        { name: 'Cobrança', href: '/reservei/cobranca', icon: <CardIcon className="w-4 h-4" /> },
        { name: 'Upgrades', href: '/reservei/upgrades', icon: <UpgradeIcon className="w-4 h-4" /> }
      ]
    },
    {
      id: 'acesso-rapido',
      title: 'Acesso Rápido',
      icon: <Zap className="w-8 h-8" />,
      description: 'Configurações e monitoramento',
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      status: '4/4',
      items: [
        { name: 'Configurações', href: '/settings', icon: <Settings className="w-4 h-4" /> },
        { name: 'APIs e Mapas', href: '/integracoes-apis', icon: <Map className="w-4 h-4" /> },
        { name: 'Agentes SRE', href: 'http://localhost:5050', icon: <Cpu className="w-4 h-4" />, external: true },
        { name: 'Ecossistema RSV360', href: '/rsv-360-ecosystem', icon: <Activity className="w-4 h-4" /> }
      ]
    }
  ];

  const serviceStatus: ServiceStatus[] = [
    { category: 'Turismo', status: 'online', total: 4, active: 4, icon: <Plane className="w-5 h-5" /> },
    { category: 'Marketing', status: 'online', total: 4, active: 4, icon: <Megaphone className="w-5 h-5" /> },
    { category: 'Fidelização', status: 'online', total: 4, active: 4, icon: <Award className="w-5 h-5" /> },
    { category: 'E-commerce', status: 'online', total: 4, active: 4, icon: <ShoppingCart className="w-5 h-5" /> },
    { category: 'Financeiro', status: 'online', total: 4, active: 4, icon: <Calculator className="w-5 h-5" /> },
    { category: 'Conteúdo', status: 'online', total: 4, active: 4, icon: <Image className="w-5 h-5" /> },
    { category: 'Automação', status: 'online', total: 4, active: 4, icon: <Bot className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationButtons />

      {/* Header da Reservei Viagens */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <Plane className="w-10 h-10 text-blue-600 mr-4" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Reservei Viagens</h1>
                  <p className="text-gray-600">Sua agência de viagens completa com os melhores destinos e preços.</p>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Rua das Viagens, 123 - Centro, São Paulo - SP
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    (11) 99999-9999
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    contato@reserveiviagens.com
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:text-right mt-4 lg:mt-0">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Bem-vindo ao Reservei Viagens!</h3>
                <p className="text-blue-700 text-sm">Sistema de Gestão Turística Completo</p>

                <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-blue-900">+{stats.clientes.total}</div>
                    <div className="text-xs text-blue-700">clientes</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-900">+{stats.destinos}</div>
                    <div className="text-xs text-blue-700">destinos</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-900">{stats.avaliacao}/5</div>
                    <div className="text-xs text-blue-700">avaliações</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendas do Mês</p>
                <p className="text-2xl font-bold text-gray-900">R$ {(stats.vendas.mes / 1000).toFixed(0)}k</p>
                <p className="text-xs text-green-600">+{stats.vendas.crescimento}%</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
                <p className="text-2xl font-bold text-gray-900">+{stats.clientes.novos}</p>
                <p className="text-xs text-blue-600">+{stats.clientes.crescimento}%</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reservas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reservas.ativas}</p>
                <p className="text-xs text-purple-600">{stats.reservas.taxa_conclusao}% conclusão</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">R$ {(stats.receita.total / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-orange-600">+{stats.receita.crescimento}%</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href}>
                <div className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 cursor-pointer`}>
                  <div className="text-center">
                    <div className="mb-2 flex justify-center">{action.icon}</div>
                    <h4 className="text-sm font-medium mb-1">{action.title}</h4>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Todas as Funcionalidades */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Todas as Funcionalidades</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {functionalityCategories.map((category) => (
              <div key={category.id} className={`${category.color} border-2 rounded-lg p-6 hover:shadow-lg transition-shadow`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {category.icon}
                    <div className="ml-3">
                      <h4 className="text-lg font-semibold">{category.title}</h4>
                      <p className="text-sm opacity-80">{category.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-white bg-opacity-50 px-2 py-1 rounded">
                    {category.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {category.items.map((item, index) => (
                    item.external ? (
                      <a key={index} href={item.href} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center p-2 bg-white bg-opacity-30 hover:bg-opacity-50 rounded text-xs font-medium transition-colors">
                          {item.icon}
                          <span className="ml-1 truncate">{item.name}</span>
                        </div>
                      </a>
                    ) : (
                      <Link key={index} href={item.href}>
                        <div className="flex items-center p-2 bg-white bg-opacity-30 hover:bg-opacity-50 rounded text-xs font-medium transition-colors">
                          {item.icon}
                          <span className="ml-1 truncate">{item.name}</span>
                        </div>
                      </Link>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status dos Serviços e Perfil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status dos Serviços */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Status dos Serviços</h3>
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                24/24 online
              </div>
            </div>

            <div className="space-y-3">
              {serviceStatus.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {service.icon}
                    </div>
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">{service.category}</span>
                      <div className="text-sm text-gray-600">{service.active}/{service.total}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informações do Perfil */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">👤 Informações do Perfil</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nome Completo</label>
                <div className="text-sm text-gray-900">Administrador Onion 360</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <div className="text-sm text-gray-900">admin@onion360.com</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Permissões</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Administrador
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Ativo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer da Reservei Viagens */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Sobre a Reservei Viagens</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Nossa História</h5>
                  <p className="text-sm text-gray-600">
                    A Reservei Viagens é uma agência de viagens completa, especializada em criar experiências únicas e memoráveis.
                    Com anos de experiência no mercado turístico, oferecemos os melhores destinos, preços competitivos e atendimento personalizado.
                  </p>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Rua das Viagens, 123 - Centro, São Paulo - SP
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    (11) 99999-9999
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    contato@reserveiviagens.com
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    www.reserveiviagens.com
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Conecte-se Conosco</h4>
              <div className="grid grid-cols-2 gap-4">
                <a href="#" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Facebook className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-blue-900">Facebook</span>
                </a>
                <a href="#" className="flex items-center p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                  <Instagram className="w-5 h-5 text-pink-600 mr-3" />
                  <span className="text-sm font-medium text-pink-900">Instagram</span>
                </a>
                <a href="#" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Twitter className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-blue-900">Twitter</span>
                </a>
                <a href="#" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <MessageSquare className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-green-900">WhatsApp</span>
                </a>
              </div>

              <div className="mt-4 text-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
