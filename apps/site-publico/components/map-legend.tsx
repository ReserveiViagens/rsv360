"use client"

import { Badge } from "@/components/ui/badge"

interface MapLegendProps {
  hotelCount: number
  zoomLevel: number
  isMobile?: boolean
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'tv'
}

export function MapLegend({ hotelCount, zoomLevel, isMobile = false, deviceType = 'desktop' }: MapLegendProps) {
  const categories = [
    { color: 'bg-purple-500', label: 'Luxo', shortLabel: 'L' },
    { color: 'bg-blue-500', label: 'Premium', shortLabel: 'P' },
    { color: 'bg-green-500', label: 'Standard', shortLabel: 'S' },
    { color: 'bg-yellow-500', label: 'Econômico', shortLabel: 'E' }
  ]

  const getLegendLayout = () => {
    switch (deviceType) {
      case 'mobile':
        return 'flex-col gap-2'
      case 'tablet':
        return 'flex-col gap-3'
      case 'desktop':
        return 'flex-col gap-3'
      case 'tv':
        return 'flex-row gap-6'
      default:
        return 'flex-col gap-3'
    }
  }

  const getPadding = () => {
    switch (deviceType) {
      case 'mobile':
        return 'p-3'
      case 'tablet':
        return 'p-4'
      case 'desktop':
        return 'p-4'
      case 'tv':
        return 'p-6'
      default:
        return 'p-4'
    }
  }

  const getTextSize = () => {
    switch (deviceType) {
      case 'mobile':
        return 'text-xs'
      case 'tablet':
        return 'text-sm'
      case 'desktop':
        return 'text-sm'
      case 'tv':
        return 'text-base'
      default:
        return 'text-sm'
    }
  }

  return (
    <div className={`${getPadding()} border-t bg-gray-50`}>
      <div className={`flex ${getLegendLayout()}`}>
        {/* Legenda de categorias */}
        <div className={`flex flex-wrap items-center gap-3 sm:gap-4 ${getTextSize()} text-gray-600`}>
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
              <span className="hidden xs:inline">{category.label}</span>
              <span className="xs:hidden">{category.shortLabel}</span>
            </div>
          ))}
        </div>
        
        {/* Informações do mapa */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${getTextSize()} text-gray-500`}>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getTextSize()}>
              {hotelCount} hotéis
            </Badge>
            <span className="hidden sm:inline">•</span>
            <span>Zoom: {zoomLevel.toFixed(1)}</span>
          </div>
          <div className={`${getTextSize()} text-gray-400`}>
            {isMobile ? 'Toque nos marcadores para ver detalhes' : 'Clique nos marcadores para ver detalhes'}
          </div>
        </div>
      </div>
    </div>
  )
}
