"use client"

import { useState, useEffect, useCallback } from "react"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { TicketProductCard } from "@/components/cards/ticket-product-card"
import { TicketCardSkeleton } from "@/components/skeletons/ticket-card-skeleton"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Plane } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
import type { ProductScore } from "@/lib/recommendation-engine"

interface PersonalizedProduct {
  id: number
  title: string
  category: string
  price: number
  originalPrice?: number
  rating?: number
  soldToday?: number
  image: string
  tags?: string[]
  soldPercent?: number
  remainingUnits?: number
  countdownEnd?: Date
  scarcityMessage?: string
  score: ProductScore
}

interface IntelligentProductCarouselProps {
  title?: string
  subtitle?: string
  count?: number
  category?: string
  showBadges?: boolean
  onProductClick?: (product: PersonalizedProduct) => void
  className?: string
}

export function IntelligentProductCarousel({
  title = "Recomendado para você",
  subtitle = "Produtos personalizados baseados no seu comportamento",
  count = 10,
  category,
  showBadges = true,
  onProductClick,
  className,
}: IntelligentProductCarouselProps) {
  const [products, setProducts] = useState<PersonalizedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)

  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = typeof window !== "undefined" 
        ? localStorage.getItem("token") 
        : null

      const params = new URLSearchParams({
        count: count.toString(),
        randomization: "20", // 20% de randomização
        ...(category && { category }),
      })

      const response = await fetch(
        `/api/recommendations/personalized?${params.toString()}`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      )

      if (!response.ok) {
        throw new Error("Erro ao buscar recomendações")
      }

      const data = await response.json()
      
      if (data.success && data.products) {
        setProducts(data.products)
        
        // Track evento
        trackEvent({
          event_type: "recommendation",
          event_name: "recommendations_loaded",
          properties: {
            count: data.products.length,
            category,
            hasPersonalization: !!data.userProfile,
          },
        })
      } else {
        throw new Error(data.error || "Erro desconhecido")
      }
    } catch (err: any) {
      console.error("Erro ao buscar recomendações:", err)
      setError(err.message || "Erro ao carregar recomendações")
    } finally {
      setIsLoading(false)
    }
  }, [count, category])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  // Auto-play: avança o carrossel a cada 3 segundos
  useEffect(() => {
    if (!carouselApi || products.length <= 1) return
    const interval = setInterval(() => {
      carouselApi.scrollNext()
    }, 3000)
    return () => clearInterval(interval)
  }, [carouselApi, products.length])

  const handleProductClick = useCallback(
    (product: PersonalizedProduct) => {
      // Track evento
      trackEvent({
        event_type: "recommendation",
        event_name: "recommended_product_clicked",
        properties: {
          productId: product.id,
          productTitle: product.title,
          score: product.score.score,
        },
      })

      onProductClick?.(product)
    },
    [onProductClick]
  )

  if (error) {
    return (
      <div className={`p-4 text-center text-gray-600 ${className}`}>
        <p>Erro ao carregar recomendações: {error}</p>
        <button
          onClick={fetchRecommendations}
          className="mt-2 text-blue-600 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={className}>
        {title && (
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        )}
        <div className="flex gap-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="min-w-[280px]">
              <TicketCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-600 ${className}`}>
        <p>Nenhuma recomendação disponível no momento.</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            {showBadges && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Personalizado
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Carousel com auto-play e setas com ícone de avião */}
      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product, index) => {
            const isPersonalized = product.score.score >= 30
            const isTopRecommendation = index < 3 && product.score.score >= 50

            return (
              <CarouselItem
                key={product.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <div className="relative">
                  {isTopRecommendation && showBadges && (
                    <Badge
                      className="absolute top-2 right-2 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
                    >
                      ⭐ Top Recomendação
                    </Badge>
                  )}
                  {isPersonalized && !isTopRecommendation && showBadges && (
                    <Badge
                      className="absolute top-2 right-2 z-10 bg-blue-600 text-white border-0"
                    >
                      Recomendado
                    </Badge>
                  )}
                  <TicketProductCard
                    title={product.title}
                    image={product.image}
                    originalPrice={product.originalPrice || product.price}
                    discountedPrice={product.price}
                    rating={product.rating}
                    soldToday={product.soldToday}
                    installments={`em até 12x de R$ ${(product.price / 12).toFixed(2)}`}
                    href={`/ingressos/${product.id}`}
                    countdownEnd={product.countdownEnd}
                    soldPercent={product.soldPercent}
                    remainingUnits={product.remainingUnits}
                    scarcityMessage={product.scarcityMessage}
                    variant="grid"
                    onAddToCart={(item) => {
                      handleProductClick(product)
                    }}
                  />
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        {/* Setas com ícone de avião: alinhadas ao layout (azul, tamanho e posição UX) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-1 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full hidden md:flex z-10 bg-white/95 hover:bg-blue-600 text-blue-600 hover:text-white border border-gray-200 hover:border-blue-600 shadow-lg transition-all duration-200"
          onClick={() => carouselApi?.scrollPrev()}
          aria-label="Anterior"
        >
          <Plane className="h-5 w-5 rotate-180" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full hidden md:flex z-10 bg-white/95 hover:bg-blue-600 text-blue-600 hover:text-white border border-gray-200 hover:border-blue-600 shadow-lg transition-all duration-200"
          onClick={() => carouselApi?.scrollNext()}
          aria-label="Próximo"
        >
          <Plane className="h-5 w-5" />
        </Button>
      </Carousel>
    </div>
  )
}
