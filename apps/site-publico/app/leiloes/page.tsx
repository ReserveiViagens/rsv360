'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuctions } from '@/hooks/useAuctions';
import { useQueryClient } from '@tanstack/react-query';
import { useCaldasNovasHotels } from '@/hooks/useHotels';
import { AuctionCardHorizontal } from '@/components/auctions/AuctionCardHorizontal';
import { Search, Calendar, Users, Clock } from 'lucide-react';
import { AuctionFilters as AuctionFiltersType } from '@/types/auction';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { getCoordinatesByHotelName, CALDAS_NOVAS_CENTER } from '@/lib/caldas-novas-coordinates';
import { getToken } from '@/lib/auth';
import { getAuctionExamples, getAuctionExamplesForMap } from '@/lib/auction-examples';
import { AuctionCardGrid } from '@/components/auctions/AuctionCardGrid';
import type { AuctionMapMarkerItem } from '@/components/auctions/AuctionMapLeaflet';

// Import dinâmico do mapa Leaflet (hover/tap → card com foto, info e preço)
const AuctionMapLeaflet = dynamic(
  () => import('@/components/auctions/AuctionMapLeaflet').then((mod) => mod.AuctionMapLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Carregando mapa...</span>
      </div>
    ),
  }
);

export default function LeiloesPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<AuctionFiltersType>({
    status: 'active',
    minPrice: 0,
    maxPrice: 2000,
  });
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [regionSearch, setRegionSearch] = useState('');
  const [viewMode, setViewMode] = useState<'mapa' | 'lista'>('mapa');
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<('hotel' | 'resort' | 'flat' | 'house')[]>(['hotel']);
  const [highlightedHotelId, setHighlightedHotelId] = useState<string | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const exampleCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const regionSuggestions = ['Caldas Novas', 'Caldas Novas Rio Quente', 'Rio Quente'];

  // Montar filtros para a API de leilões
  const auctionFilters = useMemo(() => ({
    status: 'active' as const,
    search: regionSearch || undefined,
    checkIn: checkIn || undefined,
    checkOut: checkOut || undefined,
    minPrice: filters.minPrice != null ? filters.minPrice : undefined,
    maxPrice: filters.maxPrice != null ? filters.maxPrice : undefined,
  }), [regionSearch, checkIn, checkOut, filters.minPrice, filters.maxPrice]);

  // Buscar leilões (filtros conectados)
  const { auctions, loading: auctionsLoading, error: auctionsError } = useAuctions(auctionFilters);

  // Buscar hotéis de Caldas Novas
  const { hotels, loading: hotelsLoading } = useCaldasNovasHotels({
    propertyType: selectedPropertyTypes,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });

  // Combinar leilões com dados de hotéis (melhorado com múltiplas estratégias de matching)
  const auctionsWithHotels = useMemo(() => {
    return auctions.map(auction => {
      // Estratégia 1: Match por property_id (mais preciso)
      let relatedHotel = hotels.find(h => h.id === auction.property_id);
      
      // Estratégia 2: Match por accommodation_id
      if (!relatedHotel) {
        relatedHotel = hotels.find(h => h.id === auction.accommodation_id);
      }
      
      // Estratégia 3: Match por título (fuzzy matching)
      if (!relatedHotel) {
        const auctionTitleLower = auction.title?.toLowerCase() || '';
        relatedHotel = hotels.find(h => {
          const hotelTitleLower = h.title.toLowerCase();
          return (
            auctionTitleLower.includes(hotelTitleLower) ||
            hotelTitleLower.includes(auctionTitleLower) ||
            auctionTitleLower === hotelTitleLower
          );
        });
      }
      
      // Estratégia 4: Match por enterprise_name (se disponível)
      if (!relatedHotel && auction.enterprise_name) {
        const enterpriseNameLower = auction.enterprise_name.toLowerCase();
        relatedHotel = hotels.find(h => {
          const hotelTitleLower = h.title.toLowerCase();
          return hotelTitleLower.includes(enterpriseNameLower) || enterpriseNameLower.includes(hotelTitleLower);
        });
      }
      
      return { auction, hotel: relatedHotel };
    });
  }, [auctions, hotels]);

  // Leilões ativos para a seção de countdown
  const activeAuctions = useMemo(() => {
    return auctionsWithHotels
      .filter(({ auction }) => auction.status === 'active')
      .slice(0, 3);
  }, [auctionsWithHotels]);

  // Transformar dados para o mapa com validação de coordenadas + lookup dos 45 hotéis Caldas Novas
  const mapData = useMemo(() => {
    return auctionsWithHotels
      .map(({ auction, hotel }) => {
        // Prioridade: hotel.coordinates > hotel.latitude/longitude > auction > lookup por nome (documentação 45 hotéis)
        let coords: { lat: number; lng: number };
        
        if (hotel?.coordinates?.lat != null && hotel?.coordinates?.lng != null && !isNaN(hotel.coordinates.lat) && !isNaN(hotel.coordinates.lng)) {
          coords = { lat: hotel.coordinates.lat, lng: hotel.coordinates.lng };
        } else if (hotel?.latitude != null && hotel?.longitude != null && !isNaN(hotel.latitude) && !isNaN(hotel.longitude)) {
          coords = { lat: hotel.latitude, lng: hotel.longitude };
        } else if (auction?.latitude != null && auction?.longitude != null && !isNaN(auction.latitude) && !isNaN(auction.longitude)) {
          coords = { lat: auction.latitude, lng: auction.longitude };
        } else {
          // Lookup por nome: documentação dos 45 hotéis em Caldas Novas
          const nameToLookup = hotel?.title || auction?.title || auction?.enterprise_name || '';
          coords = getCoordinatesByHotelName(nameToLookup);
        }
        
        // Validar coordenadas (lat: -90 a 90, lng: -180 a 180)
        if (isNaN(coords.lat) || coords.lat < -90 || coords.lat > 90) {
          coords = { ...CALDAS_NOVAS_CENTER };
        }
        if (isNaN(coords.lng) || coords.lng < -180 || coords.lng > 180) {
          coords = { ...CALDAS_NOVAS_CENTER };
        }
        
        return {
          id: auction.id,
          title: auction.title || hotel?.title || 'Leilão',
          lat: coords.lat,
          lng: coords.lng,
          status: auction.status,
        };
      })
      .filter(item => item.lat != null && item.lng != null && !isNaN(item.lat) && !isNaN(item.lng));
  }, [auctionsWithHotels]);

  const loading = auctionsLoading || hotelsLoading;
  // Mapa OpenStreetMap sempre disponível - usa leilões reais ou exemplos dos 45 hotéis
  const canShowMap = true;

  // Dados do mapa: leilões reais ou exemplos com coordenadas de todos os hotéis
  const mapDataFinal = useMemo(() => {
    if (mapData.length > 0) return mapData;
    return getAuctionExamplesForMap();
  }, [mapData]);

  // Exemplos reais de leilões (hotéis de Caldas Novas com imagens e coordenadas)
  const auctionExamples = useMemo(() => getAuctionExamples(), []);

  // Dados enriquecidos para o mapa Leaflet (foto, preço, info) - hover/tap mostra card
  const mapMarkerItems = useMemo((): AuctionMapMarkerItem[] => {
    if (auctionsWithHotels.length > 0) {
      return mapData.map((item) => {
        const pair = auctionsWithHotels.find((p) => p.auction.id === item.id);
        const hotel = pair?.hotel;
        const auction = pair?.auction;
        const image = hotel?.images?.[0];
        const price = hotel?.price ?? auction?.current_price ?? auction?.start_price;
        const priceFormatted = price != null ? `R$ ${Number(price).toLocaleString('pt-BR')}` : undefined;
        return {
          id: item.id,
          title: item.title,
          lat: item.lat,
          lng: item.lng,
          image,
          price: typeof price === 'number' ? price : undefined,
          priceFormatted,
          hotelId: hotel?.id,
          linkUrl: `/leiloes/${item.id}`,
          status: item.status,
          rating: hotel?.rating,
          location: hotel?.location ?? 'Caldas Novas, GO',
        };
      });
    }
    // Usar exemplos (45 hotéis) com fotos e preços
    const isLoggedIn = !!getToken();
    const baseUrl = (hotelId: string) =>
      isLoggedIn
        ? `/leiloes?hotel=${hotelId}`
        : `/login?redirect=${encodeURIComponent(`/leiloes?hotel=${hotelId}`)}`;
    return auctionExamples.map((ex, i) => ({
      id: 9000 + i,
      title: ex.title,
      lat: ex.coordinates.lat,
      lng: ex.coordinates.lng,
      image: ex.images[0],
      price: ex.pricePerNight,
      priceFormatted: `R$ ${ex.pricePerNight.toLocaleString('pt-BR')}`,
      hotelId: ex.hotelId,
      linkUrl: baseUrl(ex.hotelId),
      status: 'active',
      rating: ex.rating,
      location: ex.location,
    }));
  }, [mapData, auctionsWithHotels, auctionExamples]);

  // Tratar ?hotel=xxx: scroll e destaque no card do exemplo (após login ou link direto)
  useEffect(() => {
    const hotel = searchParams.get('hotel');
    if (!hotel) return;
    setViewMode('lista');
    setHighlightedHotelId(hotel);
    const t = setTimeout(() => {
      const target = exampleCardRefs.current[hotel];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchParams]);

  const handleSelectFromMap = (auctionId: number) => {
    setSelectedAuctionId(auctionId);
    setViewMode('lista');
    setTimeout(() => {
      const target = cardRefs.current[auctionId];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
        {/* Header com busca e filtros principais */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Busca por Região */}
              <div className="flex-1 w-full lg:w-auto">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Localização</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Caldas Novas, Rio Quente"
                    value={regionSearch}
                    onChange={(e) => setRegionSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    suppressHydrationWarning
                  />
                </div>
                {/* Sugestões de região */}
                {regionSuggestions.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {regionSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setRegionSearch(suggestion)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          regionSearch === suggestion
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Picker - Check-in */}
              <div className="w-full lg:w-auto">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Entrada</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {/* Guest Count */}
              <div className="w-full lg:w-auto">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hóspedes</label>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal - Layout Duas Colunas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda - Filtros e Leilões Ativos */}
            <aside className="lg:col-span-1 space-y-6" suppressHydrationWarning>
              {/* Filtro de Tipo de Propriedade */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Tipo de Propriedade</label>
                <div className="flex flex-wrap gap-2">
                  {(['hotel', 'resort', 'flat', 'house'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedPropertyTypes(
                          selectedPropertyTypes.includes(type)
                            ? selectedPropertyTypes.filter(t => t !== type)
                            : [...selectedPropertyTypes, type]
                        );
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedPropertyTypes.includes(type)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'hotel' ? 'Hotéis' : type === 'resort' ? 'Resorts' : type === 'flat' ? 'Apartamentos' : 'Casas'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Período</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Entrada</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Saída</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Faixa de Preço (R$)</label>
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min={0}
                      max={2000}
                      value={filters.minPrice ?? 0}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                      className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900"
                      suppressHydrationWarning
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      min={0}
                      max={2000}
                      value={filters.maxPrice ?? 2000}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Math.min(2000, Math.max(0, parseInt(e.target.value, 10) || 2000)) }))}
                      className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900"
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>R$ 0</span>
                    <span>R$ 2.000</span>
                  </div>
                </div>
              </div>

              {/* Active Auctions Section */}
              {activeAuctions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Leilões Ativos</h3>
                  <div className="space-y-3">
                    {activeAuctions.map(({ auction }) => {
                      const timeRemaining = new Date(auction.end_date).getTime() - Date.now();
                      const hours = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
                      const minutes = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));
                      const seconds = Math.max(0, Math.floor((timeRemaining % (1000 * 60)) / 1000));
                      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                      
                      return (
                        <div
                          key={auction.id}
                          className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">Contagem Regressiva</span>
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="text-2xl font-bold mb-2" suppressHydrationWarning>
                            {formattedTime}
                          </div>
                          <div className="text-sm opacity-90">
                            Participantes: {auction.total_bids || auction.auction_participants || 0}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>

            {/* Coluna Direita - Mapa e Cards */}
            <main className="lg:col-span-2 space-y-6" suppressHydrationWarning>
              {/* Lista de Cards de Propriedades */}
              <div className="space-y-4" suppressHydrationWarning>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Listagem de Propriedades</h2>
                    {!loading && !auctionsError && (
                      <p className="text-sm text-gray-600 mt-1">
                        {auctionsWithHotels.length === 0
                          ? (checkIn || checkOut || regionSearch || (filters.minPrice != null && filters.minPrice > 0) || (filters.maxPrice != null && filters.maxPrice < 2000))
                            ? 'Nenhum resultado para os filtros aplicados.'
                            : 'Nenhum leilão ativo no momento.'
                          : `${auctionsWithHotels.length} leilão(ões) encontrado(s)`}
                      </p>
                    )}
                  </div>
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('mapa')}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        viewMode === 'mapa'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Ver mapa
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('lista')}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        viewMode === 'lista'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Ver lista
                    </button>
                  </div>
                </div>
                
                {loading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Carregando leilões...</p>
                  </div>
                )}

                {auctionsError && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-amber-800">
                    <p className="font-semibold mb-2">Erro ao carregar leilões: {auctionsError}</p>
                    <p className="text-sm mb-4">O backend precisa estar rodando na porta 5000. Para iniciar tudo sincronizado:</p>
                    <ol className="list-decimal list-inside text-sm space-y-1 mb-4">
                      <li>Abra um terminal na pasta do projeto</li>
                      <li><strong>Recomendado:</strong> <code className="bg-amber-100 px-1 rounded">cd &quot;RSV360 Versao Oficial&quot; ; .\Iniciar Sistema Completo.ps1</code></li>
                      <li>Ou apenas o backend: <code className="bg-amber-100 px-1 rounded">.\scripts\iniciar-backend.ps1</code></li>
                    </ol>
                    <button
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['auctions'] })}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}

                {!loading && !auctionsError && auctionsWithHotels.length === 0 && (
                  <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-600 mb-2">Nenhum leilão ativo no momento.</p>
                    <p className="text-sm text-gray-500">Confira exemplos reais de hotéis disponíveis para leilão:</p>
                  </div>
                )}

                {/* Mapa Leaflet - hover/tap mostra card com foto, info e preço (estilo MyHouse) */}
                {!loading && !auctionsError && viewMode === 'mapa' && canShowMap && (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <AuctionMapLeaflet
                      items={mapMarkerItems}
                      onSelectAuction={(id) => {
                        if (id >= 9000) {
                          const ex = auctionExamples[id - 9000];
                          if (ex) setViewMode('lista');
                        } else {
                          handleSelectFromMap(id);
                        }
                      }}
                      selectedId={selectedAuctionId}
                    />
                    {mapMarkerItems.length > 0 && (
                      <p className="text-sm text-gray-500 px-3 py-2 bg-gray-50 border-t">
                        {mapMarkerItems.length} acomodação(ões) • Passe o mouse ou toque no marcador para ver detalhes
                      </p>
                    )}
                  </div>
                )}

                {/* Cards Horizontais (leilões reais da API) */}
                {!loading && !auctionsError && auctionsWithHotels.length > 0 && viewMode === 'lista' && (
                  <div className="space-y-4">
                    {auctionsWithHotels.map(({ auction, hotel }) => {
                      const isSelected = selectedAuctionId === auction.id;
                      return (
                        <div
                          key={auction.id}
                          ref={(element) => {
                            cardRefs.current[auction.id] = element;
                          }}
                          onClick={() => setSelectedAuctionId(auction.id)}
                          className={`rounded-lg transition-shadow ${
                            isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                          }`}
                        >
                          <AuctionCardHorizontal auction={auction} hotel={hotel} />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Grid de exemplos reais (quando sem leilões OU sempre como "Exemplos disponíveis") */}
                {!loading && !auctionsError && viewMode === 'lista' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {auctionsWithHotels.length === 0
                        ? 'Exemplos de hotéis disponíveis para leilão'
                        : 'Mais hotéis em leilão'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {auctionExamples.slice(0, 12).map((ex) => (
                        <div
                          key={ex.id}
                          ref={(el) => {
                            exampleCardRefs.current[ex.hotelId] = el;
                          }}
                          className={highlightedHotelId === ex.hotelId ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' : ''}
                        >
                          <AuctionCardGrid example={ex} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
