// ===================================================================
// BOOKING CALENDAR - CALENDÁRIO MODERNO E INTUITIVO
// ===================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable,
  SortableContext as SortableContextType
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarDays,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface Booking {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  destination: string;
  checkIn: Date;
  checkOut: Date;
  value: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  guests: number;
  notes?: string;
  color: string;
}

interface CalendarDay {
  date: Date;
  bookings: Booking[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

// ===================================================================
// COMPONENTE DE RESERVA SORTÁVEL
// ===================================================================

interface SortableBookingItemProps {
  booking: Booking;
  onView: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

const SortableBookingItem: React.FC<SortableBookingItemProps> = ({
  booking,
  onView,
  onEdit,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: booking.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-2 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(booking.status)}
            <p className="text-sm font-semibold text-gray-900 truncate">
              {booking.customerName}
            </p>
          </div>
          <p className="text-xs text-gray-600 flex items-center mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {booking.destination}
          </p>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(booking);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Visualizar"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(booking);
            }}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Editar"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(booking);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mt-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {getStatusIcon(booking.status)}
            <span className="ml-1 capitalize">{booking.status}</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(booking.paymentStatus)}`}>
            {booking.paymentStatus === 'paid' ? 'Pago' :
             booking.paymentStatus === 'pending' ? 'Pendente' : 'Falhou'}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="w-3 h-3" />
          <span>{booking.guests}</span>
          <DollarSign className="w-3 h-3 ml-2" />
          <span className="font-medium">R$ {booking.value.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

interface BookingCalendarProps {
  bookings?: Booking[];
  onBookingsChange?: (bookings: Booking[]) => void;
  onView?: (booking: Booking) => void;
  onEdit?: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings: externalBookings,
  onBookingsChange,
  onView,
  onEdit,
  onDelete
}) => {
  const [internalBookings, setInternalBookings] = useState<Booking[]>([]);
  
  // Usar bookings externos se fornecidos, caso contrário usar estado interno
  const bookings = externalBookings || internalBookings;
  
  const setBookings = (newBookings: Booking[]) => {
    if (onBookingsChange) {
      onBookingsChange(newBookings);
    } else {
      setInternalBookings(newBookings);
    }
  };
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const yearPickerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ===================================================================
  // GERAÇÃO DO CALENDÁRIO
  // ===================================================================

  const generateCalendarDays = (bookingsData: Booking[]) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayBookings = bookingsData.filter(booking => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        return date >= checkIn && date <= checkOut;
      });

      days.push({
        date: new Date(date),
        bookings: dayBookings,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    setCalendarDays(days);
  };

  // ===================================================================
  // DADOS MOCK
  // ===================================================================

  // Carregar dados mock apenas se não houver bookings externos
  useEffect(() => {
    if (!externalBookings || externalBookings.length === 0) {
      const mockBookings: Booking[] = [
        {
          id: '1',
          customerName: 'João Silva',
          customerEmail: 'joao.silva@email.com',
          customerPhone: '(11) 99999-9999',
          destination: 'Caldas Novas - GO',
          checkIn: new Date(2026, 0, 15),
          checkOut: new Date(2026, 0, 18),
          value: 1500,
          status: 'confirmed',
          paymentStatus: 'paid',
          guests: 4,
          notes: 'Cliente preferiu quarto com vista para a piscina',
          color: '#10B981'
        },
        {
          id: '2',
          customerName: 'Maria Santos',
          customerEmail: 'maria.santos@email.com',
          customerPhone: '(11) 88888-8888',
          destination: 'Porto de Galinhas - PE',
          checkIn: new Date(2026, 0, 20),
          checkOut: new Date(2026, 0, 25),
          value: 2200,
          status: 'pending',
          paymentStatus: 'pending',
          guests: 2,
          notes: 'Aguardando confirmação de pagamento',
          color: '#F59E0B'
        },
        {
          id: '3',
          customerName: 'Pedro Costa',
          customerEmail: 'pedro.costa@email.com',
          customerPhone: '(11) 77777-7777',
          destination: 'Fernando de Noronha - PE',
          checkIn: new Date(2026, 0, 10),
          checkOut: new Date(2026, 0, 15),
          value: 4500,
          status: 'confirmed',
          paymentStatus: 'paid',
          guests: 2,
          notes: 'Pacote completo com mergulho incluído',
          color: '#10B981'
        },
        {
          id: '4',
          customerName: 'Ana Oliveira',
          customerEmail: 'ana.oliveira@email.com',
          customerPhone: '(11) 66666-6666',
          destination: 'Gramado - RS',
          checkIn: new Date(2026, 0, 5),
          checkOut: new Date(2026, 0, 9),
          value: 2400,
          status: 'cancelled',
          paymentStatus: 'failed',
          guests: 3,
          notes: 'Reserva cancelada pelo cliente',
          color: '#EF4444'
        }
      ];
      setBookings(mockBookings);
    }
  }, [externalBookings]);

  // Regenerar calendário quando currentDate ou bookings mudarem
  useEffect(() => {
    generateCalendarDays(bookings);
  }, [currentDate, bookings]);

  // ===================================================================
  // NAVEGAÇÃO DO CALENDÁRIO
  // ===================================================================

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToPreviousYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
  };

  const goToNextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToMonth = (month: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
    setShowMonthPicker(false);
  };

  const goToYear = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  // ===================================================================
  // HANDLERS DE DRAG & DROP
  // ===================================================================

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const booking = bookings.find(b => b.id === event.active.id);
    setSelectedBooking(booking || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    setSelectedBooking(null);

    const { active, over } = event;

    if (!over) return;

    const activeBooking = bookings.find(b => b.id === active.id);
    if (!activeBooking) return;

    const overDate = new Date(over.id as string);
    if (isNaN(overDate.getTime())) return;

    const daysDiff = Math.floor((overDate.getTime() - new Date(activeBooking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const newCheckIn = new Date(activeBooking.checkIn);
    newCheckIn.setDate(newCheckIn.getDate() + daysDiff);
    const newCheckOut = new Date(activeBooking.checkOut);
    newCheckOut.setDate(newCheckOut.getDate() + daysDiff);

    const updatedBooking = {
      ...activeBooking,
      checkIn: newCheckIn,
      checkOut: newCheckOut
    };

    const updatedBookings = bookings.map(b => b.id === activeBooking.id ? updatedBooking : b);
    setBookings(updatedBookings);
  };

  // ===================================================================
  // HANDLERS DE AÇÕES
  // ===================================================================

  const handleViewBooking = (booking: Booking) => {
    if (onView) {
      onView(booking);
    } else {
      if (typeof window !== 'undefined') {
        window.location.href = `/reservations/${booking.id}`;
      }
    }
  };

  const handleEditBooking = (booking: Booking) => {
    if (onEdit) {
      onEdit(booking);
    } else {
      console.log('Editar reserva:', booking);
    }
  };

  const handleDeleteBooking = (booking: Booking) => {
    if (onDelete) {
      onDelete(booking);
    } else {
      if (confirm(`Tem certeza que deseja excluir a reserva de ${booking.customerName}?`)) {
        setBookings(bookings.filter(b => b.id !== booking.id));
      }
    }
  };

  // ===================================================================
  // FILTROS
  // ===================================================================

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ===================================================================
  // ATALHOS DE TECLADO
  // ===================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        goToPreviousMonth();
      } else if (e.key === 'ArrowRight' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        goToNextMonth();
      } else if (e.key === 'Home' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        goToToday();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDate]);

  // ===================================================================
  // CLICK FORA PARA FECHAR PICKERS
  // ===================================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
      }
      if (yearPickerRef.current && !yearPickerRef.current.contains(event.target as Node)) {
        setShowYearPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===================================================================
  // MESES E ANOS
  // ===================================================================

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <div className="space-y-6">
      {/* Header Moderno */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Calendário de Reservas</h1>
            <p className="text-blue-100">Gerencie suas reservas de forma intuitiva</p>
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-md hover:shadow-lg font-semibold">
            <Plus className="w-5 h-5" />
            <span>Nova Reserva</span>
          </button>
        </div>
      </div>

      {/* Navegação do Calendário - Melhorada */}
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Navegação Principal */}
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousYear}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Ano Anterior (Ctrl+Shift+←)"
            >
              <ChevronsLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Mês Anterior (Ctrl+←)"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Seletor de Mês/Ano */}
            <div className="flex items-center space-x-2">
              <div className="relative" ref={monthPickerRef}>
                <button
                  onClick={() => {
                    setShowMonthPicker(!showMonthPicker);
                    setShowYearPicker(false);
                  }}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg font-semibold text-gray-900 transition-colors flex items-center space-x-2 min-w-[140px] justify-center"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>{months[currentMonth]}</span>
                </button>
                {showMonthPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 grid grid-cols-3 gap-1 min-w-[280px]">
                    {months.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => goToMonth(index)}
                        className={`px-3 py-2 rounded-md text-sm transition-colors ${
                          index === currentMonth
                            ? 'bg-blue-500 text-white font-semibold'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {month.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={yearPickerRef}>
                <button
                  onClick={() => {
                    setShowYearPicker(!showYearPicker);
                    setShowMonthPicker(false);
                  }}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg font-semibold text-gray-900 transition-colors flex items-center space-x-2 min-w-[100px] justify-center"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{currentYear}</span>
                </button>
                {showYearPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 grid grid-cols-4 gap-1 max-h-[300px] overflow-y-auto min-w-[200px]">
                    {years.map((year) => (
                      <button
                        key={year}
                        onClick={() => goToYear(year)}
                        className={`px-3 py-2 rounded-md text-sm transition-colors ${
                          year === currentYear
                            ? 'bg-blue-500 text-white font-semibold'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Próximo Mês (Ctrl+→)"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToNextYear}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Próximo Ano (Ctrl+Shift+→)"
            >
              <ChevronsRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Botão Hoje */}
          <button
            onClick={goToToday}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold shadow-md hover:shadow-lg flex items-center space-x-2"
            title="Ir para Hoje (Ctrl+Home)"
          >
            <Calendar className="w-4 h-4" />
            <span>Hoje</span>
          </button>
        </div>
      </div>

      {/* Filtros Compactos */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex items-center space-x-4 flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente ou destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os Status</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Calendário */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="p-3 text-center font-semibold text-gray-700 text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dias do Calendário */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayId = day.date.toISOString();
              const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
              
              return (
                <div
                  key={index}
                  id={dayId}
                  className={`min-h-[120px] border-r border-b border-gray-200 p-2 transition-colors ${
                    !day.isCurrentMonth
                      ? 'bg-gray-50 text-gray-400'
                      : isWeekend
                      ? 'bg-blue-50'
                      : 'bg-white hover:bg-gray-50'
                  } ${
                    day.isToday
                      ? 'ring-2 ring-blue-500 ring-inset bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-semibold ${
                        day.isToday
                          ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                          : day.isCurrentMonth
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                  </div>
                  
                  <SortableContext
                    items={day.bookings.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1">
                      {day.bookings
                        .filter(booking => {
                          const matchesSearch = 
                            booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            booking.destination.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map((booking) => (
                          <SortableBookingItem
                            key={booking.id}
                            booking={booking}
                            onView={handleViewBooking}
                            onEdit={handleEditBooking}
                            onDelete={handleDeleteBooking}
                          />
                        ))}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {selectedBooking && (
            <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-3 opacity-90">
              <p className="font-semibold text-sm">{selectedBooking.customerName}</p>
              <p className="text-xs text-gray-600">{selectedBooking.destination}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Legenda */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex items-center justify-center space-x-6 flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Confirmada</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Pendente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Cancelada</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full ring-2 ring-blue-300"></div>
            <span className="text-sm text-gray-700">Hoje</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
