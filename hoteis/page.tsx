"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Star, Phone, MapPin, ChevronLeft, ChevronRight, Filter, Grid, List, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { useWebsiteContent } from "@/hooks/useWebsiteData"
import { HotelFilters } from "@/components/hotel-filters"
import { HotelMap } from "@/components/hotel-map"
import { AvailabilityBadge, AvailabilityStatus } from "@/components/availability-badge"
import { HotelPhotoGallery } from "@/components/hotel-photo-gallery"

interface ImageGalleryProps {
  images: string[]
  alt: string
  popular?: boolean
  onImageClick?: (index: number) => void
}

function ImageGallery({ images, alt, popular, onImageClick }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className={`aspect-video relative overflow-hidden ${popular ? "mt-8" : ""}`}>
      <img
        src={images[currentImageIndex] || "/placeholder.svg"}
        alt={`${alt} - Foto ${currentImageIndex + 1}`}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
        onClick={() => onImageClick?.(currentImageIndex)}
      />

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            title="Imagem anterior"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextImage}
            title="Próxima imagem"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              title={`Ir para imagem ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentImageIndex + 1}/{images.length}
        </div>
      )}
    </div>
  )
}

// Interface para hotel da API
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
}

// Converter hotel da API para formato esperado pelos componentes
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
  };
};

export default function HoteisPage() {
  // Usar hook para buscar dados do backend (sincronizado com CMS)
  const { data: apiHotels, isLoading: isLoadingData, error: dataError } = useWebsiteContent('hotel');
  
  const [isLoading, setIsLoading] = useState(true)
  const [filteredHotels, setFilteredHotels] = useState<any[]>([])
  const [showMap, setShowMap] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState(false)
  const [photoGalleryHotel, setPhotoGalleryHotel] = useState<any | null>(null)
  const [photoGalleryIndex, setPhotoGalleryIndex] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Converter hotéis da API para formato esperado
  const hotels = (apiHotels || [])
    .filter((h: ApiHotel) => h.status === 'active')
    .map(convertApiHotelToHotel);

  // Atualizar hotéis filtrados quando dados mudarem
  useEffect(() => {
    if (hotels.length > 0) {
      setFilteredHotels(hotels);
      setIsLoading(false);
      setLastUpdate(new Date());
    }
  }, [apiHotels]);

  // Polling para atualização em tempo real (a cada 30 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      // O hook useWebsiteContent já faz polling automático
      setLastUpdate(new Date());
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Obter localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Erro ao obter localização:', error)
        }
      )
    }
  }, [])

  const openPhotoGallery = (hotel: any, imageIndex: number = 0) => {
    setPhotoGalleryHotel(hotel)
    setPhotoGalleryIndex(imageIndex)
    setPhotoGalleryOpen(true)
  }

  const closePhotoGallery = () => {
    setPhotoGalleryOpen(false)
    setPhotoGalleryHotel(null)
    setPhotoGalleryIndex(0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (isLoading || isLoadingData) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center z-50">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          </div>
        </div>
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Carregando Hotéis</h2>
          <p className="text-blue-100">Buscando as melhores opções para você...</p>
        </div>
        <div className="mt-8 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (dataError || hotels.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-6xl mb-4">🏨</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {dataError ? 'Erro ao carregar hotéis' : 'Nenhum hotel disponível'}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {dataError 
              ? 'Não foi possível carregar os hotéis. Verifique sua conexão e tente novamente.'
              : 'No momento não temos hotéis cadastrados. Entre em contato conosco para mais informações.'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white mb-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      <div className="animate-in fade-in duration-500">
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
              alt="Reservei Viagens"
              width={40}
              height={40}
              className="rounded-full bg-white/20 p-1"
            />
            <h1 className="text-2xl font-bold tracking-tight">Hotéis em Caldas Novas</h1>
          </div>

          {/* Hero CTA */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">🔥 Ofertas Exclusivas!</h2>
              <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                <RefreshCw className="w-3 h-3 mr-1" />
                Atualizado: {lastUpdate.toLocaleTimeString()}
              </Badge>
            </div>
            <p className="text-sm mb-3">{hotels.length}+ Hotéis em Caldas Novas - Até 20% OFF + Estacionamento GRÁTIS</p>
            <Badge className="bg-yellow-500 text-black animate-pulse">⏰ Por tempo limitado!</Badge>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Controles de Filtro e Visualização */}
          <div className="flex flex-col gap-4">
            <HotelFilters 
              hotels={hotels}
              onFiltersChange={setFilteredHotels}
              onMapToggle={() => setShowMap(!showMap)}
              showMap={showMap}
            />
            
            {/* Status de Disponibilidade */}
            <AvailabilityStatus hotels={filteredHotels} />
            
            {/* Controles de Visualização */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {filteredHotels.length} de {hotels.length} hotéis
                </span>
                {selectedHotel && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {selectedHotel.name} selecionado
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mapa */}
          {showMap && (
            <HotelMap
              hotels={filteredHotels}
              selectedHotel={selectedHotel}
              onHotelSelect={setSelectedHotel}
              userLocation={userLocation || undefined}
            />
          )}

          {/* Urgency Banner */}
          <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <CardContent className="p-4 text-center">
              <h3 className="font-bold text-lg mb-2">⚡ ÚLTIMAS VAGAS DISPONÍVEIS!</h3>
              <p className="text-sm mb-3">Mais de 50 pessoas visualizando estes hotéis agora</p>
              <Badge className="bg-white text-red-600 font-bold">Reserve já e garante sua vaga!</Badge>
            </CardContent>
          </Card>

          {/* Gallery Info Banner */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardContent className="p-4 text-center">
              <h3 className="font-bold text-lg mb-2">📸 Galeria Interativa! 🎢📸✨</h3>
              <p className="text-sm mb-3">Navegue pelas fotos de cada hotel e veja todos os ambientes</p>
              <Badge className="bg-white text-blue-600 font-bold">Use as setas para ver mais fotos!</Badge>
            </CardContent>
          </Card>

          {/* Hotels List */}
          <div className={`space-y-6 ${viewMode === 'list' ? 'max-w-4xl mx-auto' : ''}`}>
            {filteredHotels.map((hotel, index) => (
              <Card
                key={hotel.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative border-2 border-transparent hover:border-blue-200"
              >
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                  {hotel.discount && (
                    <Badge className="bg-red-500 text-white animate-pulse">
                      -{hotel.discount}% OFF
                    </Badge>
                  )}
                  <AvailabilityBadge hotel={hotel} />
                </div>

                <ImageGallery 
                  images={hotel.images} 
                  alt={hotel.name} 
                  onImageClick={(index) => openPhotoGallery(hotel, index)}
                />

                {index === 0 && (
                  <Badge className="absolute top-3 left-3 bg-yellow-500 text-black font-bold z-10">
                    🏆 MAIS PROCURADO
                  </Badge>
                )}

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-xl mb-1">{hotel.name}</h3>
                      <div className="flex gap-1 mb-2">{renderStars(hotel.stars)}</div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        {hotel.location} • {hotel.distanceFromCenter}km do centro
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{hotel.rating}</span>
                          <span className="text-gray-400">({hotel.reviewCount} avaliações)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{hotel.description}</p>

                  {/* Gallery Info */}
                  <div className="mb-4">
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                      📸 {hotel.images.length} fotos disponíveis
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {hotel.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{hotel.features.length - 3} mais
                      </Badge>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {hotel.originalPrice && (
                          <span className="text-sm text-gray-400 line-through mr-2">
                            {formatPrice(hotel.originalPrice)}
                          </span>
                        )}
                        <div className="text-2xl font-bold text-green-600">{formatPrice(hotel.price)}</div>
                        <p className="text-xs text-gray-500">
                          diária a partir de - para {hotel.maxGuests} pessoas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Economia de</p>
                        <p className="text-lg font-bold text-red-600">
                          {hotel.originalPrice ? formatPrice(hotel.originalPrice - hotel.price) : "---"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-lg"
                        onClick={() =>
                          window.open(
                            `https://wa.me/5564993197555?text=Olá! Quero reservar o ${hotel.name} com desconto especial!`,
                            "_blank",
                          )
                        }
                      >
                        💚 RESERVAR AGORA - {hotel.discount}% OFF
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                          onClick={() => alert(`Detalhes completos do ${hotel.name}`)}
                        >
                          Ver Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          className="border-purple-500 text-purple-600 hover:bg-purple-50"
                          onClick={() => setSelectedHotel(hotel)}
                          title="Ver no mapa"
                        >
                          <MapPin className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Final CTA */}
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-3">🎯 Não encontrou o hotel ideal?</h3>
              <p className="mb-4">Fale conosco! Temos mais de 45 opções de hospedagem em Caldas Novas</p>
              <Button
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3"
                onClick={() =>
                  window.open(
                    "https://wa.me/5564993197555?text=Olá! Gostaria de ver mais opções de hotéis em Caldas Novas.",
                    "_blank",
                  )
                }
              >
                📞 Falar com Especialista
              </Button>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-center pt-6 pb-20">
            <Link href="/">
              <Button
                variant="outline"
                className="text-gray-600 hover:text-blue-600 border-gray-300 hover:border-blue-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/5564993197555?text=Olá! Gostaria de informações sobre hotéis em Caldas Novas."
        target="_blank"
        rel="noopener noreferrer"
        title="Falar no WhatsApp"
        className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50 animate-pulse"
      >
        <Phone className="w-7 h-7 text-white" />
      </a>

      {/* Galeria de Fotos */}
      {photoGalleryHotel && (
        <HotelPhotoGallery
          hotel={photoGalleryHotel}
          isOpen={photoGalleryOpen}
          onClose={closePhotoGallery}
          initialImageIndex={photoGalleryIndex}
        />
      )}
    </div>
  )
}
