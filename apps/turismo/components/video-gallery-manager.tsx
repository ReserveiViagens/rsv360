// Componente de gerenciamento de vídeos YouTube conforme documentação (linha 639-647)
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Photo } from '@/lib/types/budget';
import { Youtube, Link2, Trash2, Eye, X } from 'lucide-react';
import { generateId } from '@/lib/utils';

interface VideoGalleryManagerProps {
  videos: Photo[];
  onChange: (videos: Photo[]) => void;
  maxVideos?: number;
  className?: string;
}

/**
 * Extrai o ID do vídeo do YouTube de diferentes formatos de URL
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Valida se a URL é do YouTube
 */
function isValidYouTubeUrl(url: string): boolean {
  const youtubeDomains = ['youtube.com', 'youtu.be', 'm.youtube.com', 'www.youtube.com'];
  try {
    const urlObj = new URL(url);
    return youtubeDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

export function VideoGalleryManager({
  videos = [],
  onChange,
  maxVideos = 20,
  className = '',
}: VideoGalleryManagerProps) {
  const [urlInput, setUrlInput] = useState('');
  const [previewVideo, setPreviewVideo] = useState<Photo | null>(null);
  const [error, setError] = useState<string>('');

  const handleAddVideo = () => {
    const url = urlInput.trim();
    if (!url) {
      setError('Por favor, digite uma URL do YouTube');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError('Por favor, digite uma URL válida do YouTube');
      return;
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      setError('Não foi possível extrair o ID do vídeo do YouTube');
      return;
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const newVideo: Photo = {
      id: generateId(),
      url: embedUrl,
      caption: `Vídeo do YouTube: ${videoId}`,
      type: 'video',
    };

    onChange([...videos, newVideo]);
    setUrlInput('');
    setError('');
  };

  const handleRemove = (id: string) => {
    onChange(videos.filter(v => v.id !== id));
    if (previewVideo?.id === id) {
      setPreviewVideo(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Adicionar vídeo */}
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Cole a URL do YouTube aqui..."
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            setError('');
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddVideo();
            }
          }}
          className="flex-1"
          disabled={videos.length >= maxVideos}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddVideo}
          disabled={videos.length >= maxVideos || !urlInput.trim()}
        >
          <Youtube className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {/* Lista de vídeos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {videos.map((video) => {
          const videoId = extractYouTubeId(video.url);
          const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

          return (
            <div key={video.id} className="relative group border rounded-lg overflow-hidden">
              {/* Thumbnail */}
              {thumbnailUrl ? (
                <div className="aspect-video bg-black relative">
                  <img
                    src={thumbnailUrl}
                    alt={video.caption || 'Vídeo do YouTube'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full p-3">
                      <Youtube className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <Youtube className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPreviewVideo(video)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemove(video.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Legenda */}
              {video.caption && (
                <div className="p-2 bg-gray-50 text-sm truncate">
                  {video.caption}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Preview */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white"
              onClick={() => setPreviewVideo(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="aspect-video">
              <iframe
                src={previewVideo.url}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {previewVideo.caption && (
              <div className="mt-2 text-white text-center">{previewVideo.caption}</div>
            )}
          </div>
        </div>
      )}

      {/* Informação de limite */}
      {videos.length >= maxVideos && (
        <div className="text-sm text-gray-500 text-center">
          Limite de {maxVideos} vídeos atingido
        </div>
      )}
    </div>
  );
}

