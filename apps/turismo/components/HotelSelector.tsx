"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, Search, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { brazilStates, searchHotels, type Hotel } from "@/lib/hotels-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

interface HotelSelectorProps {
  value?: {
    state?: string
    city?: string
    hotelId?: string
    hotelName?: string
  }
  onChange: (value: { state: string; city: string; hotelId: string; hotelName: string }) => void
  label?: string
  required?: boolean
}

export function HotelSelector({ 
  value, 
  onChange, 
  label = "Selecionar Hotel", 
  required = false 
}: HotelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedState, setSelectedState] = useState(value?.state || "")
  const [selectedCity, setSelectedCity] = useState(value?.city || "")

  // Get filtered hotels based on search
  const filteredHotels = useMemo(() => {
    if (!searchQuery) {
      // If no search, show hotels from selected state/city
      if (selectedState && selectedCity) {
        const state = brazilStates.find(s => s.name === selectedState)
        const city = state?.cities.find(c => c.name === selectedCity)
        return city?.hotels || []
      }
      // Show all hotels organized by state/city
      return brazilStates.flatMap((state) =>
        state.cities.flatMap((city) =>
          city.hotels.map((hotel) => ({
            ...hotel,
            displayName: `${hotel.name} - ${city.name}, ${state.code}`,
          })),
        ),
      )
    }
    // Search across all hotels
    return searchHotels(searchQuery).map((hotel) => ({
      ...hotel,
      displayName: `${hotel.name} - ${hotel.city}, ${hotel.state}`,
    }))
  }, [searchQuery, selectedState, selectedCity])

  const selectedHotel = value?.hotelId ? filteredHotels.find((h) => h.id === value.hotelId) : null

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName)
    setSelectedCity("")
    // Clear hotel selection when state changes
    if (value?.hotelId) {
      onChange({ state: stateName, city: "", hotelId: "", hotelName: "" })
    }
  }

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName)
    // Clear hotel selection when city changes
    if (value?.hotelId) {
      onChange({ state: selectedState, city: cityName, hotelId: "", hotelName: "" })
    }
  }

  const handleHotelSelect = (hotel: Hotel & { displayName?: string }) => {
    const state = brazilStates.find(s => s.name === hotel.state)
    const city = state?.cities.find(c => c.name === hotel.city)
    
    if (state && city) {
      setSelectedState(state.name)
      setSelectedCity(city.name)
      onChange({
        state: state.name,
        city: city.name,
        hotelId: hotel.id,
        hotelName: hotel.name
      })
    }
  }

  const availableCities = selectedState 
    ? brazilStates.find(s => s.name === selectedState)?.cities || []
    : []

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar hotel por nome, cidade ou estado..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* State and City Selectors */}
      {!searchQuery && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-gray-600">Estado</Label>
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {brazilStates.map((state) => (
                  <SelectItem key={state.code} value={state.name}>
                    {state.name} ({state.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-gray-600">Cidade</Label>
            <Select 
              value={selectedCity} 
              onValueChange={handleCityChange}
              disabled={!selectedState}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Hotel Selection */}
      <div>
        <Label className="text-sm text-gray-600">Hotel</Label>
        <Select 
          value={value?.hotelId || ""} 
          onValueChange={(hotelId) => {
            const hotel = filteredHotels.find(h => h.id === hotelId)
            if (hotel) {
              handleHotelSelect(hotel)
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o hotel" />
          </SelectTrigger>
          <SelectContent>
            {filteredHotels.map((hotel) => (
              <SelectItem key={hotel.id} value={hotel.id}>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{hotel.displayName || `${hotel.name} - ${hotel.city}, ${hotel.state}`}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Hotel Display */}
      {selectedHotel && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">{selectedHotel.name}</p>
              <p className="text-sm text-blue-700">{selectedHotel.city}, {selectedHotel.state}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
