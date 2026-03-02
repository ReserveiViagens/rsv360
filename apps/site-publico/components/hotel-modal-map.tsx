"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface HotelModalMapProps {
  hotelName: string
  coordinates: { lat: number; lng: number }
  address?: string
}

export function HotelModalMap({ hotelName, coordinates, address }: HotelModalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapLoaded) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    // Se não tiver API key, usar mapa estático do Google
    if (!apiKey) {
      setMapError(true)
      return
    }

    // Verificar se Google Maps já está carregado
    if (typeof window !== 'undefined' && (window as any).google) {
      initializeMap()
      return
    }

    // Carregar Google Maps API
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      initializeMap()
    }
    script.onerror = () => {
      setMapError(true)
    }
    document.head.appendChild(script)

    function initializeMap() {
      if (!mapRef.current || !(window as any).google) return

      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      })

      // Adicionar marcador
      new (window as any).google.maps.Marker({
        position: coordinates,
        map: map,
        title: hotelName,
        animation: (window as any).google.maps.Animation.DROP,
      })

      setMapLoaded(true)
    }

    return () => {
      // Cleanup
    }
  }, [coordinates, hotelName, mapLoaded])

  // Fallback: Mapa estático do Google
  if (mapError || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=15&size=600x300&markers=color:red%7C${coordinates.lat},${coordinates.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}`
    
    return (
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-gray-900">{hotelName}</h4>
                {address && <p className="text-sm text-gray-600">{address}</p>}
              </div>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden border">
              <img
                src={staticMapUrl}
                alt={`Localização do ${hotelName}`}
                className="w-full h-full object-cover"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all"
              >
                <div className="bg-white px-4 py-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-sm font-semibold text-gray-900">Abrir no Google Maps</span>
                </div>
              </a>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <Navigation className="w-4 h-4" />
              <span>Ver rotas no Google Maps</span>
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="font-semibold text-gray-900">{hotelName}</h4>
              {address && <p className="text-sm text-gray-600">{address}</p>}
            </div>
          </div>
          {!mapLoaded && (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Carregando mapa...</p>
              </div>
            </div>
          )}
          <div
            ref={mapRef}
            className="aspect-video rounded-lg overflow-hidden border"
            style={{ display: mapLoaded ? 'block' : 'none' }}
          />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Navigation className="w-4 h-4" />
            <span>Ver rotas no Google Maps</span>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
