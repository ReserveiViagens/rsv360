"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { getCrossSellItems, getCrossSellItemByIndex } from "@/lib/cross-sell-matrix"
import { getContextualSubtitle } from "@/lib/cross-sell-context-messages"
import { MobileCrossSellCard } from "@/components/home/mobile-cross-sell-card"
import { getHomeSideRailsFallback } from "@/lib/home-side-rails"

interface Promotion {
  id: string
  title: string
  description: string
  price: number
  originalPrice: number
  image: string
  discount: number
  badge: string
  validUntil: string
  includes: string[]
  highlight?: boolean
}

export default function PromocoesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

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

  const promotions: Promotion[] = [
    {
      id: "promoferias-20off",
      title: "PROMOFÉRIAS Hotel + Parque Aquático",
      description:
        "Sinta a magia de Caldas Novas! Pacote completo com hotel 4 estrelas + acesso a parque aquático com estacionamento gratuito incluso.",
      price: 149,
      originalPrice: 186,
      image: "/images/promoferias-parque-aquatico.jpeg",
      discount: 20,
      badge: "PROMOFÉRIAS",
      validUntil: "31/01/2025",
      includes: ["Hotel 4 estrelas", "Parque aquático", "Estacionamento Gratuito", "Wi-Fi grátis"],
      highlight: true,
    },
    {
      id: "ilhas-lago-package",
      title: "Ilhas do Lago Resort + Parque Aquático",
      description: "Hospedagem sofisticada no Ilhas do Lago com acesso a parque aquático e spa relaxante.",
      price: 320,
      originalPrice: 380,
      image: "/images/ilhas-do-lago-resort.jpg",
      discount: 15,
      badge: "Mais Vendido",
      validUntil: "15/02/2025",
      includes: ["Resort 5 estrelas", "Spa incluso", "Parque aquático", "Área de relaxamento"],
    },
    {
      id: "melhor-idade",
      title: "Pacote Melhor Idade Caldas Novas",
      description:
        "Condições especiais para grupos da melhor idade com atividades adaptadas e acompanhamento especializado.",
      price: 210,
      originalPrice: 260,
      image: "/images/melhor-idade-caldas-novas.jpeg",
      discount: 20,
      badge: "Melhor Idade",
      validUntil: "28/02/2025",
      includes: [
        "Momentos de lazer e convivência",
        "Atividades recreativas adaptadas",
        "Tratamento em Piscinas termais",
        "Hospedagem em hotel com estrutura adaptada",
      ],
    },
    {
      id: "fim-semana-dourado",
      title: "Pacote Fim de Semana Dourado",
      description: "Hotel + Parque com condições imperdíveis para sua escapada de fim de semana perfeita!",
      price: 299,
      originalPrice: 370,
      image: "/images/fim-de-semana-dourado.jpeg",
      discount: 20,
      badge: "Fim de Semana",
      validUntil: "Ver disponibilidade grátis",
      includes: ["Diárias a partir", "Parque aquático", "Atividades grátis oferecidas pelo hotel", "Late check-out"],
    },
    {
      id: "familia-completa",
      title: "Pacote Família Completa",
      description: "Diversão garantida para toda família com crianças até 12 anos grátis e atividades especiais.",
      price: 450,
      originalPrice: 580,
      image: "/images/pacote-familia-completa.jpeg",
      discount: 22,
      badge: "Família",
      validUntil: "31/03/2025",
      includes: ["Entrada no parque aquático", "Kids club", "Atividades familiares", "Quarto família"],
    },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center z-50">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🏷️</div>
          </div>
        </div>
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Carregando Promoções</h2>
          <p className="text-orange-100">Preparando as melhores ofertas para você...</p>
        </div>
        <div className="mt-8 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-pulse"></div>
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
            {promotions.map((promo, index) => {
              const crossSellItem = (index + 1) % 4 === 0 ? getCrossSellItemByIndex("promotions", Math.floor((index + 1) / 4) - 1, getHomeSideRailsFallback()) : null
              return (
              <div key={promo.id} className="space-y-6">
              <Card
                className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative ${
                  promo.highlight
                    ? "border-4 border-yellow-400 shadow-lg"
                    : "border-2 border-transparent hover:border-orange-200"
                }`}
              >
                {promo.highlight && (
                  <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-black text-center py-1 text-sm font-bold z-20">
                    ⭐ OFERTA MAIS POPULAR ⭐
                  </div>
                )}

                <Badge className="absolute top-3 right-3 bg-red-500 text-white z-10 animate-pulse">
                  -{promo.discount}% OFF
                </Badge>

                <div className={`aspect-video relative overflow-hidden ${promo.highlight ? "mt-8" : ""}`}>
                  <img
                    src={promo.image || "/placeholder.svg"}
                    alt={promo.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-orange-500 text-white font-bold">{promo.badge}</Badge>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-2">{promo.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{promo.description}</p>

                  {/* Includes */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2 text-green-700">✅ O que está incluso:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {promo.includes.map((item) => (
                        <div key={item} className="text-xs text-gray-600 flex items-center gap-1">
                          <span className="text-green-500">•</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Validity */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Válido até: {promo.validUntil}</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-lg text-gray-400 line-through mr-2">
                          {formatPrice(promo.originalPrice)}
                        </span>
                        <div className="text-3xl font-bold text-green-600">{formatPrice(promo.price)}</div>
                        {promo.id === "ilhas-lago-package" ? (
                          <p className="text-xs text-gray-500">diárias a partir de</p>
                        ) : promo.id === "melhor-idade" ? (
                          <p className="text-xs text-gray-500">diárias a partir de</p>
                        ) : promo.id === "fim-semana-dourado" ? (
                          <p className="text-xs text-gray-500">diárias a partir de</p>
                        ) : promo.id === "familia-completa" ? (
                          <p className="text-xs text-gray-500">diárias a partir de</p>
                        ) : (
                          <p className="text-xs text-gray-500">por pessoa</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Você economiza</p>
                        <p className="text-xl font-bold text-red-600">
                          {formatPrice(promo.originalPrice - promo.price)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        className={`w-full font-bold py-3 text-lg ${
                          promo.highlight
                            ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                        onClick={() =>
                          window.open(
                            `https://wa.me/5564993197555?text=Olá! Quero aproveitar a promoção ${promo.title} com ${promo.discount}% de desconto!`,
                            "_blank",
                          )
                        }
                      >
                        {promo.highlight ? "⭐ QUERO ESTA OFERTA ESPECIAL!" : `💚 APROVEITAR ${promo.discount}% OFF`}
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
              {crossSellItem && (
                <div>
                  <MobileCrossSellCard
                    item={crossSellItem}
                    variant="compact"
                    randomImage
                    animation="fade"
                    contextualSubtitle={getContextualSubtitle("promotions", crossSellItem.id, crossSellItem.subtitle)}
                  />
                </div>
              )}
              </div>
            )})}
          </div>

          {/* Cross-sell: após lista — Viagens em grupo */}
          <div>
            {getCrossSellItems("promotions", getHomeSideRailsFallback(), { limit: 4 })
              .filter((i) => i.id === "group-travel")
              .map((item) => (
                <MobileCrossSellCard
                  key={item.id}
                  item={item}
                  variant="compact"
                  randomImage
                  contextualSubtitle={getContextualSubtitle("promotions", item.id, item.subtitle)}
                />
              ))}
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
