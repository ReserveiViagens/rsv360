"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Star, DollarSign, Users } from "@/lib/lucide-icons"
import { Hotel } from "@/lib/hotels-data"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import { SimpleHotelMap } from "./simple-hotel-map"
import { ResponsiveHotelMap } from "./responsive-hotel-map"

interface HotelMapProps {
  hotels: Hotel[]
  selectedHotel?: Hotel | null
  onHotelSelect: (hotel: Hotel) => void
  userLocation?: { lat: number; lng: number }
}

export function HotelMap({ hotels, selectedHotel, onHotelSelect, userLocation }: HotelMapProps) {
  const { isLoaded, loadError } = useGoogleMaps()

  // Se há erro de carregamento, usar mapa simples
  if (loadError) {
    return (
      <SimpleHotelMap 
        hotels={hotels}
        selectedHotel={selectedHotel}
        onHotelSelect={onHotelSelect}
        userLocation={userLocation}
      />
    )
  }

  // Se não carregou ainda, mostrar loading
  if (!isLoaded) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando mapa...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Usar mapa responsivo com Google Maps
  return (
    <ResponsiveHotelMap
      hotels={hotels}
      selectedHotel={selectedHotel}
      onHotelSelect={onHotelSelect}
      userLocation={userLocation}
    />
  )
}
