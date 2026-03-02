"use client";

import React from 'react';
import Image from 'next/image';
import { LazyImage } from '@/components/lazy/lazy-image';
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
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ✅ OPTIMIZED IMAGE COMPONENT
 * 
 * Componente de imagem otimizado que usa:
 * - Next.js Image quando possível
 * - LazyImage como fallback
 * - Suporte a múltiplos formatos
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  sizes,
  fill = false,
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  // Se é uma imagem externa ou não suporta Next.js Image, usar LazyImage
  const isExternal = src.startsWith('http://') || src.startsWith('https://');
  const isDataUrl = src.startsWith('data:');

  if (isExternal && !src.startsWith(process.env.NEXT_PUBLIC_IMAGE_DOMAIN || '')) {
    return (
      <LazyImage
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  if (isDataUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(className)}
        width={width}
        height={height}
        onLoad={onLoad}
        onError={onError}
        style={{ objectFit }}
      />
    );
  }

  // Usar Next.js Image para otimização
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(className)}
        quality={quality}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        style={{ objectFit }}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  if (!width || !height) {
    return (
      <LazyImage
        src={src}
        alt={alt}
        className={className}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(className)}
      quality={quality}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      style={{ objectFit }}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

