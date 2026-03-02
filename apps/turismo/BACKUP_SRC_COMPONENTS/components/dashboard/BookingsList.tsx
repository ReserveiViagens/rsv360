import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  notes?: string;
}

export interface BookingsListProps {
  bookings: Booking[];
  onView?: (booking: Booking) => void;
  onEdit?: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
  onStatusChange?: (bookingId: string, status: Booking['status']) => void;
  className?: string;
}

const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const statusOptions: SelectOption[] = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'completed', label: 'Concluído' },
  ];

  const sortOptions: SelectOption[] = [
    { value: 'createdAt', label: 'Data de Criação' },
    { value: 'checkIn', label: 'Check-in' },
    { value: 'customerName', label: 'Nome do Cliente' },
    { value: 'totalPrice', label: 'Preço Total' },
    { value: 'status', label: 'Status' },
  ];

  const getStatusVariant = (status: Booking['status']) => {
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

  const getStatusLabel = (status: Booking['status']) => {
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

  const filteredAndSortedBookings = bookings
    .filter(booking => {
      const matchesSearch = 
        booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.destination.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof Booking];
      let bValue = b[sortBy as keyof Booking];
      
      if (sortBy === 'createdAt' || sortBy === 'checkIn' || sortBy === 'checkOut') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white', className)}>
      {/* Header */}
      <div className="border-b border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Reservas Recentes</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">
              {filteredAndSortedBookings.length} de {bookings.length} reservas
            </span>
          </div>
        </div>
            </div>

      {/* Filters */}
      <div className="border-b border-neutral-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Buscar por cliente, email ou destino..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
              </div>
          
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-48"
          />
          
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            className="w-48"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
              </div>
            </div>

      {/* List */}
      <div className="divide-y divide-neutral-200">
        {filteredAndSortedBookings.map((booking) => (
          <div key={booking.id} className="p-4 hover:bg-neutral-50 transition-colors">
            <div className="flex items-start justify-between">
              {/* Booking Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium text-neutral-900">{booking.customerName}</span>
                  </div>
                  
                  <Badge variant={getStatusVariant(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">{booking.customerEmail}</span>
              </div>
              
              <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">{booking.customerPhone}</span>
                </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">{booking.destination}</span>
              </div>
              
              <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
              </div>
            </div>

                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span>{booking.guests} hóspedes</span>
                  <span className="font-medium text-neutral-900">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                  <span>Criado em {formatDate(booking.createdAt)}</span>
              </div>
          </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Select
                  options={[
                    { value: 'pending', label: 'Pendente' },
                    { value: 'confirmed', label: 'Confirmado' },
                    { value: 'cancelled', label: 'Cancelado' },
                    { value: 'completed', label: 'Concluído' },
                  ]}
                  value={booking.status}
                  onChange={(status) => onStatusChange?.(booking.id, status as Booking['status'])}
                  size="sm"
                  className="w-32"
                />
                
                <div className="flex items-center gap-1">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                  onClick={() => onView(booking)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                  onClick={() => onEdit(booking)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                  onClick={() => onDelete(booking)}
                      className="h-8 w-8 p-0 text-error-600 hover:text-error-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
            )}
          </div>
        </div>
              </div>
            </div>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredAndSortedBookings.length === 0 && (
        <div className="p-8 text-center">
          <div className="mx-auto h-12 w-12 text-neutral-400 mb-4">
            <Calendar className="h-full w-full" />
      </div>
          <h3 className="text-sm font-medium text-neutral-900 mb-2">
            Nenhuma reserva encontrada
          </h3>
          <p className="text-sm text-neutral-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca.'
              : 'Não há reservas no sistema ainda.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export { BookingsList };
