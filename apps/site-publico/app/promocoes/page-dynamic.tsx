"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, Clock, AlertCircle } from "lucide-react"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { useWebsiteContent } from "@/hooks/useWebsiteData"

export default function PromocoesPageDynamic() {
  const { data: promotions, isLoading, error } = useWebsiteContent('promotion')
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 })

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(countdown)
  }, [])

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

  const getValidUntil = (promotion: any) => {
    // Extrair data de validade dos metadados ou usar padrão
    return promotion.metadata?.validUntil || promotion.metadata?.valid_until || "Ver disponibilidade"
  }

  const getBadge = (promotion: any) => {
    // Extrair badge dos metadados ou usar padrão
    return promotion.metadata?.badge || promotion.metadata?.category || "Promoção"
  }

  const getIncludes = (promotion: any) => {
    // Extrair itens inclusos dos metadados ou usar features
    return promotion.metadata?.includes || promotion.features || []
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center z-50">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner className="w-16 h-16 text-white" />
          </div>
        </div>
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Carregando Promoções</h2>
          <p className="text-orange-100">Buscando as melhores ofertas para você...</p>
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao carregar promoções</h2>
          <p className="text-gray-600 text-center mb-6">
            Não foi possível carregar as promoções. Verifique sua conexão e tente novamente.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700 text-white"
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

  // Filtrar apenas promoções ativas
  const activePromotions = promotions?.filter(promo => promo.status === 'active') || []

  if (activePromotions.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-6xl mb-4">🏷️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Nenhuma promoção disponível</h2>
          <p className="text-gray-600 text-center mb-6">
            No momento não temos promoções ativas. Entre em contato conosco para mais informações.
          </p>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() =>
              window.open(
                "https://wa.me/5564993197555?text=Olá! Gostaria de informações sobre promoções especiais.",
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
        <header className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-b-3xl shadow-lg">
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
            <h1 className="text-2xl font-bold tracking-tight">Promoções Especiais</h1>
          </div>

          {/* Countdown Timer */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">⏰ Oferta Relâmpago!</h2>
            <div className="flex gap-2 justify-center">
              <div className="bg-white/30 rounded-lg p-2 text-center min-w-[50px]">
                <div className="text-xl font-bold">{timeLeft.hours.toString().padStart(2, "0")}</div>
                <div className="text-xs">Horas</div>
              </div>
              <div className="bg-white/30 rounded-lg p-2 text-center min-w-[50px]">
                <div className="text-xl font-bold">{timeLeft.minutes.toString().padStart(2, "0")}</div>
                <div className="text-xs">Min</div>
              </div>
              <div className="bg-white/30 rounded-lg p-2 text-center min-w-[50px]">
                <div className="text-xl font-bold">{timeLeft.seconds.toString().padStart(2, "0")}</div>
                <div className="text-xs">Seg</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Urgency Banner */}
          <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <CardContent className="p-4 text-center">
              <h3 className="font-bold text-lg mb-2">🔥 ÚLTIMAS HORAS!</h3>
              <p className="text-sm mb-3">Mais de 100 pessoas reservaram hoje</p>
              <Badge className="bg-white text-red-600 font-bold animate-pulse">Garante já sua promoção!</Badge>
            </CardContent>
          </Card>

          {/* Promotions List */}
          <div className="space-y-6">
            {activePromotions.map((promo, index) => {
              const discount = calculateDiscount(promo.price, promo.original_price)
              const isHighlight = index === 0 // Primeira promoção é destaque
              const validUntil = getValidUntil(promo)
              const badge = getBadge(promo)
              const includes = getIncludes(promo)

              return (
                <Card
                  key={promo.id}
                  className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative ${
                    isHighlight
                      ? "border-4 border-yellow-400 shadow-lg"
                      : "border-2 border-transparent hover:border-orange-200"
                  }`}
                >
                  {isHighlight && (
                    <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-black text-center py-1 text-sm font-bold z-20">
                      ⭐ OFERTA MAIS POPULAR ⭐
                    </div>
                  )}

                  {discount > 0 && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white z-10 animate-pulse">
                      -{discount}% OFF
                    </Badge>
                  )}

                  <div className={`aspect-video relative overflow-hidden ${isHighlight ? "mt-8" : ""}`}>
                    <img
                      src={promo.images[0] || "/placeholder.svg"}
                      alt={promo.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-orange-500 text-white font-bold">{badge}</Badge>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">{promo.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{promo.description}</p>

                    {/* Includes */}
                    {includes.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2 text-green-700">✅ O que está incluso:</h4>
                        <div className="grid grid-cols-2 gap-1">
                          {includes.slice(0, 6).map((item: string, idx: number) => (
                            <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                              <span className="text-green-500">•</span>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Validity */}
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Válido até: {validUntil}</span>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          {promo.original_price && promo.original_price > promo.price && (
                            <span className="text-lg text-gray-400 line-through mr-2">
                              {formatPrice(promo.original_price)}
                            </span>
                          )}
                          <div className="text-3xl font-bold text-green-600">{formatPrice(promo.price)}</div>
                          <p className="text-xs text-gray-500">
                            {promo.metadata?.priceType || "por pessoa"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Você economiza</p>
                          <p className="text-xl font-bold text-red-600">
                            {promo.original_price && promo.original_price > promo.price
                              ? formatPrice(promo.original_price - promo.price)
                              : "---"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          className={`w-full font-bold py-3 text-lg ${
                            isHighlight
                              ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                          onClick={() =>
                            window.open(
                              `https://wa.me/5564993197555?text=Olá! Quero aproveitar a promoção ${promo.title} com ${discount}% de desconto!`,
                              "_blank",
                            )
                          }
                        >
                          {isHighlight ? "⭐ QUERO ESTA OFERTA ESPECIAL!" : `💚 APROVEITAR ${discount}% OFF`}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                          onClick={() => alert(`Detalhes completos da promoção ${promo.title}`)}
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
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-3">🎁 Promoção Exclusiva WhatsApp!</h3>
              <p className="mb-4">Fale conosco agora e ganhe 5% de desconto adicional em qualquer pacote!</p>
              <Button
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-3"
                onClick={() =>
                  window.open(
                    "https://wa.me/5564993197555?text=Olá! Quero o desconto adicional de 5% nas promoções!",
                    "_blank",
                  )
                }
              >
                📱 Ganhar Desconto Extra
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
        href="https://wa.me/5564993197555?text=Olá! Gostaria de informações sobre as promoções especiais."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50 animate-pulse"
      >
        <Phone className="w-7 h-7 text-white" />
      </a>
    </div>
  )
}
