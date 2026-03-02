'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onError?: () => void;
  onLoad?: () => void;
}

// SVG placeholder 1x1 cinza (base64)
const DEFAULT_FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBu428gZGlzcG9u7XZlbDwvdGV4dD48L3N2Zz4=';

export function ImageWithFallback({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  priority = false,
  fallbackSrc = DEFAULT_FALLBACK,
  objectFit = 'cover',
  onError,
  onLoad,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
      onError?.();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Reset when src changes
  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-100 flex items-center justify-center w-full h-full',
        className
      )}
      style={{ 
        position: 'relative', // Garantir explicitamente para next/image fill
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        minHeight: height ? `${height}px` : '100%'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="animate-pulse bg-gray-200 w-full h-full" />
        </div>
      )}

      {hasError || imgSrc === fallbackSrc ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-20">
          <ImageIcon className="w-12 h-12 mb-2" />
          <span className="text-xs text-center px-2">Imagem não disponível</span>
        </div>
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          onError={handleError}
          onLoad={handleLoad}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down'
          )}
        />
      )}
    </div>
  );
}

