"use client"

import { useState } from "react"
import { Play, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface HotelVideoProps {
  hotelName: string
  videoUrl?: string
  youtubeId?: string
}

// URLs de vídeos mockados (em produção viriam da API)
const getHotelVideo = (hotelName: string): { youtubeId?: string; videoUrl?: string } => {
  const name = hotelName.toLowerCase()
  
  // IDs de vídeos do YouTube para hotéis conhecidos
  const videoMap: Record<string, string> = {
    'lagoa eco towers': 'dQw4w9WgXcQ', // Exemplo - substituir por IDs reais
    'piazza diroma': 'dQw4w9WgXcQ',
    'spazzio diroma': 'dQw4w9WgXcQ',
    'lacqua diroma': 'dQw4w9WgXcQ',
    'golden dolphin': 'dQw4w9WgXcQ',
    'praias do lago': 'dQw4w9WgXcQ',
    'resort do lago': 'dQw4w9WgXcQ',
  }
  
  for (const [key, value] of Object.entries(videoMap)) {
    if (name.includes(key)) {
      return { youtubeId: value }
    }
  }
  
  return {}
}

export function HotelVideo({ hotelName, videoUrl, youtubeId }: HotelVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  
  const videoData = youtubeId ? { youtubeId } : videoUrl ? { videoUrl } : getHotelVideo(hotelName)
  
  if (!videoData.youtubeId && !videoData.videoUrl) {
    return null
  }

  const handlePlay = () => {
    setIsPlaying(true)
    setShowVideo(true)
  }

  const handleClose = () => {
    setIsPlaying(false)
    setShowVideo(false)
  }

  return (
    <div className="relative">
      {!showVideo ? (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handlePlay}>
          <CardContent className="p-0 relative">
            <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </div>
                  <p className="text-lg font-semibold">Assistir Vídeo</p>
                  <p className="text-sm opacity-90">Conheça o {hotelName}</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-20" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 relative">
            <div className="relative aspect-video">
              {videoData.youtubeId ? (
                <iframe
                  className="w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${videoData.youtubeId}?autoplay=1&rel=0`}
                  title={`Vídeo do ${hotelName}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoData.videoUrl ? (
                <video
                  className="w-full h-full rounded-lg"
                  src={videoData.videoUrl}
                  controls
                  autoPlay
                />
              ) : null}
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white hover:bg-gray-100"
                onClick={handleClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
