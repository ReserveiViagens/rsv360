"use client"

import { useState } from "react"
import { X, Star, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Hotel {
  id: string
  name: string
  price: number
  stars: number
  rating?: number
  features?: string[]
  amenities?: string[]
  maxGuests?: number
  distanceFromCenter?: number
}

interface HotelComparisonProps {
  hotels: Hotel[]
  onClose: () => void
  onSelectHotel: (hotel: Hotel) => void
}

export function HotelComparison({ hotels, onClose, onSelectHotel }: HotelComparisonProps) {
  if (hotels.length === 0) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const hasFeature = (hotel: Hotel, feature: string) => {
    const allFeatures = [
      ...(hotel.features || []),
      ...(hotel.amenities || [])
    ]
    return allFeatures.some(f => f.toLowerCase().includes(feature.toLowerCase()))
  }

  const commonFeatures = [
    { label: "Wi-Fi Gratuito", key: "wi-fi" },
    { label: "Estacionamento", key: "estacionamento" },
    { label: "Café da Manhã", key: "café" },
    { label: "Piscina Termal", key: "piscina" },
    { label: "Spa", key: "spa" },
    { label: "Academia", key: "academia" },
    { label: "Restaurante", key: "restaurante" },
    { label: "Ar-Condicionado", key: "ar-condicionado" },
  ]

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 relative z-[101]">
        <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white shadow-xl">
          <CardContent className="p-6 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Comparar Hotéis</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabela de Comparação */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-gray-900">Características</th>
                    {hotels.map((hotel) => (
                      <th key={hotel.id} className="text-center p-3 min-w-[200px]">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                          <div className="flex items-center justify-center gap-1">
                            {renderStars(hotel.stars)}
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatPrice(hotel.price)}
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-green-500 hover:bg-green-600"
                            onClick={() => onSelectHotel(hotel)}
                          >
                            Selecionar
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Preço */}
                  <tr className="border-b">
                    <td className="p-3 font-medium text-gray-700">Preço por Noite</td>
                    {hotels.map((hotel) => (
                      <td key={hotel.id} className="p-3 text-center">
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(hotel.price)}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Classificação */}
                  <tr className="border-b">
                    <td className="p-3 font-medium text-gray-700">Classificação</td>
                    {hotels.map((hotel) => (
                      <td key={hotel.id} className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {renderStars(hotel.stars)}
                          <span className="text-sm text-gray-600 ml-1">
                            {hotel.stars} estrelas
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Avaliação */}
                  {hotels.some(h => h.rating) && (
                    <tr className="border-b">
                      <td className="p-3 font-medium text-gray-700">Avaliação</td>
                      {hotels.map((hotel) => (
                        <td key={hotel.id} className="p-3 text-center">
                          {hotel.rating ? (
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* Capacidade */}
                  {hotels.some(h => h.maxGuests) && (
                    <tr className="border-b">
                      <td className="p-3 font-medium text-gray-700">Capacidade Máxima</td>
                      {hotels.map((hotel) => (
                        <td key={hotel.id} className="p-3 text-center">
                          {hotel.maxGuests ? (
                            <span>{hotel.maxGuests} pessoas</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* Distância do Centro */}
                  {hotels.some(h => h.distanceFromCenter) && (
                    <tr className="border-b">
                      <td className="p-3 font-medium text-gray-700">Distância do Centro</td>
                      {hotels.map((hotel) => (
                        <td key={hotel.id} className="p-3 text-center">
                          {hotel.distanceFromCenter ? (
                            <span>{hotel.distanceFromCenter} km</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* Comodidades */}
                  {commonFeatures.map((feature) => (
                    <tr key={feature.key} className="border-b">
                      <td className="p-3 font-medium text-gray-700">{feature.label}</td>
                      {hotels.map((hotel) => (
                        <td key={hotel.id} className="p-3 text-center">
                          {hasFeature(hotel, feature.key) ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botão Fechar */}
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Fechar Comparação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
