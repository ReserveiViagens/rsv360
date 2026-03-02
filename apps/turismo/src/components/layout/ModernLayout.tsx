import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ModernSidebar from './ModernSidebar';
import { cn } from '../../lib/utils';
import {
  Menu,
  LogOut,
  Bell,
  Search,
  Settings,
  User,
  ChevronDown
} from 'lucide-react';

interface ModernLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  className?: string;
}

export default function ModernLayout({
  children,
  title,
  subtitle,
  showHeader = true,
  showSidebar = true,
  className
}: ModernLayoutProps) {
  const { user, logout } = useAuth();
  const { actualTheme } = useTheme();
  const router = useRouter();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se está em mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fechar sidebar mobile ao mudar de rota
  useEffect(() => {
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  }, [router.pathname, isMobile]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Modern Sidebar */}
      {showSidebar && (
        <ModernSidebar
          isOpen={showMobileSidebar}
          onToggle={() => setShowMobileSidebar(!showMobileSidebar)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          showSidebar && !isMobile && 'lg:ml-64',
          showSidebar && !isMobile && isCollapsed && 'lg:ml-20'
        )}
      >
        {/* Header */}
        {showHeader && (
          <header className={`${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors duration-300 sticky top-0 z-30`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Left Side */}
                <div className="flex items-center">
                  <button
                    onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    title="Abrir menu"
                  >
                    <Menu className="w-6 h-6" />
                  </button>

                  <div className="ml-4 lg:ml-0">
                    {title && (
                      <h1 className={`text-2xl font-bold transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className={`text-sm transition-colors duration-300 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="hidden md:block">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar..."
                        className={`block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                      />
                    </div>
                  </div>

                  {/* Notifications */}
                  <button
                    className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 relative"
                    title="Notificações"
                    aria-label="Ver notificações"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </button>

                  {/* Settings */}
                  <button
                    className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                    title="Configurações"
                    aria-label="Abrir configurações"
                  >
                    <Settings className="w-5 h-5" />
                  </button>

                  {/* User Menu */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className={`text-sm font-medium transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className={`text-xs transition-colors duration-300 ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user?.role || 'Usuário'}
                      </p>
                    </div>

                    <div className="relative">
                      <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user?.firstName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                      title="Sair"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className={cn('min-h-screen', className)}>
          {/* Breadcrumb (opcional) */}
          {router.pathname !== '/' && (
            <div className={`${actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-300 px-4 py-3`}>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <a
                      href="/"
                      className={`text-sm transition-colors duration-300 ${actualTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Home
                    </a>
                  </li>
                  {router.pathname.split('/').filter(Boolean).map((segment, index, array) => (
                    <li key={index} className="flex items-center">
                      <span className={`mx-2 transition-colors duration-300 ${actualTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>/</span>
                      {index === array.length - 1 ? (
                        <span className={`font-medium text-sm capitalize transition-colors duration-300 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {segment.replace(/-/g, ' ')}
                        </span>
                      ) : (
                        <a
                          href={`/${array.slice(0, index + 1).join('/')}`}
                          className={`text-sm capitalize transition-colors duration-300 ${actualTheme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {segment.replace(/-/g, ' ')}
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          )}

          {/* Content */}
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
    </div>
  );
}
