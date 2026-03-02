'use client';

/**
 * Componente: Lista de Clientes (CRM)
 * Exibe uma tabela de clientes com paginação, ordenação e filtros básicos
 */

import { useState, useEffect } from 'react';
import { Loader2, ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CustomerFilters } from './CustomerFilters';

interface CustomerProfile {
  id: number;
  user_id?: number;
  customer_id?: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  customer_name?: string;
  customer_email?: string;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  total_spent: number;
  total_bookings: number;
  last_booking_at?: string;
  first_booking_at?: string;
  average_booking_value: number;
  lifetime_value: number;
  churn_risk_score: number;
  engagement_score: number;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface CustomerListProps {
  initialFilters?: {
    loyalty_tier?: string;
    min_total_spent?: number;
    max_total_spent?: number;
    min_bookings?: number;
    tags?: string[];
  };
  onViewCustomer?: (customerId: number) => void;
  onEditCustomer?: (customerId: number) => void;
}

export function CustomerList({ 
  initialFilters = {},
  onViewCustomer,
  onEditCustomer 
}: CustomerListProps) {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 0,
    has_more: false,
  });
  const [sortBy, setSortBy] = useState<'total_spent' | 'total_bookings' | 'last_booking_at' | 'created_at'>('total_spent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.loyalty_tier) params.append('loyalty_tier', filters.loyalty_tier);
      if (filters.min_total_spent !== undefined) params.append('min_total_spent', filters.min_total_spent.toString());
      if (filters.max_total_spent !== undefined) params.append('max_total_spent', filters.max_total_spent.toString());
      if (filters.min_bookings !== undefined) params.append('min_bookings', filters.min_bookings.toString());
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
      
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);

      const response = await fetch(`/api/crm/customers?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar clientes');
      }

      const result = await response.json();
      setCustomers(result.data || []);
      setPagination(prev => ({
        ...prev,
        total: result.pagination?.total || 0,
        total_pages: result.pagination?.total_pages || 0,
        has_more: result.pagination?.has_more || false,
      }));

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filters, pagination.page, sortBy, sortOrder]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-blue-100 text-blue-800',
      diamond: 'bg-purple-100 text-purple-800',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const SortButton = ({ column, currentColumn, currentOrder }: {
    column: typeof sortBy;
    currentColumn: typeof sortBy;
    currentOrder: 'asc' | 'desc';
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={() => handleSort(column)}
    >
      {currentColumn === column ? (
        currentOrder === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-gray-500 mt-1">
            {pagination.total} cliente{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <CustomerFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <div className="flex items-center gap-2">
                      Cliente
                      <SortButton 
                        column="created_at" 
                        currentColumn={sortBy} 
                        currentOrder={sortOrder} 
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      Tier
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      Total Gasto
                      <SortButton 
                        column="total_spent" 
                        currentColumn={sortBy} 
                        currentOrder={sortOrder} 
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      Reservas
                      <SortButton 
                        column="total_bookings" 
                        currentColumn={sortBy} 
                        currentOrder={sortOrder} 
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      Última Reserva
                      <SortButton 
                        column="last_booking_at" 
                        currentColumn={sortBy} 
                        currentOrder={sortOrder} 
                      />
                    </div>
                  </TableHead>
                  <TableHead>Engajamento</TableHead>
                  <TableHead>Risco Churn</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {customer.user_name || customer.customer_name || `Cliente #${customer.id}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.user_email || customer.customer_email || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierColor(customer.loyalty_tier)}>
                        {customer.loyalty_tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(customer.total_spent)}
                    </TableCell>
                    <TableCell>{customer.total_bookings}</TableCell>
                    <TableCell>{formatDate(customer.last_booking_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${customer.engagement_score}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {customer.engagement_score}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              customer.churn_risk_score > 70
                                ? 'bg-red-600'
                                : customer.churn_risk_score > 40
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                            }`}
                            style={{ width: `${customer.churn_risk_score}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {customer.churn_risk_score}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onViewCustomer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewCustomer(customer.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEditCustomer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditCustomer(customer.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Página {pagination.page} de {pagination.total_pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_more}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

