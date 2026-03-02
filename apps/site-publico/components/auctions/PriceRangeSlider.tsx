'use client';

import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

interface PriceRangeSliderProps {
  minPrice?: number;
  maxPrice?: number;
  onChange: (minPrice: number, maxPrice: number) => void;
  defaultMin?: number;
  defaultMax?: number;
}

export function PriceRangeSlider({ 
  minPrice, 
  maxPrice, 
  onChange,
  defaultMin = 0,
  defaultMax = 2000000,
}: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState(minPrice ?? defaultMin);
  const [localMax, setLocalMax] = useState(maxPrice ?? defaultMax);

  useEffect(() => {
    if (minPrice !== undefined) setLocalMin(minPrice);
    if (maxPrice !== undefined) setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMax - 10000);
    setLocalMin(newMin);
    onChange(newMin, localMax);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMin + 10000);
    setLocalMax(newMax);
    onChange(localMin, newMax);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Faixa de Preço
      </label>
      <div className="space-y-4">
        {/* Sliders */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="range"
              min={defaultMin}
              max={defaultMax}
              value={localMin}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <input
              type="range"
              min={defaultMin}
              max={defaultMax}
              value={localMax}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-[-8px]"
            />
          </div>
        </div>

        {/* Valores */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700 font-medium">
              {formatCurrency(localMin)}
            </span>
          </div>
          <span className="text-gray-400">-</span>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700 font-medium">
              {formatCurrency(localMax)}
            </span>
          </div>
        </div>

        {/* Inputs numéricos */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={localMin}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            min={defaultMin}
            max={localMax}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Mínimo"
          />
          <input
            type="number"
            value={localMax}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            min={localMin}
            max={defaultMax}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Máximo"
          />
        </div>
      </div>
    </div>
  );
}
