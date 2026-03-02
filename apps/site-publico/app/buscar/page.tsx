"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Users, MapPin, Filter, X, Star } from "lucide-react"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { useToast } from "@/components/providers/toast-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"
import Link from "next/link"
import { useWebsiteContent } from "@/hooks/useWebsiteData"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { PropertyMap } from "@/components/property-map"

interface ApiHotel {
  id: number;
  content_id: string;
  title: string;
  description: string;
  images: string[];
  metadata?: {
    stars?: number;
    price?: number;
    originalPrice?: number;
    features?: string[];
    location?: string;
    capacity?: string;
    maxGuests?: number;
    distanceFromCenter?: number;
    reviewCount?: number;
    discount?: number;
    type?: string;
  };
  status: 'active' | 'inactive' | 'draft';
  price?: number;
  original_price?: number;
  location?: string;
  stars?: number;
  features?: string[];
  maxGuests?: number;
  distanceFromCenter?: number;
  reviewCount?: number;
  discount?: number;
  type?: string;
}

interface SearchFilters {
  destination: string;
  checkIn: string;
  checkOut: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  guests: number;
  minRating: number;
  amenities: string[];
  freeCancellation: boolean;
}

const convertApiHotelToHotel = (apiHotel: ApiHotel): any => {
  const price = apiHotel.price ?? apiHotel.metadata?.price ?? 0;
  const originalPrice = apiHotel.original_price ?? apiHotel.metadata?.originalPrice ?? price;
  const stars = apiHotel.stars ?? apiHotel.metadata?.stars ?? 4;
  const features = apiHotel.features ?? apiHotel.metadata?.features ?? [];
  const location = apiHotel.location ?? apiHotel.metadata?.location ?? 'Caldas Novas';
  const capacityText = apiHotel.metadata?.capacity ?? '4 pessoas';
  const parsedCapacity = parseInt(String(capacityText).replace(/\D/g, ''), 10);
  const maxGuests =
    apiHotel.maxGuests ??
    apiHotel.metadata?.maxGuests ??
    (Number.isFinite(parsedCapacity) && parsedCapacity > 0 ? parsedCapacity : 4);
  const distanceFromCenter =
    apiHotel.distanceFromCenter ??
    apiHotel.metadata?.distanceFromCenter ??
    2;
  const reviewCount =
    apiHotel.reviewCount ??
    apiHotel.metadata?.reviewCount ??
    120;
  const discountPercent =
    apiHotel.discount ??
    apiHotel.metadata?.discount ??
    (originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0);
  const type = apiHotel.type ?? apiHotel.metadata?.type ?? 'hotel';

  return {
    id: apiHotel.id,
    name: apiHotel.title,
    description: apiHotel.description,
    images: apiHotel.images || [],
    price,
    originalPrice,
    stars,
    rating: stars,
    reviewCount,
    location,
    distanceFromCenter,
    features,
    maxGuests,
    discount: discountPercent,
    availability: apiHotel.status === 'active' ? 'available' : 'unavailable',
    type,
  };
};

