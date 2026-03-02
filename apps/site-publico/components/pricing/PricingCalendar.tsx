/**
 * ✅ FASE 2 - ETAPA 2.2: Componente PricingCalendar
 * Calendário de preços com color coding por demanda
 * 
 * @module components/pricing/PricingCalendar
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Edit2, Calendar as CalendarIcon, Cloud, MapPin, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface PricingCalendarProps {
  propertyId: string;
  dateRange: { start: Date; end: Date };
  onDateClick?: (date: Date) => void;
  onPriceChange?: (date: Date, newPrice: number) => Promise<void>;
}

interface DayPrice {
  date: string;
  price: number;
  suggestedPrice: number;
  demand: number; // 0-100
  isManualOverride: boolean;
  events?: string[];
  weather?: string;
}

export default function PricingCalendar({
  propertyId,
  dateRange,
  onDateClick,
  onPriceChange
}: PricingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState('');

  // Query: Buscar preços para o período
  const { data: prices, isLoading } = useQuery<DayPrice[]>({
    queryKey: ['pricing-calendar', propertyId, currentMonth],
    queryFn: async () => {
      const response = await fetch(
        `/api/pricing/calendar/${propertyId}?month=${format(currentMonth, 'yyyy-MM')}`
      );
      if (!response.ok) throw new Error('Erro ao buscar preços');
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 2 * 60 * 1000
  });

  // Helper: Obter cor baseada na demanda
  const getDemandColor = (demand: number): string => {
    if (demand >= 80) return 'bg-green-500'; // Alta demanda
    if (demand >= 50) return 'bg-yellow-500'; // Média demanda
    if (demand > 0) return 'bg-red-500'; // Baixa demanda
    return 'bg-gray-300'; // Sem dados
  };

  // Helper: Obter preço do dia
  const getDayPrice = (date: Date): DayPrice | undefined => {
    if (!prices) return undefined;
    const dateStr = format(date, 'yyyy-MM-dd');
    return prices.find(p => p.date === dateStr);
  };

  // Handler: Click no dia
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const dayPrice = getDayPrice(date);
    if (dayPrice) {
      setPriceInput(dayPrice.price.toString());
    }
    onDateClick?.(date);
  };

  // Handler: Salvar preço editado
  const handleSavePrice = async () => {
    if (!selectedDate || !priceInput) return;
    
    const newPrice = parseFloat(priceInput);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Preço inválido');
      return;
    }

    try {
      await onPriceChange?.(selectedDate, newPrice);
      setEditingPrice(false);
      toast.success('Preço atualizado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar preço');
    }
  };

  // Navegação
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Gerar dias do mês
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const selectedDayPrice = selectedDate ? getDayPrice(selectedDate) : null;

  return (
    <div className="space-y-4">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={goToToday}>
          Hoje
        </Button>
      </div>

      {/* Calendário */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const dayPrice = getDayPrice(day);
              const isCurrentDay = isToday(day);
              const isOtherMonth = !isSameMonth(day, currentMonth);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative p-2 rounded-lg border-2 transition-all
                    ${isOtherMonth ? 'opacity-30' : ''}
                    ${isCurrentDay ? 'border-blue-500' : 'border-gray-200'}
                    ${dayPrice ? 'hover:border-blue-400 hover:shadow-md' : ''}
                    ${dayPrice ? getDemandColor(dayPrice.demand) : 'bg-gray-50'}
                    text-left
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {dayPrice?.isManualOverride && (
                      <Edit2 className="h-3 w-3 text-blue-600" />
                    )}
                  </div>

                  {dayPrice && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-white">
                        R$ {dayPrice.price.toFixed(0)}
                      </div>
                      {dayPrice.demand > 0 && (
                        <div className="text-xs text-white/80">
                          {dayPrice.demand.toFixed(0)}% demanda
                        </div>
                      )}
                      {dayPrice.events && dayPrice.events.length > 0 && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {dayPrice.events.length} evento{dayPrice.events.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Legenda */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Alta demanda (&gt;80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Média demanda (50-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Baixa demanda (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span>Sem dados</span>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription>
              Detalhes de preço e demanda para este dia
            </DialogDescription>
          </DialogHeader>

          {selectedDayPrice ? (
            <div className="space-y-4">
              {/* Preço Atual */}
              <div>
                <Label>Preço Atual</Label>
                <div className="text-2xl font-bold">
                  R$ {selectedDayPrice.price.toFixed(2)}
                </div>
                {selectedDayPrice.isManualOverride && (
                  <Badge variant="outline" className="mt-1">
                    <Edit2 className="h-3 w-3 mr-1" />
                    Ajuste manual
                  </Badge>
                )}
              </div>

              {/* Preço Sugerido */}
              <div>
                <Label>Preço Sugerido por AI</Label>
                <div className="text-xl font-semibold text-blue-600">
                  R$ {selectedDayPrice.suggestedPrice.toFixed(2)}
                </div>
                {selectedDayPrice.suggestedPrice > selectedDayPrice.price && (
                  <div className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    Sugestão de aumento
                  </div>
                )}
              </div>

              {/* Demanda */}
              <div>
                <Label>Demanda Esperada</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getDemandColor(selectedDayPrice.demand)}`}
                      style={{ width: `${selectedDayPrice.demand}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{selectedDayPrice.demand}%</span>
                </div>
              </div>

              {/* Eventos */}
              {selectedDayPrice.events && selectedDayPrice.events.length > 0 && (
                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Eventos Locais
                  </Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {selectedDayPrice.events.map((event, i) => (
                      <li key={i}>{event}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clima */}
              {selectedDayPrice.weather && (
                <div>
                  <Label className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Clima Previsto
                  </Label>
                  <p className="text-sm text-muted-foreground">{selectedDayPrice.weather}</p>
                </div>
              )}

              {/* Editar Preço */}
              <div className="border-t pt-4">
                <Label>Editar Preço</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="Novo preço"
                    className="flex-1"
                  />
                  <Button onClick={handleSavePrice}>
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado disponível para este dia
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDate(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

