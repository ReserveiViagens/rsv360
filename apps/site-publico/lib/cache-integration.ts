/**
 * ✅ INTEGRAÇÃO DE CACHE REDIS PARA RSV GEN 2
 * 
 * Wrapper para facilitar uso de cache em serviços críticos:
 * - Wishlists
 * - Smart Pricing
 * - Quality Program
 * - Propriedades
 */

import { redisCache, cacheGetOrSet } from './redis-cache';

export { cacheGetOrSet } from './redis-cache';

export async function invalidateCache(pattern: string): Promise<number> {
  return redisCache.deletePattern(pattern);
}

// Prefixos para organização de chaves
export const CACHE_PREFIXES = {
  WISHLIST: 'rsv:wishlist',
  PRICING: 'rsv:pricing',
  QUALITY: 'rsv:quality',
  PROPERTY: 'rsv:property',
  USER: 'rsv:user',
} as const;

// TTL padrão por tipo (em segundos)
export const CACHE_TTL = {
  WISHLIST: 3600, // 1 hora
  PRICING: 900, // 15 minutos
  QUALITY: 1800, // 30 minutos
  PROPERTY: 7200, // 2 horas
  USER: 1800, // 30 minutos
} as const;

/**
 * Cache helper para wishlists
 */
export async function cacheWishlist<T>(
  wishlistId: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const key = `${CACHE_PREFIXES.WISHLIST}:${wishlistId}`;
  return cacheGetOrSet(key, fetcher, CACHE_TTL.WISHLIST);
}

/**
 * Cache helper para pricing
 */
export async function cachePricing<T>(
  propertyId: number,
  date: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const key = `${CACHE_PREFIXES.PRICING}:${propertyId}:${date}`;
  return cacheGetOrSet(key, fetcher, CACHE_TTL.PRICING);
}

/**
 * Cache helper para quality metrics
 */
export async function cacheQuality<T>(
  hostId: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const key = `${CACHE_PREFIXES.QUALITY}:${hostId}`;
  return cacheGetOrSet(key, fetcher, CACHE_TTL.QUALITY);
}

/**
 * Cache helper para propriedades
 */
export async function cacheProperty<T>(
  propertyId: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const key = `${CACHE_PREFIXES.PROPERTY}:${propertyId}`;
  return cacheGetOrSet(key, fetcher, CACHE_TTL.PROPERTY);
}

/**
 * Invalidar cache de wishlist
 */
export async function invalidateWishlistCache(wishlistId: number): Promise<void> {
  const key = `${CACHE_PREFIXES.WISHLIST}:${wishlistId}`;
  await redisCache.delete(key);
}

/**
 * Invalidar cache de pricing
 */
export async function invalidatePricingCache(propertyId: number): Promise<void> {
  const pattern = `${CACHE_PREFIXES.PRICING}:${propertyId}:*`;
  await redisCache.deletePattern(pattern);
}

/**
 * Invalidar cache de quality
 */
export async function invalidateQualityCache(hostId: number): Promise<void> {
  const key = `${CACHE_PREFIXES.QUALITY}:${hostId}`;
  await redisCache.delete(key);
}

/**
 * Invalidar cache de propriedade
 */
export async function invalidatePropertyCache(propertyId: number): Promise<void> {
  const key = `${CACHE_PREFIXES.PROPERTY}:${propertyId}`;
  await redisCache.delete(key);
}

/**
 * Limpar todo o cache de um tipo
 */
export async function clearCacheByType(type: keyof typeof CACHE_PREFIXES): Promise<void> {
  const pattern = `${CACHE_PREFIXES[type]}:*`;
  await redisCache.deletePattern(pattern);
}

