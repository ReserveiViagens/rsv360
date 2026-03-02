"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type TicketProductCardVariant = "grid" | "list"

export interface TicketProductCardProps {
  title: string
  image: string
  imageAlt?: string
  href?: string
  originalPrice: number
  discountedPrice: number
  rating?: number
  soldToday?: number
  installments?: string
  /** Exibe badge "OFERTA RELÂMPAGO" (red-500, animate-pulse) */
  showFlashBadge?: boolean
  /** Se informado, o CTA chama este callback em vez de navegar (para exibir checkout fixo) */
  onAddToCart?: (item: { title: string; discountedPrice: number; originalPrice: number; installments?: string }) => void
  /** Chamado quando a imagem falha ao carregar (ex.: 404) — permite fallback para URL alternativa */
  onImageError?: () => void
  /** Se informado, exibe countdown (HH:MM:SS) e badge "ENDING SOON" quando &lt; 5 min */
  countdownEnd?: Date
  /** 0–100: exibe barra de progresso e texto "X% Sold Out". Ignorado se remainingUnits for informado. */
  soldPercent?: number
  /** Exibe "X unidades restantes" em vez de soldPercent quando informado */
  remainingUnits?: number
  /** Ex.: "Apenas 2 quartos a este preço!" — exibido abaixo do preço */
  scarcityMessage?: string
  /** Variante de visualização: "grid" (card vertical) ou "list" (card horizontal) */
  variant?: TicketProductCardVariant
  className?: string
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00"
  const s = Math.floor(ms / 1000) % 60
  const m = Math.floor(ms / 60000) % 60
  const h = Math.floor(ms / 3600000)
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":")
}

