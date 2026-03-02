"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, Search, MapPin, Clock, Users, Star, Globe, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { brazilStatesWithAttractions, searchAttractions, attractionTypes, type Attraction } from "@/lib/attractions-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AttractionSelection {
  state?: string
  city?: string
  attraction?: Attraction
}

interface AttractionSelectorProps {
  value?: AttractionSelection
  onChange?: (selection: AttractionSelection) => void
  required?: boolean
}

export function AttractionSelector({ value, onChange, required = false }: AttractionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [isSearchMode, setIsSearchMode] = useState(false)

  // Busca de atrações
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    let results = searchAttractions(searchQuery)
    if (selectedType && selectedType !== "all") {
      results = results.filter(attraction => attraction.type === selectedType)
    }
    return results.slice(0, 10) // Limitar a 10 resultados
  }, [searchQuery, selectedType])

  // Estados disponíveis
  const availableStates = brazilStatesWithAttractions

  // Cidades do estado selecionado
  const availableCities = useMemo(() => {
    if (!value?.state) return []
    const state = availableStates.find(s => s.name === value.state)
    return state?.cities || []
  }, [value?.state, availableStates])

  // Atrações da cidade selecionada
  const availableAttractions = useMemo(() => {
    if (!value?.city) return []
    const city = availableCities.find(c => c.name === value.city)
    let attractions = city?.attractions || []
    if (selectedType && selectedType !== "all") {
      attractions = attractions.filter(attraction => attraction.type === selectedType)
    }
    return attractions
  }, [value?.city, availableCities, selectedType])

  const handleStateChange = (stateName: string) => {
    onChange?.({
      state: stateName,
      city: undefined,
      attraction: undefined,
    })
  }

  const handleCityChange = (cityName: string) => {
    onChange?.({
      ...value,
      city: cityName,
      attraction: undefined,
    })
  }

  const handleAttractionChange = (attraction: Attraction) => {
    onChange?.({
      ...value,
      attraction: attraction,
    })
  }

  const handleSearchSelect = (attraction: Attraction) => {
    onChange?.({
      state: attraction.state,
      city: attraction.city,
      attraction: attraction,
    })
    setSearchQuery("")
    setIsSearchMode(false)
  }

  return (
    <div className="space-y-6">
      {/* Filtro por Tipo de Atração */}
      <div>
        <Label htmlFor="attraction-type">Tipo de Atração (Opcional)</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {attractionTypes.map((type) => (
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
            {attractionTypes.find(t => t.value === selectedType)?.description}
          </p>
        )}
      </div>

      {/* Busca Rápida */}
      <div>
        <Label htmlFor="attraction-search">Busca Rápida</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="attraction-search"
            type="text"
            placeholder="Digite o nome da atração, cidade ou estado..."
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
            {searchResults.map((attraction) => (
              <button
                key={attraction.id}
                onClick={() => handleSearchSelect(attraction)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{attraction.name}</div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {attraction.city}, {attraction.state}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {attractionTypes.find(t => t.value === attraction.type)?.label}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1 ml-3">
                    {attraction.hasGroupDiscount && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Desconto Grupo
                      </span>
                    )}
                    {attraction.hasScheduledTours && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Tours Agendados
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
            Nenhuma atração encontrada para "{searchQuery}"
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
                        {city.attractions.length} atração{city.attractions.length !== 1 ? 'ões' : ''}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {value?.city && availableAttractions.length > 0 && (
          <div>
            <Label htmlFor="attraction-select">Atração</Label>
            <Select 
              value={value?.attraction?.id || ""} 
              onValueChange={(attractionId) => {
                const attraction = availableAttractions.find(a => a.id === attractionId)
                if (attraction) handleAttractionChange(attraction)
              }}
            >
              <SelectTrigger id="attraction-select">
                <SelectValue placeholder="Selecione a atração" />
              </SelectTrigger>
              <SelectContent>
                {availableAttractions.map((attraction) => (
                  <SelectItem key={attraction.id} value={attraction.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <span>{attractionTypes.find(t => t.value === attraction.type)?.label.split(' ')[0]}</span>
                        <span>{attraction.name}</span>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        {attraction.hasGroupDiscount && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" title="Desconto para grupos"></span>
                        )}
                        {attraction.hasScheduledTours && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full" title="Tours agendados"></span>
                        )}
                        {attraction.accessibility && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full" title="Acessível"></span>
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

      {/* Informações da Atração Selecionada */}
      {value?.attraction && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <span>{attractionTypes.find(t => t.value === value.attraction.type)?.label.split(' ')[0]}</span>
            <span>{value.attraction.name}</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{value.attraction.city}, {value.attraction.state}</span>
              </div>
              
              {value.attraction.duration && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Duração: {value.attraction.duration}</span>
                </div>
              )}
              
              {value.attraction.operatingHours && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {value.attraction.operatingHours.open} às {value.attraction.operatingHours.close}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {value.attraction.hasGroupDiscount && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Desconto Grupo</span>
                  </span>
                )}
                
                {value.attraction.hasScheduledTours && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Tours Agendados</span>
                  </span>
                )}
                
                {value.attraction.accessibility && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Acessível
                  </span>
                )}
                
                {value.attraction.difficulty && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    value.attraction.difficulty === 'facil' ? 'bg-green-100 text-green-800' :
                    value.attraction.difficulty === 'moderado' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {value.attraction.difficulty === 'facil' ? 'Fácil' :
                     value.attraction.difficulty === 'moderado' ? 'Moderado' : 'Difícil'}
                  </span>
                )}
              </div>
              
              {value.attraction.website && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Globe className="w-4 h-4" />
                  <a 
                    href={value.attraction.website} 
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
          
          {value.attraction.description && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">{value.attraction.description}</p>
            </div>
          )}
          
          {value.attraction.ticketTypes && value.attraction.ticketTypes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Tipos de ingresso disponíveis: {value.attraction.ticketTypes.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {value.attraction.ticketTypes.map((ticket) => (
                  <span key={ticket.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    {ticket.name} - R$ {ticket.basePrice.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {required && !value?.attraction && (
        <p className="text-sm text-red-600 mt-1">
          Por favor, selecione uma atração para continuar.
        </p>
      )}
    </div>
  )
}
