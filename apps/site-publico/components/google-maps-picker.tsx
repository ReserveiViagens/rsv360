"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Loader2, Navigation } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface GoogleMapsPickerProps {
  value?: {
    address: string
    city: string
    state: string
    zip_code: string
    country: string
    latitude?: number
    longitude?: number
  }
  onChange?: (location: {
    address: string
    city: string
    state: string
    zip_code: string
    country: string
    latitude: number
    longitude: number
  }) => void
  apiKey?: string
}

export function GoogleMapsPicker({ value, onChange, apiKey }: GoogleMapsPickerProps) {
  const [address, setAddress] = useState(value?.address || '')
  const [city, setCity] = useState(value?.city || '')
  const [state, setState] = useState(value?.state || '')
  const [zipCode, setZipCode] = useState(value?.zip_code || '')
  const [lat, setLat] = useState(value?.latitude || 0)
  const [lng, setLng] = useState(value?.longitude || 0)
  const [loading, setLoading] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [autocomplete, setAutocomplete] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  // Carregar Google Maps API
  useEffect(() => {
    if (!apiKey && typeof window !== 'undefined') {
      // Tentar pegar da variável de ambiente ou usar uma chave pública de teste
      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
      if (!key) {
        console.warn('Google Maps API Key não configurada. Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
        return
      }
    }

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        initializeMap()
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [apiKey])

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return

    // Inicializar mapa
    const map = new window.google.maps.Map(mapRef.current, {
      center: lat && lng ? { lat, lng } : { lat: -17.7444, lng: -48.6278 }, // Caldas Novas como padrão
      zoom: lat && lng ? 15 : 10,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    })

    mapInstanceRef.current = map

    // Criar marcador
    if (lat && lng) {
      const marker = new window.google.maps.Marker({
        map,
        position: { lat, lng },
        draggable: true,
        title: 'Arraste para ajustar a localização'
      })

      markerRef.current = marker

      marker.addListener('dragend', () => {
        const position = marker.getPosition()
        if (position) {
          const newLat = position.lat()
          const newLng = position.lng()
          setLat(newLat)
          setLng(newLng)
          reverseGeocode(newLat, newLng)
        }
      })
    }

    // Inicializar autocomplete
    if (inputRef.current) {
      const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'br' }
      })

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace()
        if (place.geometry) {
          const location = place.geometry.location
          const newLat = location.lat()
          const newLng = location.lng()
          
          setLat(newLat)
          setLng(newLng)
          
          // Atualizar endereço
          const addressComponents = place.address_components || []
          let street = ''
          let number = ''
          let cityName = ''
          let stateName = ''
          let zip = ''

          addressComponents.forEach((component: any) => {
            const types = component.types
            if (types.includes('street_number')) number = component.long_name
            if (types.includes('route')) street = component.long_name
            if (types.includes('locality')) cityName = component.long_name
            if (types.includes('administrative_area_level_1')) stateName = component.short_name
            if (types.includes('postal_code')) zip = component.long_name
          })

          const fullAddress = `${street}${number ? ', ' + number : ''}`
          setAddress(fullAddress)
          setCity(cityName)
          setState(stateName)
          setZipCode(zip)

          // Atualizar mapa
          map.setCenter({ lat: newLat, lng: newLng })
          map.setZoom(15)

          // Atualizar marcador
          if (markerRef.current) {
            markerRef.current.setPosition({ lat: newLat, lng: newLng })
          } else {
            markerRef.current = new window.google.maps.Marker({
              map,
              position: { lat: newLat, lng: newLng },
              draggable: true
            })
            markerRef.current.addListener('dragend', () => {
              const position = markerRef.current.getPosition()
              if (position) {
                const newLat = position.lat()
                const newLng = position.lng()
                setLat(newLat)
                setLng(newLng)
                reverseGeocode(newLat, newLng)
              }
            })
          }

          // Notificar mudança
          onChange?.({
            address: fullAddress,
            city: cityName,
            state: stateName,
            zip_code: zip,
            country: 'Brasil',
            latitude: newLat,
            longitude: newLng
          })
        }
      })

      setAutocomplete(autocompleteInstance)
    }

    setMapLoaded(true)
  }

  const reverseGeocode = async (latitude: number, longitude: number) => {
    if (!window.google) return

    setLoading(true)
    const geocoder = new window.google.maps.Geocoder()
    
    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      setLoading(false)
      if (status === 'OK' && results && results[0]) {
        const place = results[0]
        const addressComponents = place.address_components || []
        
        let street = ''
        let number = ''
        let cityName = ''
        let stateName = ''
        let zip = ''

        addressComponents.forEach((component: any) => {
          const types = component.types
          if (types.includes('street_number')) number = component.long_name
          if (types.includes('route')) street = component.long_name
          if (types.includes('locality')) cityName = component.long_name
          if (types.includes('administrative_area_level_1')) stateName = component.short_name
          if (types.includes('postal_code')) zip = component.long_name
        })

        const fullAddress = `${street}${number ? ', ' + number : ''}`
        setAddress(fullAddress)
        setCity(cityName)
        setState(stateName)
        setZipCode(zip)

        onChange?.({
          address: fullAddress,
          city: cityName,
          state: stateName,
          zip_code: zip,
          country: 'Brasil',
          latitude,
          longitude
        })
      }
    })
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada pelo seu navegador')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLat(latitude)
        setLng(longitude)
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude })
          mapInstanceRef.current.setZoom(15)
        }

        if (markerRef.current) {
          markerRef.current.setPosition({ lat: latitude, lng: longitude })
        } else if (mapInstanceRef.current) {
          markerRef.current = new window.google.maps.Marker({
            map: mapInstanceRef.current,
            position: { lat: latitude, lng: longitude },
            draggable: true
          })
          markerRef.current.addListener('dragend', () => {
            const position = markerRef.current.getPosition()
            if (position) {
              const newLat = position.lat()
              const newLng = position.lng()
              setLat(newLat)
              setLng(newLng)
              reverseGeocode(newLat, newLng)
            }
          })
        }

        reverseGeocode(latitude, longitude)
      },
      (error) => {
        setLoading(false)
        alert('Erro ao obter localização: ' + error.message)
      }
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Endereço</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="pl-10"
            placeholder="Digite o endereço ou arraste o marcador no mapa"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Use o autocomplete ou arraste o marcador no mapa para ajustar
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cidade</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <Label>Estado</Label>
          <Input value={state} onChange={(e) => setState(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Label>CEP</Label>
          <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCurrentLocation}
            disabled={loading}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Minha Localização
          </Button>
        </div>
      </div>

      {lat && lng && (
        <div className="text-sm text-gray-600">
          Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
        </div>
      )}

      <Card className="overflow-hidden">
        <div
          ref={mapRef}
          className="w-full h-64 bg-gray-200"
          style={{ minHeight: '256px' }}
        />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Carregando mapa...</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// Declaração de tipos para window.google
declare global {
  interface Window {
    google: any
  }
}

