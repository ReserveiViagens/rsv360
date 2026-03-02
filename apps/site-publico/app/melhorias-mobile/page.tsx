"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Search, Star, Phone, Shield, CheckCircle, Award, Mic, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import LGPDPopup from "@/components/lgpd-popup"
import ReviewsSection from "@/components/reviews-section"
import ChatAgent from "@/components/chat-agent"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { LeftSideRail } from "@/components/home/left-side-rail"
import { RightSideRail } from "@/components/home/right-side-rail"
import {
  getHomeSideRailsData,
  getHomeSideRailsFallback,
  type HomeSideRailsData,
} from "@/lib/home-side-rails"
import { getCrossSellItems } from "@/lib/cross-sell-matrix"
import { MobileCrossSellCard } from "@/components/home/mobile-cross-sell-card"
import { SmartSearchFilter } from "@/components/search/smart-search-filter"
import { TicketProductCard } from "@/components/cards/ticket-product-card"
import { MobileExpressCheckoutV2 } from "@/components/checkout/mobile-express-checkout-v2"
import { SocialProofSection } from "@/components/social/social-proof-section"
import { SmartSearchSkeleton } from "@/components/skeletons/smart-search-skeleton"
import { TicketCardSkeleton } from "@/components/skeletons/ticket-card-skeleton"
import { getCaldasNovasOSMData } from "@/lib/caldas-novas-osm"
import type { AuctionMapMarkerItem } from "@/components/auctions/AuctionMapLeaflet"
import { ViewToggle, type ViewType } from "@/components/ui/view-toggle"
import type { TicketProductCardVariant } from "@/components/cards/ticket-product-card"
import { IntelligentProductCarousel } from "@/components/carousel/intelligent-product-carousel"

const AuctionMapLeaflet = dynamic(
  () => import("@/components/auctions/AuctionMapLeaflet").then((mod) => mod.AuctionMapLeaflet),
  { ssr: false, loading: () => <div className="h-[300px] w-full rounded-xl bg-gray-200 animate-pulse flex items-center justify-center text-gray-600 text-sm">Carregando mapa...</div> }
)

interface HeaderData {
  type: "video" | "image"
  url: string
  title?: string
  autoplay?: boolean
  muted?: boolean
}

/** URLs de fallback para imagens dos parques (arquivos em public/images podem não existir). */
const HOT_PARK_IMAGE =
  "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop"
const DIROMA_IMAGE =
  "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop"

const CATEGORIES = [
  { icon: "🔍", label: "Buscar", href: "/buscar" },
  { icon: "🏨", label: "Hotéis", href: "/hoteis" },
  { icon: "🎟️", label: "Ingressos", href: "/ingressos" },
  { icon: "🏞️", label: "Atrações", href: "/atracoes" },
]

const DEPOIMENTOS_REAIS = [
  {
    text: "Excelente atendimento! Viagem incrível para Caldas Novas. Super recomendo!",
    author: "Erica N.",
    source: "World360tur (similar regional)",
  },
  {
    text: "Agência nota 10! Fechei hotéis e ingressos parque. Atendimento Priscila top!",
    author: "Milane F.",
    source: "Cliente verificada",
  },
  {
    text: "Reserve Viagens: atendimento rápido, equipe eficiente, flexibilidade pagamento.",
    author: "SUA HOME Imobiliária",
    source: "Parceiro",
  },
]

/** Tipo mínimo para o evento onresult da Web Speech API (evita erro de parse em .tsx) */
interface VoiceResultEvent {
  results: Array<{ 0: { transcript: string }; length: number }>
}

export type ExpressCheckoutItem = {
  title: string
  discountedPrice: number
  originalPrice: number
  installments?: string
}

