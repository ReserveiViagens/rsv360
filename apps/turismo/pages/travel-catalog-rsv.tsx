// ===================================================================
// TRAVEL CATALOG RSV PAGE - PÁGINA DEDICADA PARA CATÁLOGO DE VIAGENS
// ===================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../src/context/AuthContext';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NotificationProvider } from '../src/context/NotificationContext';
import { NotificationBell, NotificationToastContainer } from '../src/components/notifications';
import { TravelCatalog, TravelPackageModal } from '../src/components/travel';
import { useTravelPackages, TravelPackage as TravelPackageType } from '../src/hooks/useTravelPackages';
import {
  ArrowLeft,
  Settings,
  Menu,
  X,
  LogOut,
  MapPin,
  Users,
  BarChart3,
  Heart,
  Calendar,
  TrendingUp,
  Eye,
  DollarSign,
  Star,
  Filter,
  Grid,
  List
} from 'lucide-react';

// ===================================================================
// TIPOS
// ===================================================================

// Usar tipo do hook
type TravelPackage = TravelPackageType;

// ===================================================================
// SISTEMA DE FAVORITOS
// ===================================================================

const FAVORITES_KEY = 'rsv360_travel_favorites';

const getFavorites = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (favorites: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Erro ao salvar favoritos:', error);
  }
};

const toggleFavorite = (packageId: string): boolean => {
  const favorites = getFavorites();
  const index = favorites.indexOf(packageId);
  
  if (index > -1) {
    favorites.splice(index, 1);
    saveFavorites(favorites);
    return false;
  } else {
    favorites.push(packageId);
    saveFavorites(favorites);
    return true;
  }
};

const isFavorite = (packageId: string): boolean => {
  return getFavorites().includes(packageId);
};

// ===================================================================
// COMPONENTE DE FAVORITOS
// ===================================================================

