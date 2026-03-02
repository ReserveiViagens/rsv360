'use client';

import { PROPERTY_TYPES, PropertyType } from '@/types/auction';

interface PropertyTypeFilterProps {
  selectedTypes: ('hotel' | 'resort' | 'flat' | 'house')[];
  onChange: (types: ('hotel' | 'resort' | 'flat' | 'house')[]) => void;
}

export function PropertyTypeFilter({ selectedTypes, onChange }: PropertyTypeFilterProps) {
  const handleToggle = (type: 'hotel' | 'resort' | 'flat' | 'house') => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter(t => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Tipo de Propriedade
      </label>
      <div className="flex flex-wrap gap-2">
        {PROPERTY_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type.id);
          return (
            <button
              key={type.id}
              onClick={() => handleToggle(type.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
