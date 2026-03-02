"use client"

import { useState } from "react"
import { CheckCircle, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface HotelWhyChooseManagerProps {
  reasons?: string[]
  onChange: (reasons: string[]) => void
}

const DEFAULT_REASONS = [
  "Localização privilegiada em Caldas Novas, a maior estância hidrotermal do mundo",
  "Acesso direto a piscinas termais com águas naturais entre 43°C e 70°C",
  "Infraestrutura completa para toda a família com segurança 24h",
  "Proximidade dos principais parques termais e atrações turísticas",
  "Melhor custo-benefício com todos os benefícios inclusos no preço"
]

export function HotelWhyChooseManager({ reasons = [], onChange }: HotelWhyChooseManagerProps) {
  const [newReason, setNewReason] = useState("")
  const currentReasons = reasons.length > 0 ? reasons : DEFAULT_REASONS

  const handleAdd = () => {
    if (newReason.trim()) {
      onChange([...currentReasons, newReason.trim()])
      setNewReason("")
    }
  }

  const handleUpdate = (index: number, value: string) => {
    const updated = [...currentReasons]
    updated[index] = value
    onChange(updated)
  }

  const handleDelete = (index: number) => {
    if (confirm("Tem certeza que deseja remover este motivo?")) {
      onChange(currentReasons.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Por que escolher este hotel?</Label>
        <p className="text-sm text-gray-500 mt-1">
          Adicione motivos que aparecem na seção "Por que escolher este hotel?" do modal
        </p>
      </div>

      {/* Lista de motivos */}
      <div className="space-y-2">
        {currentReasons.map((reason, index) => (
          <Card key={index} className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <Input
                  value={reason}
                  onChange={(e) => handleUpdate(index, e.target.value)}
                  className="flex-1 bg-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Adicionar novo motivo */}
      <div className="flex gap-2">
        <Input
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Adicionar novo motivo..."
        />
        <Button type="button" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>
    </div>
  )
}
