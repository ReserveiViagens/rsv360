'use client';

import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { DateRange } from '@/types/auction';

interface DateRangePickerProps {
  dateRange?: DateRange;
  onChange: (dateRange: { checkIn?: Date; checkOut?: Date }) => void;
}

export function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
    const date = value ? new Date(value) : null;
    if (date && date < new Date()) {
      return; // Não permitir datas passadas
    }
    onChange({
      ...dateRange,
      [field]: date || undefined,
    });
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Período
      </label>
      <div className="space-y-2">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="date"
            placeholder="Check-in"
            value={dateRange?.checkIn ? dateRange.checkIn.toISOString().split('T')[0] : ''}
            onChange={(e) => handleDateChange('checkIn', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          {dateRange?.checkIn && (
            <button
              onClick={() => onChange({ ...dateRange, checkIn: undefined })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="date"
            placeholder="Check-out"
            value={dateRange?.checkOut ? dateRange.checkOut.toISOString().split('T')[0] : ''}
            onChange={(e) => handleDateChange('checkOut', e.target.value)}
            min={dateRange?.checkIn ? dateRange.checkIn.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          {dateRange?.checkOut && (
            <button
              onClick={() => onChange({ ...dateRange, checkOut: undefined })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {dateRange?.checkIn && dateRange?.checkOut && (
        <div className="mt-2 text-xs text-gray-600">
          {formatDate(dateRange.checkIn)} - {formatDate(dateRange.checkOut)}
        </div>
      )}
    </div>
  );
}
