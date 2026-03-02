'use client';

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PropertyTypeFilter } from './PropertyTypeFilter';
import { DateRangePicker } from './DateRangePicker';
import { PriceRangeSlider } from './PriceRangeSlider';
import { AuctionFilters as AuctionFiltersType } from '@/types/auction';

interface AuctionFiltersProps {
  filters: AuctionFiltersType;
  onFiltersChange: (filters: AuctionFiltersType) => void;
  onClearFilters: () => void;
}

export function AuctionFilters({ filters, onFiltersChange, onClearFilters }: AuctionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState(filters.location || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const regionSuggestions = ['Caldas Novas', 'Caldas Novas Rio Quente', 'Rio Quente'];

  const handleRegionChange = (value: string) => {
    setRegionSearch(value);
    const filtered = regionSuggestions.filter(s => 
      s.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleRegionSelect = (region: string) => {
    setRegionSearch(region);
    setSuggestions([]);
    onFiltersChange({ ...filters, location: region });
  };

  const handlePropertyTypeChange = (types: ('hotel' | 'resort' | 'flat' | 'house')[]) => {
    onFiltersChange({ ...filters, propertyType: types });
  };

  const handleDateRangeChange = (dateRange: { checkIn?: Date; checkOut?: Date }) => {
    onFiltersChange({ ...filters, dateRange });
  };

  const handlePriceRangeChange = (minPrice: number, maxPrice: number) => {
    onFiltersChange({ ...filters, minPrice, maxPrice });
  };

  const activeFiltersCount = [
    filters.location,
    filters.propertyType?.length,
    filters.dateRange?.checkIn,
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
    filters.amenities?.length,
    filters.stars,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header com toggle mobile */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>

      {/* Conteúdo dos filtros */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-4 space-y-6`}>
        {/* Busca por Região */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Buscar por Região
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Ex: Caldas Novas"
              value={regionSearch}
              onChange={(e) => handleRegionChange(e.target.value)}
              onFocus={() => {
                if (regionSearch) {
                  const filtered = regionSuggestions.filter(s => 
                    s.toLowerCase().includes(regionSearch.toLowerCase())
                  );
                  setSuggestions(filtered);
                } else {
                  setSuggestions(regionSuggestions);
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            {regionSearch && (
              <button
                onClick={() => {
                  setRegionSearch('');
                  setSuggestions([]);
                  onFiltersChange({ ...filters, location: undefined });
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleRegionSelect(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtro de Tipo de Propriedade */}
        <PropertyTypeFilter
          selectedTypes={filters.propertyType || []}
          onChange={handlePropertyTypeChange}
        />

        {/* Date Range Picker */}
        <DateRangePicker
          dateRange={filters.dateRange}
          onChange={handleDateRangeChange}
        />

        {/* Price Range Slider */}
        <PriceRangeSlider
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onChange={handlePriceRangeChange}
        />

        {/* Filtros de Amenities (simplificado) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Comodidades
          </label>
          <div className="space-y-2">
            {['Pool', 'WiFi', 'Parking', 'Spa', 'Restaurant'].map((amenity) => {
              const isSelected = filters.amenities?.includes(amenity.toLowerCase());
              return (
                <button
                  key={amenity}
                  onClick={() => {
                    const currentAmenities = filters.amenities || [];
                    const newAmenities = isSelected
                      ? currentAmenities.filter(a => a !== amenity.toLowerCase())
                      : [...currentAmenities, amenity.toLowerCase()];
                    onFiltersChange({ ...filters, amenities: newAmenities });
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro de Estrelas */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Classificação Mínima
          </label>
          <div className="flex gap-2">
            {[3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  const newStars = filters.stars === star ? undefined : star;
                  onFiltersChange({ ...filters, stars: newStars });
                }}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                  filters.stars === star
                    ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {'⭐'.repeat(star)}
              </button>
            ))}
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  );
}
