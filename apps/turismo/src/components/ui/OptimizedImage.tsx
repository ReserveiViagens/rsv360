'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  aspectRatio?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  priority = false,
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  aspectRatio,
  objectFit = 'cover',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  // Gerar placeholder blur data URL se não fornecido
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const defaultBlurDataURL = blurDataURL || generateBlurDataURL(width, height);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
    onError?.();
  };

  // Calcular dimensões baseado no aspect ratio
  const calculatedHeight = aspectRatio ? width / aspectRatio : height;

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-gray-100',
        className
      )}
      style={{
        width: width,
        height: calculatedHeight,
      }}
      {...props}
    >
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error placeholder */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="w-12 h-12 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Falha ao carregar imagem</span>
        </div>
      )}

      {/* Imagem real */}
      {isInView && !error && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={calculatedHeight}
          quality={quality}
          priority={priority}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={defaultBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down'
          )}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      )}

      {/* Progressive Enhancement: WebP/AVIF support */}
      {isInView && !error && typeof window !== 'undefined' && (
        <picture className="hidden">
          <source srcSet={`${src}?format=avif&w=${width}&q=${quality}`} type="image/avif" />
          <source srcSet={`${src}?format=webp&w=${width}&q=${quality}`} type="image/webp" />
        </picture>
      )}
    </div>
  );
}

// Hook para preload de imagens
export function useImagePreload(sources: string[]) {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadPromises = sources.map(src => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.allSettled(preloadPromises).then(results => {
      const loaded = new Set<string>();
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          loaded.add(sources[index]);
        }
      });
      setPreloadedImages(loaded);
    });
  }, [sources]);

  return preloadedImages;
}

// Componente para galeria otimizada
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: number;
  onImageClick?: (index: number) => void;
}

export function OptimizedImageGallery({
  images,
  columns = 3,
  gap = 16,
  onImageClick,
}: ImageGalleryProps) {
  const [visibleImages, setVisibleImages] = useState(6); // Mostrar apenas 6 inicialmente

  const loadMore = () => {
    setVisibleImages(prev => Math.min(prev + 6, images.length));
  };

  return (
    <div className="space-y-4">
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {images.slice(0, visibleImages).map((image, index) => (
          <OptimizedImage
            key={index}
            src={image.src}
            alt={image.alt}
            width={image.width || 300}
            height={image.height || 200}
            className="cursor-pointer rounded-lg hover:shadow-lg transition-shadow"
            onClick={() => onImageClick?.(index)}
            lazy={index > 2} // Primeiras 3 imagens sem lazy loading
          />
        ))}
      </div>

      {visibleImages < images.length && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Carregar mais ({images.length - visibleImages} restantes)
          </button>
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;
