// ===================================================================
// BOOKING CALENDAR - CALENDÁRIO INTERATIVO COM DRAG & DROP
// ===================================================================

import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface Booking {
  id: string;
  customerName: string;
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
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onView: (booking: Booking) => void;
}

const SortableBookingItem: React.FC<SortableBookingItemProps> = ({
  booking,
  onEdit,
  onDelete,
  onView
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-white rounded-lg border-2 cursor-move hover:shadow-md transition-all duration-200 ${getStatusColor(booking.status)}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-sm text-gray-900 truncate">
            {booking.customerName}
          </h4>
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
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Visualizar"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(booking);
            }}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Editar"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(booking);
            }}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Excluir"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {getStatusIcon(booking.status)}
            <span className="ml-1 capitalize">{booking.status}</span>
          </div>
          <div className={`px-2 py-1 rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
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

const BookingCalendar: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ===================================================================
  // DADOS MOCK
  // ===================================================================

  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        customerName: 'João Silva',
        destination: 'Caldas Novas - GO',
        checkIn: new Date(2024, 0, 15),
        checkOut: new Date(2024, 0, 18),
        value: 1500,
        status: 'confirmed',
        paymentStatus: 'paid',
        guests: 4,
        notes: 'Família com crianças',
        color: '#10B981'
      },
      {
        id: '2',
        customerName: 'Maria Santos',
        destination: 'Porto de Galinhas - PE',
        checkIn: new Date(2024, 0, 20),
        checkOut: new Date(2024, 0, 25),
        value: 2200,
        status: 'pending',
        paymentStatus: 'pending',
        guests: 2,
        notes: 'Lua de mel',
        color: '#F59E0B'
      },
      {
        id: '3',
        customerName: 'Pedro Costa',
        destination: 'Fernando de Noronha - PE',
        checkIn: new Date(2024, 0, 28),
        checkOut: new Date(2024, 1, 3),
        value: 4500,
        status: 'confirmed',
        paymentStatus: 'paid',
        guests: 2,
        notes: 'Aniversário de casamento',
        color: '#3B82F6'
      },
      {
        id: '4',
        customerName: 'Ana Oliveira',
        destination: 'Gramado - RS',
        checkIn: new Date(2024, 1, 10),
        checkOut: new Date(2024, 1, 15),
        value: 1800,
        status: 'cancelled',
        paymentStatus: 'failed',
        guests: 3,
        notes: 'Cancelado por motivos pessoais',
        color: '#EF4444'
      }
    ];

    setBookings(mockBookings);
    generateCalendarDays(mockBookings);
  }, [currentDate]);

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

    // Aqui você implementaria a lógica para mover a reserva para uma nova data
    // Por simplicidade, vamos apenas reordenar a lista
    const oldIndex = bookings.findIndex(b => b.id === active.id);
    const newIndex = bookings.findIndex(b => b.id === over.id);

    if (oldIndex !== newIndex) {
      setBookings(arrayMove(bookings, oldIndex, newIndex));
    }
  };

  // ===================================================================
  // FILTROS
  // ===================================================================

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ===================================================================
  // NAVEGAÇÃO DO CALENDÁRIO
  // ===================================================================

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // ===================================================================
  // HANDLERS DE AÇÕES
  // ===================================================================

  const handleEditBooking = (booking: Booking) => {
    console.log('Editar reserva:', booking);
    // Implementar modal de edição
  };

  const handleDeleteBooking = (booking: Booking) => {
    if (confirm(`Tem certeza que deseja excluir a reserva de ${booking.customerName}?`)) {
      setBookings(bookings.filter(b => b.id !== booking.id));
    }
  };

  const handleViewBooking = (booking: Booking) => {
    console.log('Visualizar reserva:', booking);
    // Implementar modal de visualização
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendário de Reservas</h1>
          <p className="text-gray-600">Gerencie suas reservas com drag & drop</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            <Plus className="w-4 h-4" />
            <span>Nova Reserva</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente ou destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
            title="Filtrar por status"
            aria-label="Filtrar reservas por status"
          >
            <option value="all">Todos os Status</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Canceladas</option>
          </select>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 rounded-md text-sm ${
                viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 rounded-md text-sm ${
                viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 rounded-md text-sm ${
                viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Dia
            </button>
          </div>
        </div>
      </div>

      {/* Navegação do Calendário */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              →
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Hoje
            </button>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="p-4 text-center font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do calendário */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-32 border-r border-b border-gray-200 p-2 ${
                  !day.isCurrentMonth ? 'bg-gray-50' : ''
                } ${day.isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  !day.isCurrentMonth ? 'text-gray-400' : 
                  day.isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.date.getDate()}
                </div>
                
                <SortableContext items={day.bookings.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {day.bookings.map(booking => (
                      <SortableBookingItem
                        key={booking.id}
                        booking={booking}
                        onEdit={handleEditBooking}
                        onDelete={handleDeleteBooking}
                        onView={handleViewBooking}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {selectedBooking ? (
            <div className="p-3 bg-white rounded-lg border-2 border-blue-500 shadow-lg opacity-90">
              <h4 className="font-medium text-sm text-gray-900">
                {selectedBooking.customerName}
              </h4>
              <p className="text-xs text-gray-600">
                {selectedBooking.destination}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Lista de Reservas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Todas as Reservas ({filteredBookings.length})
        </h3>
        <SortableContext items={filteredBookings.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {filteredBookings.map(booking => (
              <SortableBookingItem
                key={booking.id}
                booking={booking}
                onEdit={handleEditBooking}
                onDelete={handleDeleteBooking}
                onView={handleViewBooking}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default BookingCalendar;
