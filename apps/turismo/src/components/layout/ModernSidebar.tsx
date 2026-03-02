'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Monitor as MonitorIcon,
  Plane,
  CreditCard,
  BarChart3,
  Bell,
  Smartphone,
  MapPin,
  Camera,
  MessageSquare,
  Shield,
  HelpCircle,
  Globe,
  Heart,
  Star,
  Gift,
  TrendingUp,
  Package,
  UserCheck,
  ClipboardList,
  Building2,
  Car,
  Hotel,
  Utensils,
  ShoppingBag,
  Headphones,
  Mail,
  Phone,
  Map,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  Save,
  Share,
  Copy,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  MoreHorizontal,
  MoreVertical,
  Grid,
  List,
  Layout,
  Sidebar,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Grip,
  Target,
  Zap,
  Award,
  Bookmark,
  Flag,
  Tag,
  Hash,
  AtSign,
  DollarSign,
  Percent,
  PieChart,
  Activity,
  Cpu,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalZero,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Image,
  File,
  Folder,
  FolderOpen,
  Archive,
  Inbox,
  Send,
  Reply,
  Forward,
  Trash,
  ArchiveRestore,
  Pin,
  PinOff,
  BookOpen,
  Book,
  Library,
  GraduationCap,
  Briefcase,
  Coffee,
  Gamepad2,
  Music,
  Film,
  Tv,
  Radio,
  HeadphonesIcon,
  Speaker,
  Volume1,
  Volume3,
  Disc,
  Cd,
  Vinyl,
  Cassette,
  Headphones2,
  Mic2,
  Video2,
  Camera2,
  Webcam,
  Monitor2,
  Laptop,
  Tablet,
  Smartphone2,
  Watch,
  Gamepad,
  Joystick,
  Mouse,
  Keyboard,
  Printer,
  Scanner,
  Fax,
  Router,
  Modem,
  HardDrive,
  SdCard,
  Usb,
  Plug,
  Power,
  PowerOff,
  Lightbulb,
  LightbulbOff,
  Lamp,
  LampDesk,
  LampFloor,
  LampCeiling,
  LampWall,
  LampTable,
  Candle,
  Flashlight,
  FlashlightOff,
  Torch,
  Fire,
  Flame,
  Sparkles,
  Star2,
  Heart2,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Sad,
  Surprised,
  Confused,
  Kiss,
  Wink,
  Tongue,
  ThumbsUp,
  ThumbsDown,
  Clap,
  Wave,
  Peace,
  Ok,
  Point,
  Finger,
  Hand,
  Hands,
  Foot,
  Feet,
  Leg,
  Legs,
  Arm,
  Arms,
  Body,
  Head,
  Face,
  Eye2,
  Eyes,
  Nose,
  Mouth,
  Ear,
  Ears,
  Hair,
  Beard,
  Mustache,
  Glasses,
  Sunglasses,
  Mask,
  Hat,
  Cap,
  Helmet,
  Crown,
  Tiara,
  Ring,
  Gem,
  Diamond,
  Ruby,
  Emerald,
  Sapphire,
  Pearl,
  Gold,
  Silver,
  Bronze,
  Copper,
  Iron,
  Steel,
  Aluminum,
  Titanium,
  Platinum,
  Palladium,
  Rhodium,
  Osmium,
  Iridium,
  Ruthenium,
  Rhenium,
  Tungsten,
  Molybdenum,
  Tantalum,
  Hafnium,
  Zirconium,
  Niobium,
  Yttrium,
  Lanthanum,
  Cerium,
  Praseodymium,
  Neodymium,
  Promethium,
  Samarium,
  Europium,
  Gadolinium,
  Terbium,
  Dysprosium,
  Holmium,
  Erbium,
  Thulium,
  Ytterbium,
  Lutetium,
  Actinium,
  Thorium,
  Protactinium,
  Uranium,
  Neptunium,
  Plutonium,
  Americium,
  Curium,
  Berkelium,
  Californium,
  Einsteinium,
  Fermium,
  Mendelevium,
  Nobelium,
  Lawrencium,
  Rutherfordium,
  Dubnium,
  Seaborgium,
  Bohrium,
  Hassium,
  Meitnerium,
  Darmstadtium,
  Roentgenium,
  Copernicium,
  Nihonium,
  Flerovium,
  Moscovium,
  Livermorium,
  Tennessine,
  Oganesson
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  submenu?: MenuItem[];
}

