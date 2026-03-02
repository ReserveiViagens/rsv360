"use client"

import { Hotel } from "@/lib/hotels-data"
import { Star, MapPin } from "@/lib/lucide-icons"

interface MapTooltipProps {
  hotel: Hotel
  isVisible: boolean
  position: { x: number; y: number }
}

export function MapTooltip({ hotel, isVisible, position }: MapTooltipProps) {
  if (!isVisible) return null

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'luxury': return 'bg-purple-500'
      case 'premium': return 'bg-blue-500'
      case 'standard': return 'bg-green-500'
      case 'budget': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
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

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      } as React.CSSProperties}
    >
      <div className="bg-white rounded-lg shadow-lg border p-3 max-w-xs">
        {/* Nome e estrelas */}
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold text-sm truncate">{hotel.name}</h4>
          <div className="flex">
            {Array.from({ length: hotel.stars }, (_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>

        {/* Localização */}
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
          <MapPin className="w-3 h-3" />
          <span>{hotel.location}</span>
          <span>•</span>
          <span>{hotel.distanceFromCenter}km</span>
        </div>

        {/* Preço */}
        <div className="text-sm font-bold text-green-600 mb-2">
          R$ {hotel.price}
          {hotel.originalPrice && (
            <span className="text-xs text-gray-400 line-through ml-1">
              R$ {hotel.originalPrice}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getCategoryColor(hotel.category)}`}></div>
          <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(hotel.availability.status)}`}></div>
          <span className="text-xs text-gray-500">
            {hotel.availability.status === 'available' ? 'Disponível' :
             hotel.availability.status === 'limited' ? 'Poucas vagas' :
             hotel.availability.status === 'sold_out' ? 'Esgotado' : 'Em breve'}
          </span>
        </div>
      </div>
    </div>
  )
}