export default function MelhoriasMobilePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showLGPDPopup, setShowLGPDPopup] = useState(false)
  const [expressCheckoutItem, setExpressCheckoutItem] = useState<ExpressCheckoutItem | null>(null)
  const [sideRailsData, setSideRailsData] = useState<HomeSideRailsData>(() => getHomeSideRailsFallback())
  const [sideRailsLoading, setSideRailsLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [headerData, setHeaderData] = useState<HeaderData | null>({
    type: "image",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png",
    title: "Reservei Viagens - Hotéis em Caldas Novas",
  })
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [hotParkImage, setHotParkImage] = useState(HOT_PARK_IMAGE)
  const [diromaImage, setDiromaImage] = useState(DIROMA_IMAGE)
  const [viewType, setViewType] = useState<ViewType>("grid")

  const mapOfertaItems = useMemo((): AuctionMapMarkerItem[] => {
    const osm = getCaldasNovasOSMData()
    return osm.map((item, i) => ({
      id: i,
      title: item.name,
      lat: item.lat,
      lng: item.lng,
      image: item.image,
      priceFormatted: item.price,
      linkUrl: item.website || `/hoteis/${item.slug || item.id}`,
      status: "regular",
    }))
  }, [])

  const countdownDemoEnd = useMemo(() => new Date(Date.now() + 6 * 60 * 1000), [])

  useEffect(() => {
    setVoiceSupported(
      typeof window !== "undefined" &&
        !!(window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition)
    )
  }, [])

  const startVoiceSearch = useCallback(() => {
    if (typeof window === "undefined") return
    type RecognitionInstance = {
      lang: string
      continuous: boolean
      interimResults: boolean
      start: () => void
      onresult: (ev: VoiceResultEvent) => void
      onend: () => void
      onerror: () => void
    }
    const Win = window as Window & {
      SpeechRecognition?: new () => RecognitionInstance
      webkitSpeechRecognition?: new () => RecognitionInstance
    }
    const SR = Win.SpeechRecognition ?? Win.webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.lang = "pt-BR"
    recognition.continuous = false
    recognition.interimResults = false
    setIsListening(true)
    recognition.onresult = (event: VoiceResultEvent) => {
      const last = event.results[event.results.length - 1]
      const transcript = (last && last[0] ? last[0].transcript : "") as string
      const q = encodeURIComponent(transcript.trim())
      window.location.href = `/buscar?q=${q}`
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.start()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : "")
        try {
          const headerController = new AbortController()
          const headerTimeout = setTimeout(() => headerController.abort(), 5000)
          const headerResponse = await fetch(`${API_BASE_URL}/api/website/header`, { method: "GET", signal: headerController.signal })
          clearTimeout(headerTimeout)
          if (headerResponse.ok) {
            const result = await headerResponse.json()
            if (result.success && result.data) {
              setHeaderData({
                type: result.data.type || "image",
                url: result.data.url || result.data.logo,
                title: result.data.title,
                autoplay: result.data.autoplay || false,
                muted: result.data.muted ?? true,
              })
            }
          }
        } catch {
          setHeaderData({
            type: "image",
            url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png",
            title: "Reservei Viagens - Hotéis em Caldas Novas",
          })
        }
      } catch {
        setError("Erro ao carregar dados. Exibindo versão padrão.")
      }
    }
    loadData()
    if (typeof window !== "undefined" && !localStorage.getItem("reservei-lgpd-consent")) setShowLGPDPopup(true)
  }, [])

  useEffect(() => {
    let mounted = true
    const loadSideRails = async () => {
      try {
        const data = await getHomeSideRailsData()
        if (mounted) setSideRailsData(data)
      } catch {
        if (mounted) setSideRailsData(getHomeSideRailsFallback())
      } finally {
        if (mounted) setSideRailsLoading(false)
      }
    }
    loadSideRails()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto md:max-w-[1320px] xl:max-w-[1440px] 2xl:max-w-[1600px] md:px-4 xl:px-8 2xl:px-10">
        <div className="md:grid md:grid-cols-[18rem_minmax(0,1fr)_18rem] lg:grid-cols-[18rem_minmax(0,1fr)_18rem] xl:grid-cols-[20rem_minmax(0,1fr)_20rem] 2xl:grid-cols-[20.5rem_minmax(0,1fr)_20.5rem] md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 md:items-start">
          <LeftSideRail section={sideRailsData.left} loading={sideRailsLoading} />
          <div className={expressCheckoutItem ? "max-w-md mx-auto bg-gray-50 min-h-screen relative md:max-w-none md:mt-4 xl:mt-6 md:mb-6 xl:mb-8 md:rounded-3xl md:overflow-hidden md:border md:border-gray-200 xl:shadow-sm pb-32 md:pb-36" : "max-w-md mx-auto bg-gray-50 min-h-screen relative md:max-w-none md:mt-4 xl:mt-6 md:mb-6 xl:mb-8 md:rounded-3xl md:overflow-hidden md:border md:border-gray-200 xl:shadow-sm"}>
            <div className="animate-in fade-in duration-500">
              {error && (
                <div className="mx-4 mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">{error}</div>
              )}

              {/* Banner: Página de teste */}
              <div className="md:hidden mx-4 mt-2 py-2 px-3 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-sm text-center">
                📱 Página de teste – Melhorias mobile. <Link href="/" className="underline font-medium">Voltar à home</Link>
              </div>

              <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
                      alt="Reservei Viagens"
                      width={40}
                      height={40}
                      priority
                      className="rounded-full bg-white/20 p-1 object-cover"
                    />
                    <h1 className="text-2xl font-bold tracking-tight">Reservei Viagens</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white border border-white/30">Entrar</Button>
                    </Link>
                    <Link href="/login?tab=register">
                      <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 font-medium">Cadastrar</Button>
                    </Link>
                  </div>
                </div>

                {/* Busca touch-friendly + Voice search (melhoria mobile) */}
                <div className="relative mb-6">
                  <Link href="/buscar" className="block">
                    <div className="relative flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        <Input
                          type="text"
                          placeholder="Buscar Hotéis, Parques..."
                          value={searchQuery}
                          readOnly
                          className="pl-10 min-h-12 text-base bg-white/95 border-0 rounded-xl shadow-sm cursor-pointer touch-manipulation"
                          onClick={(e) => { e.preventDefault(); window.location.href = "/buscar" }}
                        />
                      </div>
                      {voiceSupported && (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); startVoiceSearch() }}
                          disabled={isListening}
                          className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 transition-colors touch-manipulation"
                          aria-label="Buscar por voz"
                          title="Buscar por voz"
                        >
                          <Mic className={`w-5 h-5 ${isListening ? "animate-pulse" : ""}`} />
                        </button>
                      )}
                    </div>
                  </Link>
                  {voiceSupported && (
                    <p className="text-xs text-white/80 mt-1">Toque no microfone para buscar por voz</p>
                  )}
                </div>

                {/* Hero image - priority (LCP) */}
                <div className="relative w-full aspect-video bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl overflow-hidden shadow-xl mb-6 flex items-center justify-center">
                  {headerData?.type === "image" && (
                    <ImageWithFallback
                      src={headerData.url}
                      alt={headerData.title || "Reservei Viagens"}
                      width={800}
                      height={450}
                      objectFit="cover"
                      priority
                      className="w-full h-full"
                    />
                  )}
                  {!headerData && (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <p className="text-blue-100">Carregando...</p>
                    </div>
                  )}
                </div>

                {/* Mobile: Swipe carousel | Desktop: Grid (melhoria mobile) */}
                <div className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-4 pb-2 -mx-1 scrollbar-hide">
                  {CATEGORIES.map((cat, i) => (
                    <Link key={i} href={cat.href} className="flex-shrink-0 w-[140px] snap-center">
                      <button className="flex flex-col items-center p-4 rounded-2xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all w-full min-h-[100px] touch-manipulation">
                        <span className="text-2xl mb-2">{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.label}</span>
                      </button>
                    </Link>
                  ))}
                  <Link href="/promocoes" className="flex-shrink-0 w-[160px] snap-center">
                    <button className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold hover:from-yellow-500 hover:to-orange-500 transition-all w-full min-h-[100px] touch-manipulation">
                      <span className="text-xl">🏷️</span>
                      <span className="text-sm">Ver Promoções</span>
                    </button>
                  </Link>
                </div>
                <div className="hidden md:grid grid-cols-4 gap-3 mt-0">
                  {CATEGORIES.map((cat, i) => (
                    <Link key={i} href={cat.href}>
                      <button className="flex flex-col items-center p-3 rounded-2xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all w-full">
                        <span className="text-2xl mb-2">{cat.icon}</span>
                        <span className="text-xs font-medium">{cat.label}</span>
                      </button>
                    </Link>
                  ))}
                </div>
                <div className="hidden md:block mt-3">
                  <Link href="/promocoes">
                    <button className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold hover:from-yellow-500 hover:to-orange-500 transition-all">
                      <span className="text-xl">🏷️</span>
                      <span>Ver Promoções Especiais</span>
                    </button>
                  </Link>
                </div>
              </header>

              <div className="p-6 space-y-8">
                {/* SmartSearchFilter ou skeleton (Plano Remaster) */}
                {isLoading ? (
                  <SmartSearchSkeleton />
                ) : (
                  <SmartSearchFilter
                    onVoiceSearch={startVoiceSearch}
                    isListening={isListening}
                    voiceSupported={voiceSupported}
                  />
                )}

                {/* Mais Vendidos em Caldas / Ofertas de Hoje (Plano Remaster) */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Mais Vendidos em Caldas</h2>
                      <p className="text-sm text-gray-600 mt-1">Ofertas de hoje</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      {/* Toggle só visível em desktop/tablet (md+) - em mobile sempre grade para melhor conversão */}
                      <ViewToggle 
                        value={viewType} 
                        onValueChange={setViewType}
                        className="hidden md:flex"
                      />
                      <Link href="/ingressos" className="text-blue-600 font-medium text-sm hover:underline shrink-0">Ver todos</Link>
                    </div>
                  </div>
                  {/* Em mobile sempre grade (grid-cols-1), em desktop respeita escolha do usuário */}
                  <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                    {isLoading ? (
                      <>
                        <TicketCardSkeleton />
                        <TicketCardSkeleton />
                        <TicketCardSkeleton />
                        <TicketCardSkeleton />
                      </>
                    ) : (
                    <>
                    <TicketProductCard
                      title="Hot Park - 1 dia"
                      image={hotParkImage}
                      onImageError={() => setHotParkImage(HOT_PARK_IMAGE)}
                      originalPrice={199}
                      discountedPrice={149}
                      rating={4.8}
                      soldToday={12}
                      installments="em até 12x de R$ 12,42"
                      href="/ingressos/hot-park"
                      onAddToCart={setExpressCheckoutItem}
                      countdownEnd={countdownDemoEnd}
                      soldPercent={90}
                      scarcityMessage="Apenas 2 quartos a este preço!"
                      variant={viewType as TicketProductCardVariant}
                    />
                    <TicketProductCard
                      title="diRoma Thermas - Acesso ao parque"
                      image={diromaImage}
                      onImageError={() => setDiromaImage(DIROMA_IMAGE)}
                      originalPrice={179}
                      discountedPrice={129}
                      rating={4.6}
                      soldToday={8}
                      installments="em até 6x sem juros"
                      href="/ingressos/diroma"
                      onAddToCart={setExpressCheckoutItem}
                      remainingUnits={3}
                      scarcityMessage="Últimas unidades!"
                      variant={viewType as TicketProductCardVariant}
                    />
                    <TicketProductCard
                      title="Lagoa Quente - Day use"
                      image="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop"
                      originalPrice={89}
                      discountedPrice={69}
                      rating={4.5}
                      soldToday={23}
                      installments="à vista ou 3x sem juros"
                      href="/ingressos/lagoa-quente"
                      onAddToCart={setExpressCheckoutItem}
                      variant={viewType as TicketProductCardVariant}
                    />
                    <TicketProductCard
                      title="Náutico - 1 dia"
                      image="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop"
                      originalPrice={120}
                      discountedPrice={99}
                      rating={4.7}
                      soldToday={5}
                      installments="em até 4x"
                      href="/ingressos/nautico"
                      onAddToCart={setExpressCheckoutItem}
                      variant={viewType as TicketProductCardVariant}
                    />
                    </>
                    )}
                  </div>
                </div>

                {/* Carrossel Inteligente Personalizado - Recomendações baseadas em comportamento */}
                <IntelligentProductCarousel
                  title="Recomendado para você"
                  subtitle="Produtos personalizados baseados no seu comportamento de navegação e compras"
                  count={8}
                  showBadges={true}
                  onProductClick={(product) => {
                    // Track evento de clique em produto recomendado
                    console.log("Produto recomendado clicado:", product.title, "Score:", product.score.score)
                  }}
                />

                {/* Prova Social – formato Plano (Remaster) */}
                <SocialProofSection />

                {/* Mapa de ofertas em Caldas Novas (Plano Remaster) */}
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Mapa de ofertas em Caldas Novas</h2>
                    <Link href="/mapa-caldas-novas" className="text-blue-600 font-medium text-sm hover:underline shrink-0">
                      Ver mapa completo
                    </Link>
                  </div>
                  <div className="rounded-xl border border-gray-200 overflow-hidden h-[300px] md:h-[400px] bg-gray-100">
                    <AuctionMapLeaflet
                      items={mapOfertaItems}
                      usePriceTagMarkers
                      center={[-17.61, -48.62]}
                      zoom={11}
                      className="h-full w-full"
                    />
                  </div>
                </div>

                {/* Banner Precisa de Ajuda? (Plano Remaster) */}
                <Link href="https://wa.me/5562999999999" target="_blank" rel="noopener noreferrer" className="block">
                  <Card className="bg-blue-600 hover:bg-blue-700 border-0 text-white overflow-hidden transition-colors">
                    <CardContent className="p-6 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">Precisa de Ajuda?</h3>
                        <p className="text-blue-100 text-sm">Fale conosco no WhatsApp.</p>
                      </div>
                      <span className="text-2xl">💬</span>
                    </CardContent>
                  </Card>
                </Link>

                {/* Cross-sell: após categorias — 1 card oferta/flash */}
                <div>
                  {getCrossSellItems("home", sideRailsData, { limit: 1 }).map((item) => (
                    <MobileCrossSellCard key={item.id} item={item} variant="full" animation="slide" />
                  ))}
                </div>
                {/* CTA Monte suas férias (melhoria doc) */}
                <Link href="/cotacao" className="block">
                  <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5" />
                        <span className="text-sm font-semibold uppercase tracking-wider opacity-95">Monte suas férias</span>
                      </div>
                      <p className="text-lg font-bold mb-1">Escolha hotel, parque, atrações e extras em um só lugar.</p>
                      <p className="text-sm text-blue-100 mb-4">Datas → Hotel → Parques → Atrações → Café da manhã, roupa de cama e mais.</p>
                      <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors">
                        <Calendar className="w-4 h-4" />
                        Montar meu roteiro
                      </span>
                    </CardContent>
                  </Card>
                </Link>

                <Card className="bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-900 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                  <CardContent className="p-8 text-center relative z-10">
                    <Badge className="bg-red-500 text-white mb-4 animate-pulse">🔥 PROMOFÉRIAS CALDAS NOVAS!</Badge>
                    <h2 className="text-xl font-bold mb-2">Hotel + Parque Aquático</h2>
                    <p className="text-sm text-gray-700 mb-1">Diárias a partir de</p>
                    <div className="text-4xl font-black mb-2 text-blue-700">R$ 149,99</div>
                    <p className="text-sm opacity-90 mb-4">por pessoa</p>
                    <p className="text-sm leading-relaxed mb-6 opacity-95">
                      Sinta a magia de Caldas Novas! Planeje sua viagem dos sonhos hoje com diárias imperdíveis.
                    </p>
                    <Link href="/promocoes">
                      <Button className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all min-h-12 touch-manipulation">
                        Quero Esta Super Oferta!
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Cross-sell: após PROMOFÉRIAS — 2 cards (Hotéis + Parques) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getCrossSellItems("home", sideRailsData, { limit: 4 })
                    .filter((i) => ["hotels", "water-parks"].includes(i.id))
                    .slice(0, 2)
                    .map((item) => (
                      <MobileCrossSellCard key={item.id} item={item} variant="full" />
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: CheckCircle, title: "Garantia de", subtitle: "Melhor Preço" },
                    { icon: Shield, title: "Pagamento", subtitle: "100% Seguro" },
                    { icon: Award, title: "+5000 Clientes", subtitle: "Satisfeitos" },
                  ].map((badge, i) => {
                    const Icon = badge.icon
                    return (
                      <Card key={i} className="text-center p-4">
                        <CardContent className="p-0">
                          <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-xs font-medium text-gray-600">{badge.title}<br />{badge.subtitle}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Cross-sell: entre Trust Badges e Quick Access — 1 card */}
                <div>
                  {getCrossSellItems("home", sideRailsData, { excludeIds: ["hotels", "water-parks"], limit: 1 }).map((item) => (
                    <MobileCrossSellCard key={item.id} item={item} variant="full" animation="fade" />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Link href="/hoteis">
                    <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl mb-3">🏨</div>
                        <h3 className="font-bold text-lg mb-2">Hotéis</h3>
                        <p className="text-sm text-gray-600 mb-4">Conforto e qualidade garantidos</p>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 min-h-10">Ver Hotéis</Button>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/promocoes">
                    <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl mb-3">🏷️</div>
                        <h3 className="font-bold text-lg mb-2">Promoções</h3>
                        <p className="text-sm text-gray-600 mb-4">Ofertas imperdíveis</p>
                        <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 min-h-10">Ver Ofertas</Button>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {/* Cross-sell: após Quick Access — 2 cards (Atrações + Aluguel temporada) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getCrossSellItems("home", sideRailsData, { limit: 6 })
                    .filter((i) => ["attractions", "season-rentals"].includes(i.id))
                    .slice(0, 2)
                    .map((item) => (
                      <MobileCrossSellCard key={item.id} item={item} variant="full" />
                    ))}
                </div>

                {/* Depoimentos reais (melhoria mobile) */}
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Depoimentos de clientes</h2>
                  <div className="space-y-4">
                    {DEPOIMENTOS_REAIS.map((d, i) => (
                      <Card key={i}>
                        <CardContent className="p-5">
                          <p className="text-gray-700 italic mb-3">&ldquo;{d.text}&rdquo;</p>
                          <p className="font-semibold text-gray-800">{d.author}</p>
                          <p className="text-xs text-gray-500">{d.source}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">O que nossos clientes dizem</h2>
                  <ReviewsSection />
                </div>

                <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600 space-y-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
                      alt="Reservei Viagens"
                      width={32}
                      height={32}
                      loading="lazy"
                      className="rounded-full object-cover"
                    />
                    <p className="text-lg font-bold text-blue-600">Reservei Viagens</p>
                  </div>
                  <p className="italic text-blue-600 font-medium">"Parques, Hotéis & Atrações"</p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-gray-800">Sede Caldas Novas:</p>
                      <p>Rua RP5, Residencial Primavera 2 - Caldas Novas, Goiás</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Filial Cuiabá:</p>
                      <p>Av. Manoel José de Arruda, Porto - Cuiabá, Mato Grosso</p>
                    </div>
                  </div>
                  <p className="text-xs mt-6 pb-24">© 2024-2025 Reservei Viagens. Todos os direitos reservados.</p>
                </footer>
              </div>

              <div className="md:hidden">
                <ChatAgent />
              </div>
            </div>
          </div>
          <RightSideRail section={sideRailsData.right} loading={sideRailsLoading} />
        </div>
      </div>

      {showLGPDPopup && <LGPDPopup onAccept={() => {}} onDecline={() => {}} />}

      {/* Checkout Expresso fixo (Plano Remaster) - quando há item selecionado */}
      {expressCheckoutItem && (
        <MobileExpressCheckoutV2
          totalAmount={expressCheckoutItem.discountedPrice}
          discountAmount={expressCheckoutItem.originalPrice - expressCheckoutItem.discountedPrice}
          itemCount={1}
          maxInstallments={expressCheckoutItem.installments ?? "em até 12x sem juros"}
          badgeLabel="PREÇO DE CALDAS"
          onConfirm={() => router.push("/reserva-confirmada")}
        />
      )}

      {/* Sticky CTA "Reservar Agora" - apenas mobile, acima do Circular Nav (melhoria) - oculto quando checkout fixo está visível */}
      {!expressCheckoutItem && (
      <div className="md:hidden fixed bottom-20 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <Link
          href="/cotacao"
          className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-green-500 hover:bg-green-600 text-white font-bold text-base transition-colors touch-manipulation"
        >
          <Phone className="w-5 h-5 shrink-0" />
          <span>Reservar Agora</span>
        </Link>
      </div>
      )}

      {/* FAB Cotação - só desktop (na home normal é sempre visível; aqui no teste escondemos no mobile pois temos a barra sticky) */}
      <Link
        href="/cotacao"
        className="hidden md:flex fixed bottom-6 right-8 items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 rounded-full shadow-lg z-50 text-white font-semibold text-sm"
      >
        <Phone className="w-5 h-5 shrink-0" />
        <span>Realizar Cotação</span>
      </Link>

      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-24 right-4 md:bottom-24 md:right-8 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-40"
        size="sm"
      >
        ↑
      </Button>
    </div>
  )
}
