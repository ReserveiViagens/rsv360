/**
 * ✅ COMPONENTE: PHOTO UPLOADER
 * Componente específico para upload de fotos de verificação
 * 
 * @module components/verification/PhotoUploader
 */

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, CheckCircle2, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  url?: string;
}

interface PhotoUploaderProps {
  maxPhotos?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  onUploadComplete?: (photos: UploadedPhoto[]) => void;
  onPhotoRemove?: (photoId: string) => void;
  initialPhotos?: UploadedPhoto[];
  verificationType?: 'property' | 'identity' | 'document';
}

export function PhotoUploader({
  maxPhotos = 10,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  onUploadComplete,
  onPhotoRemove,
  initialPhotos = [],
  verificationType = 'property',
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>(initialPhotos);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).filter(file => {
      // Validar formato
      if (!acceptedFormats.includes(file.type)) {
        toast.error(`Formato não suportado: ${file.name}`);
        return false;
      }

      // Validar tamanho
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Arquivo muito grande: ${file.name} (máx: ${maxSizeMB}MB)`);
        return false;
      }

      return true;
    });

    // Validar limite de fotos
    if (photos.length + newFiles.length > maxPhotos) {
      toast.error(`Máximo de ${maxPhotos} fotos permitidas`);
      return;
    }

    const newPhotos: UploadedPhoto[] = newFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0,
    }));

    setPhotos([...photos, ...newPhotos]);

    // Simular upload (substituir por upload real)
    for (const photo of newPhotos) {
      await uploadPhoto(photo);
    }
  };

  const uploadPhoto = async (photo: UploadedPhoto) => {
    try {
      const formData = new FormData();
      formData.append('photo', photo.file);
      formData.append('verification_type', verificationType);

      const response = await fetch('/api/verification/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      const result = await response.json();

      setPhotos(prev => prev.map(p => 
        p.id === photo.id 
          ? { ...p, status: 'success', url: result.data?.url, progress: 100 }
          : p
      ));

      toast.success(`Foto ${photo.file.name} enviada com sucesso!`);
      onUploadComplete?.(photos.filter(p => p.status === 'success'));
    } catch (error: any) {
      setPhotos(prev => prev.map(p => 
        p.id === photo.id 
          ? { ...p, status: 'error' }
          : p
      ));
      toast.error(`Erro ao enviar ${photo.file.name}`);
    }
  };

  const removePhoto = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview);
    }
    setPhotos(photos.filter(p => p.id !== photoId));
    onPhotoRemove?.(photoId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getVerificationTypeLabel = () => {
    switch (verificationType) {
      case 'property':
        return 'Propriedade';
      case 'identity':
        return 'Identidade';
      case 'document':
        return 'Documento';
      default:
        return 'Verificação';
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <Card
        className={`
          border-2 border-dashed transition-colors
          ${dragging ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${photos.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => photos.length < maxPhotos && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${dragging ? 'bg-primary/10' : 'bg-muted'}
          `}>
            {dragging ? (
              <Upload className="w-8 h-8 text-primary animate-bounce" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">
              {dragging ? 'Solte as fotos aqui' : 'Clique ou arraste fotos aqui'}
            </p>
            <p className="text-xs text-muted-foreground">
              {getVerificationTypeLabel()} • Máx. {maxPhotos} fotos • {maxSizeMB}MB por foto
            </p>
            <p className="text-xs text-muted-foreground">
              Formatos: JPEG, PNG, WebP
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={photos.length >= maxPhotos}
          />
        </CardContent>
      </Card>

      {/* Fotos Enviadas */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="relative group">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <Image
                    src={photo.preview}
                    alt={photo.file.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  
                  {/* Overlay de Status */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center">
                    {photo.status === 'uploading' && (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    )}
                    {photo.status === 'success' && (
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    )}
                    {photo.status === 'error' && (
                      <X className="w-8 h-8 text-red-400" />
                    )}
                  </div>

                  {/* Botão Remover */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(photo.id);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  {/* Barra de Progresso */}
                  {photo.status === 'uploading' && photo.progress !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50">
                      <Progress value={photo.progress} className="h-1" />
                    </div>
                  )}
                </div>
                
                {/* Nome do Arquivo */}
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{photo.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(photo.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contador */}
      {photos.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {photos.length} de {maxPhotos} fotos enviadas
        </div>
      )}
    </div>
  );
}

