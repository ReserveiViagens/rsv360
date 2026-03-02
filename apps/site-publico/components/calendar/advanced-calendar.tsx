'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarDay {
  date: Date;
  price: number; // Sempre será um número, nunca undefined
  isBlocked: boolean;
  isToday: boolean;
  isPast: boolean;
  event?: string;
}

interface AdvancedCalendarProps {
  propertyId: number;
  basePrice: number;
  onDateSelect?: (date: Date) => void;
  blockedDates?: Array<{ start: Date; end: Date }>;
}

// Função auxiliar para garantir que um valor seja sempre um número válido
function ensureNumber(value: any, fallback: number = 300): number {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'number') return isNaN(value) ? fallback : value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

export default function AdvancedCalendar({
  propertyId,
  basePrice,
  onDateSelect,
  blockedDates = [],
}: AdvancedCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Garantir que basePrice seja sempre um número válido
  const safeBasePrice = ensureNumber(basePrice, 300);

  useEffect(() => {
    loadCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, propertyId, safeBasePrice]);

  async function loadCalendarData() {
    setLoading(true);
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      console.log('Carregando dados do calendário para:', {
        propertyId,
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd'),
        basePrice: safeBasePrice
      });
      
      // Buscar preços via API
      const pricingResponse = await fetch(
        `/api/properties/${propertyId}/pricing?start_date=${format(start, 'yyyy-MM-dd')}&end_date=${format(end, 'yyyy-MM-dd')}`
      );
      
      let prices: any[] = [];
      if (pricingResponse.ok) {
        const pricingData = await pricingResponse.json();
        console.log('Dados de preços recebidos:', pricingData);
        prices = pricingData.prices || [];
      } else {
        console.warn('Erro ao buscar preços. Status:', pricingResponse.status);
        // Continuar sem preços, usando basePrice
      }
      
      const days = eachDayOfInterval({ start, end });
      const calendar: CalendarDay[] = days.map((date) => {
        const priceData = prices.find((p: any) => p.date === format(date, 'yyyy-MM-dd'));
        const isBlocked = blockedDates.some(
          (blocked) => date >= blocked.start && date <= blocked.end
        );
        
        // Garantir que price seja sempre um número válido usando a função auxiliar
        const priceValue = ensureNumber(priceData?.price, safeBasePrice);
        
        // Garantir que priceValue é realmente um número antes de criar o objeto
        const finalPriceValue: number = typeof priceValue === 'number' && !isNaN(priceValue) ? priceValue : safeBasePrice;
        
        return {
          date,
          price: finalPriceValue, // Sempre será um número válido, nunca undefined
          isBlocked,
          isToday: isToday(date),
          isPast: date < new Date(),
          event: priceData?.breakdown?.multipliers?.find((m: any) => m.type === 'event')?.description,
        } as CalendarDay;
      });
      
      console.log('Calendário criado com', calendar.length, 'dias');
      setCalendarDays(calendar);
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
      // Em caso de erro, criar calendário básico com basePrice
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const days = eachDayOfInterval({ start, end });
      const fallbackCalendar: CalendarDay[] = days.map((date) => ({
        date,
        price: safeBasePrice,
        isBlocked: false,
        isToday: isToday(date),
        isPast: date < new Date(),
      }));
      setCalendarDays(fallbackCalendar);
    } finally {
      setLoading(false);
    }
  }

  function handleDateClick(day: CalendarDay) {
    if (day.isBlocked || day.isPast) return;
    setSelectedDate(day.date);
    onDateSelect?.(day.date);
  }

  function previousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          ←
        </button>
        <h2 className="text-xl font-bold">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          →
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendário */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const isSelected = selectedDate && isSameDay(day.date, selectedDate);
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={day.isBlocked || day.isPast}
              className={`
                p-2 rounded-lg text-sm transition
                ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                ${isSelected ? 'bg-blue-600 text-white' : ''}
                ${day.isBlocked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
                ${day.isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                ${!day.isBlocked && !day.isPast && !isSelected ? 'hover:bg-gray-100' : ''}
              `}
            >
              <div className="font-semibold">{format(day.date, 'd')}</div>
              {!day.isBlocked && (() => {
                // Garantir que price seja sempre um número válido usando a função auxiliar
                // Proteção extra: garantir que day.price existe e é válido
                const dayPrice = day.price !== undefined && day.price !== null ? day.price : safeBasePrice;
                const finalPrice = ensureNumber(dayPrice, safeBasePrice);
                
                // Verificação final: garantir que finalPrice é um número válido
                if (typeof finalPrice !== 'number' || isNaN(finalPrice)) {
                  return null; // Não renderizar se não for válido
                }
                
                // Usar Math.round e toLocaleString em vez de toFixed
                const roundedPrice = Math.round(finalPrice);
                const formattedPrice = roundedPrice.toLocaleString('pt-BR', { 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0 
                });
                
                return (
                  <div className="text-xs mt-1">
                    R$ {formattedPrice}
                  </div>
                );
              })()}
              {day.event && (
                <div className="text-xs mt-1 text-orange-600" title={day.event}>
                  🎉
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span>Indisponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 ring-2 ring-blue-500 rounded"></div>
          <span>Hoje</span>
        </div>
      </div>
    </div>
  );
}

