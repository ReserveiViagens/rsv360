"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Phone, MapPin, Clock, Camera, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { getCrossSellItems, getCrossSellItemByIndex } from "@/lib/cross-sell-matrix"
import { getContextualSubtitle } from "@/lib/cross-sell-context-messages"
import { MobileCrossSellCard } from "@/components/home/mobile-cross-sell-card"
import { getHomeSideRailsFallback } from "@/lib/home-side-rails"

interface Attraction {
  id: string
  name: string
  description: string
  image: string
  location: string
  duration: string
  category: string
  highlights: string[]
  rating: number
  price?: number
  free?: boolean
}

export default function AtracoesPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const attractions: Attraction[] = [
    {
      id: "jardim-japones",
      name: "Jardim Japonês",
      description:
        "Um refúgio de paz e beleza oriental, ideal para contemplação, meditação e fotografias únicas em meio à natureza exuberante.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/images.jfif-qEh8dMMyYkqDeGxaBMbhqplQXVSpEU.jpeg",
      location: "Centro de Caldas Novas",
      duration: "1-2 horas",
      category: "Natureza",
      highlights: ["Arquitetura japonesa", "Lagos ornamentais", "Pontes tradicionais", "Área de meditação"],
      rating: 4.8,
      price: 10,
    },
    {
      id: "lago-corumba",
      name: "Lago Corumbá",
      description:
        "Passeios de barco, jet ski e uma bela vista para relaxar e se divertir. Perfeito para esportes aquáticos e contemplação.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/97cea591709031183bf3c175de4d26c4.jpg-hDxD6ZNoJL0WRJF9sZC84493RoYy4A.jpeg",
      location: "Caldas Novas - GO",
      duration: "Meio dia",
      category: "Aventura",
      highlights: ["Passeios de barco", "Jet ski", "Pesca esportiva", "Vista panorâmica"],
      rating: 4.6,
      price: null, // Special case for "ver disponibilidade"
    },
    {
      id: "monumento-aguas",
      name: "Monumento das Águas",
      description: "Visite o cartão postal de Caldas Novas, símbolo das águas termais e marco histórico da cidade.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/monumento-as-aguas.jpg-23Ox7hDb2v9O7MvysJbMC402VHtIJ2.jpeg",
      location: "Centro Histórico",
      duration: "30 minutos",
      category: "Histórico",
      highlights: ["Marco histórico", "Fonte termal", "Área para fotos", "Centro da cidade"],
      rating: 4.4,
      free: true,
    },
    {
      id: "feira-hippie",
      name: "Feira do Luar",
      description:
        "Feira noturna com artesanato local, gastronomia típica e apresentações culturais. Experiência autêntica de Caldas Novas.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/unnamed.jpg-kMID5PSp6hxQkx36Qp540D7NUs1N9Y.jpeg",
      location: "Praça Central",
      duration: "2-3 horas",
      category: "Cultural",
      highlights: ["Artesanato local", "Gastronomia típica", "Música ao vivo", "Produtos regionais"],
      rating: 4.7,
      free: true,
    },
    {
      id: "parque-estadual",
      name: "Parque Estadual da Serra de Caldas",
      description:
        "Trilhas ecológicas, cachoeiras naturais e vista panorâmica da região. Ideal para ecoturismo e aventura.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Entrada-do-PESCAN-Parque-da-Serra-de-Caldas.jpg-1dCOLwSaVTKLgUQ35R0f6eVwQ20xhX.jpeg",
      location: "Serra de Caldas Novas",
      duration: "Dia inteiro",
      category: "Ecoturismo",
      highlights: ["Trilhas ecológicas", "Cachoeiras", "Vista panorâmica", "Flora e fauna"],
      rating: 4.9,
      price: null, // Changed to "ver disponibilidade"
    },
    {
      id: "centro-historico",
      name: "Centro Histórico",
      description: "Passeio pela história de Caldas Novas, com arquitetura colonial preservada e museus locais.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/O-que-fazer-em-Caldas-Novas-alem-dos-parques-.jpg-hggVCc4sV9K9nxiHfEglNOYL1NO3Mr.jpeg",
      location: "Centro de Caldas Novas",
      duration: "2-3 horas",
      category: "Histórico",
      highlights: ["Arquitetura colonial", "Museu local", "Igreja histórica", "Casarões antigos"],
      rating: 4.3,
      free: true,
    },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Natureza: "bg-green-500",
      Aventura: "bg-blue-500",
      Histórico: "bg-amber-500",
      Cultural: "bg-purple-500",
      Ecoturismo: "bg-emerald-500",
    }
    return colors[category as keyof typeof colors] || "bg-gray-500"
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center z-50">
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-white/20 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🏞️</div>
          </div>
        </div>
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Carregando Atrações</h2>
          <p className="text-green-100">Descobrindo os melhores pontos turísticos...</p>
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
        <header className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-b-3xl shadow-lg">
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
            <h1 className="text-2xl font-bold tracking-tight">Atrações Turísticas</h1>
          </div>

          {/* Hero CTA */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <h2 className="text-lg font-bold mb-2">🗺️ Explore Caldas Novas!</h2>
            <p className="text-sm mb-3">Roteiros personalizados + Guia local</p>
            <Badge className="bg-yellow-500 text-black animate-pulse">📸 Lugares instagramáveis!</Badge>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-4 text-center">
              <h3 className="font-bold text-lg mb-2">🎯 DICA ESPECIAL!</h3>
              <p className="text-sm mb-3">Muitas atrações são GRATUITAS em Caldas Novas</p>
              <Badge className="bg-white text-blue-600 font-bold">Aproveite sem gastar nada!</Badge>
            </CardContent>
          </Card>

          {/* Attractions List */}
          <div className="space-y-6">
            {attractions.map((attraction, index) => {
              const crossSellItem = (index + 1) % 3 === 0 ? getCrossSellItemByIndex("attractions", Math.floor((index + 1) / 3) - 1, getHomeSideRailsFallback()) : null
              return (
              <div key={attraction.id} className="space-y-6">
              <Card
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative border-2 border-transparent hover:border-green-200"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={attraction.image || "/placeholder.svg"}
                    alt={attraction.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <Badge
                    className={`absolute top-3 left-3 ${getCategoryColor(attraction.category)} text-white font-bold`}
                  >
                    {attraction.category}
                  </Badge>
                  {attraction.free && (
                    <Badge className="absolute top-3 right-3 bg-green-500 text-white font-bold animate-pulse">
                      GRÁTIS
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-1">{attraction.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">{renderStars(Math.floor(attraction.rating))}</div>
                        <span className="text-sm text-gray-600">({attraction.rating})</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{attraction.description}</p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">{attraction.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">{attraction.duration}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2 text-green-700">✨ Destaques:</h4>
                    <div className="flex flex-wrap gap-1">
                      {attraction.highlights.slice(0, 3).map((highlight) => (
                        <Badge key={highlight} variant="secondary" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                      {attraction.highlights.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{attraction.highlights.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {attraction.free ? (
                          <div className="text-2xl font-bold text-green-600">GRATUITO</div>
                        ) : attraction.id === "jardim-japones" ? (
                          <div>
                            <div className="text-2xl font-bold text-green-600">{formatPrice(attraction.price!)}</div>
                            <div className="text-xs text-green-600 font-semibold">✨ 💰 PIX ou dinheiro!</div>
                          </div>
                        ) : attraction.id === "lago-corumba" || attraction.id === "parque-estadual" ? (
                          <div className="text-lg font-bold text-blue-600">Ver disponibilidade e valor</div>
                        ) : (
                          <div className="text-2xl font-bold text-green-600">{formatPrice(attraction.price!)}</div>
                        )}
                        <p className="text-xs text-gray-500">
                          {attraction.free
                            ? "Entrada livre"
                            : attraction.id === "jardim-japones"
                              ? "entrada no PIX ou dinheiro"
                              : attraction.id === "lago-corumba" || attraction.id === "parque-estadual"
                                ? "consulte valores e horários"
                                : "por pessoa"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Instagramável</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-lg"
                        onClick={() =>
                          window.open(
                            `https://wa.me/5564993197555?text=Olá! Quero informações sobre ${attraction.name} e como chegar lá!`,
                            "_blank",
                          )
                        }
                      >
                        📍 COMO CHEGAR + DICAS
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => alert(`Detalhes completos de ${attraction.name}`)}
                      >
                        Ver Fotos e Horários
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
                    contextualSubtitle={getContextualSubtitle("attractions", crossSellItem.id, crossSellItem.subtitle)}
                  />
                </div>
              )}
              </div>
            )})}
          </div>

          {/* Cross-sell: após lista — Excursões */}
          <div>
            {getCrossSellItems("attractions", getHomeSideRailsFallback(), { limit: 4 })
              .filter((i) => i.id === "excursions")
              .map((item) => (
                <MobileCrossSellCard
                  key={item.id}
                  item={item}
                  variant="compact"
                  randomImage
                  contextualSubtitle={getContextualSubtitle("attractions", item.id, item.subtitle)}
                />
              ))}
          </div>

          {/* Tour Guide CTA */}
          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-3">🗺️ Roteiro Personalizado!</h3>
              <p className="mb-4">
                Nossos guias locais criam o roteiro perfeito para você conhecer o melhor de Caldas Novas
              </p>
              <Button
                className="bg-white text-amber-600 hover:bg-gray-100 font-bold px-8 py-3"
                onClick={() =>
                  window.open(
                    "https://wa.me/5564993197555?text=Olá! Quero um roteiro personalizado para conhecer as atrações de Caldas Novas!",
                    "_blank",
                  )
                }
              >
                🎯 Criar Meu Roteiro
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
        href="https://wa.me/5564993197555?text=Olá! Gostaria de informações sobre as atrações turísticas de Caldas Novas."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50 animate-pulse"
      >
        <Phone className="w-7 h-7 text-white" />
      </a>
    </div>
  )
}
