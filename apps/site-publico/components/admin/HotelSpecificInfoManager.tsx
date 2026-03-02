"use client"

import { useState } from "react"
import { Sparkles, Gift, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface HotelSpecificInfoManagerProps {
  highlights?: string[]
  specialBenefits?: string[]
  onChange: (data: { highlights?: string[]; specialBenefits?: string[] }) => void
}

export function HotelSpecificInfoManager({
  highlights = [],
  specialBenefits = [],
  onChange
}: HotelSpecificInfoManagerProps) {
  const [newHighlight, setNewHighlight] = useState("")
  const [newBenefit, setNewBenefit] = useState("")

  const addHighlight = () => {
    if (newHighlight.trim()) {
      onChange({
        highlights: [...highlights, newHighlight.trim()],
        specialBenefits
      })
      setNewHighlight("")
    }
  }

  const removeHighlight = (index: number) => {
    onChange({
      highlights: highlights.filter((_, i) => i !== index),
      specialBenefits
    })
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      onChange({
        highlights,
        specialBenefits: [...specialBenefits, newBenefit.trim()]
      })
      setNewBenefit("")
    }
  }

  const removeBenefit = (index: number) => {
    onChange({
      highlights,
      specialBenefits: specialBenefits.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-6">
      {/* Destaques Exclusivos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <Label className="text-base font-semibold">Destaques Exclusivos</Label>
        </div>
        <p className="text-sm text-gray-600">
          Adicione características únicas e diferenciais deste hotel
        </p>

        <div className="space-y-2">
          {highlights.map((highlight, index) => (
            <Card key={index} className="bg-purple-50 border-purple-200">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-sm text-gray-700">{highlight}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHighlight(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addHighlight()}
            placeholder="Ex: Torres ecológicas com certificação sustentável"
          />
          <Button type="button" onClick={addHighlight}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Benefícios Especiais */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-yellow-600" />
          <Label className="text-base font-semibold">Benefícios Especiais Inclusos</Label>
        </div>
        <p className="text-sm text-gray-600">
          Adicione benefícios exclusivos que este hotel oferece
        </p>

        <div className="space-y-2">
          {specialBenefits.map((benefit, index) => (
            <Card key={index} className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-sm text-gray-700">{benefit}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBenefit(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addBenefit()}
            placeholder="Ex: Tour ecológico guiado"
          />
          <Button type="button" onClick={addBenefit}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  )
}
