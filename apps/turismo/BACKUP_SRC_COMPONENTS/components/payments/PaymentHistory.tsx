import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Search, Filter, Download, Eye, RefreshCw, Calendar, DollarSign, User, MapPin, Clock, CheckCircle, AlertCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { cn } from '../../utils/cn';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: 'credit_card' | 'pix' | 'boleto' | 'transfer';
  customerName: string;
  customerEmail: string;
  description: string;
  gateway: string;
  transactionDate: Date;
  processedDate?: Date;
  refundDate?: Date;
  installments: number;
  fees: number;
  netAmount: number;
  gatewayTransactionId: string;
  errorMessage?: string;
  refundReason?: string;
  metadata: {
    bookingId?: string;
    packageName?: string;
    destination?: string;
    customerId: string;
  };
}

export interface TransactionFilters {
  status: string[];
  paymentMethod: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  amountRange: {
    min: number | null;
    max: number | null;
  };
  customerName: string;
  gateway: string[];
}

export interface PaymentHistoryProps {
  className?: string;
}

const statusOptions: SelectOption[] = [
  { value: 'pending', label: 'Pendente', icon: '⏳' },
  { value: 'processing', label: 'Processando', icon: '🔄' },
  { value: 'completed', label: 'Concluído', icon: '✅' },
  { value: 'failed', label: 'Falhou', icon: '❌' },
  { value: 'refunded', label: 'Reembolsado', icon: '💰' },
  { value: 'cancelled', label: 'Cancelado', icon: '🚫' }
];

const paymentMethodOptions: SelectOption[] = [
  { value: 'credit_card', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '📱' },
  { value: 'boleto', label: 'Boleto', icon: '📄' },
  { value: 'transfer', label: 'Transferência', icon: '🏦' }
];

const gatewayOptions: SelectOption[] = [
  { value: 'stripe', label: 'Stripe', icon: '💳' },
  { value: 'pagseguro', label: 'PagSeguro', icon: '🇧🇷' },
  { value: 'mercadopago', label: 'MercadoPago', icon: '🇦🇷' },
  { value: 'paypal', label: 'PayPal', icon: '🌐' }
];

