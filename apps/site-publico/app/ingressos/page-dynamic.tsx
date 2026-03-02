"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, Users, Clock, MapPin, AlertCircle } from "lucide-react"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { useWebsiteContent } from "@/hooks/useWebsiteData"

export default function IngressosPageDynamic() {
  const { data: tickets, isLoading, error } = useWebsiteContent('ticket')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0
    return Math.round(((originalPrice - price) / originalPrice) * 100)
  }

  const getDuration = (ticket: any) => {
    return ticket.metadata?.duration || ticket.metadata?.duracao || "Dia inteiro"
  }

  const getAgeGroup = (ticket: any) => {
    return ticket.metadata?.ageGroup || ticket.metadata?.faixa_etaria || "Todas as idades"
  }

  const getFeatures = (ticket: any) => {
    return ticket.metadata?.features || ticket.features || []
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500 to-pink-600 flex flex-col items-center justify-center z-50">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner className="w-16 h-16 text-white" />
          </div>
        </div>
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Carregando Ingressos</h2>
          <p className="text-purple-100">Preparando os melhores parques para você...</p>
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao carregar ingressos</h2>
          <p className="text-gray-600 text-center mb-6">
            Não foi possível carregar os ingressos. Verifique sua conexão e tente novamente.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
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

  // Filtrar apenas ingressos ativos
  const activeTickets = tickets?.filter(ticket => ticket.status === 'active') || []

  if (activeTickets.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Nenhum ingresso disponível</h2>
          <p className="text-gray-600 text-center mb-6">
            No momento não temos ingressos cadastrados. Entre em contato conosco para mais informações.
          </p>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() =>
              window.open(
                "https://wa.me/5564993197555?text=Olá! Gostaria de informações sobre ingressos para parques em Caldas Novas.",
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
        <header className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-b-3xl shadow-lg">
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
            <h1 className="text-2xl font-bold tracking-tight">Ingressos para Parques</h1>
          </div>

          {/* Hero CTA */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <h2 className="text-lg font-bold mb-2">🎢 Diversão Garantida!</h2>
            <p className="text-sm mb-3">Ingressos com desconto para os melhores parques</p>
            <Badge className="bg-yellow-500 text-black animate-pulse">⚡ Ofertas especiais!</Badge>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardContent className="p-4 text-center">
              <h3 className="font-bold text-lg mb-2">🎯 Pacotes Completos!</h3>
              <p className="text-sm mb-3">Combine hotel + ingressos e economize ainda mais</p>
              <Badge className="bg-white text-blue-600 font-bold">Fale conosco no WhatsApp!</Badge>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <div className="space-y-6">
            {activeTickets.map((ticket, index) => {
              const discount = calculateDiscount(ticket.price, ticket.original_price)
              const duration = getDuration(ticket)
              const ageGroup = getAgeGroup(ticket)
              const features = getFeatures(ticket)
              const isPopular = index === 0 // Primeiro ingresso é o mais popular

              return (
                <Card
                  key={ticket.id}
                  className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative ${
                    isPopular
                      ? "border-4 border-yellow-400 shadow-lg"
                      : "border-2 border-transparent hover:border-purple-200"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-black text-center py-1 text-sm font-bold z-20">
                      ⭐ MAIS POPULAR ⭐
                    </div>
                  )}

                  {discount > 0 && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white z-10 animate-pulse">
                      -{discount}% OFF
                    </Badge>
                  )}

                  {/* Image */}
                  <div className={`aspect-video relative overflow-hidden ${isPopular ? "mt-8" : ""}`}>
                    <img
                      src={ticket.images[0] || "/placeholder.svg"}
                      alt={ticket.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-purple-500 text-white font-bold">
                      {ticket.metadata?.category || "Parque"}
                    </Badge>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">{ticket.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{ticket.description}</p>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {ticket.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{ticket.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{ageGroup}</span>
                      </div>
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2 text-purple-700">🎯 O que está incluso:</h4>
                        <div className="grid grid-cols-2 gap-1">
                          {features.slice(0, 6).map((feature: string, idx: number) => (
                            <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                              <span className="text-purple-500">•</span>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          {ticket.original_price && ticket.original_price > ticket.price && (
                            <span className="text-lg text-gray-400 line-through mr-2">
                              {formatPrice(ticket.original_price)}
                            </span>
                          )}
                          <div className="text-3xl font-bold text-green-600">{formatPrice(ticket.price)}</div>
                          <p className="text-xs text-gray-500">
                            {ticket.metadata?.priceType || "por pessoa"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Você economiza</p>
                          <p className="text-xl font-bold text-red-600">
                            {ticket.original_price && ticket.original_price > ticket.price
                              ? formatPrice(ticket.original_price - ticket.price)
                              : "---"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          className={`w-full font-bold py-3 text-lg ${
                            isPopular
                              ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                          onClick={() =>
                            window.open(
                              `https://wa.me/5564993197555?text=Olá! Quero comprar ingresso para ${ticket.title} com ${discount}% de desconto!`,
                              "_blank",
                            )
                          }
                        >
                          {isPopular ? "⭐ QUERO ESTE INGRESSO!" : `🎫 COMPRAR INGRESSO ${discount > 0 ? `- ${discount}% OFF` : ''}`}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
                          onClick={() => alert(`Detalhes completos do ingresso ${ticket.title}`)}
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
          <Card className="bg-gradient-to-br from-green-600 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-3">🎁 Pacote Completo!</h3>
              <p className="mb-4">Combine hotel + ingressos e ganhe até 15% de desconto adicional!</p>
              <Button
                className="bg-white text-green-600 hover:bg-gray-100 font-bold px-8 py-3"
                onClick={() =>
                  window.open(
                    "https://wa.me/5564993197555?text=Olá! Quero um pacote completo hotel + ingressos com desconto!",
                    "_blank",
                  )
                }
              >
                🏨+🎫 Pacote Completo
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
        href="https://wa.me/5564993197555?text=Olá! Gostaria de informações sobre ingressos para parques em Caldas Novas."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50 animate-pulse"
      >
        <Phone className="w-7 h-7 text-white" />
      </a>
    </div>
  )
}
