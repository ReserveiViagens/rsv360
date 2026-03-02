"use client"

import { useState } from "react"
import { Gift, Plus, X, Wifi, Car, Coffee, Waves, Dumbbell, Utensils, Bed, Clock, Shield, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Benefit {
  icon: string
  title: string
  description: string
  free: boolean
}

interface HotelBenefitsManagerProps {
  benefits?: Benefit[]
  onChange: (benefits: Benefit[]) => void
}

const DEFAULT_BENEFITS: Benefit[] = [
  {
    icon: "wifi",
    title: "Wi-Fi Gratuito",
    description: "Internet de alta velocidade em todas as áreas",
    free: true
  },
  {
    icon: "car",
    title: "Estacionamento Grátis",
    description: "Vagas cobertas e descobertas disponíveis",
    free: true
  },
  {
    icon: "coffee",
    title: "Café da Manhã Incluso",
    description: "Buffet completo com opções locais e saudáveis",
    free: true
  },
  {
    icon: "waves",
    title: "Piscinas Termais",
    description: "Águas naturais entre 43°C e 70°C - acesso ilimitado",
    free: true
  },
  {
    icon: "dumbbell",
    title: "Academia e Spa",
    description: "Equipamentos modernos e área de relaxamento",
    free: true
  },
  {
    icon: "utensils",
    title: "Restaurante no Local",
    description: "Gastronomia local e internacional",
    free: false
  },
  {
    icon: "bed",
    title: "Ar-Condicionado",
    description: "Climatização em todos os ambientes",
    free: true
  },
  {
    icon: "clock",
    title: "Check-in/Check-out Flexível",
    description: "Horários adaptáveis às suas necessidades",
    free: true
  },
  {
    icon: "shield",
    title: "Segurança 24h",
    description: "Monitoramento e segurança em tempo integral",
    free: true
  },
  {
    icon: "heart",
    title: "Serviço de Quarto",
    description: "Limpeza diária e serviços personalizados",
    free: true
  }
]

const ICON_MAP: Record<string, any> = {
  wifi: Wifi,
  car: Car,
  coffee: Coffee,
  waves: Waves,
  dumbbell: Dumbbell,
  utensils: Utensils,
  bed: Bed,
  clock: Clock,
  shield: Shield,
  heart: Heart,
  sparkles: Sparkles
}

export function HotelBenefitsManager({ benefits = [], onChange }: HotelBenefitsManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newBenefit, setNewBenefit] = useState<Benefit>({
    icon: "sparkles",
    title: "",
    description: "",
    free: true
  })

  // Inicializar com benefícios padrão se vazio
  const currentBenefits = benefits.length > 0 ? benefits : DEFAULT_BENEFITS

  const handleAdd = () => {
    if (!newBenefit.title.trim()) {
      alert("Preencha o título do benefício")
      return
    }
    onChange([...currentBenefits, newBenefit])
    setNewBenefit({
      icon: "sparkles",
      title: "",
      description: "",
      free: true
    })
    setIsAdding(false)
  }

  const handleUpdate = (index: number, updated: Benefit) => {
    const updatedBenefits = [...currentBenefits]
    updatedBenefits[index] = updated
    onChange(updatedBenefits)
  }

  const handleDelete = (index: number) => {
    if (confirm("Tem certeza que deseja remover este benefício?")) {
      onChange(currentBenefits.filter((_, i) => i !== index))
    }
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || Sparkles
    return <IconComponent className="w-5 h-5" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Benefícios Inclusos</Label>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os benefícios que aparecem no modal de detalhes
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isAdding ? "Cancelar" : "Adicionar Benefício"}
        </Button>
      </div>

      {/* Formulário de adicionar */}
      {isAdding && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="benefit-title">Título *</Label>
                <Input
                  id="benefit-title"
                  value={newBenefit.title}
                  onChange={(e) => setNewBenefit({ ...newBenefit, title: e.target.value })}
                  placeholder="Ex: Wi-Fi Gratuito"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefit-icon">Ícone</Label>
                <select
                  id="benefit-icon"
                  value={newBenefit.icon}
                  onChange={(e) => setNewBenefit({ ...newBenefit, icon: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="wifi">Wi-Fi</option>
                  <option value="car">Carro</option>
                  <option value="coffee">Café</option>
                  <option value="waves">Ondas/Piscina</option>
                  <option value="dumbbell">Academia</option>
                  <option value="utensils">Restaurante</option>
                  <option value="bed">Cama</option>
                  <option value="clock">Relógio</option>
                  <option value="shield">Escudo</option>
                  <option value="heart">Coração</option>
                  <option value="sparkles">Estrelas</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefit-description">Descrição *</Label>
              <Textarea
                id="benefit-description"
                value={newBenefit.description}
                onChange={(e) => setNewBenefit({ ...newBenefit, description: e.target.value })}
                placeholder="Descrição do benefício..."
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="benefit-free"
                checked={newBenefit.free}
                onChange={(e) => setNewBenefit({ ...newBenefit, free: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="benefit-free">Benefício Gratuito</Label>
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={handleAdd}>
                Adicionar
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de benefícios */}
      <div className="space-y-3">
        {currentBenefits.map((benefit, index) => (
          <Card key={index} className={benefit.free ? "border-green-200 bg-green-50" : "border-gray-200"}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${benefit.free ? "text-green-600" : "text-gray-600"}`}>
                  {renderIcon(benefit.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                    {benefit.free && (
                      <Badge className="bg-green-600 text-white text-xs">GRÁTIS</Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      className="ml-auto text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
