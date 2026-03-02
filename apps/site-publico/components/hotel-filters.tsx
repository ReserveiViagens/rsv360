"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { MapPin, Star, DollarSign, Users, Wifi, Car, Utensils, Waves } from "lucide-react"
import { Hotel } from "@/lib/hotels-data"

interface FilterState {
  priceRange: [number, number]
  stars: number[]
  categories: string[]
  amenities: string[]
  availability: string[]
  distance: number
  searchTerm: string
}

interface HotelFiltersProps {
  hotels: Hotel[]
  onFiltersChange: (filteredHotels: Hotel[]) => void
  onMapToggle: () => void
  showMap: boolean
}

export function HotelFilters({ hotels, onFiltersChange, onMapToggle, showMap }: HotelFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [50, 1000],
    stars: [],
    categories: [],
    amenities: [],
    availability: [],
    distance: 50,
    searchTerm: ""
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const applyFilters = () => {
    let filtered = [...hotels]

    // Filtro por termo de busca
    if (filters.searchTerm) {
      filtered = filtered.filter(hotel =>
        hotel.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        hotel.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
    }

    // Filtro por faixa de preço
    filtered = filtered.filter(hotel =>
      hotel.price >= filters.priceRange[0] && hotel.price <= filters.priceRange[1]
    )

    // Filtro por estrelas
    if (filters.stars.length > 0) {
      filtered = filtered.filter(hotel => filters.stars.includes(hotel.stars))
    }

    // Filtro por categoria
    if (filters.categories.length > 0) {
      filtered = filtered.filter(hotel => filters.categories.includes(hotel.category))
    }

    // Filtro por amenidades
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(hotel =>
        filters.amenities.every(amenity => hotel.amenities.includes(amenity))
      )
    }

    // Filtro por disponibilidade
    if (filters.availability.length > 0) {
      filtered = filtered.filter(hotel => filters.availability.includes(hotel.availability.status))
    }

    // Filtro por distância
    filtered = filtered.filter(hotel => hotel.distanceFromCenter <= filters.distance)

    onFiltersChange(filtered)
  }

  const clearFilters = () => {
    setFilters({
      priceRange: [50, 1000],
      stars: [],
      categories: [],
      amenities: [],
      availability: [],
      distance: 50,
      searchTerm: ""
    })
    onFiltersChange(hotels)
  }

  const toggleStar = (star: number) => {
    setFilters(prev => ({
      ...prev,
      stars: prev.stars.includes(star)
        ? prev.stars.filter(s => s !== star)
        : [...prev.stars, star]
    }))
  }

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const toggleAvailability = (status: string) => {
    setFilters(prev => ({
      ...prev,
      availability: prev.availability.includes(status)
        ? prev.availability.filter(a => a !== status)
        : [...prev.availability, status]
    }))
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">🔍 Filtros Avançados</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Recolher" : "Expandir"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onMapToggle}
              className={showMap ? "bg-blue-100" : ""}
            >
              🗺️ {showMap ? "Ocultar Mapa" : "Ver Mapa"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca por texto */}
        <div>
          <label className="text-sm font-medium mb-2 block">Buscar hotéis</label>
          <Input
            placeholder="Nome, localização ou descrição..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Faixa de preço */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Preço: R$ {filters.priceRange[0]} - R$ {filters.priceRange[1]}
          </label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
            max={1000}
            min={50}
            step={25}
            className="w-full"
          />
        </div>

        {/* Estrelas */}
        <div>
          <label className="text-sm font-medium mb-2 block">Classificação</label>
          <div className="flex gap-2 flex-wrap">
            {[5, 4, 3, 2, 1].map(star => (
              <Button
                key={star}
                variant={filters.stars.includes(star) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleStar(star)}
                className="flex items-center gap-1"
              >
                <Star className="w-3 h-3" />
                {star}
              </Button>
            ))}
          </div>
        </div>

        {/* Categorias */}
        <div>
          <label className="text-sm font-medium mb-2 block">Categoria</label>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'luxury', label: 'Luxo', icon: '👑' },
              { key: 'premium', label: 'Premium', icon: '⭐' },
              { key: 'standard', label: 'Standard', icon: '🏨' },
              { key: 'budget', label: 'Econômico', icon: '💰' }
            ].map(category => (
              <Button
                key={category.key}
                variant={filters.categories.includes(category.key) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(category.key)}
              >
                {category.icon} {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Amenidades */}
        {isExpanded && (
          <div>
            <label className="text-sm font-medium mb-2 block">Amenidades</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'Wi-Fi', icon: <Wifi className="w-4 h-4" /> },
                { key: 'Piscina', icon: <Waves className="w-4 h-4" /> },
                { key: 'Estacionamento', icon: <Car className="w-4 h-4" /> },
                { key: 'Restaurante', icon: <Utensils className="w-4 h-4" /> },
                { key: 'Spa', icon: '🧘' },
                { key: 'Academia', icon: '💪' }
              ].map(amenity => (
                <div key={amenity.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity.key}
                    checked={filters.amenities.includes(amenity.key)}
                    onCheckedChange={() => toggleAmenity(amenity.key)}
                  />
                  <label htmlFor={amenity.key} className="text-sm flex items-center gap-1">
                    {typeof amenity.icon === 'string' ? amenity.icon : amenity.icon}
                    {amenity.key}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disponibilidade */}
        {isExpanded && (
          <div>
            <label className="text-sm font-medium mb-2 block">Disponibilidade</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'available', label: 'Disponível', color: 'bg-green-100 text-green-800' },
                { key: 'limited', label: 'Poucas vagas', color: 'bg-yellow-100 text-yellow-800' },
                { key: 'sold_out', label: 'Esgotado', color: 'bg-red-100 text-red-800' }
              ].map(status => (
                <Button
                  key={status.key}
                  variant={filters.availability.includes(status.key) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAvailability(status.key)}
                  className={filters.availability.includes(status.key) ? status.color : ""}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Distância do centro */}
        {isExpanded && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Distância do centro: {filters.distance} km
            </label>
            <Slider
              value={[filters.distance]}
              onValueChange={(value) => setFilters(prev => ({ ...prev, distance: value[0] }))}
              max={50}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={applyFilters} className="flex-1">
            🔍 Aplicar Filtros
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            🗑️ Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
