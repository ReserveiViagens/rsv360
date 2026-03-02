"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, MapPin, Clock, Camera, Star, AlertCircle } from "lucide-react"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { useWebsiteContent } from "@/hooks/useWebsiteData"

export default function AtracoesPageDynamic() {
  const { data: attractions, isLoading, error } = useWebsiteContent('attraction')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const getCategory = (attraction: any) => {
    return attraction.metadata?.category || attraction.metadata?.tipo || "Atração"
  }

  const getDuration = (attraction: any) => {
    return attraction.metadata?.duration || attraction.metadata?.duracao || "1-2 horas"
  }

  const getHighlights = (attraction: any) => {
    return attraction.metadata?.highlights || attraction.features || []
  }

  const getRating = (attraction: any) => {
    return attraction.metadata?.rating || attraction.metadata?.avaliacao || 4.5
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-500 to-blue-600 flex flex-col items-center justify-center z-50">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner className="w-16 h-16 text-white" />
          </div>
        </div>
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Carregando Atrações</h2>
          <p className="text-green-100">Descobrindo os melhores lugares para você...</p>
        </div>
        <div className="mt-8 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao carregar atrações</h2>
          <p className="text-gray-600 text-center mb-6">
            Não foi possível carregar as atrações. Verifique sua conexão e tente novamente.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Tentar Novamente
          </Button>
          <Link href="/" className="mt-4">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Filtrar apenas atrações ativas
  const activeAttractions = attractions?.filter(attraction => attraction.status === 'active') || []

  if (activeAttractions.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-6xl mb-4">🎢</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Nenhuma atração disponível</h2>
          <p className="text-gray-600 text-center mb-6">
            No momento não temos atrações cadastradas. Entre em contato conosco para mais informações.
          </p>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() =>
              window.open(
                "https://wa.me/5564993197555?text=Olá! Gostaria de informações sobre atrações em Caldas Novas.",
                "_blank",
              )
            }
          >
            <Phone className="w-4 h-4 mr-2" />
            Falar com Especialista
          </Button>
          <Link href="/" className="mt-4">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      <div className="animate-in fade-in duration-500">
        {/* Header */}
        <header className="bg-gradient-to-br from-green-500 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
              alt="Reservei Viagens"
              width={40}
              height={40}
              className="rounded-full bg-white/20 p-1"
            />
            <h1 className="text-2xl font-bold tracking-tight">Atrações em Caldas Novas</h1>
          </div>

          {/* Hero CTA */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <h2 className="text-lg font-bold mb-2">🎯 Descubra Caldas Novas!</h2>
            <p className="text-sm mb-3">Mais de 50 atrações incríveis para você explorar</p>
            <Badge className="bg-yellow-500 text-black animate-pulse">✨ Experiências únicas!</Badge>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardContent className="p-4 text-center">
              <h3 className="font-bold text-lg mb-2">📸 Galeria de Fotos!</h3>
              <p className="text-sm mb-3">Veja as fotos de cada atração e planeje sua visita</p>
              <Badge className="bg-white text-blue-600 font-bold">Clique nas imagens para ampliar!</Badge>
            </CardContent>
          </Card>

          {/* Attractions List */}
          <div className="space-y-6">
            {activeAttractions.map((attraction, index) => {
              const category = getCategory(attraction)
              const duration = getDuration(attraction)
              const highlights = getHighlights(attraction)
              const rating = getRating(attraction)
              const isFree = !attraction.price || attraction.price === 0

              return (
                <Card
                  key={attraction.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative border-2 border-transparent hover:border-green-200"
                >
                  {/* Category Badge */}
                  <Badge className="absolute top-3 left-3 bg-green-500 text-white font-bold z-10">
                    {category}
                  </Badge>

                  {/* Rating Badge */}
                  <Badge className="absolute top-3 right-3 bg-yellow-500 text-black font-bold z-10">
                    <Star className="w-3 h-3 mr-1" />
                    {rating}
                  </Badge>

                  {/* Image */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={attraction.images[0] || "/placeholder.svg"}
                      alt={attraction.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300" />
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2">{attraction.title}</h3>
                        {attraction.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            {attraction.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4" />
                          {duration}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{attraction.description}</p>

                    {/* Highlights */}
                    {highlights.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2 text-green-700">✨ Destaques:</h4>
                        <div className="flex flex-wrap gap-2">
                          {highlights.slice(0, 4).map((highlight: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                          {highlights.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{highlights.length - 4} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1">{renderStars(rating)}</div>
                      <span className="text-sm text-gray-600">({rating}/5)</span>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          {isFree ? (
                            <div className="text-2xl font-bold text-green-600">GRATUITO</div>
                          ) : (
                            <div className="text-2xl font-bold text-green-600">
                              {formatPrice(attraction.price)}
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {isFree ? "Entrada gratuita" : "por pessoa"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Duração</p>
                          <p className="text-sm font-bold text-blue-600">{duration}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
                          onClick={() =>
                            window.open(
                              `https://wa.me/5564993197555?text=Olá! Quero informações sobre a atração ${attraction.title} em Caldas Novas!`,
                              "_blank",
                            )
                          }
                        >
                          📍 Quero Visitar
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => alert(`Detalhes completos da atração ${attraction.title}`)}
                        >
                          Ver Detalhes Completos
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Final CTA */}
          <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-3">🎯 Quer um roteiro personalizado?</h3>
              <p className="mb-4">Nossa equipe pode criar um roteiro perfeito para você!</p>
              <Button
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-3"
                onClick={() =>
                  window.open(
                    "https://wa.me/5564993197555?text=Olá! Quero um roteiro personalizado para Caldas Novas!",
                    "_blank",
                  )
                }
              >
                📋 Criar Meu Roteiro
              </Button>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-center pt-6 pb-20">
            <Link href="/">
              <Button
                variant="outline"
                className="text-gray-600 hover:text-blue-600 border-gray-300 hover:border-blue-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/5564993197555?text=Olá! Gostaria de informações sobre atrações em Caldas Novas."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50 animate-pulse"
      >
        <Phone className="w-7 h-7 text-white" />
      </a>
    </div>
  )
}
