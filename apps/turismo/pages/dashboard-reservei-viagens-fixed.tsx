import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin, Phone, Mail, Globe, Users, Star, DollarSign, TrendingUp,
  Plane, Camera, Gamepad2, Ticket, Megaphone, BarChart3, Search, Lightbulb,
  Award, Trophy, Gift, ShoppingCart, ShoppingBag, Package, Store,
  Calculator, FileText, CreditCard, RefreshCw, Image, Video,
  MessageCircle, Bot, Bell, Settings, Zap, Edit3, FileCheck,
  Shield, Passport, Car, Hotel, Map, User, Lock, UserCheck, Calendar,
  Home
} from 'lucide-react';

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

interface ServiceStatus {
  category: string;
  status: string;
  total: number;
  active: number;
  icon: React.ReactNode;
}

export default function DashboardReserveiViagensFixed() {
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

        {/* Status dos Serviços */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Status dos Serviços</h3>
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                7/7 online
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
                <div className="text-sm text-gray-900">Administrador Reservei Viagens</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <div className="text-sm text-gray-900">admin@reserveiviagens.com</div>
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

        {/* Footer */}
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
                  <Globe className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-blue-900">Facebook</span>
                </a>
                <a href="#" className="flex items-center p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                  <Camera className="w-5 h-5 text-pink-600 mr-3" />
                  <span className="text-sm font-medium text-pink-900">Instagram</span>
                </a>
                <a href="#" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <MessageCircle className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-blue-900">Twitter</span>
                </a>
                <a href="#" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-green-900">WhatsApp</span>
                </a>
              </div>

              <div className="mt-4 text-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  Voltar ao Dashboard Principal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
