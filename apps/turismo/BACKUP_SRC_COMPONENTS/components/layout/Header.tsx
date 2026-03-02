import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { RESERVEI_COLORS, type ColorScheme } from '../../hooks/useTheme';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  X,
  Plus,
  MessageSquare,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Palette,
  Monitor,
  HelpCircle,
  Accessibility
} from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleMobileSidebar: () => void;
  isSidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'auto';
  colorScheme: ColorScheme;
  onToggleTheme: () => void;
  onSetColorScheme: (scheme: ColorScheme) => void;
  onShowHelp?: () => void;
  onShowAccessibility?: () => void;
}

export default function Header({ 
  onToggleSidebar, 
  onToggleMobileSidebar, 
  isSidebarCollapsed,
  theme,
  colorScheme,
  onToggleTheme,
  onSetColorScheme,
  onShowHelp,
  onShowAccessibility
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Reserva confirmada',
      message: 'Sua reserva para Caldas Novas foi confirmada',
      time: '2 min atrás',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Novo cliente',
      message: 'João Silva foi adicionado ao sistema',
      time: '15 min atrás',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Pagamento pendente',
      message: '3 reservas aguardando confirmação de pagamento',
      time: '1 hora atrás',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'auto':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Sun className="h-5 w-5" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            title="Alternar sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            title="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar reservas, clientes, viagens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
            />
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            title="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
                     {/* Quick Actions */}
           <div className="hidden sm:flex items-center space-x-2">
             <button
               className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
               title="Nova reserva"
             >
               <Plus className="h-5 w-5" />
             </button>
             <button
               className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
               title="Calendário"
             >
               <Calendar className="h-5 w-5" />
             </button>
             <button
               className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
               title="Mensagens"
             >
               <MessageSquare className="h-5 w-5" />
             </button>
             {onShowHelp && (
               <button
                 onClick={onShowHelp}
                 className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                 title="Atalhos de teclado (?)"
               >
                 <HelpCircle className="h-5 w-5" />
               </button>
             )}
             {onShowAccessibility && (
               <button
                 onClick={onShowAccessibility}
                 className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                 title="Configurações de acessibilidade"
               >
                 <Accessibility className="h-5 w-5" />
               </button>
             )}
           </div>

                     {/* Theme Menu */}
           <div className="relative">
             <button
               onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
               className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
               title="Configurações de tema"
             >
               {getThemeIcon()}
             </button>

             {/* Theme Dropdown */}
             {isThemeMenuOpen && (
               <>
                 <div
                   className="fixed inset-0 z-40"
                   onClick={() => setIsThemeMenuOpen(false)}
                 />
                 <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                   <div className="py-2">
                     <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                       <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                         Personalização
                       </h3>
                     </div>
                     
                     {/* Theme Options */}
                     <div className="px-4 py-2">
                       <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                         Tema
                       </p>
                       <div className="space-y-1">
                         {[
                           { value: 'light', label: 'Claro', icon: Sun },
                           { value: 'dark', label: 'Escuro', icon: Moon },
                           { value: 'auto', label: 'Automático', icon: Monitor }
                         ].map((option) => (
                           <button
                             key={option.value}
                             onClick={() => {
                               onToggleTheme();
                               setIsThemeMenuOpen(false);
                             }}
                             className={cn(
                               'w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200',
                               theme === option.value
                                 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                 : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                             )}
                           >
                             <option.icon className="h-4 w-4 mr-3" />
                             {option.label}
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* Color Scheme Options */}
                     <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                       <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                         Esquema de Cores
                       </p>
                       <div className="grid grid-cols-2 gap-2">
                         {Object.entries(RESERVEI_COLORS).map(([scheme, colors]) => (
                           <button
                             key={scheme}
                             onClick={() => {
                               onSetColorScheme(scheme as ColorScheme);
                               setIsThemeMenuOpen(false);
                             }}
                             className={cn(
                               'flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200',
                               colorScheme === scheme
                                 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                 : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                             )}
                           >
                             <div
                               className={cn(
                                 'w-4 h-4 rounded-full mr-2',
                                 scheme === 'blue' && 'bg-blue-500',
                                 scheme === 'green' && 'bg-green-500',
                                 scheme === 'purple' && 'bg-purple-500',
                                 scheme === 'orange' && 'bg-orange-500'
                               )}
                             />
                             {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                           </button>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               </>
             )}
           </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 relative"
              title="Notificações"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Notificações
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              'px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200',
                              !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                            )}
                          >
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Nenhuma notificação
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title="Perfil do usuário"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'Usuário'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Meu Perfil
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Configurações
                    </Link>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
            />
                         <button
               onClick={() => setIsSearchOpen(false)}
               className="absolute inset-y-0 right-0 pr-3 flex items-center"
               title="Fechar busca"
             >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
