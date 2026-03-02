import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../hooks/useSidebar';
import { useTheme } from '../../hooks/useTheme';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { usePWA } from '../../hooks/usePWA';
import { useAccessibility } from '../../hooks/useAccessibility';
import Sidebar from './Sidebar';
import Header from './Header';
import KeyboardShortcutsHelp from '../ui/KeyboardShortcutsHelp';
import PWAInstallBanner from '../ui/PWAInstallBanner';
import SkipLinks from '../ui/SkipLinks';
import AccessibilityPanel from '../ui/AccessibilityPanel';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
}

export default function Layout({ 
  children, 
  showSidebar = true, 
  showHeader = true 
}: LayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { isOpen, isCollapsed, toggleSidebar, toggleMobileSidebar, closeMobileSidebar } = useSidebar();
  const { theme, colorScheme, setTheme, setColorScheme, toggleTheme, colors } = useTheme();
  const { showHelp } = useKeyboardShortcuts();
  const { isOnline, updateAvailable, updateApp } = usePWA();
  const { announce } = useAccessibility();
  const [isMobile, setIsMobile] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

  // Detectar se está em mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Em mobile, sempre fechar o sidebar
      if (mobile) {
        closeMobileSidebar();
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [closeMobileSidebar]);

  // Fechar sidebar mobile ao mudar de rota
  useEffect(() => {
    if (isMobile) {
      closeMobileSidebar();
    }
  }, [router.pathname, isMobile, closeMobileSidebar]);

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated && router.pathname !== '/auth') {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  // Handlers já estão disponíveis via hooks

  // Se estiver carregando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado e não for página de auth, não renderizar nada
  if (!isAuthenticated && router.pathname !== '/auth') {
    return null;
  }

  // Para páginas de autenticação, não mostrar layout
  if (router.pathname === '/auth') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip Links */}
      <SkipLinks />
      
      {/* PWA Install Banner */}
      <PWAInstallBanner />
      
      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-green-600 text-white px-4 py-2 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm">Nova versão disponível!</span>
            <button
              onClick={updateApp}
              className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors duration-200"
            >
              Atualizar
            </button>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-red-600 text-white px-4 py-2 text-center">
          <span className="text-sm">Você está offline. Algumas funcionalidades podem estar limitadas.</span>
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          isOpen={isOpen}
          onToggle={toggleMobileSidebar}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          showSidebar && !isMobile && 'lg:ml-64',
          showSidebar && !isMobile && isCollapsed && 'lg:ml-20'
        )}
      >
        {/* Header */}
        {showHeader && (
          <Header
            onToggleSidebar={toggleSidebar}
            onToggleMobileSidebar={toggleMobileSidebar}
            isSidebarCollapsed={isCollapsed}
            theme={theme}
            colorScheme={colorScheme}
            onToggleTheme={toggleTheme}
            onSetColorScheme={setColorScheme}
            onShowHelp={() => setShowKeyboardHelp(true)}
            onShowAccessibility={() => setShowAccessibilityPanel(true)}
          />
        )}

        {/* Page Content */}
        <main
          className={cn(
            'min-h-screen transition-all duration-300 ease-in-out',
            showHeader ? 'pt-0' : 'pt-0'
          )}
        >
          {/* Breadcrumb (opcional) */}
          {router.pathname !== '/' && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <a
                      href="/"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                    >
                      Home
                    </a>
                  </li>
                  {router.pathname.split('/').filter(Boolean).map((segment, index, array) => (
                    <li key={index} className="flex items-center">
                      <span className="mx-2 text-gray-400 dark:text-gray-600">/</span>
                      {index === array.length - 1 ? (
                        <span className="text-gray-900 dark:text-white font-medium text-sm capitalize">
                          {segment.replace(/-/g, ' ')}
                        </span>
                      ) : (
                        <a
                          href={`/${array.slice(0, index + 1).join('/')}`}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm capitalize"
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
         {isMobile && isOpen && (
           <div
             className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
             onClick={closeMobileSidebar}
           />
         )}

                 {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsHelp
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />

        {/* Accessibility Panel */}
        <AccessibilityPanel
          isOpen={showAccessibilityPanel}
          onClose={() => setShowAccessibilityPanel(false)}
        />
      </div>
    );
  }