export function TicketProductCard({
  title,
  image,
  imageAlt,
  href = "#",
  originalPrice,
  discountedPrice,
  rating = 0,
  soldToday = 0,
  installments = "em até 12x sem juros",
  showFlashBadge = true,
  onAddToCart,
  onImageError,
  countdownEnd,
  soldPercent,
  remainingUnits,
  scarcityMessage,
  variant = "grid",
  className,
}: TicketProductCardProps) {
  const [countdownMs, setCountdownMs] = useState<number | null>(
    countdownEnd ? Math.max(0, countdownEnd.getTime() - Date.now()) : null
  )
  const isEndingSoon = countdownMs != null && countdownMs > 0 && countdownMs < 5 * 60 * 1000

  useEffect(() => {
    if (!countdownEnd) return
    const tick = () => {
      const ms = Math.max(0, countdownEnd.getTime() - Date.now())
      setCountdownMs(ms)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [countdownEnd])

  const handleCtaClick = (e: React.MouseEvent) => {
    if (onAddToCart) {
      e.preventDefault()
      onAddToCart({
        title,
        discountedPrice,
        originalPrice,
        installments,
      })
    }
  }

  // Layout em grade (padrão)
  if (variant === "grid") {
    const content = (
      <Card
        className={cn(
          "overflow-hidden border border-gray-200 bg-white rounded-2xl transition-all duration-200 hover:shadow-xl active:scale-[0.98]",
          className
        )}
      >
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={imageAlt ?? title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
            onError={onImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          {showFlashBadge && (
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold animate-pulse">
              OFERTA RELÂMPAGO
            </span>
          )}
          {countdownMs != null && countdownMs > 0 && (
            <div className="absolute top-3 left-3 flex flex-col gap-0.5">
              <span className="text-white text-sm font-mono font-bold drop-shadow-md">
                {formatCountdown(countdownMs)}
              </span>
              {isEndingSoon && (
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase">
                  Ending soon
                </span>
              )}
            </div>
          )}
          {rating > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-3">{title}</h3>
          {soldToday > 0 && (
            <p className="text-xs text-gray-600 mb-2">
              {soldToday} {soldToday === 1 ? "pessoa comprou" : "pessoas compraram"} hoje
            </p>
          )}
          <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</span>
              <span className="text-sm text-gray-600">Por apenas</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(discountedPrice)}</span>
            </div>
            {installments && (
              <p className="text-sm text-gray-700 font-medium mt-1">{installments}</p>
            )}
            {(soldPercent != null || remainingUnits != null) && (
              <div className="mt-2">
                {remainingUnits != null ? (
                  <p className="text-xs text-gray-600 font-medium">{remainingUnits} unidades restantes</p>
                ) : (
                  <>
                    <p className="text-xs text-gray-600 font-medium">{Math.round(soldPercent ?? 0)}% Sold Out</p>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, soldPercent ?? 0))}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            {scarcityMessage && (
              <p className="text-xs text-gray-600 mt-2 px-2 py-1 rounded-lg bg-gray-100/80">{scarcityMessage}</p>
            )}
          </div>
          {onAddToCart ? (
            <button
              type="button"
              onClick={handleCtaClick}
              className={cn(
                "inline-flex items-center justify-center w-full py-3 rounded-xl font-bold text-gray-900 text-sm",
                "bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500",
                "transition-all active:scale-[0.98] touch-manipulation"
              )}
            >
              GARANTIR MEU INGRESSO
            </button>
          ) : (
            <span
              className={cn(
                "inline-flex items-center justify-center w-full py-3 rounded-xl font-bold text-gray-900 text-sm",
                "bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500",
                "transition-all active:scale-[0.98] touch-manipulation"
              )}
            >
              GARANTIR MEU INGRESSO
            </span>
          )}
        </CardContent>
      </Card>
    )

    if (href && href !== "#" && !onAddToCart) {
      return (
        <Link
          href={href}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl"
        >
          {content}
        </Link>
      )
    }
    return <div className="focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 rounded-2xl">{content}</div>
  }

  // Layout em lista (horizontal)
  const content = (
    <Card
      className={cn(
        "overflow-hidden border border-gray-200 bg-white rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98]",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-32 h-48 sm:h-auto sm:min-h-[120px] overflow-hidden shrink-0">
          <Image
            src={image}
            alt={imageAlt ?? title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 128px"
            onError={onImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {showFlashBadge && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold animate-pulse">
              OFERTA RELÂMPAGO
            </span>
          )}
          {countdownMs != null && countdownMs > 0 && (
            <div className="absolute top-2 left-2 flex flex-col gap-0.5">
              <span className="text-white text-xs font-mono font-bold drop-shadow-md">
                {formatCountdown(countdownMs)}
              </span>
              {isEndingSoon && (
                <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold uppercase">
                  Ending soon
                </span>
              )}
            </div>
          )}
          {rating > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2">{title}</h3>
            {soldToday > 0 && (
              <p className="text-xs text-gray-600 mb-2">
                {soldToday} {soldToday === 1 ? "pessoa comprou" : "pessoas compraram"} hoje
              </p>
            )}
            <div className="rounded-lg bg-orange-50 border border-orange-100 p-2 mb-3">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xs text-gray-500 line-through">{formatPrice(originalPrice)}</span>
                <span className="text-xs text-gray-600">Por apenas</span>
                <span className="text-lg font-bold text-gray-900">{formatPrice(discountedPrice)}</span>
              </div>
              {installments && (
                <p className="text-xs text-gray-700 font-medium mt-1">{installments}</p>
              )}
              {(soldPercent != null || remainingUnits != null) && (
                <div className="mt-1.5">
                  {remainingUnits != null ? (
                    <p className="text-[10px] text-gray-600 font-medium">{remainingUnits} unidades restantes</p>
                  ) : (
                    <>
                      <p className="text-[10px] text-gray-600 font-medium">{Math.round(soldPercent ?? 0)}% Sold Out</p>
                      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="h-full bg-red-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, soldPercent ?? 0))}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
              {scarcityMessage && (
                <p className="text-[10px] text-gray-600 mt-1.5 px-1.5 py-0.5 rounded bg-gray-100/80">{scarcityMessage}</p>
              )}
            </div>
          </div>
          {onAddToCart ? (
            <button
              type="button"
              onClick={handleCtaClick}
              className={cn(
                "inline-flex items-center justify-center w-full py-2 rounded-lg font-bold text-gray-900 text-xs",
                "bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500",
                "transition-all active:scale-[0.98] touch-manipulation"
              )}
            >
              GARANTIR MEU INGRESSO
            </button>
          ) : (
            <span
              className={cn(
                "inline-flex items-center justify-center w-full py-2 rounded-lg font-bold text-gray-900 text-xs",
                "bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500",
                "transition-all active:scale-[0.98] touch-manipulation"
              )}
            >
              GARANTIR MEU INGRESSO
            </span>
          )}
        </CardContent>
      </div>
    </Card>
  )

  if (href && href !== "#" && !onAddToCart) {
    return (
      <Link
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl"
      >
        {content}
      </Link>
    )
  }
  return <div className="focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 rounded-xl">{content}</div>

  if (href && href !== "#" && !onAddToCart) {
    return (
      <Link
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl"
      >
        {content}
      </Link>
    )
  }
  return <div className="focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 rounded-2xl">{content}</div>
}
