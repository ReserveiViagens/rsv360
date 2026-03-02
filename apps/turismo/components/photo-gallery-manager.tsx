// Componente de gerenciamento de galeria de fotos conforme documentação (linha 628-638)
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Photo } from '@/lib/types/budget';
import { Upload, Link2, Trash2, Edit2, Eye, Move, X } from 'lucide-react';
import { generateId } from '@/lib/utils';

interface PhotoGalleryManagerProps {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  maxPhotos?: number;
  accept?: string;
  className?: string;
}

export function PhotoGalleryManager({
  photos = [],
  onChange,
  maxPhotos = 50,
  accept = 'image/*,video/*',
  className = '',
}: PhotoGalleryManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos: Photo[] = [];
    
    files.slice(0, maxPhotos - photos.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newPhoto: Photo = {
          id: generateId(),
          url: reader.result as string,
          caption: file.name,
          type: file.type.startsWith('video/') ? 'video' : 'image',
        };
        newPhotos.push(newPhoto);
        
        if (newPhotos.length === files.length) {
          onChange([...photos, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [photos, maxPhotos, onChange]);

  const handleUrlAdd = useCallback(() => {
    const url = urlInputRef.current?.value.trim();
    if (!url) return;

    const newPhoto: Photo = {
      id: generateId(),
      url: url,
      caption: '',
      type: url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('youtube') || url.includes('youtu.be') ? 'video' : 'image',
    };
    
    onChange([...photos, newPhoto]);
    
    // Limpar input
    if (urlInputRef.current) {
      urlInputRef.current.value = '';
    }
  }, [photos, onChange]);

  const handleRemove = useCallback((id: string) => {
    onChange(photos.filter(p => p.id !== id));
    if (previewPhoto?.id === id) {
      setPreviewPhoto(null);
    }
  }, [photos, onChange, previewPhoto]);

  const handleEditCaption = useCallback((id: string, currentCaption: string) => {
    const newCaption = prompt('Digite uma legenda para esta mídia:', currentCaption || '');
    if (newCaption !== null) {
      onChange(photos.map(p => p.id === id ? { ...p, caption: newCaption } : p));
    }
  }, [photos, onChange]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newPhotos = [...photos];
    const [removed] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(dropIndex, 0, removed);
    
    onChange(newPhotos);
    setDraggedIndex(null);
  }, [photos, draggedIndex, onChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload e URL */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Arquivos
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFileUpload}
            className="hidden"
            disabled={photos.length >= maxPhotos}
          />
        </div>
        <div className="flex-1 flex gap-2">
          <Input
            ref={urlInputRef}
            type="url"
            placeholder="Adicionar por URL..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleUrlAdd();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleUrlAdd}
            disabled={photos.length >= maxPhotos}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Grid de Fotos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={`relative group border rounded-lg overflow-hidden ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            {/* Preview */}
            {photo.type === 'video' || photo.url.includes('.mp4') || photo.url.includes('.mov') || photo.url.includes('youtube') || photo.url.includes('youtu.be') ? (
              <div className="aspect-video bg-black flex items-center justify-center">
                <video
                  src={photo.url}
                  className="w-full h-full object-cover"
                  controls={false}
                  onMouseEnter={(e) => {
                    (e.target as HTMLVideoElement).play();
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLVideoElement).pause();
                  }}
                />
              </div>
            ) : (
              <img
                src={photo.url}
                alt={photo.caption || `Foto ${index + 1}`}
                className="w-full aspect-square object-cover"
              />
            )}

            {/* Overlay com ações */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPreviewPhoto(photo)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleEditCaption(photo.id, photo.caption || '')}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRemove(photo.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Indicador de drag */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100">
              <Move className="w-4 h-4" />
            </div>

            {/* Legenda */}
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 truncate">
                {photo.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Preview */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white"
              onClick={() => setPreviewPhoto(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            {previewPhoto.type === 'video' || previewPhoto.url.includes('video') ? (
              <video
                src={previewPhoto.url}
                className="w-full rounded-lg"
                controls
                autoPlay
              />
            ) : (
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption || 'Preview'}
                className="w-full rounded-lg"
              />
            )}
            {previewPhoto.caption && (
              <div className="mt-2 text-white text-center">{previewPhoto.caption}</div>
            )}
          </div>
        </div>
      )}

      {/* Informação de limite */}
      {photos.length >= maxPhotos && (
        <div className="text-sm text-gray-500 text-center">
          Limite de {maxPhotos} mídias atingido
        </div>
      )}
    </div>
  );
}

