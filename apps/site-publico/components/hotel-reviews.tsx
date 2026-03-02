"use client"

import { Star, User, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Review {
  id: string
  author: string
  rating: number
  date: string
  comment: string
  verified?: boolean
  helpful?: number
}

interface HotelReviewsProps {
  hotelId: string
  hotelName: string
  averageRating?: number
  reviewCount?: number
}

// Avaliações mockadas (em produção viriam da API)
const getMockReviews = (hotelName: string): Review[] => {
  const baseReviews: Review[] = [
    {
      id: "1",
      author: "Maria Silva",
      rating: 5,
      date: "2025-01-10",
      comment: "Excelente hotel! Piscinas termais incríveis, café da manhã delicioso e atendimento impecável. Recomendo muito!",
      verified: true,
      helpful: 12
    },
    {
      id: "2",
      author: "João Santos",
      rating: 4,
      date: "2025-01-08",
      comment: "Ótima estrutura e localização. Quartos confortáveis e limpos. Única ressalva é o Wi-Fi que poderia ser mais rápido.",
      verified: true,
      helpful: 8
    },
    {
      id: "3",
      author: "Ana Costa",
      rating: 5,
      date: "2025-01-05",
      comment: "Perfeito para família! As crianças adoraram as piscinas e o kids club. Vamos voltar com certeza!",
      verified: true,
      helpful: 15
    },
    {
      id: "4",
      author: "Carlos Oliveira",
      rating: 4,
      date: "2024-12-28",
      comment: "Bom custo-benefício. Estacionamento grátis e café da manhã incluso fazem toda diferença. Recomendo!",
      verified: false,
      helpful: 5
    },
    {
      id: "5",
      author: "Patricia Lima",
      rating: 5,
      date: "2024-12-20",
      comment: "Experiência incrível! Spa maravilhoso, restaurante com comida excelente. Superou todas as expectativas!",
      verified: true,
      helpful: 20
    }
  ]

  // Personalizar comentários baseado no hotel
  if (hotelName.toLowerCase().includes('eco towers')) {
    baseReviews[0].comment = "Torres ecológicas impressionantes! Vista panorâmica incrível e sustentabilidade em cada detalhe. Spa premium!"
    baseReviews[2].comment = "Perfeito para quem busca luxo e consciência ambiental. Energia solar e reciclagem em todo lugar!"
  } else if (hotelName.toLowerCase().includes('piazza diroma')) {
    baseReviews[0].comment = "Arquitetura italiana linda! Acesso direto aos parques diRoma foi um diferencial. Restaurante gourmet excelente!"
    baseReviews[4].comment = "Concierge 24h resolveu tudo! Degustação de vinhos foi um toque especial. Recomendo muito!"
  } else if (hotelName.toLowerCase().includes('spazzio') || hotelName.toLowerCase().includes('lacqua')) {
    baseReviews[2].comment = "Acqua Park é sensacional! Crianças não queriam sair. Piscinas termais com diferentes temperaturas perfeitas!"
    baseReviews[1].comment = "Tobogãs emocionantes e estrutura completa para família. Kids Club com monitores muito atenciosos!"
  }

  return baseReviews
}

export function HotelReviews({ hotelId, hotelName, averageRating = 4.5, reviewCount = 120 }: HotelReviewsProps) {
  const reviews = getMockReviews(hotelName)
  const ratingDistribution = {
    5: Math.floor(reviewCount * 0.6),
    4: Math.floor(reviewCount * 0.25),
    3: Math.floor(reviewCount * 0.1),
    2: Math.floor(reviewCount * 0.03),
    1: Math.floor(reviewCount * 0.02)
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Resumo de Avaliações */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center md:justify-start mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-sm text-gray-600">Baseado em {reviewCount} avaliações</p>
            </div>
            
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating as keyof typeof ratingDistribution]
                const percentage = (count / reviewCount) * 100
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-8">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Avaliações Recentes</h3>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{review.author}</span>
                      {review.verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Verificado</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(review.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="text-gray-700 mt-3 leading-relaxed">{review.comment}</p>
              {review.helpful && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <span>Útil para {review.helpful} pessoas</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
