"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, ExternalLink, Star } from "lucide-react"
import { Hotel } from "@/lib/hotels-data"

interface SimpleHotelMapProps {
  hotels: Hotel[]
  selectedHotel?: Hotel | null
  onHotelSelect: (hotel: Hotel) => void
  userLocation?: { lat: number; lng: number }
}

export function SimpleHotelMap({ hotels, selectedHotel, onHotelSelect, userLocation }: SimpleHotelMapProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const openInGoogleMaps = (hotel: Hotel) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hotel.coordinates.lat},${hotel.coordinates.lng}`
    window.open(url, '_blank')
  }

  const openAllInGoogleMaps = () => {
    const centerLat = -17.7444
    const centerLng = -48.6278
    const url = `https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLng}`
    window.open(url, '_blank')
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'luxury': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'premium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'standard': return 'bg-green-100 text-green-800 border-green-200'
      case 'budget': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'limited': return 'bg-yellow-100 text-yellow-800'
      case 'sold_out': return 'bg-red-100 text-red-800'
      case 'coming_soon': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">🗺️ Localização dos Hotéis</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={openAllInGoogleMaps}>
              <ExternalLink className="w-4 h-4 mr-1" />
              Ver no Google Maps
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grade
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Mapa visual simples */}
        <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg m-4 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Caldas Novas - GO
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {hotels.length} hotéis disponíveis
              </p>
              <Button onClick={openAllInGoogleMaps} size="sm">
                <Navigation className="w-4 h-4 mr-1" />
                Abrir no Google Maps
              </Button>
            </div>
          </div>
          
          {/* Pontos no mapa */}
          <div className="absolute inset-0">
            {hotels.slice(0, 20).map((hotel, index) => (
              <div
                key={hotel.id}
                className={`absolute w-3 h-3 rounded-full cursor-pointer transition-all hover:scale-125 ${
                  selectedHotel?.id === hotel.id 
                    ? 'bg-red-500 ring-2 ring-red-300' 
                    : getCategoryColor(hotel.category).split(' ')[0]
                }`}
                style={{
                  left: `${20 + (index % 4) * 20}%`,
                  top: `${30 + (index % 5) * 15}%`
                } as React.CSSProperties}
                onClick={() => onHotelSelect(hotel)}
                title={hotel.name}
              />
            ))}
          </div>
        </div>
        
        {/* Lista de hotéis */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Hotéis por Localização</h4>
            <Badge variant="outline">
              {hotels.length} hotéis
            </Badge>
          </div>
          
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 gap-3' 
              : 'space-y-2'
          } max-h-80 overflow-y-auto`}>
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedHotel?.id === hotel.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onHotelSelect(hotel)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm">{hotel.name}</h5>
                      <div className="flex">
                        {Array.from({ length: hotel.stars }, (_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{hotel.location}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{hotel.distanceFromCenter}km do centro</span>
                      <span>•</span>
                      <span>{hotel.rating} ({hotel.reviewCount} avaliações)</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Badge className={`text-xs ${getCategoryColor(hotel.category)}`}>
                        {hotel.category === 'luxury' ? 'Luxo' : 
                         hotel.category === 'premium' ? 'Premium' :
                         hotel.category === 'standard' ? 'Standard' : 'Econômico'}
                      </Badge>
                      <Badge className={`text-xs ${getAvailabilityColor(hotel.availability.status)}`}>
                        {hotel.availability.status === 'available' ? 'Disponível' :
                         hotel.availability.status === 'limited' ? 'Poucas vagas' :
                         hotel.availability.status === 'sold_out' ? 'Esgotado' : 'Em breve'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openInGoogleMaps(hotel)
                    }}
                    className="p-1"
                  >
                    <MapPin className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
