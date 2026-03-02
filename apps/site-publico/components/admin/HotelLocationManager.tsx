"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Navigation, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface HotelLocationManagerProps {
  location: string
  coordinates?: { lat: number; lng: number }
  distanceFromCenter?: number
  onChange: (data: {
    location: string
    coordinates?: { lat: number; lng: number }
    distanceFromCenter?: number
  }) => void
}

export function HotelLocationManager({
  location,
  coordinates,
  distanceFromCenter,
  onChange
}: HotelLocationManagerProps) {
  const [address, setAddress] = useState(location)
  const [lat, setLat] = useState(coordinates?.lat?.toString() || "")
  const [lng, setLng] = useState(coordinates?.lng?.toString() || "")
  const [distance, setDistance] = useState(distanceFromCenter?.toString() || "")
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setAddress(location)
  }, [location])

  useEffect(() => {
    if (coordinates) {
      setLat(coordinates.lat.toString())
      setLng(coordinates.lng.toString())
    }
  }, [coordinates])

  useEffect(() => {
    if (distanceFromCenter !== undefined) {
      setDistance(distanceFromCenter.toString())
    }
  }, [distanceFromCenter])

  const handleAddressChange = (value: string) => {
    setAddress(value)
    onChange({
      location: value,
      coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : coordinates,
      distanceFromCenter: distance ? parseFloat(distance) : distanceFromCenter
    })
  }

  const handleCoordinatesChange = () => {
    const latValue = parseFloat(lat)
    const lngValue = parseFloat(lng)
    
    if (!isNaN(latValue) && !isNaN(lngValue)) {
      onChange({
        location: address,
        coordinates: { lat: latValue, lng: lngValue },
        distanceFromCenter: distance ? parseFloat(distance) : distanceFromCenter
      })
    }
  }

  const handleDistanceChange = (value: string) => {
    setDistance(value)
    const distanceValue = parseFloat(value)
    onChange({
      location: address,
      coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : coordinates,
      distanceFromCenter: !isNaN(distanceValue) ? distanceValue : undefined
    })
  }

  // Carregar Google Maps para seleção de localização
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    if (typeof window !== 'undefined' && (window as any).google) {
      initializeMap()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      initializeMap()
    }
    document.head.appendChild(script)

    function initializeMap() {
      if (!mapRef.current || !(window as any).google) return

      const defaultCenter = coordinates || { lat: -17.7444, lng: -48.6278 } // Caldas Novas
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      })

      let marker: any = null

      if (coordinates) {
        marker = new (window as any).google.maps.Marker({
          position: coordinates,
          map: map,
          draggable: true
        })

        marker.addListener('dragend', (e: any) => {
          const newLat = e.latLng.lat()
          const newLng = e.latLng.lng()
          setLat(newLat.toString())
          setLng(newLng.toString())
          onChange({
            location: address,
            coordinates: { lat: newLat, lng: newLng },
            distanceFromCenter: distance ? parseFloat(distance) : distanceFromCenter
          })
        })
      }

      // Adicionar busca de endereço (se o elemento existir)
      const searchInput = document.getElementById('address-search') as HTMLInputElement
      if (searchInput) {
        const searchBox = new (window as any).google.maps.places.SearchBox(searchInput)

        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces()
          if (places.length === 0) return

          const place = places[0]
          if (!place.geometry) return

          const newLat = place.geometry.location.lat()
          const newLng = place.geometry.location.lng()

          setLat(newLat.toString())
          setLng(newLng.toString())
          setAddress(place.formatted_address || place.name || address)

          if (marker) {
            marker.setPosition({ lat: newLat, lng: newLng })
          } else {
            marker = new (window as any).google.maps.Marker({
              position: { lat: newLat, lng: newLng },
              map: map,
              draggable: true
            })

            marker.addListener('dragend', (e: any) => {
              const dragLat = e.latLng.lat()
              const dragLng = e.latLng.lng()
              setLat(dragLat.toString())
              setLng(dragLng.toString())
              onChange({
                location: address,
                coordinates: { lat: dragLat, lng: dragLng },
                distanceFromCenter: distance ? parseFloat(distance) : distanceFromCenter
              })
            })
          }

          map.setCenter({ lat: newLat, lng: newLng })

          onChange({
            location: place.formatted_address || place.name || address,
            coordinates: { lat: newLat, lng: newLng },
            distanceFromCenter: distance ? parseFloat(distance) : distanceFromCenter
          })
        })

        map.controls[(window as any).google.maps.ControlPosition.TOP_LEFT].push(
          document.getElementById('address-search') as HTMLElement
        )

        setMapLoaded(true)
      }
    }

    return () => {
      // Cleanup se necessário
    }
  }, [coordinates, address, distance])

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Localização</Label>

      {/* Endereço */}
      <div className="space-y-2">
        <Label htmlFor="address">Endereço / Localização *</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="Ex: Caldas Novas, GO"
        />
      </div>

      {/* Busca de endereço (será posicionado no mapa) */}
      <div id="address-search" className="hidden">
        <Input
          type="text"
          placeholder="Buscar endereço no mapa..."
          className="w-64"
        />
      </div>

      {/* Coordenadas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => {
              setLat(e.target.value)
              handleCoordinatesChange()
            }}
            onBlur={handleCoordinatesChange}
            placeholder="-17.7444"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => {
              setLng(e.target.value)
              handleCoordinatesChange()
            }}
            onBlur={handleCoordinatesChange}
            placeholder="-48.6278"
          />
        </div>
      </div>

      {/* Distância do centro */}
      <div className="space-y-2">
        <Label htmlFor="distance">Distância do Centro (km)</Label>
        <Input
          id="distance"
          type="number"
          step="0.1"
          value={distance}
          onChange={(e) => handleDistanceChange(e.target.value)}
          placeholder="0.0"
        />
      </div>

      {/* Mapa */}
      {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
        <div className="space-y-2">
          <Label>Selecionar Localização no Mapa</Label>
          <Card>
            <CardContent className="p-0">
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
            </CardContent>
          </Card>
          <p className="text-xs text-gray-500">
            💡 Arraste o marcador no mapa para ajustar a localização ou busque um endereço
          </p>
        </div>
      ) : (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Google Maps API Key não configurada. Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para usar o mapa interativo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
