"use client"

import Link from "next/link"
import Image from "next/image"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getRandomImage } from "@/lib/cross-sell-image-pool"
import type { SideRailItem } from "@/lib/home-side-rails"

export interface MobileCrossSellCardProps {
  item: SideRailItem
  variant?: "compact" | "full"
  randomImage?: boolean
  animation?: "fade" | "slide" | "scale" | "none"
  contextualSubtitle?: string
  ctaText?: "Ver oferta" | "Abrir agora" | "Completar pacote"
}

const ANIMATION_CLASS = {
  fade: "animate-in fade-in duration-300",
  slide: "animate-in fade-in slide-in-from-bottom-4 duration-300",
  scale: "animate-in fade-in zoom-in-95 duration-300",
  none: "",
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=160&fit=crop"

export function MobileCrossSellCard({
  item,
  variant = "full",
  randomImage = false,
  animation = "fade",
  contextualSubtitle,
  ctaText = "Ver oferta",
}: MobileCrossSellCardProps) {
  const imageUrl = useMemo(() => {
    if (randomImage) return getRandomImage(item.id)
    return item.image ?? DEFAULT_IMAGE
  }, [item.id, item.image, randomImage])

  const imgHeight = variant === "compact" ? 100 : 120
  const animClass = ANIMATION_CLASS[animation]
  const subtitle = contextualSubtitle ?? item.subtitle

  return (
    <Link
      href={item.href}
      className={`block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl min-h-[44px] ${animClass}`}
    >
      <Card className="overflow-hidden border border-gray-200/90 bg-white rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98]">
        <div
          className="relative w-full overflow-hidden"
          style={{ height: imgHeight }}
        >
          <Image
            src={imageUrl}
            alt={item.imageAlt ?? item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
          />
          <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {item.badge && (
            <Badge
              variant="secondary"
              className={`absolute top-2 right-2 text-[10px] opacity-95 ${item.highlight ? "animate-pulse" : ""}`}
            >
              {item.badge}
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 leading-snug">
            {item.title}
          </h3>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed line-clamp-2">
            {subtitle}
          </p>
          <p className="text-xs font-medium text-blue-600 mt-2">{ctaText}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
