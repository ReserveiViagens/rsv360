import React, { useState } from 'react';
import { Search, Home, ArrowLeft, MapPin, Calendar, Users, BarChart3, Settings } from 'lucide-react';
import { Button, Input } from '../ui';

interface NotFoundPageProps {
  onNavigate?: (path: string) => void;
  className?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ 
  onNavigate,
  className 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Páginas sugeridas baseadas na busca
  const suggestedPages = [
    { path: '/', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, description: 'Visão geral do sistema' },
    { path: '/bookings', label: 'Reservas', icon: <Calendar className="w-4 h-4" />, description: 'Gestão de reservas' },
    { path: '/customers', label: 'Clientes', icon: <Users className="w-4 h-4" />, description: 'Gestão de clientes' },
    { path: '/reports', label: 'Relatórios', icon: <BarChart3 className="w-4 h-4" />, description: 'Analytics e relatórios' },
    { path: '/settings', label: 'Configurações', icon: <Settings className="w-4 h-4" />, description: 'Configurações do sistema' }
  ];

  // Filtrar páginas baseado na busca
  const filteredPages = suggestedPages.filter(page =>
    page.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    handleNavigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredPages.length > 0) {
      handleNavigate(filteredPages[0].path);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${className || ''}`}>
      <div className="max-w-4xl w-full">
        {/* Header da página */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <MapPin className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Página não encontrada
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A página que você está procurando não existe ou foi movida. 
            Use a busca abaixo para encontrar o que procura ou navegue pelas opções sugeridas.
          </p>
        </div>

        {/* Barra de busca */}
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Buscar funcionalidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12"
              aria-label="Buscar funcionalidades"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              disabled={filteredPages.length === 0}
            >
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Páginas sugeridas */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">
            Páginas sugeridas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.map((page) => (
              <button
                key={page.path}
                onClick={() => handleNavigate(page.path)}
                className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    {page.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {page.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {page.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ações principais */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button
            onClick={handleGoBack}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            onClick={handleGoHome}
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Início
          </Button>
        </div>

        {/* Informações adicionais */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <span>Precisa de ajuda?</span>
            <button
              onClick={() => handleNavigate('/help')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Entre em contato com o suporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NotFoundPage };
export type { NotFoundPageProps };
