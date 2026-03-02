"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Navigation, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw } from "@/lib/lucide-icons"

interface MapControlsProps {
  onCenterMap: () => void
  onUserLocation?: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
  hasUserLocation?: boolean
  isMobile?: boolean
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'tv'
}

export function MapControls({
  onCenterMap,
  onUserLocation,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  isFullscreen,
  hasUserLocation = false,
  isMobile = false,
  deviceType = 'desktop'
}: MapControlsProps) {
  const getControlLayout = () => {
    switch (deviceType) {
      case 'mobile':
        return 'flex-col gap-2'
      case 'tablet':
        return 'flex-col sm:flex-row gap-2'
      case 'desktop':
        return 'flex-row gap-2'
      case 'tv':
        return 'flex-row gap-3'
      default:
        return 'flex-row gap-2'
    }
  }

  const getButtonSize = () => {
    switch (deviceType) {
      case 'mobile':
        return 'sm'
      case 'tablet':
        return 'sm'
      case 'desktop':
        return 'sm'
      case 'tv':
        return 'default'
      default:
        return 'sm'
    }
  }

  return (
    <div className={`flex ${getControlLayout()}`}>
      {/* Controles principais */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Botões de localização */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size={getButtonSize()}
            onClick={onCenterMap}
            className="flex-1 sm:flex-none min-w-0"
          >
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="hidden xs:inline truncate">Centro</span>
            <span className="xs:hidden">Centro</span>
          </Button>
          
          {hasUserLocation && (
            <Button 
              variant="outline" 
              size={getButtonSize()}
              onClick={onUserLocation}
              className="flex-1 sm:flex-none min-w-0"
            >
              <Navigation className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Minha Localização</span>
              <span className="xs:hidden">Localização</span>
            </Button>
          )}
        </div>
        
        {/* Botões de zoom */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size={getButtonSize()}
            onClick={onZoomOut}
            className="flex-1 sm:flex-none"
          >
            <ZoomOut className="w-4 h-4" />
            <span className="hidden xs:inline ml-1">-</span>
          </Button>
          
          <Button 
            variant="outline" 
            size={getButtonSize()}
            onClick={onZoomIn}
            className="flex-1 sm:flex-none"
          >
            <ZoomIn className="w-4 h-4" />
            <span className="hidden xs:inline ml-1">+</span>
          </Button>
        </div>
      </div>
      
      {/* Botão de tela cheia para mobile e tablet */}
      {(isMobile || deviceType === 'tablet') && (
        <Button 
          variant="outline" 
          size={getButtonSize()}
          onClick={onToggleFullscreen}
          className="w-full sm:w-auto"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 mr-1" />
              Sair da Tela Cheia
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 mr-1" />
              Tela Cheia
            </>
          )}
        </Button>
      )}
    </div>
  )
}
