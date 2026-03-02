import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface CalendarBooking {
  id: string;
  customerName: string;
  destination: string;
  checkIn: Date;
  checkOut: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  guests: number;
  totalPrice: number;
}

export interface CalendarProps {
  bookings: CalendarBooking[];
  onDateClick?: (date: Date) => void;
  onBookingClick?: (booking: CalendarBooking) => void;
  onBookingMove?: (bookingId: string, newCheckIn: Date, newCheckOut: Date) => void;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  bookings,
  onDateClick,
  onBookingClick,
  onBookingMove,
  className,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Navegação do calendário
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Gerar dias do mês
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Organizar reservas por data
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    
    bookings.forEach(booking => {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      
      // Adicionar reserva para cada dia do período
      let current = start;
      while (current <= end) {
        const dateKey = format(current, 'yyyy-MM-dd');
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(booking);
        current = addMonths(current, 0); // Avançar um dia
      }
    });
    
    return map;
  }, [bookings]);

  // Verificar se uma data tem reservas
  const getBookingsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return bookingsByDate.get(dateKey) || [];
  };

  // Calcular duração da reserva
  const getBookingDuration = (booking: CalendarBooking) => {
    const start = new Date(booking.checkIn);
    const end = new Date(booking.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Verificar se é o primeiro dia da reserva
  const isFirstDayOfBooking = (date: Date, booking: CalendarBooking) => {
    return isSameDay(date, new Date(booking.checkIn));
  };

  // Verificar se é o último dia da reserva
  const isLastDayOfBooking = (date: Date, booking: CalendarBooking) => {
    return isSameDay(date, new Date(booking.checkOut));
  };

  // Verificar se é um dia intermediário da reserva
  const isMiddleDayOfBooking = (date: Date, booking: CalendarBooking) => {
    const start = new Date(booking.checkIn);
    const end = new Date(booking.checkOut);
    return date > start && date < end;
  };

  // Drag and Drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const bookingId = active.id as string;
    const targetDate = new Date(over.id as string);
    
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const duration = getBookingDuration(booking);
    const newCheckIn = targetDate;
    const newCheckOut = addMonths(targetDate, duration);
    
    onBookingMove?.(bookingId, newCheckIn, newCheckOut);
  };

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-6', className)}>
      {/* Header do Calendário */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold text-neutral-900">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="h-8 w-8 p-0"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="flex items-center gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          Hoje
        </Button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-neutral-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day) => {
            const dayBookings = getBookingsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[120px] p-2 border border-neutral-100 transition-colors',
                  'hover:bg-neutral-50 cursor-pointer',
                  {
                    'bg-neutral-50': !isCurrentMonth,
                    'bg-blue-50 border-blue-200': isCurrentDay,
                  }
                )}
                onClick={() => onDateClick?.(day)}
              >
                {/* Número do dia */}
                <div
                  className={cn(
                    'text-sm font-medium mb-2',
                    {
                      'text-neutral-400': !isCurrentMonth,
                      'text-blue-600': isCurrentDay,
                      'text-neutral-900': isCurrentMonth && !isCurrentDay,
                    }
                  )}
                >
                  {format(day, 'd')}
                </div>

                {/* Reservas do dia */}
                <div className="space-y-1">
                  {dayBookings.map((booking) => {
                    const isFirst = isFirstDayOfBooking(day, booking);
                    const isLast = isLastDayOfBooking(day, booking);
                    const isMiddle = isMiddleDayOfBooking(day, booking);
                    
                    // Só mostrar reserva no primeiro dia ou se for um dia único
                    if (!isFirst && !isMiddle) return null;
                    
                    return (
                      <DraggableBooking
                        key={booking.id}
                        booking={booking}
                        isFirst={isFirst}
                        isLast={isLast}
                        isMiddle={isMiddle}
                        onClick={() => onBookingClick?.(booking)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
};

// Componente de reserva arrastável
interface DraggableBookingProps {
  booking: CalendarBooking;
  isFirst: boolean;
  isLast: boolean;
  isMiddle: boolean;
  onClick: () => void;
}

const DraggableBooking: React.FC<DraggableBookingProps> = ({
  booking,
  isFirst,
  isLast,
  isMiddle,
  onClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: booking.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusVariant = (status: CalendarBooking['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: CalendarBooking['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'p-2 rounded text-xs cursor-move transition-all',
        'hover:shadow-sm active:shadow-md',
        {
          'opacity-50': isDragging,
          'rounded-l-md': isFirst,
          'rounded-r-md': isLast,
          'rounded-none': isMiddle,
        }
      )}
      onClick={onClick}
    >
      <div className="font-medium text-white truncate">
        {booking.customerName}
      </div>
      <div className="text-white/80 truncate">
        {booking.destination}
      </div>
      <Badge
        variant={getStatusVariant(booking.status)}
        className="mt-1 text-xs"
      >
        {getStatusLabel(booking.status)}
      </Badge>
    </div>
  );
};

export { Calendar };
