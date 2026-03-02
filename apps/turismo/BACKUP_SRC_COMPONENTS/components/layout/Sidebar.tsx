import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
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
  DollarSign,
  BookOpen,
  HelpCircle,
  GraduationCap,
  FileText as FileTextIcon,
  Database,
  Server,
  Smartphone,
  Monitor,
  Cloud,
  Lock,
  Key,
  UserCheck,
  ClipboardList,
  PieChart,
  LineChart,
  BarChart,
  PieChart as PieChartIcon,
  Mail,
  Hand,
  WifiOff
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
  description?: string;
  badge?: string;
  submenu?: MenuItem[];
  permission?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onToggle, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se está em mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      id: 'customers',
      name: 'Clientes',
      icon: <Users className="h-5 w-5" />,
      href: '/customers',
      description: 'Gestão de clientes',
      submenu: [
        { id: 'customer-list', name: 'Lista de Clientes', icon: <Users2 className="h-4 w-4" />, href: '/customers' },
        { id: 'customer-profile', name: 'Perfis', icon: <UserPlus className="h-4 w-4" />, href: '/customers' },
        { id: 'customer-analytics', name: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, href: '/customers' }
      ]
    },
    {
      id: 'payments',
      name: 'Pagamentos',
      icon: <CreditCard className="h-5 w-5" />,
      href: '/payments',
      description: 'Sistema de pagamentos',
      submenu: [
        { id: 'transactions', name: 'Transações', icon: <Activity className="h-4 w-4" />, href: '/payments' },
        { id: 'refunds', name: 'Reembolsos', icon: <RefreshCw className="h-4 w-4" />, href: '/payments' },
        { id: 'analytics', name: 'Analytics', icon: <LineChart className="h-4 w-4" />, href: '/payments' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: <Target className="h-5 w-5" />,
      href: '/marketing',
      description: 'Campanhas e leads',
      submenu: [
        { id: 'campaigns', name: 'Campanhas', icon: <Zap className="h-4 w-4" />, href: '/marketing' },
        { id: 'leads', name: 'Leads', icon: <UserPlus className="h-4 w-4" />, href: '/marketing' },
        { id: 'email', name: 'Email Marketing', icon: <Mail className="h-4 w-4" />, href: '/marketing' },
        { id: 'social', name: 'Redes Sociais', icon: <Globe className="h-4 w-4" />, href: '/marketing' }
      ]
    },
    {
      id: 'reports',
      name: 'Relatórios',
      icon: <FileText className="h-5 w-5" />,
      href: '/reports',
      description: 'Relatórios e analytics',
      submenu: [
        { id: 'custom-reports', name: 'Relatórios Customizados', icon: <ClipboardList className="h-4 w-4" />, href: '/reports' },
        { id: 'templates', name: 'Templates', icon: <FileTextIcon className="h-4 w-4" />, href: '/reports' },
        { id: 'scheduler', name: 'Agendamento', icon: <Calendar className="h-4 w-4" />, href: '/reports' },
        { id: 'export', name: 'Exportação', icon: <Download className="h-4 w-4" />, href: '/reports' }
      ]
    },
    {
      id: 'notifications',
      name: 'Notificações',
      icon: <Bell className="h-5 w-5" />,
      href: '/notifications',
      description: 'Sistema de notificações',
      submenu: [
        { id: 'push-notifications', name: 'Push Notifications', icon: <Smartphone className="h-4 w-4" />, href: '/notifications' },
        { id: 'email-marketing', name: 'Email Marketing', icon: <Mail className="h-4 w-4" />, href: '/notifications' },
        { id: 'sms', name: 'SMS', icon: <MessageSquare className="h-4 w-4" />, href: '/notifications' },
        { id: 'chat', name: 'Chat', icon: <MessageCircle className="h-4 w-4" />, href: '/notifications' }
      ]
    },
    {
      id: 'testing',
      name: 'Testes',
      icon: <ShieldCheck className="h-5 w-5" />,
      href: '/testing',
      description: 'Testes e qualidade',
      submenu: [
        { id: 'test-runner', name: 'Test Runner', icon: <Play className="h-4 w-4" />, href: '/testing' },
        { id: 'quality-metrics', name: 'Métricas de Qualidade', icon: <BarChart className="h-4 w-4" />, href: '/testing' },
        { id: 'test-suites', name: 'Test Suites', icon: <ClipboardList className="h-4 w-4" />, href: '/testing' },
        { id: 'code-coverage', name: 'Code Coverage', icon: <PieChartIcon className="h-4 w-4" />, href: '/testing' }
      ]
    },
    {
      id: 'documentation',
      name: 'Documentação',
      icon: <BookOpen className="h-5 w-5" />,
      href: '/documentation',
      description: 'Documentação e treinamento',
      submenu: [
        { id: 'docs', name: 'Documentação', icon: <FileTextIcon className="h-4 w-4" />, href: '/documentation' },
        { id: 'training', name: 'Treinamento', icon: <GraduationCap className="h-4 w-4" />, href: '/documentation' },
        { id: 'help', name: 'Ajuda', icon: <HelpCircle className="h-4 w-4" />, href: '/documentation' },
        { id: 'tutorials', name: 'Tutoriais', icon: <Play className="h-4 w-4" />, href: '/documentation' }
      ]
    },
    {
      id: 'deploy',
      name: 'Deploy',
      icon: <Cloud className="h-5 w-5" />,
      href: '/deploy',
      description: 'Deploy e DevOps',
      submenu: [
        { id: 'final-deploy', name: 'Deploy Final', icon: <Server className="h-4 w-4" />, href: '/deploy' },
        { id: 'go-live', name: 'Go-Live', icon: <Zap className="h-4 w-4" />, href: '/deploy' },
        { id: 'monitoring', name: 'Monitoramento', icon: <Activity className="h-4 w-4" />, href: '/deploy' },
        { id: 'backup', name: 'Backup & Recovery', icon: <Database className="h-4 w-4" />, href: '/deploy' }
      ]
    },
    {
      id: 'mobile',
      name: 'Mobile App',
      icon: <Smartphone className="h-5 w-5" />,
      href: '/mobile',
      description: 'Aplicativo mobile',
      submenu: [
        { id: 'mobile-layout', name: 'Layout Mobile', icon: <Monitor className="h-4 w-4" />, href: '/mobile' },
        { id: 'touch-interactions', name: 'Interações Touch', icon: <Hand className="h-4 w-4" />, href: '/mobile' },
        { id: 'offline-support', name: 'Suporte Offline', icon: <WifiOff className="h-4 w-4" />, href: '/mobile' },
        { id: 'push-notifications', name: 'Push Notifications', icon: <Bell className="h-4 w-4" />, href: '/mobile' }
      ]
    },
    {
      id: 'settings',
      name: 'Configurações',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings',
      description: 'Configurações do sistema'
    }
  ];

  const handleSubmenuToggle = (menuId: string) => {
    setOpenSubmenu(openSubmenu === menuId ? null : menuId);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActive = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActiveItem = isActive(item.href);
    const isSubmenuOpen = openSubmenu === item.id;

    return (
      <div key={item.id} className="space-y-1">
        <Link
          href={item.href}
          className={cn(
            'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
            'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300',
            isActiveItem
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300'
          )}
          onClick={() => {
            if (hasSubmenu) {
              handleSubmenuToggle(item.id);
            }
          }}
        >
          <span className="flex-shrink-0 mr-3">
            {item.icon}
          </span>
          
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.name}</span>
              {hasSubmenu && (
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    isSubmenuOpen ? 'rotate-180' : ''
                  )}
                />
              )}
            </>
          )}
        </Link>

                 {/* Submenu */}
         <AnimatePresence>
           {hasSubmenu && !isCollapsed && isSubmenuOpen && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               transition={{ duration: 0.2, ease: 'easeInOut' }}
               className="ml-6 space-y-1 overflow-hidden"
             >
               {item.submenu?.map((subItem, index) => (
                 <motion.div
                   key={subItem.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.05, duration: 0.2 }}
                 >
                   <Link
                     href={subItem.href}
                     className={cn(
                       'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                       'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300',
                       isActive(subItem.href)
                         ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                         : 'text-gray-600 dark:text-gray-400'
                     )}
                   >
                     <span className="flex-shrink-0 mr-3">
                       {subItem.icon}
                     </span>
                     <span className="flex-1">{subItem.name}</span>
                   </Link>
                 </motion.div>
               ))}
             </motion.div>
           )}
         </AnimatePresence>
      </div>
    );
  };

  // Overlay para mobile
  if (isMobile && isOpen) {
    return (
      <>
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
        
        {/* Sidebar Mobile */}
        <motion.div
          initial={{ x: -256 }}
          animate={{ x: 0 }}
          exit={{ x: -256 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl lg:hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Reservei Viagens
              </span>
            </div>
                      <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Fechar menu"
          >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-3 space-y-2">
              {menuItems.map(renderMenuItem)}
            </nav>
          </div>

          {/* User Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
                 </motion.div>
       </>
     );
   }

  // Sidebar Desktop
  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 lg:bg-white lg:border-r lg:border-gray-200 lg:dark:bg-gray-900 lg:dark:border-gray-700',
        'overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={cn(
          'flex items-center space-x-3 transition-all duration-300',
          isCollapsed ? 'justify-center' : ''
        )}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              Reservei Viagens
            </span>
          )}
        </div>
        
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Colapsar sidebar"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-2">
          {menuItems.map(renderMenuItem)}
        </nav>
      </div>

      {/* User Section */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">
                {user?.firstName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </button>
        </div>
      )}

      {/* Collapse Button (quando colapsado) */}
      {isCollapsed && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={onToggleCollapse}
            className="w-full p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Expandir sidebar"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </button>
                 </div>
       )}
     </motion.div>
   );
 }
