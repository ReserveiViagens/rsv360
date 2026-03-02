"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, Search, MapPin, Clock, Users, Star, Globe, Calendar, Bus, User, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { brazilStatesWithTours, searchTours, tourTypes, type Tour } from "@/lib/tours-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TourSelection {
  state?: string
  city?: string
  tour?: Tour
}

interface TourSelectorProps {
  value?: TourSelection
  onChange?: (selection: TourSelection) => void
  required?: boolean
}

export function TourSelector({ value, onChange, required = false }: TourSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [isSearchMode, setIsSearchMode] = useState(false)

  // Busca de tours
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    let results = searchTours(searchQuery)
    if (selectedType && selectedType !== "all") {
      results = results.filter(tour => tour.type === selectedType)
    }
    return results.slice(0, 10) // Limitar a 10 resultados
  }, [searchQuery, selectedType])

  // Estados disponíveis
  const availableStates = brazilStatesWithTours

  // Cidades do estado selecionado
  const availableCities = useMemo(() => {
    if (!value?.state) return []
    const state = availableStates.find(s => s.name === value.state)
    return state?.cities || []
  }, [value?.state, availableStates])

  // Tours da cidade selecionada
  const availableTours = useMemo(() => {
    if (!value?.city) return []
    const city = availableCities.find(c => c.name === value.city)
    let tours = city?.tours || []
    if (selectedType && selectedType !== "all") {
      tours = tours.filter(tour => tour.type === selectedType)
    }
    return tours
  }, [value?.city, availableCities, selectedType])

  const handleStateChange = (stateName: string) => {
    onChange?.({
      state: stateName,
      city: undefined,
      tour: undefined,
    })
  }

  const handleCityChange = (cityName: string) => {
    onChange?.({
      ...value,
      city: cityName,
      tour: undefined,
    })
  }

  const handleTourChange = (tour: Tour) => {
    onChange?.({
      ...value,
      tour: tour,
    })
  }

  const handleSearchSelect = (tour: Tour) => {
    onChange?.({
      state: tour.state,
      city: tour.city,
      tour: tour,
    })
    setSearchQuery("")
    setIsSearchMode(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'bg-green-100 text-green-800'
      case 'moderado': return 'bg-yellow-100 text-yellow-800'
      case 'dificil': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'Fácil'
      case 'moderado': return 'Moderado'
      case 'dificil': return 'Difícil'
      default: return difficulty
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtro por Tipo de Tour */}
      <div>
        <Label htmlFor="tour-type">Tipo de Passeio (Opcional)</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {tourTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center space-x-2">
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedType && selectedType !== "all" && (
          <p className="text-sm text-gray-500 mt-1">
            {tourTypes.find(t => t.value === selectedType)?.description}
          </p>
        )}
      </div>

      {/* Busca Rápida */}
      <div>
        <Label htmlFor="tour-search">Busca Rápida</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="tour-search"
            type="text"
            placeholder="Digite o nome do passeio, cidade ou estado..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsSearchMode(e.target.value.length > 0)
            }}
            className="pl-10"
          />
        </div>

        {/* Resultados da Busca */}
        {isSearchMode && searchResults.length > 0 && (
          <div className="mt-2 border border-gray-200 rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((tour) => (
              <button
                key={tour.id}
                onClick={() => handleSearchSelect(tour)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{tour.name}</div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {tour.city}, {tour.state}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
                      <span>{tourTypes.find(t => t.value === tour.type)?.label}</span>
                      <span>•</span>
                      <span>{tour.duration}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1 ml-3">
                    {tour.hasGroupDiscount && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Desconto Grupo
                      </span>
                    )}
                    {tour.transportIncluded && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Transporte
                      </span>
                    )}
                    {tour.mealIncluded && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        Refeição
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {isSearchMode && searchQuery && searchResults.length === 0 && (
          <div className="mt-2 p-3 text-center text-gray-500 text-sm border border-gray-200 rounded-md">
            Nenhum passeio encontrado para "{searchQuery}"
          </div>
        )}
      </div>

      {/* Seleção Hierárquica */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="state-select">Estado</Label>
          <Select value={value?.state || ""} onValueChange={handleStateChange}>
            <SelectTrigger id="state-select">
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {availableStates.map((state) => (
                <SelectItem key={state.code} value={state.name}>
                  {state.name} ({state.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {value?.state && (
          <div>
            <Label htmlFor="city-select">Cidade</Label>
            <Select value={value?.city || ""} onValueChange={handleCityChange}>
              <SelectTrigger id="city-select">
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{city.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {city.tours.length} passeio{city.tours.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {value?.city && availableTours.length > 0 && (
          <div>
            <Label htmlFor="tour-select">Passeio</Label>
            <Select 
              value={value?.tour?.id || ""} 
              onValueChange={(tourId) => {
                const tour = availableTours.find(t => t.id === tourId)
                if (tour) handleTourChange(tour)
              }}
            >
              <SelectTrigger id="tour-select">
                <SelectValue placeholder="Selecione o passeio" />
              </SelectTrigger>
              <SelectContent>
                {availableTours.map((tour) => (
                  <SelectItem key={tour.id} value={tour.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <span>{tourTypes.find(t => t.value === tour.type)?.label.split(' ')[0]}</span>
                        <span>{tour.name}</span>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        {tour.hasGroupDiscount && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" title="Desconto para grupos"></span>
                        )}
                        {tour.transportIncluded && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full" title="Transporte incluído"></span>
                        )}
                        {tour.guideIncluded && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full" title="Guia incluído"></span>
                        )}
                        {tour.mealIncluded && (
                          <span className="w-2 h-2 bg-orange-500 rounded-full" title="Refeição incluída"></span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Informações do Tour Selecionado */}
      {value?.tour && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <span>{tourTypes.find(t => t.value === value.tour.type)?.label.split(' ')[0]}</span>
            <span>{value.tour.name}</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{value.tour.city}, {value.tour.state}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Duração: {value.tour.duration}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Saída: {value.tour.departureTime}
                  {value.tour.returnTime && ` - Retorno: ${value.tour.returnTime}`}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  {value.tour.minParticipants} - {value.tour.maxParticipants} pessoas
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(value.tour.difficulty)}`}>
                  {getDifficultyLabel(value.tour.difficulty)}
                </span>

                {value.tour.hasGroupDiscount && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Desconto Grupo</span>
                  </span>
                )}
                
                {value.tour.transportIncluded && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center space-x-1">
                    <Bus className="w-3 h-3" />
                    <span>Transporte</span>
                  </span>
                )}
                
                {value.tour.guideIncluded && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>Guia</span>
                  </span>
                )}

                {value.tour.mealIncluded && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center space-x-1">
                    <Utensils className="w-3 h-3" />
                    <span>Refeição</span>
                  </span>
                )}

                {value.tour.weatherDependent && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Dep. Clima
                  </span>
                )}
              </div>
              
              {value.tour.website && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Globe className="w-4 h-4" />
                  <a 
                    href={value.tour.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    Site oficial
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {value.tour.description && (
            <div className="mb-4 pb-3 border-b border-gray-200">
              <p className="text-sm text-gray-600">{value.tour.description}</p>
            </div>
          )}

          <div className="mb-4 pb-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Ponto de Encontro:
            </p>
            <p className="text-sm text-gray-600">{value.tour.meetingPoint}</p>
          </div>
          
          {value.tour.includes && value.tour.includes.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Inclui:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {value.tour.includes.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {value.tour.excludes && value.tour.excludes.length > 0 && (
            <div className="mb-4 pb-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Não inclui:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {value.tour.excludes.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {value.tour.ticketTypes && value.tour.ticketTypes.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Tipos de ingresso disponíveis: {value.tour.ticketTypes.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {value.tour.ticketTypes.map((ticket) => (
                  <span key={ticket.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    {ticket.name} - R$ {ticket.basePrice.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {required && !value?.tour && (
        <p className="text-sm text-red-600 mt-1">
          Por favor, selecione um passeio para continuar.
        </p>
      )}
    </div>
  )
}