export default function BuscarPage() {
  const { data: apiHotels, isLoading: isLoadingData, error: dataError, retry } = useWebsiteContent('hotel');
  const toast = useToast();
  
  const [filters, setFilters] = useState<SearchFilters>({
    destination: "",
    checkIn: "",
    checkOut: "",
    type: "Todos",
    minPrice: 0,
    maxPrice: 1000,
    guests: 1,
    minRating: 0,
    amenities: [],
    freeCancellation: false,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);

  // Converter hotéis da API
  const allProperties = (apiHotels || [])
    .filter((h: ApiHotel) => h.status === 'active')
    .map(convertApiHotelToHotel);

  // Obter tipos únicos de propriedades
  const propertyTypes = ["Todos", ...Array.from(new Set(allProperties.map((p: any) => p.type || 'hotel')))];
  
  // Obter todas as comodidades únicas
  const allAmenities = Array.from(
    new Set(
      allProperties.flatMap((p: any) => p.features || [])
    )
  ).sort();

  // Calcular preço máximo disponível
  const maxAvailablePrice = Math.max(...allProperties.map((p: any) => p.price || 0), 1000);

  useEffect(() => {
    if (filters.maxPrice > maxAvailablePrice) {
      setFilters(prev => ({ ...prev, maxPrice: maxAvailablePrice }));
    }
  }, [maxAvailablePrice]);

  const handleSearch = () => {
    if (!filters.destination && !searchPerformed) {
      toast.info('Digite um destino para buscar');
      return;
    }
    
    // Redirecionar para página de busca completa com parâmetros
    const params = new URLSearchParams();
    if (filters.destination) params.set('destination', filters.destination);
    if (filters.checkIn) params.set('checkIn', filters.checkIn);
    if (filters.checkOut) params.set('checkOut', filters.checkOut);
    if (filters.type !== 'Todos') params.set('type', filters.type);
    if (filters.guests > 1) params.set('guests', filters.guests.toString());
    
    window.location.href = `/hoteis/busca/completa?${params.toString()}`;
  };

  const clearFilters = () => {
    setFilters({
      destination: "",
      checkIn: "",
      checkOut: "",
      type: "Todos",
      minPrice: 0,
      maxPrice: maxAvailablePrice,
      guests: 1,
      minRating: 0,
      amenities: [],
      freeCancellation: false,
    });
    setFilteredProperties([]);
    setSearchPerformed(false);
  };

  // Salvar filtros na URL
  useEffect(() => {
    if (typeof window !== 'undefined' && searchPerformed) {
      const params = new URLSearchParams();
      if (filters.destination) params.set('destination', filters.destination);
      if (filters.checkIn) params.set('checkIn', filters.checkIn);
      if (filters.checkOut) params.set('checkOut', filters.checkOut);
      if (filters.type !== 'Todos') params.set('type', filters.type);
      if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < maxAvailablePrice) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.guests > 1) params.set('guests', filters.guests.toString());
      if (filters.minRating > 0) params.set('minRating', filters.minRating.toString());
      if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','));
      if (filters.freeCancellation) params.set('freeCancellation', 'true');
      
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }
  }, [filters, searchPerformed, maxAvailablePrice]);

  // Carregar filtros da URL ao montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlDestination = params.get('destination');
      const urlCheckIn = params.get('checkIn');
      const urlCheckOut = params.get('checkOut');
      const urlType = params.get('type');
      const urlMinPrice = params.get('minPrice');
      const urlMaxPrice = params.get('maxPrice');
      const urlGuests = params.get('guests');
      const urlMinRating = params.get('minRating');
      const urlAmenities = params.get('amenities');
      const urlFreeCancellation = params.get('freeCancellation');

      if (urlDestination || urlCheckIn || urlCheckOut || urlType || urlMinPrice || urlMaxPrice || urlGuests || urlMinRating || urlAmenities || urlFreeCancellation) {
        setFilters(prev => ({
          ...prev,
          destination: urlDestination || prev.destination,
          checkIn: urlCheckIn || prev.checkIn,
          checkOut: urlCheckOut || prev.checkOut,
          type: urlType || prev.type,
          minPrice: urlMinPrice ? Number(urlMinPrice) : prev.minPrice,
          maxPrice: urlMaxPrice ? Number(urlMaxPrice) : prev.maxPrice,
          guests: urlGuests ? Number(urlGuests) : prev.guests,
          minRating: urlMinRating ? Number(urlMinRating) : prev.minRating,
          amenities: urlAmenities ? urlAmenities.split(',') : prev.amenities,
          freeCancellation: urlFreeCancellation === 'true',
        }));
        // Executar busca automaticamente se houver filtros na URL
        setTimeout(() => handleSearch(), 100);
      }
    }
  }, []);

  // Persistir filtros no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && searchPerformed) {
      localStorage.setItem('searchFilters', JSON.stringify(filters));
    }
  }, [filters, searchPerformed]);

  // Carregar filtros do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('searchFilters');
      if (savedFilters) {
        try {
          const parsed = JSON.parse(savedFilters);
          setFilters(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          // Ignorar erro
        }
      }
    }
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ));
  };

  // Formatar data para input date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
              ←
            </Button>
          </Link>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
            alt="Reservei Viagens"
            width={40}
            height={40}
            className="rounded-full bg-white/20 p-1"
          />
          <h1 className="text-2xl font-bold tracking-tight">Buscar Propriedades</h1>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Encontre o lugar perfeito</h2>
          <p className="text-blue-100">Descubra propriedades incríveis para sua próxima viagem</p>
        </div>

        {/* Search Form */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            {/* Destino */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Onde você quer ir?"
                value={filters.destination}
                onChange={(e) => setFilters(prev => ({ ...prev, destination: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="date"
                  placeholder="dd/mm/aaaa"
                  value={filters.checkIn}
                  onChange={(e) => setFilters(prev => ({ ...prev, checkIn: e.target.value }))}
                  min={getTodayDate()}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="date"
                  placeholder="dd/mm/aaaa"
                  value={filters.checkOut}
                  onChange={(e) => setFilters(prev => ({ ...prev, checkOut: e.target.value }))}
                  min={filters.checkIn || getTomorrowDate()}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Botão Buscar */}
            <Button
              onClick={handleSearch}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-lg"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar
            </Button>

            {/* Botão Filtros */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </CardContent>
        </Card>

        {/* Filtros Expandidos */}
        {showFilters && (
          <Card className="mt-4 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              {/* Tipo */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preço */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Preço: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Preço Mínimo"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                      min={0}
                    />
                    <Input
                      type="number"
                      placeholder="Preço Máximo"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                      min={filters.minPrice}
                      max={maxAvailablePrice}
                    />
                  </div>
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={(value) => setFilters(prev => ({ 
                      ...prev, 
                      minPrice: value[0], 
                      maxPrice: value[1] 
                    }))}
                    min={0}
                    max={maxAvailablePrice}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Hóspedes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Hóspedes</label>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    value={filters.guests}
                    onChange={(e) => setFilters(prev => ({ ...prev, guests: Number(e.target.value) }))}
                    min={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">+</span>
                </div>
              </div>

              {/* Avaliação Mínima */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Avaliação Mínima: {filters.minRating > 0 ? `${filters.minRating}+ estrelas` : 'Qualquer'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFilters(prev => ({ ...prev, minRating: prev.minRating === star ? 0 : star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= filters.minRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comodidades */}
              {allAmenities.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Comodidades</label>
                  <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                    {allAmenities.slice(0, 10).map((amenity: string) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`amenity-${amenity}`}
                          checked={filters.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                amenities: [...prev.amenities, amenity]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                amenities: prev.amenities.filter(a => a !== amenity)
                              }));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                          {amenity}
                        </label>
                      </div>
                    ))}
                    {allAmenities.length > 10 && (
                      <p className="text-xs text-gray-500 mt-2">
                        +{allAmenities.length - 10} outras comodidades disponíveis
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Cancelamento Grátis */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="freeCancellation"
                  checked={filters.freeCancellation}
                  onChange={(e) => setFilters(prev => ({ ...prev, freeCancellation: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="freeCancellation" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Cancelamento grátis
                </label>
              </div>

              {/* Botão Limpar */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        )}
      </header>

      {/* Results */}
      <div className="p-6 space-y-6">
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Carregando propriedades..." />
            <p className="text-gray-600">Carregando propriedades...</p>
          </div>
        ) : dataError ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nao foi possivel carregar as propriedades</h3>
            <p className="text-gray-600 mb-4">Voce ainda pode usar a busca. Tente atualizar os dados.</p>
            <Button variant="outline" onClick={retry}>
              Tentar novamente
            </Button>
          </div>
        ) : !searchPerformed ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Pronto para buscar?</h3>
            <p className="text-gray-600">Preencha os campos acima e clique em "Buscar" para encontrar propriedades incríveis</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏨</div>
            {filters.destination ? (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum destino encontrado</h3>
                <p className="text-gray-600 mb-4">
                  Não encontramos propriedades em "{filters.destination}" com os filtros selecionados.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma propriedade encontrada</h3>
                <p className="text-gray-600 mb-4">
                  Não encontramos propriedades com os filtros selecionados.
                </p>
              </>
            )}
            <Button onClick={clearFilters} variant="outline">
              Limpar Filtros e Buscar Novamente
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {filteredProperties.length} propriedade{filteredProperties.length !== 1 ? 's' : ''} encontrada{filteredProperties.length !== 1 ? 's' : ''}
              </h3>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>

            {/* Mapa Interativo */}
            {filteredProperties.length > 0 && (
              <div className="mb-6">
                <PropertyMap
                  properties={filteredProperties.map(p => ({
                    id: p.id,
                    name: p.name,
                    location: p.location,
                    price: p.price,
                    rating: p.rating || p.stars || 0,
                    images: p.images || [],
                  }))}
                  onPropertyClick={(property) => {
                    const found = filteredProperties.find(p => p.id === property.id);
                    if (found) {
                      window.location.href = `/hoteis/${found.id}`;
                    }
                  }}
                />
              </div>
            )}

            {filteredProperties.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="relative aspect-video">
                  <ImageWithFallback
                    src={property.images[0] || "/placeholder.svg"}
                    alt={property.name}
                    width={800}
                    height={450}
                    objectFit="cover"
                    className="w-full h-full"
                  />
                  {property.discount && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white animate-pulse">
                      -{property.discount}% OFF
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-1">{property.name}</h3>
                      <div className="flex gap-1 mb-2">{renderStars(property.stars)}</div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        {property.location} • {property.distanceFromCenter}km do centro
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{property.rating}</span>
                          <span className="text-gray-400">({property.reviewCount} avaliações)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                    {property.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.features.slice(0, 3).map((feature: string) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {property.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{property.features.length - 3} mais
                      </Badge>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {property.originalPrice && (
                          <span className="text-sm text-gray-400 line-through mr-2">
                            {formatPrice(property.originalPrice)}
                          </span>
                        )}
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(property.price)}
                        </div>
                        <p className="text-xs text-gray-500">
                          diária a partir de - para {property.maxGuests} pessoas
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/hoteis/${property.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          Ver Detalhes
                        </Button>
                      </Link>
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold"
                        onClick={() =>
                          window.open(
                            `https://wa.me/5564993197555?text=Olá! Quero reservar o ${property.name} com desconto especial!`,
                            "_blank",
                          )
                        }
                      >
                        💚 Reservar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

