import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  MapPin,
  Clock,
  Star,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { AnalyticsChart } from './AnalyticsChart';
import { BookingsList, Booking } from './BookingsList';
import { DefaultQuickActions } from './QuickActions';
import { useUIStore } from '../../stores/useUIStore';
import { useAuth, usePermissions } from '../../hooks/useAuth';
import { bookingService, BookingStats } from '../../services/bookingService';
import { paymentService, PaymentStats } from '../../services/paymentService';
import { useWebSocket } from '../../services/websocketClient';
import { toast } from 'react-hot-toast';

// Dados mock para demonstração
const mockBookings: Booking[] = [
  {
    id: '1',
    customerName: 'Maria Silva',
    customerEmail: 'maria@email.com',
    customerPhone: '(11) 99999-9999',
    destination: 'Caldas Novas - GO',
    checkIn: '2025-01-15',
    checkOut: '2025-01-20',
    guests: 2,
    totalPrice: 1200.00,
    status: 'confirmed',
    createdAt: '2025-01-10',
    notes: 'Cliente VIP, preferência por quarto com vista'
  },
  {
    id: '2',
    customerName: 'João Santos',
    customerEmail: 'joao@email.com',
    customerPhone: '(11) 88888-8888',
    destination: 'Caldas Novas - GO',
    checkIn: '2025-01-18',
    checkOut: '2025-01-22',
    guests: 4,
    totalPrice: 1800.00,
    status: 'pending',
    createdAt: '2025-01-12',
    notes: 'Família com crianças, solicita berço'
  },
  {
    id: '3',
    customerName: 'Ana Costa',
    customerEmail: 'ana@email.com',
    customerPhone: '(11) 77777-7777',
    destination: 'Caldas Novas - GO',
    checkIn: '2025-01-20',
    checkOut: '2025-01-25',
    guests: 2,
    totalPrice: 1500.00,
    status: 'confirmed',
    createdAt: '2025-01-14',
    notes: 'Aniversário de casamento, decoração especial'
  },
  {
    id: '4',
    customerName: 'Carlos Lima',
    customerEmail: 'carlos@email.com',
    customerPhone: '(11) 66666-6666',
    destination: 'Caldas Novas - GO',
    checkIn: '2025-01-25',
    checkOut: '2025-01-30',
    guests: 3,
    totalPrice: 2100.00,
    status: 'completed',
    createdAt: '2025-01-16',
    notes: 'Cliente recorrente, sempre satisfeito'
  }
];

const mockChartData = [
  { name: 'Jan', reservas: 45, receita: 54000, clientes: 38 },
  { name: 'Fev', reservas: 52, receita: 62400, clientes: 45 },
  { name: 'Mar', reservas: 48, receita: 57600, clientes: 42 },
  { name: 'Abr', reservas: 61, receita: 73200, clientes: 53 },
  { name: 'Mai', reservas: 55, receita: 66000, clientes: 48 },
  { name: 'Jun', reservas: 67, receita: 80400, clientes: 58 },
  { name: 'Jul', reservas: 73, receita: 87600, clientes: 64 },
  { name: 'Ago', reservas: 69, receita: 82800, clientes: 60 },
  { name: 'Set', reservas: 58, receita: 69600, clientes: 51 },
  { name: 'Out', reservas: 63, receita: 75600, clientes: 55 },
  { name: 'Nov', reservas: 71, receita: 85200, clientes: 62 },
  { name: 'Dez', reservas: 78, receita: 93600, clientes: 68 }
];

const mockDestinationsData = [
  { name: 'Caldas Novas', value: 45 },
  { name: 'Rio Quente', value: 28 },
  { name: 'Pirenópolis', value: 18 },
  { name: 'Goiânia', value: 12 },
  { name: 'Outros', value: 8 }
];

