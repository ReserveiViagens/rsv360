"use client"

import { useState, useEffect } from "react"
import { Search, Star, Phone, Shield, CheckCircle, Award, MapPin, Calendar } from '@/lib/lucide-icons'
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

interface HeaderData {
  type: "video" | "image";
  url: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
}

export default function ReserveiViagensLanding() {
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [shouldAutoplay, setShouldAutoplay] = useState(false)
  const [showLGPDPopup, setShowLGPDPopup] = useState(false)
  const [sideRailsData, setSideRailsData] = useState<HomeSideRailsData>(() => getHomeSideRailsFallback())
  const [sideRailsLoading, setSideRailsLoading] = useState(true)
  const [headerData, setHeaderData] = useState<HeaderData | null>({
    type: "image",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png",
    title: "Reservei Viagens - Hotéis em Caldas Novas",
  })

  useEffect(() => {
    // Carregar dados com tratamento robusto de erros
    const loadData = async () => {
      try {
        setError(null);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
          (typeof window !== 'undefined' ? window.location.origin : '');
        
        // Carregar header com timeout e fallback
        try {
          const headerController = new AbortController();
          const headerTimeout = setTimeout(() => headerController.abort(), 5000);
          
          const headerResponse = await fetch(`${API_BASE_URL}/api/website/header`, {
            method: "GET",
            signal: headerController.signal,
          });
          
          clearTimeout(headerTimeout);
          
          if (headerResponse.ok) {
            const result = await headerResponse.json();
            if (result.success && result.data) {
              setHeaderData({
                type: result.data.type || "image",
                url: result.data.url || result.data.logo,
                title: result.data.title,
                autoplay: result.data.autoplay || false,
                muted: result.data.muted || true,
              });
              if (result.data.autoplay) {
                setShouldAutoplay(true);
              }
            }
          }
        } catch (headerError: any) {
          console.warn('⚠️ Erro ao carregar header, usando fallback:', headerError.message);
          // Fallback seguro para header
          setHeaderData({
            type: "image",
            url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png",
            title: "Reservei Viagens - Hotéis em Caldas Novas",
          });
        }
      } catch (err: any) {
        console.error('❌ Erro geral ao carregar dados:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      }
    };

    loadData();

    // Verifica se é a primeira visita para autoplay
    const hasVisited = localStorage.getItem("reservei-viagens-visited")
    if (!hasVisited) {
      setShouldAutoplay(true)
      localStorage.setItem("reservei-viagens-visited", "true")
    }

    // Check LGPD consent
    const lgpdConsent = localStorage.getItem("reservei-lgpd-consent")
    if (!lgpdConsent) {
      setShowLGPDPopup(true)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const loadSideRails = async () => {
      try {
        const data = await getHomeSideRailsData()
        if (mounted) {
          setSideRailsData(data)
        }
      } catch {
        if (mounted) {
          setSideRailsData(getHomeSideRailsFallback())
        }
      } finally {
        if (mounted) {
          setSideRailsLoading(false)
        }
      }
    }

    loadSideRails()
    return () => {
      mounted = false
    }
  }, [])

  const handleLGPDAccept = () => {
    console.log("LGPD consent accepted")
    // Here you can initialize analytics, tracking, etc.
  }

  const handleLGPDDecline = () => {
    console.log("LGPD consent declined")
    // Here you can disable non-essential tracking
  }

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

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto md:max-w-[1320px] xl:max-w-[1440px] 2xl:max-w-[1600px] md:px-4 xl:px-8 2xl:px-10">
        <div className="md:grid md:grid-cols-[18rem_minmax(0,1fr)_18rem] lg:grid-cols-[18rem_minmax(0,1fr)_18rem] xl:grid-cols-[20rem_minmax(0,1fr)_20rem] 2xl:grid-cols-[20.5rem_minmax(0,1fr)_20.5rem] md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 md:items-start">
          <LeftSideRail section={sideRailsData.left} loading={sideRailsLoading} />
          <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative md:max-w-none md:mt-4 xl:mt-6 md:mb-6 xl:mb-8 md:rounded-3xl md:overflow-hidden md:border md:border-gray-200 xl:shadow-sm">
      <div className="animate-in fade-in duration-500">
        {error && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            Nao foi possivel carregar parte do conteudo dinamico. Exibindo versao padrao da pagina.
          </div>
        )}
        {/* Header */}
        <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
                alt="Reservei Viagens"
                width={40}
                height={40}
                priority={true}
                className="rounded-full bg-white/20 p-1 object-cover"
              />
              <h1 className="text-2xl font-bold tracking-tight">Reservei Viagens</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white border border-white/30">
                  Entrar
                </Button>
              </Link>
              <Link href="/login?tab=register">
                <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 font-medium">
                  Cadastrar
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative mb-6">
            <Link href="/buscar">
              <div className="relative cursor-pointer">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar Hotéis, Parques..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => window.location.href = '/buscar'}
                  className="pl-10 bg-white/95 border-0 rounded-xl shadow-sm cursor-pointer"
                  readOnly
                />
              </div>
            </Link>
          </div>

          {/* Image Section - Vídeo removido por problemas de carregamento */}
          <div className="relative w-full aspect-video bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl overflow-hidden shadow-xl mb-6 flex items-center justify-center">
            {headerData ? (
              headerData.type === "video" && (
                headerData.url.includes('youtube.com') || headerData.url.includes('youtu.be') || headerData.url.includes('vimeo.com') ? (
                  <iframe
                    src={headerData.url.includes('youtube.com') || headerData.url.includes('youtu.be') 
                      ? headerData.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') + ((headerData.autoplay && shouldAutoplay) ? "?autoplay=1&mute=1" : "")
                      : headerData.url.replace('vimeo.com/', 'player.vimeo.com/video/') + ((headerData.autoplay && shouldAutoplay) ? "?autoplay=1&muted=1" : "")}
                    title={headerData.title || "Vídeo promocional"}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // Vídeo local removido - usar apenas imagens ou placeholder
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Reservei Viagens</h2>
                      <p className="text-blue-100">Hotéis em Caldas Novas</p>
                    </div>
                  </div>
                )
              )
            ) : null}
            {headerData && headerData.type === "image" && (
              <ImageWithFallback
                src={headerData.url}
                alt={headerData.title || "Reservei Viagens"}
                width={800}
                height={450}
                objectFit="cover"
                priority={true}
                className="w-full h-full"
              />
            )}
            {!headerData && (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Reservei Viagens</h2>
                  <p className="text-blue-100">Carregando...</p>
                </div>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: "🔍", label: "Buscar", href: "/buscar" },
              { icon: "🏨", label: "Hotéis", href: "/hoteis" },
              { icon: "🎟️", label: "Ingressos", href: "/ingressos" },
              { icon: "🏞️", label: "Atrações", href: "/atracoes" },
            ].map((category, index) => (
              <Link key={index} href={category.href}>
                <button className="flex flex-col items-center p-3 rounded-2xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-105 w-full">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <span className="text-xs font-medium">{category.label}</span>
                </button>
              </Link>
            ))}
          </div>

          {/* Cross-sell mobile: após categorias — 1 card oferta/flash */}
          <div className="mt-4 space-y-3">
            {getCrossSellItems("home", sideRailsData, { limit: 1 }).map((item) => (
              <MobileCrossSellCard
                key={item.id}
                item={item}
                variant="full"
                animation="slide"
              />
            ))}
          </div>
          
          {/* Promoções Row */}
          <div className="mt-3">
            <Link href="/promocoes">
              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold hover:from-yellow-500 hover:to-orange-500 transition-all duration-200">
                <span className="text-xl">🏷️</span>
                <span>Ver Promoções Especiais</span>
              </button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-8">
          {/* CTA Monte suas férias */}
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

          {/* Hero Promotion */}
          <Card className="bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-900 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
            <CardContent className="p-8 text-center relative z-10">
              <Badge className="bg-red-500 text-white mb-4 animate-pulse">🔥 PROMOFÉRIAS CALDAS NOVAS!</Badge>
              <h2 className="text-xl font-bold mb-2">Hotel + Parque Aquático</h2>
              <p className="text-sm text-gray-700 mb-1">Diárias a partir de</p>
              <div className="text-4xl font-black mb-2 text-blue-700">R$ 149,99</div>
              <p className="text-sm opacity-90 mb-4">por pessoa</p>
              <p className="text-sm leading-relaxed mb-6 opacity-95">
                Sinta a magia de Caldas Novas! Planeje sua viagem dos sonhos hoje com diárias imperdíveis em pacotes com
                hotéis confortáveis e os melhores parques aquáticos.
              </p>
              <Link href="/promocoes">
                <Button className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  Quero Esta Super Oferta!
                </Button>
              </Link>
              <p className="text-sm font-semibold text-blue-700 mt-4">
                Reservei Viagens: Parques, Hotéis & Atrações te esperam!
              </p>
            </CardContent>
          </Card>

          {/* Cross-sell mobile: após PROMOFÉRIAS — 2 cards (Hotéis + Parques) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getCrossSellItems("home", sideRailsData, { limit: 4 })
              .filter((i) => ["hotels", "water-parks"].includes(i.id))
              .slice(0, 2)
              .map((item) => (
                <MobileCrossSellCard key={item.id} item={item} variant="full" />
              ))}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: CheckCircle, title: "Garantia de", subtitle: "Melhor Preço" },
              { icon: Shield, title: "Pagamento", subtitle: "100% Seguro" },
              { icon: Award, title: "+5000 Clientes", subtitle: "Satisfeitos" },
            ].map((badge, index) => {
              const IconComponent = badge.icon
              return (
                <Card key={index} className="text-center p-4">
                  <CardContent className="p-0">
                    <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-600">
                      {badge.title}
                      <br />
                      {badge.subtitle}
                    </p>
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

          {/* Quick Access Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/hoteis">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">🏨</div>
                  <h3 className="font-bold text-lg mb-2">Hotéis</h3>
                  <p className="text-sm text-gray-600 mb-4">Conforto e qualidade garantidos</p>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    Ver Hotéis
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/promocoes">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">🏷️</div>
                  <h3 className="font-bold text-lg mb-2">Promoções</h3>
                  <p className="text-sm text-gray-600 mb-4">Ofertas imperdíveis</p>
                  <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                    Ver Ofertas
                  </Button>
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

          {/* Reviews Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">O que nossos clientes dizem</h2>
            <ReviewsSection />
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600 space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
                alt="Reservei Viagens"
                width={32}
                height={32}
                priority={true}
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

            <div className="space-y-2 text-sm">
              <p>
                <strong>E-mail:</strong>{" "}
                <a href="mailto:reservas@reserveiviagens.com.br" className="text-blue-600 hover:underline">
                  reservas@reserveiviagens.com.br
                </a>
              </p>
              <p>
                <strong>Telefone:</strong>{" "}
                <a href="tel:+556521270415" className="text-blue-600 hover:underline">
                  (65) 2127-0415
                </a>
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-800">WhatsApp:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <a
                  href="https://wa.me/5564993197555?text=Olá! Gostaria de mais informações sobre as ofertas da Reservei Viagens."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  (64) 99319-7555
                </a>
                <span>|</span>
                <a
                  href="https://wa.me/5564993068752?text=Olá! Gostaria de mais informações sobre as ofertas da Reservei Viagens."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  (64) 99306-8752
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <a
                  href="https://wa.me/5565992351207?text=Olá! Gostaria de mais informações sobre as ofertas da Reservei Viagens."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  (65) 99235-1207
                </a>
                <span>|</span>
                <a
                  href="https://wa.me/5565992048814?text=Olá! Gostaria de mais informações sobre as ofertas da Reservei Viagens."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  (65) 99204-8814
                </a>
              </div>
            </div>

            <div className="flex justify-center gap-6 my-6">
              <a
                href="https://www.facebook.com/comercialreservei"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Facebook"
              >
                📘
              </a>
              <a
                href="https://www.instagram.com/reserveiviagens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Instagram"
              >
                📸
              </a>
              <a
                href="https://www.reserveiviagens.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Nosso Site"
              >
                🌐
              </a>
            </div>

            <p className="text-xs mt-6 pb-20">© 2024-2025 Reservei Viagens. Todos os direitos reservados.</p>
          </footer>
        </div>

        {/* Chat Agent */}
        <div className="md:hidden">
          <ChatAgent />
        </div>
      </div>

      {/* LGPD Popup */}
      {showLGPDPopup && <LGPDPopup onAccept={handleLGPDAccept} onDecline={handleLGPDDecline} />}

      {/* Realizar Cotação — formulário Monte suas férias */}
      <Link
        href="/cotacao"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-8 flex items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-50 text-white font-semibold text-sm"
      >
        <Phone className="w-5 h-5 shrink-0" />
        <span>Realizar Cotação</span>
      </Link>

      {/* Scroll to Top Button */}
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-32 right-4 md:bottom-24 md:right-8 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-40"
        size="sm"
      >
        ↑
      </Button>

      {/* Bottom Navigation — oculto: usando apenas o menu circular (CircularNav) */}
      {false && (
        <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-sm border-t shadow-lg">
          <div className="flex justify-around py-2">
            {[
              { icon: "🏠", label: "Início", href: "/" },
              { icon: "🔍", label: "Buscar", href: "/buscar" },
              { icon: "🏨", label: "Hotéis", href: "/hoteis" },
              { icon: "👤", label: "Perfil", href: "/perfil" },
            ].map((item, index) => (
              <div key={index}>
                {item.href && (
                  <Link href={item.href}>
                    <button className="flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                      <span className="text-xl mb-1">{item.icon}</span>
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      )}
          </div>
          <RightSideRail section={sideRailsData.right} loading={sideRailsLoading} />
        </div>
      </div>
    </div>
  )
}
