import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Plus,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Award,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { useUIStore } from '../../stores/useUIStore';
import { CustomerProfileData } from './CustomerProfile';

export interface CustomerListData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: 'active' | 'inactive' | 'vip';
  totalTrips: number;
  totalSpent: number;
  averageRating: number;
  memberSince: Date;
  tags: string[];
}

export interface CustomerListProps {
  customers: CustomerListData[];
  onView?: (customer: CustomerListData) => void;
  onEdit?: (customer: CustomerListData) => void;
  onDelete?: (customer: CustomerListData) => void;
  onExport?: () => void;
  onNewCustomer?: () => void;
  className?: string;
}

const statusOptions: SelectOption[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'vip', label: 'VIP' },
];

const sortOptions: SelectOption[] = [
  { value: 'name', label: 'Nome' },
  { value: 'email', label: 'Email' },
  { value: 'memberSince', label: 'Data de Cadastro' },
  { value: 'totalTrips', label: 'Total de Viagens' },
  { value: 'totalSpent', label: 'Total Gasto' },
  { value: 'averageRating', label: 'Avaliação Média' },
];

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onView,
  onEdit,
  onDelete,
  onExport,
  onNewCustomer,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const { showNotification } = useUIStore();

  // Filtros e busca
  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof CustomerListData];
      let bValue: any = b[sortBy as keyof CustomerListData];

      if (sortBy === 'memberSince') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [customers, searchTerm, statusFilter, sortBy, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleDelete = (customer: CustomerListData) => {
    if (onDelete) {
      if (window.confirm(`Tem certeza que deseja excluir o cliente "${customer.name}"?`)) {
        onDelete(customer);
        showNotification('Cliente excluído com sucesso!', 'success');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'vip': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'vip': return 'VIP';
      default: return status;
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <div className="w-4 h-4" />;
    
    return sortOrder === 'asc' ? (
      <div className="w-4 h-4 text-blue-600">↑</div>
    ) : (
      <div className="w-4 h-4 text-blue-600">↓</div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-600">
            {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''} encontrado{filteredCustomers.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          )}
          {onNewCustomer && (
            <Button onClick={onNewCustomer}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          )}
        </div>
      </div>

      {/* Filtros e busca */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Busca principal */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, email, telefone, cidade, estado ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </Button>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <Select
                label="Status"
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
              />
              <Select
                label="Ordenar por"
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
              />
              <div className="flex items-end space-x-2">
                <Button
                  variant={sortOrder === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('asc')}
                >
                  ↑ Crescente
                </Button>
                <Button
                  variant={sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('desc')}
                >
                  ↓ Decrescente
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de clientes */}
      <div className="space-y-4">
        {currentCustomers.map((customer) => (
          <Card key={customer.id} className="p-6">
            <div className="flex items-start justify-between">
              {/* Informações principais */}
              <div className="flex items-start space-x-4 flex-1">
                <Avatar
                  size="lg"
                  src={`https://ui-avatars.com/api/?name=${customer.name}&background=2563eb&color=fff`}
                  alt={customer.name}
                />
                
                <div className="flex-1 space-y-3">
                  {/* Nome e status */}
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-gray-900">{customer.name}</h3>
                    <Badge variant={getStatusColor(customer.status)}>
                      {getStatusLabel(customer.status)}
                    </Badge>
                    {customer.status === 'vip' && (
                      <Award className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>

                  {/* Contato e localização */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{customer.city}, {customer.state}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Membro desde {format(customer.memberSince, 'MMM yyyy', { locale: ptBR })}</span>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{customer.totalTrips}</div>
                      <div className="text-xs text-blue-600">Viagens</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{formatCurrency(customer.totalSpent)}</div>
                      <div className="text-xs text-green-600">Total Gasto</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{customer.averageRating.toFixed(1)}</div>
                      <div className="text-xs text-yellow-600">Avaliação</div>
                    </div>
                  </div>

                  {/* Tags */}
                  {customer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center space-x-2">
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(customer)}
                    title="Ver perfil"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(customer)}
                    title="Editar cliente"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(customer)}
                    className="text-red-600 hover:text-red-700"
                    title="Excluir cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Mensagem quando não há clientes */}
        {currentCustomers.length === 0 && (
          <Card className="p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filteredCustomers.length === 0 ? 'Nenhum cliente encontrado' : 'Nenhum cliente nesta página'}
            </h3>
            <p className="text-gray-600">
              {filteredCustomers.length === 0 
                ? 'Tente ajustar os filtros de busca ou adicionar um novo cliente.'
                : 'Vá para a primeira página ou ajuste os filtros.'
              }
            </p>
          </Card>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCustomers.length)} de {filteredCustomers.length} clientes
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export { CustomerList };
export type { CustomerListData, CustomerListProps };
