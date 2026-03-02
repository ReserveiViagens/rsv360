import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  List, 
  Grid3X3,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Calendar, CalendarBooking } from '../../components/bookings/Calendar';
import { BookingModal, BookingFormData } from '../../components/bookings/BookingModal';
import { BookingTable, BookingTableData } from '../../components/bookings/BookingTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useUIStore } from '../../stores/useUIStore';
import { BookingApi, useBookingApi } from '../../services/api/bookingApi';

const BookingsPage: React.FC = () => {
  const { addNotification } = useUIStore();
  const bookingApi = useBookingApi();
  
  // Estados
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [bookings, setBookings] = useState<BookingTableData[]>([]);
  const [calendarBookings, setCalendarBookings] = useState<CalendarBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingFormData | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Carregar reservas
  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingApi.getBookings();
      if (response.success && response.data) {
        const bookingsData = response.data.data;
        setBookings(bookingsData);
        
        // Converter para formato do calendário
        const calendarData: CalendarBooking[] = bookingsData.map(booking => ({
          id: booking.id,
          customerName: booking.customerName,
          destination: booking.destination,
          checkIn: new Date(booking.checkIn),
          checkOut: new Date(booking.checkOut),
          status: booking.status,
          guests: booking.guests,
          totalPrice: booking.totalPrice,
        }));
        setCalendarBookings(calendarData);
      } else {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: response.error || 'Erro ao carregar reservas'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao carregar reservas'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar reservas na montagem
  useEffect(() => {
    loadBookings();
  }, []);

  // Handlers
  const handleNewBooking = () => {
    setEditingBooking(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditBooking = (booking: BookingTableData) => {
    setEditingBooking(booking);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewBooking = (booking: BookingTableData) => {
    addNotification({
      type: 'info',
      title: 'Visualizar Reserva',
      message: `Visualizando reserva de ${booking.customerName}`
    });
  };

  const handleDeleteBooking = async (booking: BookingTableData) => {
    if (window.confirm(`Tem certeza que deseja excluir a reserva de ${booking.customerName}?`)) {
      try {
        const response = await bookingApi.deleteBooking(booking.id);
        if (response.success) {
          addNotification({
            type: 'success',
            title: 'Sucesso',
            message: response.message || 'Reserva excluída com sucesso'
          });
          loadBookings(); // Recarregar lista
        } else {
          addNotification({
            type: 'error',
            title: 'Erro',
            message: response.error || 'Erro ao excluir reserva'
          });
        }
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: 'Erro ao excluir reserva'
        });
      }
    }
  };

  const handleSaveBooking = async (data: BookingFormData) => {
    try {
      let response;
      
      if (modalMode === 'create') {
        response = await bookingApi.createBooking(data);
      } else {
        response = await bookingApi.updateBooking(data.id!, data);
      }

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Sucesso',
          message: response.message || 'Reserva salva com sucesso'
        });
        setIsModalOpen(false);
        loadBookings(); // Recarregar lista
      } else {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: response.error || 'Erro ao salvar reserva'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar reserva'
      });
    }
  };

  const handleCalendarDateClick = (date: Date) => {
    addNotification({
      type: 'info',
      title: 'Data Selecionada',
      message: `Data selecionada: ${date.toLocaleDateString('pt-BR')}`
    });
  };

  const handleCalendarBookingClick = (booking: CalendarBooking) => {
    const tableBooking = bookings.find(b => b.id === booking.id);
    if (tableBooking) {
      handleViewBooking(tableBooking);
    }
  };

  const handleCalendarBookingMove = async (bookingId: string, newCheckIn: Date, newCheckOut: Date) => {
    try {
      const response = await bookingApi.updateBooking(bookingId, {
        checkIn: newCheckIn.toISOString().split('T')[0],
        checkOut: newCheckOut.toISOString().split('T')[0],
      });

      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Reserva Movida',
          message: 'Reserva movida com sucesso no calendário'
        });
        loadBookings(); // Recarregar dados
      } else {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: response.error || 'Erro ao mover reserva'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao mover reserva'
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await bookingApi.exportBookings();
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Exportação',
          message: `Arquivo ${response.data} exportado com sucesso`
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: response.error || 'Erro ao exportar reservas'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao exportar reservas'
      });
    }
  };

  const handleRefresh = () => {
    loadBookings();
    addNotification({
      type: 'info',
      title: 'Atualização',
      message: 'Dados atualizados com sucesso'
    });
  };

  const handleResetData = () => {
    if (window.confirm('Tem certeza que deseja resetar os dados para o estado inicial? Esta ação não pode ser desfeita.')) {
      BookingApi.resetMockData();
      loadBookings();
      addNotification({
        type: 'success',
        title: 'Dados Resetados',
        message: 'Dados resetados para o estado inicial'
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Gestão de Reservas
            </h1>
            <p className="text-neutral-600 mt-2">
              Gerencie todas as reservas e visualize no calendário ou tabela
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="flex items-center gap-2"
            >
              Resetar Dados
            </Button>
            
            <Button
              onClick={handleNewBooking}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Reserva
            </Button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total de Reservas</p>
                <p className="text-2xl font-bold text-neutral-900">{bookings.length}</p>
              </div>
              <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-primary-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Pendentes</p>
                <p className="text-2xl font-bold text-warning-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <Badge variant="warning" className="text-xs">P</Badge>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Confirmadas</p>
                <p className="text-2xl font-bold text-success-600">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-success-100 rounded-lg flex items-center justify-center">
                <Badge variant="success" className="text-xs">C</Badge>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Receita Total</p>
                <p className="text-2xl font-bold text-accent-600">
                  R$ {bookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="h-8 w-8 bg-accent-100 rounded-lg flex items-center justify-center">
                <span className="text-accent-600 font-bold text-xs">R$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de Visualização */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">Visualização:</span>
              <div className="flex bg-neutral-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="flex items-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Calendário
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  Tabela
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-neutral-500">
              {isLoading ? 'Carregando...' : `${bookings.length} reservas encontradas`}
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Carregando reservas...</p>
          </div>
        ) : (
          <>
            {viewMode === 'calendar' ? (
              <Calendar
                bookings={calendarBookings}
                onDateClick={handleCalendarDateClick}
                onBookingClick={handleCalendarBookingClick}
                onBookingMove={handleCalendarBookingMove}
              />
            ) : (
              <BookingTable
                bookings={bookings}
                onView={handleViewBooking}
                onEdit={handleEditBooking}
                onDelete={handleDeleteBooking}
                onExport={handleExport}
                onNewBooking={handleNewBooking}
              />
            )}
          </>
        )}
      </div>

      {/* Modal de Reserva */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBooking}
        booking={editingBooking}
        mode={modalMode}
      />
    </div>
  );
};

export { BookingsPage };
