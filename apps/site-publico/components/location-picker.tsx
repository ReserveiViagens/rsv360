"use client"

import { useState, useEffect } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAddressByCEP } from "@/lib/validations"

interface LocationPickerProps {
  value?: string
  onChange?: (address: {
    address: string
    city: string
    state: string
    zip_code: string
    country: string
  }) => void
  onCoordinatesChange?: (lat: number, lng: number) => void
}

export function LocationPicker({ value, onChange, onCoordinatesChange }: LocationPickerProps) {
  const [address, setAddress] = useState(value || '')
  const [loading, setLoading] = useState(false)

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '')
    if (cep.length === 8) {
      setLoading(true)
      try {
        const addressData = await getAddressByCEP(cep)
        if (addressData) {
          const fullAddress = {
            address: `${addressData.logradouro}${addressData.complemento ? ', ' + addressData.complemento : ''}`,
            city: addressData.localidade,
            state: addressData.uf,
            zip_code: addressData.cep,
            country: 'Brasil'
          }
          setAddress(fullAddress.address)
          onChange?.(fullAddress)
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>CEP</Label>
        <div className="relative">
          <Input
            placeholder="00000-000"
            maxLength={9}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              const formatted = value.length > 5 
                ? `${value.slice(0, 5)}-${value.slice(5)}`
                : value
              e.target.value = formatted
              if (value.length === 8) {
                handleCEPChange(e as any)
              }
            }}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">Digite o CEP para preencher automaticamente</p>
      </div>

      <div>
        <Label>Endereço</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="pl-10"
            placeholder="Rua, número, complemento"
          />
        </div>
      </div>
    </div>
  )
}

