import React, { useState, useEffect } from 'react';
import {
  Building,
  Users,
  DollarSign,
  ShoppingCart,
  MapPin,
  Camera,
  Video,
  FileText,
  Settings,
  BarChart3,
  Bell,
  Star,
  Gift,
  CreditCard,
  Globe,
  Shield,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  Layers,
  Database,
  Server,
  Cloud,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Hotel,
  Plane,
  Car,
  Award,
  Target
} from 'lucide-react';
import RSVSidebar from '../components/RSVSidebar';
import RSVDashboard from '../components/RSVDashboard';
import { ResponsiveSidebar } from '../components/ResponsiveSidebar';

// ===================================================================
// RSV 360 ECOSYSTEM ARCHITECTURE - SISTEMA MODULAR COMPLETO
// ===================================================================

interface Service {
  id: string;
  name: string;
  description: string;
  port: number;
  status: 'active' | 'inactive' | 'error';
  category: string;
  icon: React.ComponentType<any>;
  url: string;
  color: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  services: Service[];
}

const RSV360Ecosystem: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('core');
  const [showDashboard, setShowDashboard] = useState(false);

  // ===================================================================
  // CONFIGURAÇÃO DOS 32 MICROSSERVIÇOS POR CATEGORIA
  // ===================================================================

  const categories: Category[] = [
    {
      id: 'core',
      name: 'Core Services',
      description: 'Serviços fundamentais do sistema',
      icon: Server,
      color: 'bg-blue-500',
      services: [
        {
          id: 'core',
          name: 'Core API',
          description: 'API principal, autenticação, middleware',
          port: 5000,
          status: 'active',
          category: 'core',
          icon: Server,
          url: 'http://localhost:5000',
          color: 'bg-blue-500'
        },
        {
          id: 'travel',
          name: 'Travel Management',
          description: 'Gestão de viagens, pacotes, destinos',
          port: 6003,
          status: 'active',
          category: 'core',
          icon: Plane,
          url: 'http://localhost:6003',
          color: 'bg-blue-500'
        },
        {
          id: 'finance',
          name: 'Finance System',
          description: 'Controle financeiro, relatórios, pagamentos',
          port: 6005,
          status: 'active',
          category: 'core',
          icon: DollarSign,
          url: 'http://localhost:6005',
          color: 'bg-blue-500'
        },
        {
          id: 'tickets',
          name: 'Ticket System',
          description: 'Sistema de tickets, suporte, atendimento',
          port: 6006,
          status: 'active',
          category: 'core',
          icon: MessageCircle,
          url: 'http://localhost:6006',
          color: 'bg-blue-500'
        }
      ]
    },
    {
      id: 'business',
      name: 'Business Services',
      description: 'Serviços de negócio e e-commerce',
      icon: Building,
      color: 'bg-green-500',
      services: [
        {
          id: 'payments',
          name: 'Payment Gateway',
          description: 'Gateway de pagamento, processamento',
          port: 6007,
          status: 'active',
          category: 'business',
          icon: CreditCard,
          url: 'http://localhost:6007',
          color: 'bg-green-500'
        },
        {
          id: 'ecommerce',
          name: 'E-commerce',
          description: 'Loja virtual, produtos, carrinho',
          port: 6008,
          status: 'active',
          category: 'business',
          icon: ShoppingCart,
          url: 'http://localhost:6008',
          color: 'bg-green-500'
        },
        {
          id: 'attractions',
          name: 'Attractions',
          description: 'Atrações turísticas, passeios',
          port: 6009,
          status: 'active',
          category: 'business',
          icon: MapPin,
          url: 'http://localhost:6009',
          color: 'bg-green-500'
        },
        {
          id: 'vouchers',
          name: 'Vouchers',
          description: 'Vouchers, cupons, promoções',
          port: 6010,
          status: 'active',
          category: 'business',
          icon: Gift,
          url: 'http://localhost:6010',
          color: 'bg-green-500'
        },
        {
          id: 'voucher-editor',
          name: 'Voucher Editor',
          description: 'Editor de vouchers, templates',
          port: 6011,
          status: 'active',
          category: 'business',
          icon: Edit,
          url: 'http://localhost:6011',
          color: 'bg-green-500'
        },
        {
          id: 'giftcards',
          name: 'Gift Cards',
          description: 'Cartões presente, vales',
          port: 6012,
          status: 'active',
          category: 'business',
          icon: Heart,
          url: 'http://localhost:6012',
          color: 'bg-green-500'
        },
        {
          id: 'coupons',
          name: 'Coupons',
          description: 'Sistema de cupons, descontos',
          port: 6013,
          status: 'active',
          category: 'business',
          icon: Bookmark,
          url: 'http://localhost:6013',
          color: 'bg-green-500'
        }
      ]
    },
    {
      id: 'specialized',
      name: 'Specialized Services',
      description: 'Serviços especializados e técnicos',
      icon: Zap,
      color: 'bg-purple-500',
      services: [
        {
          id: 'parks',
          name: 'Parks Management',
          description: 'Parques temáticos, reservas',
          port: 6014,
          status: 'active',
          category: 'specialized',
          icon: MapPin,
          url: 'http://localhost:6014',
          color: 'bg-purple-500'
        },
        {
          id: 'maps',
          name: 'Maps & Location',
          description: 'Mapas, geolocalização, rotas',
          port: 6015,
          status: 'active',
          category: 'specialized',
          icon: Globe,
          url: 'http://localhost:6015',
          color: 'bg-purple-500'
        },
        {
          id: 'visa',
          name: 'Visa Processing',
          description: 'Processamento de vistos',
          port: 6016,
          status: 'active',
          category: 'specialized',
          icon: Shield,
          url: 'http://localhost:6016',
          color: 'bg-purple-500'
        },
        {
          id: 'marketing',
          name: 'Marketing',
          description: 'Campanhas, email marketing, SEO',
          port: 6017,
          status: 'active',
          category: 'specialized',
          icon: TrendingUp,
          url: 'http://localhost:6017',
          color: 'bg-purple-500'
        },
        {
          id: 'subscriptions',
          name: 'Subscriptions',
          description: 'Assinaturas, planos, cobrança',
          port: 6018,
          status: 'active',
          category: 'specialized',
          icon: Calendar,
          url: 'http://localhost:6018',
          color: 'bg-purple-500'
        },
        {
          id: 'seo',
          name: 'SEO Optimization',
          description: 'Otimização SEO, meta tags',
          port: 6019,
          status: 'active',
          category: 'specialized',
          icon: Search,
          url: 'http://localhost:6019',
          color: 'bg-purple-500'
        },
        {
          id: 'multilingual',
          name: 'Multilingual',
          description: 'Tradução, i18n, localização',
          port: 6020,
          status: 'active',
          category: 'specialized',
          icon: Globe,
          url: 'http://localhost:6020',
          color: 'bg-purple-500'
        },
        {
          id: 'videos',
          name: 'Video Processing',
          description: 'Processamento de vídeos',
          port: 6021,
          status: 'active',
          category: 'specialized',
          icon: Video,
          url: 'http://localhost:6021',
          color: 'bg-purple-500'
        },
        {
          id: 'photos',
          name: 'Photo Gallery',
          description: 'Galeria, upload, otimização',
          port: 6022,
          status: 'active',
          category: 'specialized',
          icon: Camera,
          url: 'http://localhost:6022',
          color: 'bg-purple-500'
        }
      ]
    },
    {
      id: 'management',
      name: 'Management Systems',
      description: 'Sistemas de gestão e administração',
      icon: Settings,
      color: 'bg-orange-500',
      services: [
        {
          id: 'admin',
          name: 'Admin Panel',
          description: 'Painel administrativo, usuários',
          port: 6023,
          status: 'active',
          category: 'management',
          icon: User,
          url: 'http://localhost:6023',
          color: 'bg-orange-500'
        },
        {
          id: 'analytics',
          name: 'Analytics',
          description: 'Analytics, métricas, dashboards',
          port: 6024,
          status: 'active',
          category: 'management',
          icon: BarChart3,
          url: 'http://localhost:6024',
          color: 'bg-orange-500'
        },
        {
          id: 'reports',
          name: 'Reports',
          description: 'Relatórios, exportação, PDF',
          port: 6025,
          status: 'active',
          category: 'management',
          icon: FileText,
          url: 'http://localhost:6025',
          color: 'bg-orange-500'
        },
        {
          id: 'data',
          name: 'Data Management',
          description: 'Gestão de dados, migração',
          port: 6026,
          status: 'active',
          category: 'management',
          icon: Database,
          url: 'http://localhost:6026',
          color: 'bg-orange-500'
        }
      ]
    },
    {
      id: 'communication',
      name: 'Communication Services',
      description: 'Serviços de comunicação e interação',
      icon: MessageCircle,
      color: 'bg-pink-500',
      services: [
        {
          id: 'notifications',
          name: 'Notifications',
          description: 'Notificações push, email, SMS',
          port: 6027,
          status: 'active',
          category: 'communication',
          icon: Bell,
          url: 'http://localhost:6027',
          color: 'bg-pink-500'
        },
        {
          id: 'reviews',
          name: 'Reviews',
          description: 'Avaliações, comentários, ratings',
          port: 6028,
          status: 'active',
          category: 'communication',
          icon: Star,
          url: 'http://localhost:6028',
          color: 'bg-pink-500'
        },
        {
          id: 'rewards',
          name: 'Rewards',
          description: 'Sistema de recompensas',
          port: 6029,
          status: 'active',
          category: 'communication',
          icon: Award,
          url: 'http://localhost:6029',
          color: 'bg-pink-500'
        },
        {
          id: 'loyalty',
          name: 'Loyalty Program',
          description: 'Programa de fidelidade',
          port: 6030,
          status: 'active',
          category: 'communication',
          icon: Heart,
          url: 'http://localhost:6030',
          color: 'bg-pink-500'
        },
        {
          id: 'sales',
          name: 'Sales CRM',
          description: 'Gestão de vendas, CRM',
          port: 5031,
          status: 'active',
          category: 'communication',
          icon: Target,
          url: 'http://localhost:5031',
          color: 'bg-pink-500'
        },
        {
          id: 'sectoral_finance',
          name: 'Sectoral Finance',
          description: 'Finanças setoriais',
          port: 6005,
          status: 'active',
          category: 'communication',
          icon: DollarSign,
          url: 'http://localhost:6005',
          color: 'bg-pink-500'
        },
        {
          id: 'refunds',
          name: 'Refunds',
          description: 'Sistema de reembolsos',
          port: 6007,
          status: 'active',
          category: 'communication',
          icon: CreditCard,
          url: 'http://localhost:6007',
          color: 'bg-pink-500'
        }
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory & Logistics',
      description: 'Controle de estoque e logística',
      icon: Layers,
      color: 'bg-indigo-500',
      services: [
        {
          id: 'inventory',
          name: 'Inventory Control',
          description: 'Controle de estoque (data-management)',
          port: 6026,
          status: 'active',
          category: 'inventory',
          icon: Layers,
          url: 'http://localhost:6026',
          color: 'bg-indigo-500'
        }
      ]
    }
  ];

  // ===================================================================
  // FUNÇÕES DE UTILIDADE
  // ===================================================================

  const handleServiceSelect = (service: { id: string; name: string; port: number }) => {
    const category = categories.find(cat =>
      cat.services.some(s => s.id === service.id)
    );
    if (category) {
      setSelectedCategory(category.id);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return Clock;
      case 'error': return XCircle;
      default: return AlertCircle;
    }
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ===================================================================
          MENU LATERAL RESPONSIVO
          =================================================================== */}
      <ResponsiveSidebar
        onServiceSelect={handleServiceSelect}
        onToggle={setSidebarOpen}
      />

      {/* ===================================================================
          CONTEÚDO PRINCIPAL
          =================================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Principal */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedCategoryData?.name}
              </h2>
              <p className="text-gray-600">{selectedCategoryData?.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {selectedCategoryData?.services.length} serviços ativos
              </div>
                            <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Alternar Dashboard"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Configurações"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto p-6">
          {showDashboard ? (
            <RSVDashboard />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {selectedCategoryData?.services.map((service) => {
                const StatusIcon = getStatusIcon(service.status);
                const ServiceIcon = service.icon;

                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* Header do Card */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${service.color}`}>
                        <ServiceIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${getStatusColor(service.status)}`} />
                        <span className={`text-xs font-medium ${getStatusColor(service.status)}`}>
                          {service.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {service.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Porta: {service.port}</span>
                        <span>•</span>
                        <span>ID: {service.id}</span>
                      </div>
                    </div>

                    {/* Ações do Card */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(service.url, '_blank')}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        Acessar
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Mais opções"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RSV360Ecosystem;
