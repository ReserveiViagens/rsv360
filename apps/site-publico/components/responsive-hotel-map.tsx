"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, ExternalLink, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "@/lib/lucide-icons"
import { Hotel } from "@/lib/hotels-data"
import { HotelPin } from "./hotel-pin"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { MapControls } from "./map-controls"
import { MapLegend } from "./map-legend"
import { MapMarkerInfo } from "./map-marker-info"
import { MapTooltip } from "./map-tooltip"
import { DeviceDebug } from "./device-debug"

interface ResponsiveHotelMapProps {
  hotels: Hotel[]
  selectedHotel?: Hotel | null
  onHotelSelect: (hotel: Hotel) => void
  userLocation?: { lat: number; lng: number }
}

export function ResponsiveHotelMap({ 
  hotels, 
  selectedHotel, 
  onHotelSelect, 
  userLocation 
}: ResponsiveHotelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [zoomLevel, setZoomLevel] = useState(13)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [markerInfo, setMarkerInfo] = useState<{
    hotel: Hotel | null
    isVisible: boolean
    position?: { x: number; y: number }
  }>({
    hotel: null,
    isVisible: false,
    position: undefined
  })
  const [tooltip, setTooltip] = useState<{
    hotel: Hotel | null
    isVisible: boolean
    position: { x: number; y: number }
  }>({
    hotel: null,
    isVisible: false,
    position: { x: 0, y: 0 }
  })
  
  const { isLoaded, loadError } = useGoogleMaps()
  const deviceInfo = useDeviceDetection()

  // Coordenadas do centro de Caldas Novas
  const caldasNovasCenter = { lat: -17.7444, lng: -48.6278 }

  // Inicializar mapa
  useEffect(() => {
    if (isLoaded && !map && mapRef.current) {
      initializeMap()
    }
  }, [isLoaded, map])

  // Atualizar zoom level
  useEffect(() => {
    if (map) {
      const listener = map.addListener('zoom_changed', () => {
        setZoomLevel(map.getZoom())
      })
      return () => window.google?.maps?.event?.removeListener(listener)
    }
  }, [map])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: caldasNovasCenter,
      zoom: deviceInfo.isMobile ? 12 : deviceInfo.isTV ? 14 : 13,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      zoomControl: !deviceInfo.isMobile,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false
    })

    setMap(mapInstance)
    addHotelMarkers(mapInstance)
  }

  const addHotelMarkers = (mapInstance: any) => {
    if (!window.google) return
    
    const newMarkers: any[] = []

    hotels.forEach((hotel) => {
      // Criar elemento HTML personalizado para o pin
      const pinElement = document.createElement('div')
      pinElement.innerHTML = `
        <div class="hotel-pin-container">
          <div class="hotel-pin-content"></div>
        </div>
      `
      
      const marker = new window.google.maps.Marker({
        position: hotel.coordinates,
        map: mapInstance,
        title: hotel.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${getCategoryColor(hotel.category)}" stroke="white" stroke-width="2"/>
              <circle cx="20" cy="20" r="6" fill="${getAvailabilityColor(hotel.availability.status)}"/>
              <text x="20" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${hotel.stars}</text>
            </svg>
          `),
          scaledSize: { width: 40, height: 40 },
          anchor: { x: 20, y: 40 }
        }
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(hotel)
      })

      // Evento de hover para tooltip
      marker.addListener('mouseover', (event: any) => {
        setTooltip({
          hotel: hotel,
          isVisible: true,
          position: {
            x: event.pixel?.x || 0,
            y: event.pixel?.y || 0
          }
        })
      })

      marker.addListener('mouseout', () => {
        setTooltip({
          hotel: null,
          isVisible: false,
          position: { x: 0, y: 0 }
        })
      })

      marker.addListener('click', (event: any) => {
        onHotelSelect(hotel)
        
        // Mostrar informações do marcador
        setMarkerInfo({
          hotel: hotel,
          isVisible: true,
          position: {
            x: event.pixel?.x || window.innerWidth / 2,
            y: event.pixel?.y || window.innerHeight / 2
          }
        })
        
        // Fechar tooltip
        setTooltip({
          hotel: null,
          isVisible: false,
          position: { x: 0, y: 0 }
        })
        
        // Fechar infoWindow se estiver aberto
        if (infoWindow && typeof infoWindow.close === 'function') {
          infoWindow.close()
        }
        
        // Centralizar no hotel
        mapInstance.setCenter(hotel.coordinates)
        mapInstance.setZoom(Math.max(zoomLevel, 15))
      })

      newMarkers.push({ marker, infoWindow, hotel })
    })

    setMarkers(newMarkers)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'luxury': return '#8B5CF6'
      case 'premium': return '#3B82F6'
      case 'standard': return '#10B981'
      case 'budget': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981'
      case 'limited': return '#F59E0B'
      case 'sold_out': return '#EF4444'
      case 'coming_soon': return '#6B7280'
      default: return '#6B7280'
    }
  }

  const createInfoWindowContent = (hotel: Hotel) => {
    return `
      <div class="p-3 max-w-xs">
        <div class="flex items-center gap-2 mb-2">
          <div class="flex">
            ${Array.from({ length: hotel.stars }, (_, i) => '⭐').join('')}
          </div>
          <span class="text-sm font-bold">${hotel.name}</span>
        </div>
        <div class="text-sm text-gray-600 mb-2">${hotel.location}</div>
        <div class="flex items-center gap-1 mb-2">
          <span class="text-lg font-bold text-green-600">R$ ${hotel.price}</span>
          ${hotel.originalPrice ? `<span class="text-sm text-gray-400 line-through">R$ ${hotel.originalPrice}</span>` : ''}
        </div>
        <div class="flex items-center gap-1 mb-2">
          <span class="text-xs px-2 py-1 rounded ${getAvailabilityBadgeClass(hotel.availability.status)}">
            ${getAvailabilityText(hotel.availability.status)}
          </span>
          ${hotel.availability.roomsAvailable ? `<span class="text-xs text-gray-500">${hotel.availability.roomsAvailable} quartos</span>` : ''}
        </div>
        <div class="text-xs text-gray-500">
          ${hotel.distanceFromCenter}km do centro • ${hotel.maxGuests} pessoas
        </div>
      </div>
    `
  }

  const getAvailabilityBadgeClass = (status: string) => {
    const classes = {
      available: 'bg-green-100 text-green-800',
      limited: 'bg-yellow-100 text-yellow-800',
      sold_out: 'bg-red-100 text-red-800',
      coming_soon: 'bg-gray-100 text-gray-800'
    }
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
  }

  const getAvailabilityText = (status: string) => {
    const texts = {
      available: 'Disponível',
      limited: 'Poucas vagas',
      sold_out: 'Esgotado',
      coming_soon: 'Em breve'
    }
    return texts[status as keyof typeof texts] || 'Indisponível'
  }

  const centerOnUserLocation = () => {
    if (userLocation && map) {
      map.setCenter(userLocation)
      map.setZoom(15)
    }
  }

  const centerOnCaldasNovas = () => {
    if (map) {
      map.setCenter(caldasNovasCenter)
      map.setZoom(deviceInfo.isMobile ? 12 : 13)
    }
  }

  const zoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom() + 1)
    }
  }

  const zoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const closeMarkerInfo = () => {
    setMarkerInfo({
      hotel: null,
      isVisible: false,
      position: undefined
    })
  }

  const selectHotelFromMarker = (hotel: Hotel) => {
    onHotelSelect(hotel)
    closeMarkerInfo()
  }

  if (loadError) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">🗺️ Mapa de Hotéis</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Mapa Indisponível
            </h3>
            <p className="text-gray-600 mb-4">
              Configure a chave da Google Maps API para visualizar o mapa interativo
            </p>
            <Button onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=-17.7444,-48.6278', '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir no Google Maps
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

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

  return (
    <Card className={`w-full ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          {/* Título */}
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">🗺️ Mapa de Hotéis</CardTitle>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Controles responsivos */}
          <MapControls
            onCenterMap={centerOnCaldasNovas}
            onUserLocation={userLocation ? centerOnUserLocation : undefined}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
            hasUserLocation={!!userLocation}
            isMobile={deviceInfo.isMobile}
            deviceType={deviceInfo.type}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          className={`w-full ${
            isFullscreen 
              ? 'h-[calc(100vh-120px)]' 
              : deviceInfo.isTV 
                ? 'h-[600px]' 
                : deviceInfo.isDesktop 
                  ? 'h-96' 
                  : deviceInfo.isTablet 
                    ? 'h-80' 
                    : 'h-72'
          } rounded-lg`}
        />
        
        {/* Legenda responsiva */}
        <MapLegend
          hotelCount={hotels.length}
          zoomLevel={zoomLevel}
          isMobile={deviceInfo.isMobile}
          deviceType={deviceInfo.type}
        />
      </CardContent>

      {/* Informações do marcador */}
      {markerInfo.hotel && (
        <MapMarkerInfo
          hotel={markerInfo.hotel}
          isVisible={markerInfo.isVisible}
          onClose={closeMarkerInfo}
          onSelect={selectHotelFromMarker}
          position={markerInfo.position}
        />
      )}

      {/* Tooltip do marcador */}
      {tooltip.hotel && (
        <MapTooltip
          hotel={tooltip.hotel}
          isVisible={tooltip.isVisible}
          position={tooltip.position}
        />
      )}

      {/* Debug do dispositivo (apenas em desenvolvimento) */}
      <DeviceDebug />
    </Card>
  )
}

