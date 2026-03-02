"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Phone, ExternalLink, Users, DollarSign, Clock } from "@/lib/lucide-icons"
import { Hotel } from "@/lib/hotels-data"
import Image from "next/image"

interface MapMarkerInfoProps {
  hotel: Hotel
  isVisible: boolean
  onClose: () => void
  onSelect: (hotel: Hotel) => void
  position?: { x: number; y: number }
}

export function MapMarkerInfo({ 
  hotel, 
  isVisible, 
  onClose, 
  onSelect, 
  position 
}: MapMarkerInfoProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'luxury': return { label: 'Luxo', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '👑' }
      case 'premium': return { label: 'Premium', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '⭐' }
      case 'standard': return { label: 'Standard', color: 'bg-green-100 text-green-800 border-green-200', icon: '🏨' }
      case 'budget': return { label: 'Econômico', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '💰' }
      default: return { label: 'Standard', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '🏨' }
    }
  }

  const getAvailabilityInfo = (status: string) => {
    switch (status) {
      case 'available': return { label: 'Disponível', color: 'bg-green-100 text-green-800', icon: '✅' }
      case 'limited': return { label: 'Poucas vagas', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' }
      case 'sold_out': return { label: 'Esgotado', color: 'bg-red-100 text-red-800', icon: '❌' }
      case 'coming_soon': return { label: 'Em breve', color: 'bg-blue-100 text-blue-800', icon: '🕐' }
      default: return { label: 'Indisponível', color: 'bg-gray-100 text-gray-800', icon: '❓' }
    }
  }

  const categoryInfo = getCategoryInfo(hotel.category)
  const availabilityInfo = getAvailabilityInfo(hotel.availability.status)

  const openWhatsApp = () => {
    const message = `Olá! Gostaria de informações sobre o ${hotel.name} em Caldas Novas.`
    window.open(`https://wa.me/5564993197555?text=${encodeURIComponent(message)}`, '_blank')
  }

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hotel.coordinates.lat},${hotel.coordinates.lng}`
    window.open(url, '_blank')
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length)
  }

  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-sm sm:max-w-md bg-white shadow-2xl border-0"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold leading-tight">{hotel.name}</CardTitle>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: hotel.stars }, (_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-gray-600 ml-1">
                  {hotel.rating} ({hotel.reviewCount} avaliações)
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Imagem principal */}
          <div className="relative h-48 rounded-lg overflow-hidden">
            <Image
              src={hotel.images[currentImageIndex]}
              alt={hotel.name}
              fill
              className="object-cover"
            />
            
            {/* Controles de imagem */}
            {hotel.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={prevImage}
                >
                  ‹
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextImage}
                >
                  ›
                </Button>
              </>
            )}
            
            {/* Indicadores de imagem */}
            {hotel.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {hotel.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  title={`Ir para imagem ${index + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
                ))}
              </div>
            )}
          </div>

          {/* Informações do hotel */}
          <div className="space-y-3">
            {/* Localização */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{hotel.location}</span>
              <span>•</span>
              <span>{hotel.distanceFromCenter}km do centro</span>
            </div>

            {/* Categoria e disponibilidade */}
            <div className="flex gap-2">
              <Badge className={`text-xs ${categoryInfo.color}`}>
                {categoryInfo.icon} {categoryInfo.label}
              </Badge>
              <Badge className={`text-xs ${availabilityInfo.color}`}>
                {availabilityInfo.icon} {availabilityInfo.label}
              </Badge>
            </div>

            {/* Preço */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                R$ {hotel.price}
              </span>
              {hotel.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    R$ {hotel.originalPrice}
                  </span>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Economia de R$ {hotel.originalPrice - hotel.price}
                  </Badge>
                </>
              )}
            </div>

            {/* Capacidade */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Até {hotel.maxGuests} pessoas</span>
            </div>

            {/* Última atualização */}
            {hotel.availability.lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  Atualizado {new Date(hotel.availability.lastUpdated).toLocaleString('pt-BR')}
                </span>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={openWhatsApp}
              >
                <Phone className="w-4 h-4 mr-1" />
                Reservar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openGoogleMaps}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
