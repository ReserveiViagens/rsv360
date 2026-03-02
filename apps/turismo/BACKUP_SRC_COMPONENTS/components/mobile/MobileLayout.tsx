import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Calendar, Users, CreditCard, Megaphone, BarChart3, Settings, Bell, Search, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../stores/useUIStore';

export interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { showNotification } = useUIStore();

  // Fechar sidebar ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', color: 'text-blue-600' },
    { icon: Calendar, label: 'Reservas', href: '/bookings', color: 'text-green-600' },
    { icon: Users, label: 'Clientes', href: '/customers', color: 'text-purple-600' },
    { icon: CreditCard, label: 'Pagamentos', href: '/payments', color: 'text-orange-600' },
    { icon: Megaphone, label: 'Marketing', href: '/marketing', color: 'text-pink-600' },
    { icon: BarChart3, label: 'Relatórios', href: '/reports', color: 'text-indigo-600' },
    { icon: Settings, label: 'Configurações', href: '/settings', color: 'text-gray-600' }
  ];

  const handleNavigation = (href: string) => {
    setIsSidebarOpen(false);
    showNotification(`Navegando para ${href}`, 'info');
    // Aqui você implementaria a navegação real
  };

  const handleQuickAction = () => {
    setIsSidebarOpen(false);
    showNotification('Ação rápida ativada!', 'success');
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Header Mobile */}
      <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RSV</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">RSV Travel</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleQuickAction}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              aria-label="Ação rápida"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Barra de busca móvel */}
        {isSearchOpen && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar reservas, clientes, pagamentos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </header>

      {/* Sidebar Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header do Sidebar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">RSV</span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">RSV Travel</h2>
                    <p className="text-sm text-gray-600">Sistema Onboarding</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Fechar menu"
                  title="Fechar menu"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Navegação */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <IconComponent className={`w-5 h-5 ${item.color}`} />
                      <span className="font-medium text-gray-700">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Footer do Sidebar */}
              <div className="p-4 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Usuário Atual</p>
                      <p className="text-xs text-gray-600">admin@rsv.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="lg:ml-64">
        <div className="lg:hidden">
          {/* Espaçamento para header móvel */}
          <div className="h-20"></div>
        </div>
        
        {/* Conteúdo da página */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IconComponent className={`w-5 h-5 ${item.color}`} />
                <span className="text-xs text-gray-600">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Indicador de carregamento */}
      <div className="lg:hidden fixed top-20 right-4 z-40">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export { MobileLayout };
export type { MobileLayoutProps };
