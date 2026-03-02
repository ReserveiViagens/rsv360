import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Users,
  Calendar,
  MapPin,
  Ticket,
  Gift,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  FileText,
  Shield,
  Camera,
  Video,
  MessageSquare,
  Bell,
  Globe,
  Award,
  Building,
  Plane,
  Car,
  Hotel,
  Utensils,
  Mountain,
  UserPlus,
  Heart,
  Zap,
  Target,
  BarChart3,
  Users2,
  FileImage,
  Play,
  MessageCircle,
  ShieldCheck,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Trash,
  Eye,
  Crown,
  Activity,
  DollarSign
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
  description?: string;
  badge?: string;
  submenu?: MenuItem[];
}

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      href: '/dashboard',
      description: 'Visão geral do sistema'
    },
    {
      id: 'travel',
      name: 'Viagens',
      icon: <Plane className="h-5 w-5" />,
      href: '/travel',
      description: 'Gestão de viagens e reservas',
      submenu: [
        { id: 'bookings', name: 'Reservas', icon: <Calendar className="h-4 w-4" />, href: '/travel' },
        { id: 'destinations', name: 'Destinos', icon: <MapPin className="h-4 w-4" />, href: '/travel' },
        { id: 'hotels', name: 'Hotéis', icon: <Hotel className="h-4 w-4" />, href: '/travel' },
        { id: 'transport', name: 'Transporte', icon: <Car className="h-4 w-4" />, href: '/travel' }
      ]
    },
    {
      id: 'attractions',
      name: 'Atrações',
      icon: <Mountain className="h-5 w-5" />,
      href: '/attractions',
      description: 'Pontos turísticos e atividades'
    },
    {
      id: 'parks',
      name: 'Parques',
      icon: <TreePine className="h-5 w-5" />,
      href: '/parks',
      description: 'Parques temáticos e naturais'
    },
    {
      id: 'tickets',
      name: 'Ingressos',
      icon: <Ticket className="h-5 w-5" />,
      href: '/tickets',
      description: 'Venda e gestão de ingressos'
    },
    {
      id: 'loyalty',
      name: 'Fidelidade',
      icon: <Star className="h-5 w-5" />,
      href: '/loyalty',
      description: 'Programa de fidelidade',
      badge: 'Novo'
    },
    {
      id: 'groups',
      name: 'Grupos',
      icon: <Users2 className="h-5 w-5" />,
      href: '/groups',
      description: 'Gestão de grupos de viagem',
      badge: 'Novo'
    },
    {
      id: 'rewards',
      name: 'Recompensas',
      icon: <Award className="h-5 w-5" />,
      href: '/rewards',
      description: 'Sistema de recompensas'
    },
    {
      id: 'coupons',
      name: 'Cupons',
      icon: <Gift className="h-5 w-5" />,
      href: '/coupons',
      description: 'Gestão de cupons de desconto'
    },
    {
      id: 'giftcards',
      name: 'Gift Cards',
      icon: <CreditCard className="h-5 w-5" />,
      href: '/giftcards',
      description: 'Cartões-presente'
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      icon: <ShoppingCart className="h-5 w-5" />,
      href: '/ecommerce',
      description: 'Loja virtual'
    },
    {
      id: 'finance',
      name: 'Financeiro',
      icon: <TrendingUp className="h-5 w-5" />,
      href: '/finance-dashboard',
      description: 'Gestão financeira',
      submenu: [
        { id: 'dashboard', name: 'Dashboard Financeiro', icon: <BarChart3 className="h-4 w-4" />, href: '/finance-dashboard' },
        { id: 'sales', name: 'Dashboard de Vendas', icon: <ShoppingCart className="h-4 w-4" />, href: '/sales-dashboard' },
        { id: 'sectoral', name: 'Setorial', icon: <Building className="h-4 w-4" />, href: '/sectoral-finance' },
        { id: 'refunds', name: 'Reembolsos', icon: <RefreshCw className="h-4 w-4" />, href: '/refunds' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: <Target className="h-5 w-5" />,
      href: '/marketing-dashboard',
      description: 'Campanhas e promoções',
      submenu: [
        { id: 'dashboard', name: 'Dashboard Marketing', icon: <BarChart3 className="h-4 w-4" />, href: '/marketing-dashboard' },
        { id: 'campaigns', name: 'Campanhas', icon: <Target className="h-4 w-4" />, href: '/marketing' },
        { id: 'analytics', name: 'Analytics', icon: <TrendingUp className="h-4 w-4" />, href: '/analytics-dashboard' }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/analytics-dashboard',
      description: 'Relatórios e métricas',
      submenu: [
        { id: 'dashboard', name: 'Dashboard Analytics', icon: <BarChart3 className="h-4 w-4" />, href: '/analytics-dashboard' },
        { id: 'reports', name: 'Relatórios', icon: <FileText className="h-4 w-4" />, href: '/analytics' },
        { id: 'metrics', name: 'Métricas', icon: <TrendingUp className="h-4 w-4" />, href: '/metrics' }
      ]
    },
    {
      id: 'seo',
      name: 'SEO',
      icon: <Search className="h-5 w-5" />,
      href: '/seo',
      description: 'Otimização para motores de busca'
    },
    {
      id: 'multilingual',
      name: 'Multilíngue',
      icon: <Globe className="h-5 w-5" />,
      href: '/multilingual',
      description: 'Traduções e idiomas'
    },
    {
      id: 'subscriptions',
      name: 'Assinaturas',
      icon: <Heart className="h-5 w-5" />,
      href: '/subscriptions',
      description: 'Gestão de assinaturas'
    },
    {
      id: 'inventory',
      name: 'Inventário',
      icon: <Package className="h-5 w-5" />,
      href: '/inventory',
      description: 'Controle de estoque'
    },
    {
      id: 'documents',
      name: 'Documentos',
      icon: <FileText className="h-5 w-5" />,
      href: '/documents',
      description: 'Gestão de documentos'
    },
    {
      id: 'visa',
      name: 'Vistos',
      icon: <ShieldCheck className="h-5 w-5" />,
      href: '/visa',
      description: 'Processamento de vistos'
    },
    {
      id: 'insurance',
      name: 'Seguros',
      icon: <Shield className="h-5 w-5" />,
      href: '/insurance',
      description: 'Gestão de seguros'
    },
    {
      id: 'photos',
      name: 'Fotos',
      icon: <Camera className="h-5 w-5" />,
      href: '/photos',
      description: 'Galeria de fotos'
    },
    {
      id: 'videos',
      name: 'Vídeos',
      icon: <Play className="h-5 w-5" />,
      href: '/videos',
      description: 'Gestão de vídeos'
    },
    {
      id: 'reviews',
      name: 'Avaliações',
      icon: <MessageCircle className="h-5 w-5" />,
      href: '/reviews',
      description: 'Sistema de avaliações'
    },
    {
      id: 'chatbots',
      name: 'Chatbots',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/chatbots',
      description: 'Atendimento automatizado'
    },
    {
      id: 'notifications',
      name: 'Notificações',
      icon: <Bell className="h-5 w-5" />,
      href: '/notifications',
      description: 'Sistema de notificações',
      badge: 'New'
    },
    {
      id: 'notifications-dashboard',
      name: 'Dashboard Notificações',
      icon: <Activity className="h-5 w-5" />,
      href: '/notifications-dashboard',
      description: 'Dashboard de notificações',
      badge: 'New'
    },
    {
      id: 'cadastros',
      name: 'Cadastros',
      icon: <UserPlus className="h-5 w-5" />,
      href: '/cadastros',
      description: 'Gestão de corretores e proprietários',
      badge: 'Novo'
    },
    {
      id: 'pagamentos',
      name: 'Pagamentos',
      icon: <DollarSign className="h-5 w-5" />,
      href: '/pagamentos',
      description: 'Gestão de pagamentos',
      badge: 'Novo'
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/chat',
      description: 'Sistema de conversas e suporte',
      badge: 'Novo'
    },
    {
      id: 'admin',
      name: 'Administração',
      icon: <Crown className="h-5 w-5" />,
      href: '/admin',
      description: 'Painel administrativo',
      submenu: [
        { id: 'users', name: 'Usuários', icon: <Users className="h-4 w-4" />, href: '/admin' },
        { id: 'settings', name: 'Configurações', icon: <Settings className="h-4 w-4" />, href: '/admin' },
        { id: 'logs', name: 'Logs', icon: <FileText className="h-4 w-4" />, href: '/admin' }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleSubmenu = (menuId: string) => {
    setOpenSubmenu(openSubmenu === menuId ? null : menuId);
  };

  const isActive = (href: string) => {
    return router.pathname === href;
  };

  const renderMenuItem = (item: MenuItem) => {
    const isItemActive = isActive(item.href);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuOpen = openSubmenu === item.id;

    return (
      <div key={item.id}>
        <Link
          href={hasSubmenu ? '#' : item.href}
          onClick={hasSubmenu ? (e) => { e.preventDefault(); toggleSubmenu(item.id); } : undefined}
          className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isItemActive
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-3">{item.icon}</span>
            <span>{item.name}</span>
            {item.badge && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                {item.badge}
              </span>
            )}
          </div>
          {hasSubmenu && (
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} 
            />
          )}
        </Link>
        
        {hasSubmenu && isSubmenuOpen && (
          <div className="ml-6 mt-2 space-y-1">
            {item.submenu!.map((subItem) => (
              <Link
                key={subItem.id}
                href={subItem.href}
                className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                  isActive(subItem.href)
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{subItem.icon}</span>
                <span>{subItem.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Onion RSV</h1>
                <p className="text-xs text-gray-500">360° Platform</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 font-semibold">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'usuario@email.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map(renderMenuItem)}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}

// Componente TreePine para substituir o ícone de parques
function TreePine(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      />
    </svg>
  );
}

// Componente Package para substituir o ícone de inventário
function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
} 