interface ModernSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({
  isOpen,
  onToggle,
  isCollapsed,
  onToggleCollapse
}) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      href: '/dashboard-rsv',
      icon: <Home className="h-5 w-5" />,
      description: 'Visão geral do sistema'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      href: '/analytics-complete',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Dashboards e métricas'
    },
    {
      id: 'reservations',
      name: 'Reservas',
      href: '/reservations-rsv',
      icon: <Calendar className="h-5 w-5" />,
      description: 'Gerenciar reservas',
      submenu: [
        {
          id: 'new-reservation',
          name: 'Nova Reserva',
          href: '/reservations-rsv/new',
          icon: <Plus className="h-4 w-4" />
        },
        {
          id: 'pending-reservations',
          name: 'Pendentes',
          href: '/reservations-rsv/pending',
          icon: <Clock className="h-4 w-4" />
        },
        {
          id: 'confirmed-reservations',
          name: 'Confirmadas',
          href: '/reservations-rsv/confirmed',
          icon: <CheckCircle className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'travel',
      name: 'Viagens',
      href: '/travel',
      icon: <Plane className="h-5 w-5" />,
      description: 'Catálogo de viagens',
      submenu: [
        {
          id: 'travel-catalog',
          name: 'Catálogo',
          href: '/travel-catalog-rsv',
          icon: <Package className="h-4 w-4" />
        },
        {
          id: 'destinations',
          name: 'Destinos',
          href: '/destinations',
          icon: <MapPin className="h-4 w-4" />
        },
        {
          id: 'packages',
          name: 'Pacotes',
          href: '/packages',
          icon: <Gift className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'customers',
      name: 'Clientes',
      href: '/customers-rsv',
      icon: <Users className="h-5 w-5" />,
      description: 'Gerenciar clientes'
    },
    {
      id: 'reports',
      name: 'Relatórios',
      href: '/reports-complete',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Relatórios e análises'
    },
    {
      id: 'notifications',
      name: 'Notificações',
      href: '/notifications',
      icon: <Bell className="h-5 w-5" />,
      description: 'Central de notificações'
    },
    {
      id: 'settings',
      name: 'Configurações',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
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
        {hasSubmenu ? (
          // Item com submenu
          <div className="relative">
            <button
              className={cn(
                'group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300',
                'hover:shadow-sm hover:scale-[1.02]',
                isActiveItem
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-700 dark:text-gray-300',
                isCollapsed ? 'justify-center px-2' : ''
              )}
              onClick={() => {
                if (isCollapsed) {
                  // Quando colapsado, expandir o menu primeiro
                  onToggleCollapse();
                } else {
                  // Quando expandido, alternar submenu
                  handleSubmenuToggle(item.id);
                }
              }}
              title={isCollapsed ? item.name : undefined}
            >
              <span className={cn(
                "flex-shrink-0 transition-colors duration-200",
                isActiveItem ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                isCollapsed ? "" : "mr-3"
              )}>
                {item.icon}
              </span>

              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  <motion.div
                    animate={{ rotate: isSubmenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </>
              )}
            </button>

            {/* Tooltip para menu colapsado */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                {item.name}
              </div>
            )}
          </div>
        ) : (
          // Item sem submenu - é um link normal
          <div className="relative">
            <Link
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300',
                'hover:shadow-sm hover:scale-[1.02]',
                isActiveItem
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-700 dark:text-gray-300',
                isCollapsed ? 'justify-center px-2' : ''
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <span className={cn(
                "flex-shrink-0 transition-colors duration-200",
                isActiveItem ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                isCollapsed ? "" : "mr-3"
              )}>
                {item.icon}
              </span>

              {!isCollapsed && (
                <span className="flex-1">{item.name}</span>
              )}
            </Link>

            {/* Tooltip para menu colapsado */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                {item.name}
              </div>
            )}
          </div>
        )}

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
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                      'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300',
                      'hover:shadow-sm hover:scale-[1.01]',
                      isActive(subItem.href)
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    )}
                  >
                    <span className="flex-shrink-0 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-2xl lg:hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Reservei Viagens
              </span>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-2 px-4">
              {menuItems.map(renderMenuItem)}
            </nav>
          </div>

          {/* User Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
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
        'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40',
        'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
        'shadow-xl backdrop-blur-sm',
        'overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={cn(
          'flex items-center space-x-3 transition-all duration-300',
          isCollapsed ? 'justify-center' : ''
        )}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Reservei Viagens
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            title="Recolher menu"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2 px-4">
          {menuItems.map(renderMenuItem)}
        </nav>
      </div>

      {/* Theme Toggle */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {!isCollapsed ? (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'p-1.5 rounded-md transition-colors duration-200',
                  theme === 'light' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
                title="Tema claro"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'p-1.5 rounded-md transition-colors duration-200',
                  theme === 'dark' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
                title="Tema escuro"
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn(
                  'p-1.5 rounded-md transition-colors duration-200',
                  theme === 'system' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
                title="Tema do sistema"
              >
                <MonitorIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          // Tema toggle para menu colapsado
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'p-2 rounded-md transition-colors duration-200',
                theme === 'light' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              title="Tema claro"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'p-2 rounded-md transition-colors duration-200',
                theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              title="Tema escuro"
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'p-2 rounded-md transition-colors duration-200',
                theme === 'system' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              title="Tema do sistema"
            >
              <MonitorIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
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
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-sm">
                {user?.firstName?.charAt(0) || 'U'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors duration-200"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ModernSidebar;
