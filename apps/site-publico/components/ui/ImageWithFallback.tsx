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

const DEFAULT_FALLBACK =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBu428gZGlzcG9u7XZlbDwvdGV4dD48L3N2Zz4=';

function isUnoptimizedSrc(url: string): boolean {
  return url.startsWith('http') || url.startsWith('data:');
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fallbackSrc = DEFAULT_FALLBACK,
  objectFit = 'cover',
  onError,
  onLoad,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [exhausted, setExhausted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setIsLoading(true);
      onError?.();
      return;
    }
    setExhausted(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  React.useEffect(() => {
    setImgSrc(src);
    setExhausted(false);
    setIsLoading(true);
  }, [src]);

  const sizedStyle =
    width != null || height != null
      ? {
          width: width != null ? `${width}px` : undefined,
          height: height != null ? `${height}px` : undefined,
          minHeight: height != null ? `${height}px` : undefined,
        }
      : undefined;

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden bg-gray-100',
        className,
      )}
      style={sizedStyle}
    >
      {isLoading && !exhausted && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="h-full w-full animate-pulse bg-gray-200" />
        </div>
      )}

      {exhausted ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-gray-400">
          <ImageIcon className="mb-2 h-12 w-12" />
          <span className="px-2 text-center text-xs">Imagem não disponível</span>
        </div>
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          unoptimized={isUnoptimizedSrc(imgSrc)}
          onError={handleError}
          onLoad={handleLoad}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down',
          )}
        />
      )}
    </div>
  );
}
