"use client"

import { useState } from "react"
import { Video, Youtube, Upload, X, Play, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface HotelVideoManagerProps {
  videoUrl?: string
  youtubeId?: string
  onChange: (data: { videoUrl?: string; youtubeId?: string }) => void
}

export function HotelVideoManager({ videoUrl, youtubeId, onChange }: HotelVideoManagerProps) {
  const [inputType, setInputType] = useState<"youtube" | "url">(youtubeId ? "youtube" : "url")
  const [youtubeInput, setYoutubeInput] = useState(youtubeId || "")
  const [urlInput, setUrlInput] = useState(videoUrl || "")

  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  const handleYoutubeSubmit = () => {
    if (!youtubeInput.trim()) {
      onChange({ youtubeId: undefined })
      return
    }

    // Se já é um ID (sem caracteres especiais de URL), usar diretamente
    if (/^[a-zA-Z0-9_-]{11}$/.test(youtubeInput.trim())) {
      onChange({ youtubeId: youtubeInput.trim(), videoUrl: undefined })
      return
    }

    // Tentar extrair ID da URL
    const extractedId = extractYoutubeId(youtubeInput)
    if (extractedId) {
      onChange({ youtubeId: extractedId, videoUrl: undefined })
    } else {
      alert("URL do YouTube inválida. Por favor, insira uma URL válida ou o ID do vídeo.")
    }
  }

  const handleUrlSubmit = () => {
    onChange({ videoUrl: urlInput.trim() || undefined, youtubeId: undefined })
  }

  const handleRemove = () => {
    onChange({ videoUrl: undefined, youtubeId: undefined })
    setYoutubeInput("")
    setUrlInput("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Vídeo do Hotel</Label>
        {(youtubeId || videoUrl) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remover Vídeo
          </Button>
        )}
      </div>

      {/* Tipo de entrada */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={inputType === "youtube" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputType("youtube")}
        >
          <Youtube className="w-4 h-4 mr-2" />
          YouTube
        </Button>
        <Button
          type="button"
          variant={inputType === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputType("url")}
        >
          <Upload className="w-4 h-4 mr-2" />
          URL Direta
        </Button>
      </div>

      {/* Preview do vídeo atual */}
      {(youtubeId || videoUrl) && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {youtubeId ? "Vídeo do YouTube" : "Vídeo por URL"}
                </p>
                <p className="text-sm text-gray-600">
                  {youtubeId ? `ID: ${youtubeId}` : videoUrl}
                </p>
              </div>
              {youtubeId && (
                <Badge className="bg-red-600 text-white">
                  <Youtube className="w-3 h-3 mr-1" />
                  YouTube
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input YouTube */}
      {inputType === "youtube" && (
        <div className="space-y-2">
          <Label htmlFor="youtube-input">
            URL ou ID do YouTube
          </Label>
          <div className="flex gap-2">
            <Input
              id="youtube-input"
              type="text"
              placeholder="https://www.youtube.com/watch?v=... ou ID do vídeo"
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleYoutubeSubmit()}
            />
            <Button
              type="button"
              onClick={handleYoutubeSubmit}
              disabled={!youtubeInput.trim()}
            >
              Adicionar
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Cole a URL completa do YouTube ou apenas o ID do vídeo (11 caracteres)
          </p>
        </div>
      )}

      {/* Input URL */}
      {inputType === "url" && (
        <div className="space-y-2">
          <Label htmlFor="video-url">
            URL do Vídeo
          </Label>
          <div className="flex gap-2">
            <Input
              id="video-url"
              type="url"
              placeholder="https://exemplo.com/video.mp4"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
            >
              Adicionar
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            URL direta para arquivo de vídeo (MP4, WebM, etc.)
          </p>
        </div>
      )}

      {/* Preview do vídeo */}
      {youtubeId && (
        <div className="mt-4">
          <Label>Preview</Label>
          <div className="mt-2 aspect-video rounded-lg overflow-hidden border">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="Preview do vídeo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}
