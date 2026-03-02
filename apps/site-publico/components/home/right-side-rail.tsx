'use client'

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { SideRailItem, SideRailSection } from "@/lib/home-side-rails"

interface RightSideRailProps {
  section: SideRailSection
  loading?: boolean
}

function RailCard({ item, loading }: { item: SideRailItem; loading?: boolean }) {
  if (loading) {
    return (
      <Card className="border border-gray-200/90 bg-white rounded-xl overflow-hidden animate-pulse">
        <div className="h-24 bg-gray-200/80" />
        <CardContent className="p-3.5 xl:p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-lg xl:hover:shadow-xl hover:-translate-y-0.5 border border-gray-200/90 hover:border-orange-200/80 bg-white rounded-xl ${item.highlight ? "ring-2 ring-amber-300/60" : ""}`}>
      {item.image && (
        <div className="relative h-24 xl:h-28 overflow-hidden">
          <Image
            src={item.image}
            alt={item.imageAlt ?? item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 1280px) 288px, 320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}
      <CardContent className="p-3.5 xl:p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-[13px] xl:text-sm text-gray-900 leading-snug">{item.title}</h3>
          {item.badge && (
            <Badge
              className={`text-[10px] xl:text-[11px] whitespace-nowrap bg-orange-500 hover:bg-orange-600 opacity-95 group-hover:opacity-100 ${item.highlight ? "animate-pulse" : ""}`}
            >
              {item.badge}
            </Badge>
          )}
        </div>
        <p className="text-[11px] xl:text-xs text-gray-600 leading-relaxed">{item.subtitle}</p>
        <p className="text-[11px] xl:text-xs mt-2.5 text-orange-700 font-medium group-hover:text-orange-800 transition-colors">Abrir agora</p>
      </CardContent>
    </Card>
  )
}

export function RightSideRail({ section, loading = false }: RightSideRailProps) {
  return (
    <aside className="hidden md:block w-72 xl:w-80 2xl:w-[20.5rem] shrink-0">
      <div className="sticky top-6 xl:top-8 2xl:top-10 space-y-3 lg:space-y-3 xl:space-y-4">
        <Card className="border border-orange-100/80 bg-gradient-to-br from-orange-50/95 to-white shadow-sm xl:shadow-md rounded-xl overflow-hidden">
          <CardContent className="p-4 xl:p-5">
            <p className="text-xs xl:text-sm font-semibold text-orange-700 uppercase tracking-wider">{section.title}</p>
            <p className="text-[11px] xl:text-xs text-gray-600 mt-1.5 leading-relaxed">{section.description}</p>
          </CardContent>
        </Card>

        {section.items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-xl"
          >
            <RailCard item={item} loading={loading} />
          </Link>
        ))}
      </div>
    </aside>
  )
}
