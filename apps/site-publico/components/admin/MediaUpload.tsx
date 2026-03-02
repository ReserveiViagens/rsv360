'use client';

import React, { useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Play, ImageIcon, AlertCircle } from '@/lib/lucide-icons';

type MediaItem = {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  thumbnailUrl?: string | null;
  error?: string;
};

interface MediaUploadProps {
  onChange: (mediaUrls: string[]) => void;
  disabled?: boolean;
}

export default function MediaUpload({ onChange, disabled = false }: MediaUploadProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isImage = (mime: string) => mime.startsWith('image/');
  const isVideo = (mime: string) => mime.startsWith('video/');

  const handlePick = () => fileInputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next: MediaItem[] = [];
    Array.from(files).forEach((file) => {
      if (!isImage(file.type) && !isVideo(file.type)) {
        next.push({
          id: Math.random().toString(36).slice(2),
          file,
          preview: URL.createObjectURL(file),
          type: 'image',
          status: 'error',
          progress: 0,
          error: 'Tipo de arquivo não suportado (use imagens ou vídeos MP4/WebM)'
        });
        return;
      }
      next.push({
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
        type: isImage(file.type) ? 'image' : 'video',
        status: 'pending',
        progress: 0
      });
    });
    setItems((prev) => {
      const updated = [...prev, ...next];
      // Iniciar upload automaticamente para novos itens
      next.forEach((item) => {
        if (item.status === 'pending') {
          uploadItem(item);
        }
      });
      return updated;
    });
  };

  const uploadItem = async (item: MediaItem) => {
    try {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading', progress: 10 } : i)));
      const form = new FormData();
      const field = item.type === 'image' ? 'images' : 'videos';
      form.append(field, item.file);

      const endpoint = item.type === 'image' ? '/api/upload/images' : '/api/upload/videos';

      // Obter token de autenticação
      const getAuthToken = () => {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
        if (tokenCookie) {
          const token = tokenCookie.split('=')[1];
          if (token) return `Bearer ${token}`;
        }
        const tokenFromStorage = localStorage.getItem('admin_token');
        return tokenFromStorage ? `Bearer ${tokenFromStorage}` : 'Bearer admin-token-123';
      };

      console.log(`📤 Fazendo upload para: ${API_BASE_URL}${endpoint}`);
      console.log(`📋 Tipo: ${item.type}, Arquivo: ${item.file.name}`);
      
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: getAuthToken() },
        body: form
      });

      console.log(`📡 Resposta do upload: ${res.status} ${res.statusText}`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ Erro no upload: ${res.status}`, errorText);
        throw new Error(`Upload falhou: ${res.status} - ${errorText}`);
      }
      
      const json = await res.json();
      console.log(`✅ Upload bem-sucedido:`, json);
      const list = (item.type === 'image' ? json.images : json.videos) || [];
      const first = list[0];

      // Construir URL completa
      const imageUrl = first ? `${API_BASE_URL}${first.url}` : null;
      const thumbnailUrl = first?.thumbnailUrl ? `${API_BASE_URL}${first.thumbnailUrl}` : null;
      
      console.log(`🖼️ URL gerada: ${imageUrl}`);
      console.log(`🖼️ Thumbnail URL: ${thumbnailUrl}`);
      
      if (!imageUrl) {
        throw new Error("URL não foi retornada pelo servidor");
      }

      // Atualizar items e obter URLs atualizadas
      setItems((prev) => {
        const updated = prev.map((i) => (i.id === item.id ? {
          ...i,
          status: 'success',
          progress: 100,
          url: imageUrl,
          thumbnailUrl: thumbnailUrl
        } : i));
        
        // Emitir URLs após atualizar o estado
        const urls = updated
          .filter((i) => i.status === 'success' && i.url)
          .map((i) => i.url!);
        
        console.log(`📤 Emitindo URLs para onChange:`, urls);
        
        // Chamar onChange com as URLs atualizadas (usar setTimeout para garantir que o estado foi atualizado)
        setTimeout(() => {
          if (urls.length > 0) {
            onChange(Array.from(new Set(urls)));
            console.log(`✅ onChange chamado com ${urls.length} URL(s)`);
          }
        }, 100);
        
        return updated;
      });
    } catch (e: any) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: e.message } : i)));
      setError('Falha no upload de mídia');
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      const urls = updated.filter((i) => i.status === 'success' && i.url).map((i) => i.url!)
      onChange(urls);
      return updated;
    });
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
        aria-label="Selecionar arquivos de mídia"
        title="Selecionar arquivos de mídia"
        name="media"
        id={inputId}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className="flex items-center gap-2"
        onClick={handlePick}
        aria-label="Upload de Mídia (imagens/vídeos)"
        title="Upload de Mídia (imagens/vídeos)"
      >
        <Upload className="w-4 h-4" />
        Upload de Mídia (imagens/vídeos)
      </Button>

      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="relative overflow-hidden">
              <CardContent className="p-2">
                <div className="relative aspect-video bg-black/5 rounded">
                  {item.type === 'image' ? (
                    <img src={item.preview} alt="preview" className="w-full h-full object-cover rounded" />
                  ) : (
                    <video
                      className="w-full h-full object-cover rounded"
                      controls
                      poster={item.thumbnailUrl || undefined}
                      src={item.url || item.preview}
                    />
                  )}

                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded p-1"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remover mídia"
                    title="Remover mídia"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute top-2 left-2 bg-white/90 rounded px-2 py-0.5 text-xs flex items-center gap-1">
                    {item.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {item.type}
                  </div>
                </div>

                {item.status === 'uploading' && (
                  <div className="mt-2">
                    <Progress value={item.progress} className="h-1" />
                    <p className="text-xs text-center mt-1">{item.progress}%</p>
                  </div>
                )}

                {item.status === 'error' && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {item.error || 'Falha no upload'}
                  </div>
                )}

                {item.status === 'pending' && (
                  <Button size="sm" className="w-full mt-2" onClick={() => uploadItem(item)} disabled={disabled}>
                    <Upload className="w-3 h-3 mr-1" />
                    Enviar
                  </Button>
                )}

                {item.status === 'success' && item.url && (
                  <div className="mt-2 text-xs text-green-700 break-all">{item.url}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
