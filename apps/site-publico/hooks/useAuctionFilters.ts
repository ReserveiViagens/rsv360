'use client';

import { useState, useCallback } from 'react';
import { AuctionFilters } from '@/types/auction';

/**
 * Hook para gerenciar filtros de leilões
 */
export function useAuctionFilters(initialFilters?: AuctionFilters) {
  const [filters, setFilters] = useState<AuctionFilters>(initialFilters || {});

  const updateFilter = useCallback(<K extends keyof AuctionFilters>(
    key: K,
    value: AuctionFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.location ||
      filters.propertyType?.length ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.dateRange?.checkIn ||
      filters.dateRange?.checkOut ||
      filters.amenities?.length ||
      filters.stars ||
      filters.search
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
  };
}