interface FavoritesTabProps {
  packages: TravelPackageType[];
  onViewPackage: (pkg: TravelPackageType) => void;
  onBookPackage: (pkg: TravelPackageType) => void;
  onSharePackage: (pkg: TravelPackageType) => void;
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({ packages, onViewPackage, onBookPackage, onSharePackage }) => {
  const [favorites, setFavorites] = useState<string[]>(getFavorites());
  const favoritePackages = useMemo(() => {
    return packages.filter(pkg => favorites.includes(pkg.id));
  }, [packages, favorites]);

  const handleRemoveFavorite = (packageId: string) => {
    toggleFavorite(packageId);
    setFavorites(getFavorites());
  };

  if (favoritePackages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum pacote favoritado</h3>
        <p className="text-gray-600 mb-6">Comece a favoritar pacotes que você gostou para encontrá-los facilmente aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Pacotes Favoritos</h3>
            <p className="text-sm text-gray-600 mt-1">{favoritePackages.length} pacote{favoritePackages.length !== 1 ? 's' : ''} favoritado{favoritePackages.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritePackages.map((pkg) => (
            <div key={pkg.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                {pkg.images && pkg.images.length > 0 && (
                  <img
                    src={pkg.images[0]}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  {pkg.isPopular && (
                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">Popular</span>
                  )}
                  {pkg.isFeatured && (
                    <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">Destaque</span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveFavorite(pkg.id)}
                  className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  title="Remover dos favoritos"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </button>
                {pkg.discount && (
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{pkg.discount}%
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{pkg.title}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pkg.shortDescription || pkg.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">{pkg.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-xs font-medium">{pkg.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">R$ {pkg.price.toLocaleString('pt-BR')}</span>
                    {pkg.originalPrice && (
                      <span className="text-sm text-gray-400 line-through ml-2">R$ {pkg.originalPrice.toLocaleString('pt-BR')}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewPackage(pkg)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => onBookPackage(pkg)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// COMPONENTE DE ANALYTICS
// ===================================================================

interface AnalyticsTabProps {
  packages: TravelPackageType[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ packages }) => {
  const stats = useMemo(() => {
    const totalPackages = packages.length;
    const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.price, 0);
    const avgPrice = totalPackages > 0 ? totalRevenue / totalPackages : 0;
    const avgRating = totalPackages > 0 
      ? packages.reduce((sum, pkg) => sum + pkg.rating, 0) / totalPackages 
      : 0;
    const popularCount = packages.filter(pkg => pkg.isPopular).length;
    const featuredCount = packages.filter(pkg => pkg.isFeatured).length;
    const favoritesCount = getFavorites().length;
    
    const categoryDistribution = packages.reduce((acc, pkg) => {
      acc[pkg.category] = (acc[pkg.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priceRanges = {
      low: packages.filter(pkg => pkg.price < 1000).length,
      medium: packages.filter(pkg => pkg.price >= 1000 && pkg.price < 3000).length,
      high: packages.filter(pkg => pkg.price >= 3000).length,
    };

    return {
      totalPackages,
      totalRevenue,
      avgPrice,
      avgRating,
      popularCount,
      featuredCount,
      favoritesCount,
      categoryDistribution,
      priceRanges
    };
  }, [packages]);

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Pacotes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPackages}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita Total</p>
              <p className="text-3xl font-bold text-gray-900">R$ {stats.totalRevenue.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Preço Médio</p>
              <p className="text-3xl font-bold text-gray-900">R$ {Math.round(stats.avgPrice).toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avaliação Média</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-6 h-6 text-yellow-600 fill-current" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Distribuições */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Categoria</h3>
          <div className="space-y-3">
            {Object.entries(stats.categoryDistribution).map(([category, count]) => {
              const percentage = (count / stats.totalPackages) * 100;
              const categoryNames: Record<string, string> = {
                beach: 'Praia',
                mountain: 'Montanha',
                city: 'Cidade',
                adventure: 'Aventura',
                romantic: 'Romântico',
                family: 'Família'
              };
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{categoryNames[category] || category}</span>
                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Faixa de Preço</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Econômico (&lt; R$ 1.000)</span>
                <span className="text-sm text-gray-600">{stats.priceRanges.low}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(stats.priceRanges.low / stats.totalPackages) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Médio (R$ 1.000 - R$ 3.000)</span>
                <span className="text-sm text-gray-600">{stats.priceRanges.medium}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(stats.priceRanges.medium / stats.totalPackages) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Premium (&gt; R$ 3.000)</span>
                <span className="text-sm text-gray-600">{stats.priceRanges.high}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${(stats.priceRanges.high / stats.totalPackages) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pacotes Populares</p>
              <p className="text-2xl font-bold text-gray-900">{stats.popularCount}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pacotes em Destaque</p>
              <p className="text-2xl font-bold text-gray-900">{stats.featuredCount}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500 fill-current" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Favoritos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.favoritesCount}</p>
            </div>
            <Heart className="w-8 h-8 text-red-500 fill-current" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function TravelCatalogRSVPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'favorites' | 'analytics'>('catalog');
  const [selectedPackage, setSelectedPackage] = useState<TravelPackageType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { packages, loading: packagesLoading } = useTravelPackages();

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleViewPackage = (pkg: TravelPackageType) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleBookPackage = (pkg: TravelPackageType) => {
    console.log('Reservar pacote:', pkg);
    router.push(`/reservations-rsv?package=${pkg.id}`);
  };

  const handleFavoritePackage = (pkg: TravelPackageType) => {
    const isNowFavorite = toggleFavorite(pkg.id);
    // Forçar atualização do componente TravelCatalog
    if (activeTab === 'favorites') {
      window.location.reload();
    }
  };

  const handleSharePackage = (pkg: TravelPackageType) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: pkg.title,
        text: pkg.shortDescription || pkg.description,
        url: window.location.href
      });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };


  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <ProtectedRoute>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    title="Abrir menu"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <div className="ml-4 lg:ml-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Catálogo de Viagens</h1>
                    <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Descubra os melhores destinos e pacotes</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                  <NotificationBell />
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500">{user?.role || 'Agente'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                      title="Sair"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
              showSidebar ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className="h-full flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
                    title="Fechar menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                  <Link 
                    href="/dashboard-rsv" 
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 mr-3" />
                    Voltar ao Dashboard
                  </Link>
                  
                  <div className="pt-4">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Catálogo
                    </h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('catalog');
                          setShowSidebar(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'catalog'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <MapPin className="w-5 h-5 mr-3" />
                        Catálogo de Viagens
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveTab('favorites');
                          setShowSidebar(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'favorites'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Heart className={`w-5 h-5 mr-3 ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
                        Favoritos
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveTab('analytics');
                          setShowSidebar(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === 'analytics'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <BarChart3 className="w-5 h-5 mr-3" />
                        Analytics
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Outros
                    </h3>
                    <div className="space-y-1">
                      <Link 
                        href="/reservations-rsv" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Calendar className="w-5 h-5 mr-3" />
                        Reservas
                      </Link>
                      <Link 
                        href="/customers-rsv" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Users className="w-5 h-5 mr-3" />
                        Clientes
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Settings className="w-5 h-5 mr-3" />
                        Configurações
                      </Link>
                    </div>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Overlay para mobile */}
            {showSidebar && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setShowSidebar(false)}
              />
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Tab Navigation */}
                <div className="mb-6 sm:mb-8">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('catalog')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                          activeTab === 'catalog'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>Catálogo</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('favorites')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                          activeTab === 'favorites'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
                          <span>Favoritos</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                          activeTab === 'analytics'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4" />
                          <span>Analytics</span>
                        </div>
                      </button>
                    </nav>
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'catalog' && (
                  <TravelCatalog />
                )}
                {activeTab === 'favorites' && (
                  <FavoritesTab
                    packages={packages}
                    onViewPackage={handleViewPackage}
                    onBookPackage={handleBookPackage}
                    onSharePackage={handleSharePackage}
                  />
                )}
                {activeTab === 'analytics' && (
                  <AnalyticsTab packages={packages} />
                )}
              </div>
            </main>
          </div>
          
          {/* Modal de Pacote */}
          <TravelPackageModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            package={selectedPackage}
            onBook={handleBookPackage}
            onFavorite={handleFavoritePackage}
            onShare={handleSharePackage}
          />
          
          <NotificationToastContainer />
        </div>
      </NotificationProvider>
    </ProtectedRoute>
  );
}
