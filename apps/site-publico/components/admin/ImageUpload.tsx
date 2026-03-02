'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  X,
  ImageIcon,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Download,
  Eye,
  Trash2
} from '@/lib/lucide-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error' | 'pending';
  progress: number;
  error?: string;
  url?: string;
}

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE = 10; // 10MB
const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export default function ImageUpload({
  onImagesChange,
  maxFiles = 10,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  className,
  disabled = false
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de arquivo não suportado. Use: ${acceptedTypes.join(', ')}`;
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo: ${maxSize}MB`;
    }

    return null;
  };

  const processFiles = useCallback((files: FileList) => {
    const newImages: ImageFile[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);

      if (error) {
        const imageFile: ImageFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
          status: 'error',
          progress: 0,
          error
        };
        newImages.push(imageFile);
      } else {
        const imageFile: ImageFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
          status: 'pending',
          progress: 0
        };
        newImages.push(imageFile);
      }
    });

    setImages(prev => {
      const updated = [...prev, ...newImages];
      if (updated.length > maxFiles) {
        return updated.slice(0, maxFiles);
      }
      return updated;
    });
  }, [maxFiles, maxSize, acceptedTypes]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const uploadImage = async (imageFile: ImageFile): Promise<string> => {
    // Simular upload - em produção, enviar para servidor
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const currentIndex = images.findIndex(img => img.id === imageFile.id);
        if (currentIndex !== -1) {
          setImages(prev => {
            const updated = [...prev];
            updated[currentIndex] = {
              ...updated[currentIndex],
              progress: Math.min(updated[currentIndex].progress + 10, 100)
            };
            return updated;
          });
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        const mockUrl = `https://picsum.photos/400/300?random=${imageFile.id}`;
        resolve(mockUrl);
      }, 2000);
    });
  };

  const startUpload = async (imageFile: ImageFile) => {
    try {
      setImages(prev => prev.map(img =>
        img.id === imageFile.id
          ? { ...img, status: 'uploading', progress: 0 }
          : img
      ));

      const url = await uploadImage(imageFile);

      setImages(prev => prev.map(img =>
        img.id === imageFile.id
          ? { ...img, status: 'success', progress: 100, url }
          : img
      ));

      // Atualizar lista de URLs
      const successImages = images
        .map(img => img.id === imageFile.id ? { ...img, url } : img)
        .filter(img => img.status === 'success' && img.url)
        .map(img => img.url!);

      onImagesChange(successImages);
    } catch (error) {
      setImages(prev => prev.map(img =>
        img.id === imageFile.id
          ? { ...img, status: 'error', error: 'Erro no upload' }
          : img
      ));
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      const successImages = updated
        .filter(img => img.status === 'success' && img.url)
        .map(img => img.url!);
      onImagesChange(successImages);
      return updated;
    });
  };

  const retryUpload = (imageFile: ImageFile) => {
    startUpload(imageFile);
  };

  const getStatusIcon = (status: ImageFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <ImageIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ImageFile['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'uploading':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
          aria-label="Upload de imagens"
          title="Selecionar imagens para upload"
        />

        <div className="space-y-2">
          <Upload className="w-8 h-8 mx-auto text-gray-400" />
          <div className="text-sm">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Clique para upload
            </span>
            {' '}ou arraste e solte
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF até {maxSize}MB cada (máx. {maxFiles} arquivos)
          </p>
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={cn('relative overflow-hidden', getStatusColor(image.status))}>
                  <CardContent className="p-2">
                    <div className="relative aspect-square">
                      <img
                        src={image.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewIndex(index);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(image.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Status Icon */}
                      <div className="absolute top-2 right-2">
                        {getStatusIcon(image.status)}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {image.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={image.progress} className="h-1" />
                        <p className="text-xs text-center mt-1">{image.progress}%</p>
                      </div>
                    )}

                    {/* Error Message */}
                    {image.status === 'error' && (
                      <div className="mt-2">
                        <Alert className="py-2">
                          <AlertCircle className="h-3 w-3" />
                          <AlertDescription className="text-xs">
                            {image.error}
                          </AlertDescription>
                        </Alert>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-1"
                          onClick={() => retryUpload(image)}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Tentar Novamente
                        </Button>
                      </div>
                    )}

                    {/* Success Actions */}
                    {image.status === 'success' && (
                      <div className="mt-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {/* Pending Upload */}
                    {image.status === 'pending' && (
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => startUpload(image)}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Modal */}
      {previewIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => setPreviewIndex(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={images[previewIndex]?.preview}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>
        </div>
      )}

      {/* Summary */}
      {images.length > 0 && (
        <div className="text-sm text-gray-600">
          {images.filter(img => img.status === 'success').length} de {images.length} imagens carregadas
        </div>
      )}
    </div>
  );
}
