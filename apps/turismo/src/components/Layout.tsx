import React, { useState } from 'react';
import Navigation from './Navigation';
import NotificationBell from './NotificationBell';
import ToastContainer, { useToast } from './ToastContainer';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toasts, removeToast } = useToast();

  // Se não estiver autenticado e não estiver carregando, redirecionar para login
  if (!isLoading && !isAuthenticated && router.pathname !== '/login' && router.pathname !== '/register') {
    router.push('/login');
    return null;
  }

  // Se estiver carregando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se estiver na página de login ou registro, não mostrar layout
  if (router.pathname === '/login' || router.pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Navigation */}
      <div className="lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64">
        <Navigation />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 mr-3"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                {getPageTitle(router.pathname)}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationBell />
              
              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      {getUserInitial()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {getUserName()}
                  </span>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/travel': 'Viagens',
    '/attractions': 'Atrações',
    '/parks': 'Parques',
    '/tickets': 'Ingressos',
    '/loyalty': 'Fidelidade',
    '/groups': 'Grupos',
    '/rewards': 'Recompensas',
    '/coupons': 'Cupons',
    '/giftcards': 'Gift Cards',
    '/ecommerce': 'E-commerce',
    '/finance': 'Financeiro',
    '/finance-dashboard': 'Dashboard Financeiro',
    '/sales': 'Vendas',
    '/sales-dashboard': 'Dashboard de Vendas',
    '/sectoral-finance': 'Finanças Setoriais',
    '/refunds': 'Reembolsos',
    '/marketing': 'Marketing',
    '/marketing-dashboard': 'Dashboard de Marketing',
    '/analytics': 'Analytics',
    '/analytics-dashboard': 'Dashboard de Analytics',
    '/seo': 'SEO',
    '/multilingual': 'Multilíngue',
    '/subscriptions': 'Assinaturas',
    '/inventory': 'Inventário',
    '/documents': 'Documentos',
    '/visa': 'Vistos',
    '/insurance': 'Seguros',
    '/photos': 'Fotos',
    '/videos': 'Vídeos',
    '/reviews': 'Avaliações',
    '/chatbots': 'Chatbots',
    '/notifications': 'Notificações',
    '/notifications-dashboard': 'Dashboard de Notificações',
    '/admin': 'Administração'
  };
  
  return titles[pathname] || 'Onion RSV 360';
}

function getUserInitial(): string {
  // Em produção, isso viria do contexto de autenticação
  return 'U';
}

function getUserName(): string {
  // Em produção, isso viria do contexto de autenticação
  return 'Usuário';
} 