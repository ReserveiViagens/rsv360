"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Phone, ExternalLink, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Hotel } from "@/lib/hotels-data"
import Image from "next/image"

interface HotelPinProps {
  hotel: Hotel
  isSelected?: boolean
  onSelect?: (hotel: Hotel) => void
  onClose?: () => void
  showDetails?: boolean
  zoomLevel?: number
}

export function HotelPin({ 
  hotel, 
  isSelected = false, 
  onSelect, 
  onClose, 
  showDetails = false,
  zoomLevel = 13 
}: HotelPinProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const getPinSize = () => {
    if (zoomLevel >= 16) return 'large'
    if (zoomLevel >= 14) return 'medium'
    return 'small'
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'limited': return 'bg-yellow-500'
      case 'sold_out': return 'bg-red-500'
      case 'coming_soon': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'luxury': return 'border-purple-500'
      case 'premium': return 'border-blue-500'
      case 'standard': return 'border-green-500'
      case 'budget': return 'border-yellow-500'
      default: return 'border-gray-500'
    }
  }

  const pinSize = getPinSize()
  const isLarge = pinSize === 'large'
  const isMedium = pinSize === 'medium'

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length)
  }

  const openWhatsApp = () => {
    const message = `Olá! Gostaria de informações sobre o ${hotel.name} em Caldas Novas.`
    window.open(`https://wa.me/5564993197555?text=${encodeURIComponent(message)}`, '_blank')
  }

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hotel.coordinates.lat},${hotel.coordinates.lng}`
    window.open(url, '_blank')
  }

  if (pinSize === 'small') {
    return (
      <div
        className={`relative cursor-pointer transition-all duration-300 ${
          isSelected ? 'scale-110 z-50' : 'hover:scale-105'
        }`}
        onClick={() => onSelect?.(hotel)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Pin pequeno com foto */}
        <div className={`w-12 h-12 rounded-full border-2 overflow-hidden shadow-lg ${
          getCategoryColor(hotel.category)
        } ${isSelected ? 'ring-4 ring-blue-300' : ''}`}>
          <Image
            src={hotel.images[0]}
            alt={hotel.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Indicador de disponibilidade */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getAvailabilityColor(hotel.availability.status)}`} />
        
        {/* Tooltip no hover */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
            <Card className="p-2 shadow-lg border-0 bg-white">
              <div className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                {hotel.name}
              </div>
              <div className="text-xs text-gray-600">
                R$ {hotel.price}
              </div>
            </Card>
          </div>
        )}
      </div>
    )
  }

  if (pinSize === 'medium') {
    return (
      <div
        className={`relative cursor-pointer transition-all duration-300 ${
          isSelected ? 'scale-110 z-50' : 'hover:scale-105'
        }`}
        onClick={() => onSelect?.(hotel)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Pin médio com foto e info básica */}
        <Card className={`w-32 h-20 overflow-hidden shadow-lg border-2 ${
          getCategoryColor(hotel.category)
        } ${isSelected ? 'ring-4 ring-blue-300' : ''}`}>
          <div className="relative h-full">
            <Image
              src={hotel.images[currentImageIndex]}
              alt={hotel.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Info overlay */}
            <div className="absolute bottom-1 left-1 right-1">
              <div className="text-xs font-semibold text-white truncate">
                {hotel.name}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-white">
                  R$ {hotel.price}
                </div>
                <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(hotel.availability.status)}`} />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Indicador de disponibilidade */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getAvailabilityColor(hotel.availability.status)}`} />
      </div>
    )
  }

  // Pin grande com detalhes completos
  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected ? 'scale-110 z-50' : 'hover:scale-105'
      }`}
      onClick={() => onSelect?.(hotel)}
    >
      <Card className={`w-80 max-w-[90vw] overflow-hidden shadow-xl border-2 ${
        getCategoryColor(hotel.category)
      } ${isSelected ? 'ring-4 ring-blue-300' : ''}`}>
        {/* Header com foto principal */}
        <div className="relative h-48">
          <Image
            src={hotel.images[currentImageIndex]}
            alt={hotel.name}
            fill
            className="object-cover"
          />
          
          {/* Overlay com controles */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Botão de fechar */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          {/* Controles de imagem */}
          {hotel.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
          
          {/* Indicadores de imagem */}
          {hotel.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {hotel.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex(index)
                  }}
                  title={`Ir para imagem ${index + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {hotel.discount && (
              <Badge className="bg-red-500 text-white text-xs">
                -{hotel.discount}% OFF
              </Badge>
            )}
            <Badge className={`text-xs ${getAvailabilityColor(hotel.availability.status)} text-white`}>
              {hotel.availability.status === 'available' ? 'Disponível' :
               hotel.availability.status === 'limited' ? 'Poucas vagas' :
               hotel.availability.status === 'sold_out' ? 'Esgotado' : 'Em breve'}
            </Badge>
          </div>
        </div>
        
        {/* Conteúdo do card */}
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Nome e estrelas */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight">{hotel.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: hotel.stars }, (_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    {hotel.rating} ({hotel.reviewCount})
                  </span>
                </div>
              </div>
            </div>
            
            {/* Localização */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{hotel.location}</span>
              <span className="text-gray-400">•</span>
              <span>{hotel.distanceFromCenter}km do centro</span>
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
            
            {/* Ações */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  openWhatsApp()
                }}
              >
                <Phone className="w-4 h-4 mr-1" />
                Reservar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openGoogleMaps()
                }}
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
