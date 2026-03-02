import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useUIStore } from '../../stores/useUIStore';

export interface BookingTableData {
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

export interface BookingTableProps {
  bookings: BookingTableData[];
  onView?: (booking: BookingTableData) => void;
  onEdit?: (booking: BookingTableData) => void;
  onDelete?: (booking: BookingTableData) => void;
  onExport?: () => void;
  onNewBooking?: () => void;
  className?: string;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onView,
  onEdit,
  onDelete,
  onExport,
  onNewBooking,
  className,
}) => {
  const { addNotification } = useUIStore();
  
  // Estados de filtros e paginação
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [destinationFilter, setDestinationFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Opções de filtros
  const statusOptions: SelectOption[] = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'completed', label: 'Concluído' },
  ];

  const destinationOptions: SelectOption[] = [
    { value: 'all', label: 'Todos os Destinos' },
    { value: 'Caldas Novas - GO', label: 'Caldas Novas - GO' },
    { value: 'Rio Quente - GO', label: 'Rio Quente - GO' },
    { value: 'Pirenópolis - GO', label: 'Pirenópolis - GO' },
    { value: 'Goiânia - GO', label: 'Goiânia - GO' },
    { value: 'Brasília - DF', label: 'Brasília - DF' },
    { value: 'Outros', label: 'Outros' },
  ];

  const dateRangeOptions: SelectOption[] = [
    { value: 'all', label: 'Todas as Datas' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'quarter', label: 'Este Trimestre' },
    { value: 'year', label: 'Este Ano' },
  ];

  const itemsPerPageOptions: SelectOption[] = [
    { value: '10', label: '10 por página' },
    { value: '25', label: '25 por página' },
    { value: '50', label: '50 por página' },
    { value: '100', label: '100 por página' },
  ];

  // Filtrar e ordenar dados
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
      // Filtro de busca
      const matchesSearch = 
        booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.destination.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtro de status
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      
      // Filtro de destino
      const matchesDestination = destinationFilter === 'all' || booking.destination === destinationFilter;
      
      // Filtro de data
      const matchesDateRange = (() => {
        if (dateRangeFilter === 'all') return true;
        
        const today = new Date();
        const checkIn = new Date(booking.checkIn);
        
        switch (dateRangeFilter) {
          case 'today':
            return format(checkIn, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return checkIn >= weekAgo;
          case 'month':
            return checkIn.getMonth() === today.getMonth() && checkIn.getFullYear() === today.getFullYear();
          case 'quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            const bookingQuarter = Math.floor(checkIn.getMonth() / 3);
            return bookingQuarter === quarter && checkIn.getFullYear() === today.getFullYear();
          case 'year':
            return checkIn.getFullYear() === today.getFullYear();
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesDestination && matchesDateRange;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof BookingTableData];
      let bValue = b[sortBy as keyof BookingTableData];
      
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

    return filtered;
  }, [bookings, searchQuery, statusFilter, destinationFilter, dateRangeFilter, sortBy, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredAndSortedBookings.slice(startIndex, endIndex);

  // Handlers
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDestinationFilter('all');
    setDateRangeFilter('all');
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      addNotification({
        type: 'info',
        title: 'Exportar',
        message: 'Funcionalidade de exportação será implementada na próxima fase'
      });
    }
  };

  const handleNewBooking = () => {
    if (onNewBooking) {
      onNewBooking();
    } else {
      addNotification({
        type: 'info',
        title: 'Nova Reserva',
        message: 'Funcionalidade de nova reserva será implementada na próxima fase'
      });
    }
  };

  // Formatação
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusVariant = (status: BookingTableData['status']) => {
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

  const getStatusLabel = (status: BookingTableData['status']) => {
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

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return <ChevronUp className="h-4 w-4 text-neutral-400" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary-600" />
    );
  };

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white', className)}>
      {/* Header da Tabela */}
      <div className="border-b border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            Reservas ({filteredAndSortedBookings.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
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
      </div>

      {/* Filtros */}
      <div className="border-b border-neutral-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Buscar reservas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
          
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          
          <Select
            options={destinationOptions}
            value={destinationFilter}
            onChange={setDestinationFilter}
          />
          
          <Select
            options={dateRangeOptions}
            value={dateRangeFilter}
            onChange={setDateRangeFilter}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('destination')}
                  className="flex items-center gap-1 hover:text-neutral-700"
                >
                  Destino
                  <SortIcon column="destination" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('checkIn')}
                  className="flex items-center gap-1 hover:text-neutral-700"
                >
                  Check-in
                  <SortIcon column="checkIn" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('checkOut')}
                  className="flex items-center gap-1 hover:text-neutral-700"
                >
                  Check-out
                  <SortIcon column="checkOut" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('guests')}
                  className="flex items-center gap-1 hover:text-neutral-700"
                >
                  Hóspedes
                  <SortIcon column="guests" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('totalPrice')}
                  className="flex items-center gap-1 hover:text-neutral-700"
                >
                  Preço
                  <SortIcon column="totalPrice" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1 hover:text-neutral-700"
                >
                  Criado em
                  <SortIcon column="createdAt" />
                </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {currentBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-neutral-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      {booking.customerName}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {booking.customerEmail}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {booking.destination}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {formatDate(booking.checkIn)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {formatDate(booking.checkOut)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {booking.guests}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {formatCurrency(booking.totalPrice)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {formatDate(booking.createdAt)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="border-t border-neutral-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-700">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAndSortedBookings.length)} de{' '}
                {filteredAndSortedBookings.length} resultados
              </span>
              
              <Select
                options={itemsPerPageOptions}
                value={itemsPerPage.toString()}
                onChange={handleItemsPerPageChange}
                className="w-32"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {currentBookings.length === 0 && (
        <div className="p-8 text-center">
          <div className="mx-auto h-12 w-12 text-neutral-400 mb-4">
            <Filter className="h-full w-full" />
          </div>
          <h3 className="text-sm font-medium text-neutral-900 mb-2">
            Nenhuma reserva encontrada
          </h3>
          <p className="text-sm text-neutral-500">
            {searchQuery || statusFilter !== 'all' || destinationFilter !== 'all' || dateRangeFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Não há reservas no sistema ainda.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export { BookingTable };
