"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, X, Maximize2, Download, Share2 } from "@/lib/lucide-icons"
import Image from "next/image"
import { Hotel } from "@/lib/hotels-data"

interface HotelPhotoGalleryProps {
  hotel: Hotel
  isOpen: boolean
  onClose: () => void
  initialImageIndex?: number
}

export function HotelPhotoGallery({ 
  hotel, 
  isOpen, 
  onClose, 
  initialImageIndex = 0 
}: HotelPhotoGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setCurrentImageIndex(initialImageIndex)
  }, [initialImageIndex])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const nextImage = () => {
    setIsLoading(true)
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length)
  }

  const prevImage = () => {
    setIsLoading(true)
    setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length)
  }

  const goToImage = (index: number) => {
    setIsLoading(true)
    setCurrentImageIndex(index)
  }

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = hotel.images[currentImageIndex]
    link.download = `${hotel.name}-${currentImageIndex + 1}.jpg`
    link.click()
  }

  const shareImage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hotel.name,
          text: `Confira o ${hotel.name} em Caldas Novas!`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
      }
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado para a área de transferência!')
    }
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      {/* Overlay de fundo */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Container da galeria */}
      <div className={`relative bg-white rounded-lg overflow-hidden shadow-2xl ${
        isFullscreen ? 'w-full h-full max-w-none max-h-none' : 'w-full max-w-4xl max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg">{hotel.name}</h3>
            <Badge className="bg-blue-100 text-blue-800">
              {currentImageIndex + 1} de {hotel.images.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadImage}
              title="Baixar imagem"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={shareImage}
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Imagem principal */}
        <div className="relative bg-gray-100">
          <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96 sm:h-[500px]'} relative`}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            <Image
              src={hotel.images[currentImageIndex]}
              alt={`${hotel.name} - Foto ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              onLoad={handleImageLoad}
              priority
            />
            
            {/* Controles de navegação */}
            {hotel.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={prevImage}
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={nextImage}
                  disabled={isLoading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Miniaturas */}
        {hotel.images.length > 1 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {hotel.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  title={`Ver imagem ${index + 1}`}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${hotel.name} - Miniatura ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Informações do hotel */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{hotel.name}</h4>
              <p className="text-sm text-gray-600">{hotel.location}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">R$ {hotel.price}</p>
              {hotel.originalPrice && (
                <p className="text-sm text-gray-400 line-through">R$ {hotel.originalPrice}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
