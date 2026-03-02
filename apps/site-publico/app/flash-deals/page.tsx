'use client';

import React, { useState, useMemo } from 'react';
import { useFlashDeals } from '@/hooks/useFlashDeals';
import { useCaldasNovasHotels } from '@/hooks/useHotels';
import { FlashDealCard } from '@/components/flash-deals/FlashDealCard';
import { AuctionFilters } from '@/components/auctions/AuctionFilters';
import { Search, Zap, Filter } from 'lucide-react';
import { AuctionFilters as AuctionFiltersType } from '@/types/auction';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { getCrossSellItems, getCrossSellItemByIndex } from '@/lib/cross-sell-matrix';
import { getContextualSubtitle } from '@/lib/cross-sell-context-messages';
import { MobileCrossSellCard } from '@/components/home/mobile-cross-sell-card';
import { getHomeSideRailsFallback } from '@/lib/home-side-rails';

export default function FlashDealsPage() {
  const [filters, setFilters] = useState<AuctionFiltersType>({});
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Buscar flash deals
  const { flashDeals, loading: flashDealsLoading, error: flashDealsError } = useFlashDeals();

  // Buscar hotéis de Caldas Novas para combinar com flash deals
  const { hotels, loading: hotelsLoading } = useCaldasNovasHotels({
    propertyType: filters.propertyType,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    amenities: filters.amenities,
    stars: filters.stars,
  });

  // Combinar flash deals com dados de hotéis
  const flashDealsWithHotels = useMemo(() => {
    return flashDeals.map(flashDeal => {
      // Tentar encontrar hotel relacionado
      const relatedHotel = hotels.find(hotel => 
        hotel.id === flashDeal.property_id ||
        hotel.id === flashDeal.accommodation_id ||
        flashDeal.title?.toLowerCase().includes(hotel.title.toLowerCase())
      );

      return {
        flashDeal,
        hotel: relatedHotel,
      };
    });
  }, [flashDeals, hotels]);

  // Aplicar filtros e busca
  const filteredFlashDeals = useMemo(() => {
    let filtered = flashDealsWithHotels;

    // Busca por texto
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(({ flashDeal, hotel }) =>
        flashDeal.title?.toLowerCase().includes(searchLower) ||
        flashDeal.description?.toLowerCase().includes(searchLower) ||
        hotel?.title?.toLowerCase().includes(searchLower) ||
        hotel?.location?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de localização
    if (filters.location) {
      filtered = filtered.filter(({ hotel }) =>
        hotel?.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Ordenação
    if (filters.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a.flashDeal[filters.sortBy === 'price' ? 'current_price' : 'created_at'] || 0;
        const bValue = b.flashDeal[filters.sortBy === 'price' ? 'current_price' : 'created_at'] || 0;
        
        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    return filtered;
  }, [flashDealsWithHotels, filters, search]);

  const loading = flashDealsLoading || hotelsLoading;

  const handleClearFilters = () => {
    setFilters({});
    setSearch('');
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-10 h-10" />
              <div>
                <h1 className="text-4xl font-bold mb-2">Ofertas Relâmpago</h1>
                <p className="text-xl text-red-50">
                  Ofertas relâmpago com desconto progressivo! Quanto mais tempo passa, maior o desconto.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-white/20 hover:bg-white/30 border-white/30"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Busca Central */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar ofertas relâmpago por região, hotel ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-white text-gray-900 text-lg placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de Filtros */}
          <aside className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-4">
              <AuctionFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* Área Principal */}
          <main className="flex-1">
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="mt-4 text-gray-600">Carregando ofertas relâmpago...</p>
              </div>
            )}

            {/* Error State */}
            {flashDealsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                <p>Erro ao carregar ofertas relâmpago: {flashDealsError}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !flashDealsError && filteredFlashDeals.length === 0 && (
              <>
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma oferta relâmpago encontrada</h3>
                  <p className="text-gray-600 mb-4">
                    Não há ofertas relâmpago disponíveis no momento. Volte em breve!
                  </p>
                  {(filters.location || filters.propertyType?.length || filters.minPrice || filters.maxPrice || search) && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Limpar Filtros
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                  {getCrossSellItems('flash-deals', getHomeSideRailsFallback(), { limit: 3 }).map((item) => (
                    <MobileCrossSellCard
                      key={item.id}
                      item={item}
                      variant="full"
                      randomImage
                      contextualSubtitle={getContextualSubtitle('flash-deals', item.id, item.subtitle)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Grid de Flash Deals */}
            {!loading && !flashDealsError && filteredFlashDeals.length > 0 && (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  {filteredFlashDeals.length} {filteredFlashDeals.length === 1 ? 'oferta disponível' : 'ofertas disponíveis'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFlashDeals.map(({ flashDeal, hotel }, index) => {
                    const crossSellItem = (index + 1) % 3 === 0 ? getCrossSellItemByIndex('flash-deals', Math.floor((index + 1) / 3) - 1, getHomeSideRailsFallback()) : null;
                    return (
                      <React.Fragment key={flashDeal.id}>
                        <FlashDealCard flashDeal={flashDeal} hotel={hotel} />
                        {crossSellItem && (
                          <div className="col-span-full">
                            <MobileCrossSellCard
                              item={crossSellItem}
                              variant="compact"
                              randomImage
                              animation="fade"
                              contextualSubtitle={getContextualSubtitle('flash-deals', crossSellItem.id, crossSellItem.subtitle)}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
