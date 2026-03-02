"use client"

import { useState, useEffect } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CityStateAutocompleteProps {
  city?: string
  state?: string
  onCityChange?: (city: string) => void
  onStateChange?: (state: string) => void
}

// Lista de estados brasileiros
const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' }
]

export function CityStateAutocomplete({ city, state, onCityChange, onStateChange }: CityStateAutocompleteProps) {
  const [cityValue, setCityValue] = useState(city || '')
  const [stateValue, setStateValue] = useState(state || '')
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [stateSuggestions, setStateSuggestions] = useState<string[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [showStateSuggestions, setShowStateSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)

  // Buscar cidades por estado (mock - em produção usar API real)
  useEffect(() => {
    if (stateValue && stateValue.length >= 2) {
      const filtered = BRAZILIAN_STATES.filter(s =>
        s.code.toLowerCase().includes(stateValue.toLowerCase()) ||
        s.name.toLowerCase().includes(stateValue.toLowerCase())
      ).map(s => `${s.code} - ${s.name}`)
      setStateSuggestions(filtered.slice(0, 5))
      setShowStateSuggestions(filtered.length > 0)
    } else {
      setStateSuggestions([])
      setShowStateSuggestions(false)
    }
  }, [stateValue])

  // Buscar cidades (mock - em produção usar API real como IBGE)
  useEffect(() => {
    if (cityValue && cityValue.length >= 2) {
      setLoading(true)
      // Simular busca de cidades
      setTimeout(() => {
        const commonCities = [
          'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília',
          'Salvador', 'Fortaleza', 'Curitiba', 'Recife', 'Porto Alegre',
          'Goiânia', 'Belém', 'Guarulhos', 'Campinas', 'São Luís',
          'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal', 'Teresina',
          'Caldas Novas', 'Rio Quente', 'Araguaia', 'Pirenópolis'
        ]
        const filtered = commonCities.filter(c =>
          c.toLowerCase().includes(cityValue.toLowerCase())
        )
        setCitySuggestions(filtered.slice(0, 5))
        setShowCitySuggestions(filtered.length > 0)
        setLoading(false)
      }, 300)
    } else {
      setCitySuggestions([])
      setShowCitySuggestions(false)
    }
  }, [cityValue])

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="relative">
        <Label>Cidade</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={cityValue}
            onChange={(e) => {
              setCityValue(e.target.value)
              onCityChange?.(e.target.value)
            }}
            onFocus={() => citySuggestions.length > 0 && setShowCitySuggestions(true)}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
            className="pl-10"
            placeholder="Digite a cidade"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
        {showCitySuggestions && citySuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {citySuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => {
                  setCityValue(suggestion)
                  onCityChange?.(suggestion)
                  setShowCitySuggestions(false)
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <Label>Estado</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={stateValue}
            onChange={(e) => {
              setStateValue(e.target.value)
              onStateChange?.(e.target.value)
            }}
            onFocus={() => stateSuggestions.length > 0 && setShowStateSuggestions(true)}
            onBlur={() => setTimeout(() => setShowStateSuggestions(false), 200)}
            className="pl-10"
            placeholder="GO, SP, RJ..."
          />
        </div>
        {showStateSuggestions && stateSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {stateSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => {
                  const code = suggestion.split(' - ')[0]
                  setStateValue(code)
                  onStateChange?.(code)
                  setShowStateSuggestions(false)
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