const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    amount: 1500.00,
    currency: 'BRL',
    status: 'completed',
    paymentMethod: 'credit_card',
    customerName: 'João Silva',
    customerEmail: 'joao@email.com',
    description: 'Pacote Caldas Novas - 3 dias',
    gateway: 'stripe',
    transactionDate: new Date('2025-08-01T10:30:00'),
    processedDate: new Date('2025-08-01T10:32:15'),
    installments: 3,
    fees: 43.50,
    netAmount: 1456.50,
    gatewayTransactionId: 'txn_stripe_12345',
    metadata: {
      bookingId: 'bk_001',
      packageName: 'Caldas Novas Família',
      destination: 'Caldas Novas, GO',
      customerId: 'cust_001'
    }
  },
  {
    id: 'txn_002',
    amount: 890.00,
    currency: 'BRL',
    status: 'pending',
    paymentMethod: 'pix',
    customerName: 'Maria Santos',
    customerEmail: 'maria@email.com',
    description: 'Pacote Porto Seguro - 2 dias',
    gateway: 'pagseguro',
    transactionDate: new Date('2025-08-01T14:15:00'),
    installments: 1,
    fees: 0,
    netAmount: 890.00,
    gatewayTransactionId: 'txn_pagseguro_67890',
    metadata: {
      bookingId: 'bk_002',
      packageName: 'Porto Seguro Relax',
      destination: 'Porto Seguro, BA',
      customerId: 'cust_002'
    }
  },
  {
    id: 'txn_003',
    amount: 2200.00,
    currency: 'BRL',
    status: 'failed',
    paymentMethod: 'credit_card',
    customerName: 'Pedro Costa',
    customerEmail: 'pedro@email.com',
    description: 'Pacote Fernando de Noronha - 5 dias',
    gateway: 'stripe',
    transactionDate: new Date('2025-08-01T16:45:00'),
    installments: 6,
    fees: 63.80,
    netAmount: 2136.20,
    gatewayTransactionId: 'txn_stripe_12346',
    errorMessage: 'Cartão recusado - limite insuficiente',
    metadata: {
      bookingId: 'bk_003',
      packageName: 'Fernando de Noronha Premium',
      destination: 'Fernando de Noronha, PE',
      customerId: 'cust_003'
    }
  },
  {
    id: 'txn_004',
    amount: 750.00,
    currency: 'BRL',
    status: 'refunded',
    paymentMethod: 'credit_card',
    customerName: 'Ana Oliveira',
    customerEmail: 'ana@email.com',
    description: 'Pacote Bonito - 2 dias',
    gateway: 'mercadopago',
    transactionDate: new Date('2025-07-28T09:20:00'),
    processedDate: new Date('2025-07-28T09:22:30'),
    refundDate: new Date('2025-07-30T11:15:00'),
    installments: 2,
    fees: 21.75,
    netAmount: 728.25,
    gatewayTransactionId: 'txn_mercadopago_11111',
    refundReason: 'Cancelamento do cliente',
    metadata: {
      bookingId: 'bk_004',
      packageName: 'Bonito Aventura',
      destination: 'Bonito, MS',
      customerId: 'cust_004'
    }
  }
];

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ className }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filters, setFilters] = useState<TransactionFilters>({
    status: [],
    paymentMethod: [],
    dateRange: { start: null, end: null },
    amountRange: { min: null, max: null },
    customerName: '',
    gateway: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(transaction.status)) {
        return false;
      }

      // Payment method filter
      if (filters.paymentMethod.length > 0 && !filters.paymentMethod.includes(transaction.paymentMethod)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start && transaction.transactionDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && transaction.transactionDate > filters.dateRange.end) {
        return false;
      }

      // Amount range filter
      if (filters.amountRange.min && transaction.amount < filters.amountRange.min) {
        return false;
      }
      if (filters.amountRange.max && transaction.amount > filters.amountRange.max) {
        return false;
      }

      // Customer name filter
      if (filters.customerName && !transaction.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) {
        return false;
      }

      // Gateway filter
      if (filters.gateway.length > 0 && !filters.gateway.includes(transaction.gateway)) {
        return false;
      }

      // Search term
      if (searchTerm && !(
        transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
      )) {
        return false;
      }

      return true;
    });
  }, [transactions, filters, searchTerm]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <DollarSign className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return <CreditCard className="w-4 h-4" />;
      case 'pix': return <CreditCard className="w-4 h-4" />;
      case 'boleto': return <CreditCard className="w-4 h-4" />;
      case 'transfer': return <CreditCard className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const handleFilterChange = (field: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleExport = () => {
    // Simulate export
    const csvContent = [
      ['ID', 'Data', 'Cliente', 'Valor', 'Status', 'Método', 'Gateway'],
      ...filteredTransactions.map(t => [
        t.id,
        t.transactionDate.toLocaleDateString('pt-BR'),
        t.customerName,
        `R$ ${t.amount.toFixed(2)}`,
        t.status,
        t.paymentMethod,
        t.gateway
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    // Simulate refresh
    setTransactions([...mockTransactions]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico de Transações</h2>
          <p className="text-gray-600">Acompanhe todas as transações de pagamento</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <Input
              placeholder="ID, cliente, email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              value={filters.status.length > 0 ? { value: filters.status.join(','), label: `${filters.status.length} selecionados` } : null}
              options={statusOptions}
              onChange={(option) => handleFilterChange('status', [option.value])}
              placeholder="Todos os status"
              isMulti
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pagamento
            </label>
            <Select
              value={filters.paymentMethod.length > 0 ? { value: filters.paymentMethod.join(','), label: `${filters.paymentMethod.length} selecionados` } : null}
              options={paymentMethodOptions}
              onChange={(option) => handleFilterChange('paymentMethod', [option.value])}
              placeholder="Todos os métodos"
              isMulti
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gateway
            </label>
            <Select
              value={filters.gateway.length > 0 ? { value: filters.gateway.join(','), label: `${filters.gateway.length} selecionados` } : null}
              options={gatewayOptions}
              onChange={(option) => handleFilterChange('gateway', [option.value])}
              placeholder="Todos os gateways"
              isMulti
            />
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Aprovado</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(filteredTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.netAmount, 0))}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredTransactions.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Falharam</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredTransactions.filter(t => t.status === 'failed').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Reembolsos</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(filteredTransactions.filter(t => t.status === 'refunded').reduce((sum, t) => sum + t.netAmount, 0))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                      <div className="text-sm text-gray-500">{transaction.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                      <div className="text-sm text-gray-500">{transaction.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                      {transaction.installments > 1 && (
                        <div className="text-xs text-gray-500">{transaction.installments}x</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={cn('flex items-center gap-1', getStatusColor(transaction.status))}>
                      {getStatusIcon(transaction.status)}
                      {transaction.status === 'completed' ? 'Concluído' :
                       transaction.status === 'pending' ? 'Pendente' :
                       transaction.status === 'processing' ? 'Processando' :
                       transaction.status === 'failed' ? 'Falhou' :
                       transaction.status === 'refunded' ? 'Reembolsado' : 'Cancelado'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      <span className="text-sm text-gray-900 capitalize">
                        {transaction.paymentMethod === 'credit_card' ? 'Cartão' :
                         transaction.paymentMethod === 'pix' ? 'PIX' :
                         transaction.paymentMethod === 'boleto' ? 'Boleto' : 'Transferência'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(transaction)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
                  </span>{' '}
                  de <span className="font-medium">{filteredTransactions.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Detalhes da Transação - ${selectedTransaction?.id}`}
        size="2xl"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="customer">Cliente</TabsTrigger>
                <TabsTrigger value="technical">Técnico</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID da Transação</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Badge className={cn('flex items-center gap-1', getStatusColor(selectedTransaction.status))}>
                      {getStatusIcon(selectedTransaction.status)}
                      {selectedTransaction.status === 'completed' ? 'Concluído' :
                       selectedTransaction.status === 'pending' ? 'Pendente' :
                       selectedTransaction.status === 'processing' ? 'Processando' :
                       selectedTransaction.status === 'failed' ? 'Falhou' :
                       selectedTransaction.status === 'refunded' ? 'Reembolsado' : 'Cancelado'}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Líquido</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedTransaction.netAmount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxas</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedTransaction.fees)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.installments}x</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="customer" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.customerEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pacote</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.metadata.packageName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.metadata.destination}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID da Reserva</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.metadata.bookingId}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gateway</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedTransaction.gateway}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID do Gateway</label>
                    <p className="text-sm text-gray-900">{selectedTransaction.gatewayTransactionId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data da Transação</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedTransaction.transactionDate)}</p>
                  </div>
                  {selectedTransaction.processedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Processamento</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedTransaction.processedDate)}</p>
                    </div>
                  )}
                  {selectedTransaction.refundDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data do Reembolso</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedTransaction.refundDate)}</p>
                    </div>
                  )}
                  {selectedTransaction.errorMessage && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Erro</label>
                      <p className="text-sm text-red-600">{selectedTransaction.errorMessage}</p>
                    </div>
                  )}
                  {selectedTransaction.refundReason && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motivo do Reembolso</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.refundReason}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Fechar
              </Button>
              {selectedTransaction.status === 'pending' && (
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verificar Status
                </Button>
              )}
              {selectedTransaction.status === 'completed' && (
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Solicitar Reembolso
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export { PaymentHistory };
export type { Transaction, TransactionFilters, PaymentHistoryProps };
