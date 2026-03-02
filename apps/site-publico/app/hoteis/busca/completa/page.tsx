'use client';

// ===================================================================
// PÁGINA PÚBLICA - BUSCA COMPLETA DE HOTÉIS/EMPREENDIMENTOS
// ===================================================================

import React, { useState, useEffect, Suspense } from 'react';
import { Building2, MapPin, Star, Search, Filter, Grid, List, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Enterprise } from '@/types/accommodations';
import { Button } from '@/components/ui/button';
import { getCrossSellItems, getCrossSellItemByIndex } from '@/lib/cross-sell-matrix';
import { getContextualSubtitle } from '@/lib/cross-sell-context-messages';
import { MobileCrossSellCard } from '@/components/home/mobile-cross-sell-card';
import { getHomeSideRailsFallback } from '@/lib/home-side-rails';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function BuscaCompletaContent() {
  const searchParams = useSearchParams();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    state: ''
  });

  // Carregar parâmetros da URL ao montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const destination = params.get('destination') || '';
      
      if (destination) {
        setSearchTerm(destination);
      }
    }
  }, []);

  useEffect(() => {
    loadEnterprises();
  }, [filters, searchTerm]);

  const loadEnterprises = async () => {
    try {
      setLoading(true);
      setError(null);
      const hotelsUrl = `${API_BASE_URL}/api/website/content/hotels`;
      const fallbackUrl = '/api/website/content/hotels';

      let hotelsResponse: Response;
      try {
        hotelsResponse = await fetch(hotelsUrl);
      } catch {
        hotelsResponse = await fetch(fallbackUrl);
      }

      if (!hotelsResponse.ok) {
        throw new Error('Falha ao carregar hoteis');
      }

      const oldData = await hotelsResponse.json();
      const hotelsData = oldData.data || oldData.contents || oldData || [];
      const allEnterprises: Enterprise[] = Array.isArray(hotelsData)
        ? hotelsData
            .filter((hotel: any) => hotel.status === 'active')
            .map((hotel: any) => {
              const location = hotel.location || hotel.metadata?.location || 'Caldas Novas, GO';
              const locationParts = location.split(',').map((p: string) => p.trim());

              return {
                id: hotel.id || `old-${hotel.content_id}`,
                name: hotel.title || hotel.name || 'Hotel',
                description: hotel.description || '',
                enterpriseType: 'hotel' as const,
                address: {
                  city: locationParts[0] || hotel.metadata?.city || 'Caldas Novas',
                  state: locationParts[1] || hotel.metadata?.state || 'GO',
                  country: 'Brasil',
                },
                images: Array.isArray(hotel.images) ? hotel.images : hotel.images ? [hotel.images] : [],
                amenities: Array.isArray(hotel.features) ? hotel.features : hotel.metadata?.features || [],
                status: hotel.status === 'active' ? 'active' : 'inactive',
                isFeatured: hotel.metadata?.featured || hotel.is_featured || false,
                contact: {
                  phone: hotel.metadata?.phone,
                  email: hotel.metadata?.email,
                  website: hotel.metadata?.website,
                },
                createdAt: hotel.created_at || new Date().toISOString(),
                updatedAt: hotel.updated_at || new Date().toISOString(),
              };
            })
        : [];

      // Filtrar por termo de busca se houver
      let filtered = allEnterprises;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = allEnterprises.filter(enterprise => 
          enterprise.name.toLowerCase().includes(search) ||
          enterprise.description?.toLowerCase().includes(search) ||
          enterprise.address.city.toLowerCase().includes(search) ||
          enterprise.address.state.toLowerCase().includes(search)
        );
      }

      // Remover duplicatas baseado no ID
      const uniqueEnterprises = filtered.filter((ent, index, self) =>
        index === self.findIndex(e => e.id === ent.id)
      );

      setEnterprises(uniqueEnterprises);
    } catch (error) {
      console.error('Erro ao carregar empreendimentos:', error);
      setError('Nao foi possivel carregar os hoteis.');
      setEnterprises([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hotel: 'Hotel',
      pousada: 'Pousada',
      resort: 'Resort',
      flat: 'Flat',
      chacara: 'Chácara',
      hostel: 'Hostel',
      apartment_hotel: 'Apart Hotel',
      resort_apartment: 'Apartamento de Resort',
      resort_house: 'Casa de Resort',
      hotel_house: 'Casa de Hotel',
      airbnb: 'Airbnb',
      other: 'Outro'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/hoteis">
              <button className="p-2 hover:bg-white/20 rounded-md transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold mb-4">Encontre o Lugar Perfeito</h1>
              <p className="text-xl text-blue-100">
                Explore nossa seleção de hotéis, pousadas, resorts e muito mais
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os tipos</option>
                <option value="hotel">Hotel</option>
                <option value="pousada">Pousada</option>
                <option value="resort">Resort</option>
                <option value="flat">Flat</option>
                <option value="chacara">Chácara</option>
              </select>

              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os estados</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="SP">São Paulo</option>
                <option value="MG">Minas Gerais</option>
                <option value="BA">Bahia</option>
                <option value="PE">Pernambuco</option>
                <option value="GO">Goiás</option>
              </select>
            </div>

            {/* Modo de visualização */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mb-4 text-sm text-gray-600">
          {loading ? (
            'Carregando...'
          ) : (
            <>
              Mostrando <strong>{enterprises.length}</strong> empreendimento{enterprises.length !== 1 ? 's' : ''}
            </>
          )}
        </div>

        {/* Lista de Empreendimentos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-700 mb-3">Nao foi possivel carregar os hoteis.</p>
            <Button variant="outline" onClick={loadEnterprises}>Tentar novamente</Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterprises.map((enterprise, index) => {
              const crossSellItem = (index + 1) % 4 === 0 ? getCrossSellItemByIndex('hotels', Math.floor((index + 1) / 4) - 1, getHomeSideRailsFallback()) : null;
              return (
                <React.Fragment key={enterprise.id}>
                  <Link
                    href={`/hoteis/${enterprise.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                {enterprise.images && enterprise.images.length > 0 && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={enterprise.images[0]}
                      alt={enterprise.name}
                      className="w-full h-full object-cover"
                    />
                    {enterprise.isFeatured && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Destaque
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{enterprise.name}</h3>
                    <span className="text-xs text-gray-500">{getTypeLabel(enterprise.enterpriseType)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{enterprise.address.city}, {enterprise.address.state}</span>
                  </div>
                  {enterprise.description && (
                    <p className="text-sm text-gray-700 line-clamp-2">{enterprise.description}</p>
                  )}
                </div>
              </Link>
                  {crossSellItem && (
                    <div key={`cs-${index}`} className="col-span-full">
                      <MobileCrossSellCard
                        item={crossSellItem}
                        variant="compact"
                        randomImage
                        animation="fade"
                        contextualSubtitle={getContextualSubtitle('hotels', crossSellItem.id, crossSellItem.subtitle)}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Cross-sell: após lista — Viagens em grupo */}
          <div className="mt-6">
            {getCrossSellItems('hotels', getHomeSideRailsFallback(), { limit: 4 })
              .filter((i) => i.id === 'group-travel')
              .map((item) => (
                <MobileCrossSellCard
                  key={item.id}
                  item={item}
                  variant="compact"
                  randomImage
                  contextualSubtitle={getContextualSubtitle('hotels', item.id, item.subtitle)}
                />
              ))}
          </div>
        ) : (
          <div className="space-y-4">
            {enterprises.map((enterprise, index) => {
              const crossSellItem = (index + 1) % 4 === 0 ? getCrossSellItemByIndex('hotels', Math.floor((index + 1) / 4) - 1, getHomeSideRailsFallback()) : null;
              return (
                <React.Fragment key={enterprise.id}>
                  <Link
                    href={`/hoteis/${enterprise.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 flex gap-6"
                  >
                    {enterprise.images && enterprise.images.length > 0 && (
                      <img
                        src={enterprise.images[0]}
                        alt={enterprise.name}
                        className="w-48 h-32 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{enterprise.name}</h3>
                        <span className="text-sm text-gray-500">{getTypeLabel(enterprise.enterpriseType)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{enterprise.address.city}, {enterprise.address.state}</span>
                      </div>
                      {enterprise.description && (
                        <p className="text-sm text-gray-700">{enterprise.description}</p>
                      )}
                    </div>
                  </Link>
                  {crossSellItem && (
                    <div key={`cs-${index}`}>
                      <MobileCrossSellCard
                        item={crossSellItem}
                        variant="compact"
                        randomImage
                        animation="fade"
                        contextualSubtitle={getContextualSubtitle('hotels', crossSellItem.id, crossSellItem.subtitle)}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Cross-sell: após lista (modo list) — Viagens em grupo */}
          <div className="mt-6">
            {getCrossSellItems('hotels', getHomeSideRailsFallback(), { limit: 4 })
              .filter((i) => i.id === 'group-travel')
              .map((item) => (
                <MobileCrossSellCard
                  key={item.id}
                  item={item}
                  variant="compact"
                  randomImage
                  contextualSubtitle={getContextualSubtitle('hotels', item.id, item.subtitle)}
                />
              ))}
          </div>
        )}

        {!loading && enterprises.length === 0 && (
          <>
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Nenhum empreendimento encontrado</p>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Tente buscar com outros termos ou <button onClick={() => setSearchTerm('')} className="text-blue-600 hover:underline">limpar a busca</button>
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
              {getCrossSellItems('hotels', getHomeSideRailsFallback(), { limit: 3 }).map((item) => (
                <MobileCrossSellCard
                  key={item.id}
                  item={item}
                  variant="full"
                  randomImage
                  contextualSubtitle={getContextualSubtitle('hotels', item.id, item.subtitle)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BuscaCompletaHoteisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <BuscaCompletaContent />
    </Suspense>
  );
}
