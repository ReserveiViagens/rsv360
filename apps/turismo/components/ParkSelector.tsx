"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, Search, MapPin, FerrisWheel } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { brazilStatesWithParks, searchParks, parkTypes, type Park } from "@/lib/parks-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ParkSelectorProps {
  value?: {
    state?: string
    city?: string
    parkId?: string
    parkName?: string
  }
  onChange?: (selected: {
    state?: string
    city?: string
    parkId?: string
    parkName?: string
  }) => void
  required?: boolean
}

export function ParkSelector({ value, onChange, required = false }: ParkSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [isSearchMode, setIsSearchMode] = useState(false)

  // Busca de parques
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    let results = searchParks(searchQuery)
    if (selectedType && selectedType !== "all") {
      results = results.filter(park => park.type === selectedType)
    }
    return results.slice(0, 10) // Limitar a 10 resultados
  }, [searchQuery, selectedType])

  // Estados disponíveis
  const availableStates = brazilStatesWithParks

  // Cidades do estado selecionado
  const availableCities = useMemo(() => {
    if (!value?.state) return []
    const state = availableStates.find(s => s.name === value.state)
    return state?.cities || []
  }, [value?.state, availableStates])

  // Parques da cidade selecionada
  const availableParks = useMemo(() => {
    if (!value?.city) return []
    const city = availableCities.find(c => c.name === value.city)
    let parks = city?.parks || []
    if (selectedType && selectedType !== "all") {
      parks = parks.filter(park => park.type === selectedType)
    }
    return parks
  }, [value?.city, availableCities, selectedType])

  const handleStateChange = (stateName: string) => {
    onChange?.({
      state: stateName,
      city: undefined,
      parkId: undefined,
      parkName: undefined,
    })
  }

  const handleCityChange = (cityName: string) => {
    onChange?.({
      ...value,
      city: cityName,
      parkId: undefined,
      parkName: undefined,
    })
  }

  const handleParkChange = (parkId: string) => {
    const park = availableParks.find(p => p.id === parkId) || 
                 searchResults.find(p => p.id === parkId)
    
    if (park) {
      onChange?.({
        state: park.state,
        city: park.city,
        parkId: park.id,
        parkName: park.name,
      })
    }
  }

  const handleSearchSelect = (park: Park) => {
    onChange?.({
      state: park.state,
      city: park.city,
      parkId: park.id,
      parkName: park.name,
    })
    setSearchQuery("")
    setIsSearchMode(false)
  }

  return (
    <div className="space-y-6">
      {/* Filtro por Tipo de Parque */}
      <div>
        <Label htmlFor="park-type">Tipo de Parque (Opcional)</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {parkTypes.map((type) => (
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
            {parkTypes.find(t => t.value === selectedType)?.description}
          </p>
        )}
      </div>

      {/* Busca Rápida */}
      <div>
        <Label htmlFor="park-search">Busca Rápida</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="park-search"
            type="text"
            placeholder="Digite o nome do parque, cidade ou estado..."
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
          <div className="mt-2 border rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((park) => (
              <button
                key={park.id}
                onClick={() => handleSearchSelect(park)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FerrisWheel className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">{park.name}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{park.city}, {park.state}</span>
                      <span className="mx-2">•</span>
                      <span>{parkTypes.find(t => t.value === park.type)?.label}</span>
                    </div>
                    {park.description && (
                      <div className="text-sm text-gray-400 mt-1 truncate">
                        {park.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {isSearchMode && searchQuery && searchResults.length === 0 && (
          <div className="mt-2 p-3 text-center text-gray-500 bg-gray-50 rounded-lg">
            Nenhum parque encontrado para "{searchQuery}"
          </div>
        )}
      </div>

      {/* Seleção Hierárquica */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-700 border-t pt-4">
          Ou selecione por localização:
        </div>
        
        {/* Estado */}
        <div>
          <Label htmlFor="state">Estado {required && <span className="text-red-500">*</span>}</Label>
          <Select value={value?.state || ""} onValueChange={handleStateChange}>
            <SelectTrigger>
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

        {/* Cidade */}
        {value?.state && (
          <div>
            <Label htmlFor="city">Cidade {required && <span className="text-red-500">*</span>}</Label>
            <Select value={value?.city || ""} onValueChange={handleCityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{city.name}</span>
                      <span className="text-gray-400">({city.parks.length} parque{city.parks.length !== 1 ? 's' : ''})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Parque */}
        {value?.city && availableParks.length > 0 && (
          <div>
            <Label htmlFor="park">Parque {required && <span className="text-red-500">*</span>}</Label>
            <Select value={value?.parkId || ""} onValueChange={handleParkChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o parque" />
              </SelectTrigger>
              <SelectContent>
                {availableParks.map((park) => (
                  <SelectItem key={park.id} value={park.id}>
                    <div className="flex items-start space-x-2">
                      <div className="flex items-center space-x-2">
                        <FerrisWheel className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="font-medium">{park.name}</div>
                          <div className="text-xs text-gray-500">
                            {parkTypes.find(t => t.value === park.type)?.label}
                            {park.fastPassAvailable && " • Fast Pass"}
                            {park.groupDiscounts && " • Desconto Grupo"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Informações do Parque Selecionado */}
      {value?.parkId && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FerrisWheel className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900">{value.parkName}</h3>
              <p className="text-sm text-gray-600 flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{value.city}, {value.state}</span>
              </p>
              
              {/* Características do parque */}
              <div className="flex flex-wrap gap-2 mt-2">
                {(() => {
                  const park = availableParks.find(p => p.id === value.parkId) || 
                              searchResults.find(p => p.id === value.parkId)
                  if (!park) return null
                  
                  return (
                    <>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {parkTypes.find(t => t.value === park.type)?.label}
                      </span>
                      {park.fastPassAvailable && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Fast Pass Disponível
                        </span>
                      )}
                      {park.groupDiscounts && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Desconto para Grupos
                        </span>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