const Dashboard: React.FC = () => {
  const { addNotification } = useUIStore();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { isConnected, onRealTimeUpdate } = useWebSocket();
  
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  
  // Real data states
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises: Promise<any>[] = [];

      // Load booking stats if user has permission
      if (hasPermission('bookings.stats')) {
        promises.push(bookingService.getBookingStats());
      }

      // Load payment stats if user has permission
      if (hasPermission('payments.stats')) {
        promises.push(paymentService.getPaymentStats());
      }

      // Load recent bookings
      promises.push(bookingService.getBookings({ 
        limit: 10, 
        sort_by: 'created_at', 
        sort_order: 'desc' 
      }));

      const results = await Promise.allSettled(promises);
      let resultIndex = 0;

      // Process booking stats
      if (hasPermission('bookings.stats')) {
        const bookingStatsResult = results[resultIndex++];
        if (bookingStatsResult.status === 'fulfilled') {
          setBookingStats(bookingStatsResult.value);
        }
      }

      // Process payment stats
      if (hasPermission('payments.stats')) {
        const paymentStatsResult = results[resultIndex++];
        if (paymentStatsResult.status === 'fulfilled') {
          setPaymentStats(paymentStatsResult.value);
        }
      }

      // Process recent bookings
      const bookingsResult = results[resultIndex++];
      if (bookingsResult.status === 'fulfilled') {
        setRecentBookings(bookingsResult.value.bookings || []);
      }

    } catch (error: any) {
      console.error('Dashboard data load error:', error);
      setError('Erro ao carregar dados do dashboard');
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dados atualizados!');
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Setup real-time updates
  useEffect(() => {
    const unsubscribe = onRealTimeUpdate((update) => {
      if (update.type === 'booking_update' || update.type === 'payment_update') {
        // Refresh specific data based on update type
        loadDashboardData();
      }
    });

    return unsubscribe;
  }, [onRealTimeUpdate]);

  // Handlers para as ações rápidas
  const handleNewBooking = () => {
    addNotification({
      type: 'info',
      title: 'Nova Reserva',
      message: 'Funcionalidade de nova reserva será implementada na próxima fase'
    });
  };

  const handleNewCustomer = () => {
    addNotification({
      type: 'info',
      title: 'Novo Cliente',
      message: 'Funcionalidade de novo cliente será implementada na próxima fase'
    });
  };

  const handleNewTravel = () => {
    addNotification({
      type: 'info',
      title: 'Nova Viagem',
      message: 'Funcionalidade de nova viagem será implementada na próxima fase'
    });
  };

  const handleReports = () => {
    addNotification({
      type: 'info',
      title: 'Relatórios',
      message: 'Funcionalidade de relatórios será implementada na próxima fase'
    });
  };

  const handleSettings = () => {
    addNotification({
      type: 'info',
      title: 'Configurações',
      message: 'Funcionalidade de configurações será implementada na próxima fase'
    });
  };

  const handleNotifications = () => {
    addNotification({
      type: 'info',
      title: 'Notificações',
      message: 'Funcionalidade de notificações será implementada na próxima fase'
    });
  };

  const handleExport = () => {
    addNotification({
      type: 'info',
      title: 'Exportar Dados',
      message: 'Funcionalidade de exportação será implementada na próxima fase'
    });
  };

  const handleImport = () => {
    addNotification({
      type: 'info',
      title: 'Importar Dados',
      message: 'Funcionalidade de importação será implementada na próxima fase'
    });
  };

  // Handlers para as reservas
  const handleViewBooking = (booking: Booking) => {
    addNotification({
      type: 'info',
      title: 'Visualizar Reserva',
      message: `Visualizando reserva de ${booking.customerName}`
    });
  };

  const handleEditBooking = (booking: Booking) => {
    addNotification({
      type: 'info',
      title: 'Editar Reserva',
      message: `Editando reserva de ${booking.customerName}`
    });
  };

  const handleDeleteBooking = (booking: Booking) => {
    if (window.confirm(`Tem certeza que deseja excluir a reserva de ${booking.customerName}?`)) {
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      addNotification({
        type: 'success',
        title: 'Reserva Excluída',
        message: `Reserva de ${booking.customerName} foi excluída com sucesso`
      });
    }
  };

  const handleStatusChange = (bookingId: string, status: Booking['status']) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status } 
          : booking
      )
    );
    
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      addNotification({
        type: 'success',
        title: 'Status Atualizado',
        message: `Status da reserva de ${booking.customerName} foi alterado para ${status}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Dashboard RSV Onboarding
          </h1>
          <p className="text-neutral-600 mt-2">
            Bem-vindo ao sistema de gestão de reservas e viagens
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Reservas"
            value={bookings.length}
            change={{ value: 12, period: 'este mês', isPositive: true }}
            icon={Calendar}
            variant="primary"
          />
          <StatsCard
            title="Clientes Ativos"
            value={bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
            change={{ value: 8, period: 'este mês', isPositive: true }}
            icon={Users}
            variant="success"
          />
          <StatsCard
            title="Receita Total"
            value={bookings.reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
            change={{ value: 15, period: 'este mês', isPositive: true }}
            icon={DollarSign}
            variant="accent"
          />
          <StatsCard
            title="Destinos"
            value={new Set(bookings.map(b => b.destination)).size}
            change={{ value: 2, period: 'este mês', isPositive: true }}
            icon={MapPin}
            variant="info"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsChart
            title="Reservas e Receita (Últimos 12 meses)"
            data={mockChartData}
            type="line"
            height={300}
            dataKeys={['reservas', 'receita']}
            xAxisDataKey="name"
            yAxisDataKey="value"
          />
          <AnalyticsChart
            title="Destinos Mais Populares"
            data={mockDestinationsData}
            type="pie"
            height={300}
            yAxisDataKey="value"
          />
        </div>

        {/* Quick Actions */}
        <DefaultQuickActions
          onNewBooking={handleNewBooking}
          onNewCustomer={handleNewCustomer}
          onNewTravel={handleNewTravel}
          onReports={handleReports}
          onSettings={handleSettings}
          onNotifications={handleNotifications}
          onExport={handleExport}
          onImport={handleImport}
        />

        {/* Bookings List */}
        <BookingsList
          bookings={bookings}
          onView={handleViewBooking}
          onEdit={handleEditBooking}
          onDelete={handleDeleteBooking}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export { Dashboard };
