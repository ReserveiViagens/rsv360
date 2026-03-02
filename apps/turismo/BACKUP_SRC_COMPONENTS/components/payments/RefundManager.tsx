import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, Search, Filter, Download, Eye, Ban, RotateCcw, FileText, User, Calendar, CreditCard } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { cn } from '../../utils/cn';

export interface RefundRequest {
  id: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  requestDate: Date;
  processedDate?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  refundMethod: 'original_method' | 'bank_transfer' | 'credit_voucher';
  bankDetails?: {
    bank: string;
    agency: string;
    account: string;
    accountType: string;
  };
  metadata: {
    bookingId?: string;
    packageName?: string;
    destination?: string;
    originalPaymentMethod: string;
    gateway: string;
  };
  attachments?: string[];
  notes: string;
}

export interface RefundFilters {
  status: string[];
  refundMethod: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  amountRange: {
    min: number | null;
    max: number | null;
  };
  customerName: string;
  reason: string[];
}

export interface RefundManagerProps {
  className?: string;
}

const statusOptions: SelectOption[] = [
  { value: 'pending', label: 'Pendente', icon: '⏳' },
  { value: 'approved', label: 'Aprovado', icon: '✅' },
  { value: 'rejected', label: 'Rejeitado', icon: '❌' },
  { value: 'completed', label: 'Concluído', icon: '💰' },
  { value: 'cancelled', label: 'Cancelado', icon: '🚫' }
];

const refundMethodOptions: SelectOption[] = [
  { value: 'original_method', label: 'Método Original', icon: '💳' },
  { value: 'bank_transfer', label: 'Transferência Bancária', icon: '🏦' },
  { value: 'credit_voucher', label: 'Vale Crédito', icon: '🎫' }
];

const reasonOptions: SelectOption[] = [
  { value: 'customer_cancellation', label: 'Cancelamento do Cliente', icon: '👤' },
  { value: 'service_issue', label: 'Problema no Serviço', icon: '🔧' },
  { value: 'duplicate_charge', label: 'Cobrança Duplicada', icon: '🔄' },
  { value: 'fraud', label: 'Fraude', icon: '🚨' },
  { value: 'technical_error', label: 'Erro Técnico', icon: '💻' },
  { value: 'other', label: 'Outro', icon: '📝' }
];

const mockRefunds: RefundRequest[] = [
  {
    id: 'ref_001',
    transactionId: 'txn_001',
    customerName: 'Ana Oliveira',
    customerEmail: 'ana@email.com',
    originalAmount: 750.00,
    refundAmount: 750.00,
    reason: 'customer_cancellation',
    status: 'completed',
    requestDate: new Date('2025-07-30T10:00:00'),
    processedDate: new Date('2025-07-31T14:30:00'),
    approvedBy: 'João Silva',
    refundMethod: 'original_method',
    metadata: {
      bookingId: 'bk_004',
      packageName: 'Bonito Aventura',
      destination: 'Bonito, MS',
      originalPaymentMethod: 'credit_card',
      gateway: 'mercadopago'
    },
    notes: 'Cliente solicitou cancelamento devido a mudança de planos'
  },
  {
    id: 'ref_002',
    transactionId: 'txn_005',
    customerName: 'Carlos Mendes',
    customerEmail: 'carlos@email.com',
    originalAmount: 1200.00,
    refundAmount: 1200.00,
    reason: 'service_issue',
    status: 'pending',
    requestDate: new Date('2025-08-01T15:30:00'),
    refundMethod: 'bank_transfer',
    bankDetails: {
      bank: 'Banco do Brasil',
      agency: '1234',
      account: '12345-6',
      accountType: 'Corrente'
    },
    metadata: {
      bookingId: 'bk_005',
      packageName: 'Gramado Romântico',
      destination: 'Gramado, RS',
      originalPaymentMethod: 'credit_card',
      gateway: 'stripe'
    },
    notes: 'Hotel não disponível na data solicitada'
  },
  {
    id: 'ref_003',
    transactionId: 'txn_006',
    customerName: 'Fernanda Costa',
    customerEmail: 'fernanda@email.com',
    originalAmount: 890.00,
    refundAmount: 890.00,
    reason: 'duplicate_charge',
    status: 'approved',
    requestDate: new Date('2025-08-01T16:45:00'),
    approvedBy: 'Maria Santos',
    refundMethod: 'original_method',
    metadata: {
      bookingId: 'bk_006',
      packageName: 'Porto Seguro Relax',
      destination: 'Porto Seguro, BA',
      originalPaymentMethod: 'pix',
      gateway: 'pagseguro'
    },
    notes: 'Cobrança realizada duas vezes pelo sistema'
  },
  {
    id: 'ref_004',
    transactionId: 'txn_007',
    customerName: 'Roberto Alves',
    customerEmail: 'roberto@email.com',
    originalAmount: 1800.00,
    refundAmount: 900.00,
    reason: 'service_issue',
    status: 'rejected',
    requestDate: new Date('2025-07-29T11:20:00'),
    rejectionReason: 'Cliente já utilizou parte do serviço',
    refundMethod: 'credit_voucher',
    metadata: {
      bookingId: 'bk_007',
      packageName: 'Chapada dos Veadeiros',
      destination: 'Alto Paraíso, GO',
      originalPaymentMethod: 'credit_card',
      gateway: 'stripe'
    },
    notes: 'Cliente participou do primeiro dia do pacote'
  }
];

const RefundManager: React.FC<RefundManagerProps> = ({ className }) => {
  const [refunds, setRefunds] = useState<RefundRequest[]>(mockRefunds);
  const [filters, setFilters] = useState<RefundFilters>({
    status: [],
    refundMethod: [],
    dateRange: { start: null, end: null },
    amountRange: { min: null, max: null },
    customerName: '',
    reason: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredRefunds = useMemo(() => {
    return refunds.filter(refund => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(refund.status)) {
        return false;
      }

      // Refund method filter
      if (filters.refundMethod.length > 0 && !filters.refundMethod.includes(refund.refundMethod)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start && refund.requestDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && refund.requestDate > filters.dateRange.end) {
        return false;
      }

      // Amount range filter
      if (filters.amountRange.min && refund.refundAmount < filters.amountRange.min) {
        return false;
      }
      if (filters.amountRange.max && refund.refundAmount > filters.amountRange.max) {
        return false;
      }

      // Customer name filter
      if (filters.customerName && !refund.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) {
        return false;
      }

      // Reason filter
      if (filters.reason.length > 0 && !filters.reason.includes(refund.reason)) {
        return false;
      }

      // Search term
      if (searchTerm && !(
        refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      )) {
        return false;
      }

      return true;
    });
  }, [refunds, filters, searchTerm]);

  const paginatedRefunds = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRefunds.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRefunds, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <Ban className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getReasonLabel = (reason: string) => {
    const option = reasonOptions.find(opt => opt.value === reason);
    return option ? option.label : reason;
  };

  const getRefundMethodLabel = (method: string) => {
    const option = refundMethodOptions.find(opt => opt.value === method);
    return option ? option.label : method;
  };

  const handleFilterChange = (field: keyof RefundFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewDetails = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setShowDetailsModal(true);
  };

  const handleProcessRefund = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setShowProcessModal(true);
  };

  const handleApproveRefund = (refundId: string) => {
    setRefunds(prev => prev.map(r => 
      r.id === refundId 
        ? { ...r, status: 'approved', approvedBy: 'Usuário Atual' }
        : r
    ));
    setShowProcessModal(false);
  };

  const handleRejectRefund = (refundId: string, reason: string) => {
    setRefunds(prev => prev.map(r => 
      r.id === refundId 
        ? { ...r, status: 'rejected', rejectionReason: reason }
        : r
    ));
    setShowProcessModal(false);
  };

  const handleCompleteRefund = (refundId: string) => {
    setRefunds(prev => prev.map(r => 
      r.id === refundId 
        ? { ...r, status: 'completed', processedDate: new Date() }
        : r
    ));
    setShowProcessModal(false);
  };

  const handleExport = () => {
    // Simulate export
    const csvContent = [
      ['ID', 'Cliente', 'Valor', 'Status', 'Motivo', 'Data Solicitação'],
      ...filteredRefunds.map(r => [
        r.id,
        r.customerName,
        `R$ ${r.refundAmount.toFixed(2)}`,
        r.status,
        getReasonLabel(r.reason),
        r.requestDate.toLocaleDateString('pt-BR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reembolsos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Reembolsos</h2>
          <p className="text-gray-600">Gerencie solicitações de reembolso e cancelamentos</p>
        </div>
        <div className="flex gap-3">
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
              Método de Reembolso
            </label>
            <Select
              value={filters.refundMethod.length > 0 ? { value: filters.refundMethod.join(','), label: `${filters.refundMethod.length} selecionados` } : null}
              options={refundMethodOptions}
              onChange={(option) => handleFilterChange('refundMethod', [option.value])}
              placeholder="Todos os métodos"
              isMulti
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo
            </label>
            <Select
              value={filters.reason.length > 0 ? { value: filters.reason.join(','), label: `${filters.reason.length} selecionados` } : null}
              options={reasonOptions}
              onChange={(option) => handleFilterChange('reason', [option.value])}
              placeholder="Todos os motivos"
              isMulti
            />
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredRefunds.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aprovados</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredRefunds.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Concluídos</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredRefunds.filter(r => r.status === 'completed').length}
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
              <p className="text-sm text-gray-600">Rejeitados</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredRefunds.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Refunds Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitação
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
                  Motivo
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
              {paginatedRefunds.map((refund) => (
                <tr key={refund.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{refund.id}</div>
                      <div className="text-sm text-gray-500">Transação: {refund.transactionId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{refund.customerName}</div>
                      <div className="text-sm text-gray-500">{refund.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(refund.refundAmount)}</div>
                      <div className="text-xs text-gray-500">Original: {formatCurrency(refund.originalAmount)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={cn('flex items-center gap-1', getStatusColor(refund.status))}>
                      {getStatusIcon(refund.status)}
                      {refund.status === 'completed' ? 'Concluído' :
                       refund.status === 'approved' ? 'Aprovado' :
                       refund.status === 'pending' ? 'Pendente' :
                       refund.status === 'rejected' ? 'Rejeitado' : 'Cancelado'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getReasonLabel(refund.reason)}</div>
                    <div className="text-xs text-gray-500">{getRefundMethodLabel(refund.refundMethod)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(refund.requestDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(refund)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detalhes
                      </Button>
                      {refund.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleProcessRefund(refund)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Processar
                        </Button>
                      )}
                    </div>
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
                    {Math.min(currentPage * itemsPerPage, filteredRefunds.length)}
                  </span>{' '}
                  de <span className="font-medium">{filteredRefunds.length}</span> resultados
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

      {/* Refund Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Detalhes do Reembolso - ${selectedRefund?.id}`}
        size="2xl"
      >
        {selectedRefund && (
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID da Solicitação</label>
                    <p className="text-sm text-gray-900">{selectedRefund.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Badge className={cn('flex items-center gap-1', getStatusColor(selectedRefund.status))}>
                      {getStatusIcon(selectedRefund.status)}
                      {selectedRefund.status === 'completed' ? 'Concluído' :
                       selectedRefund.status === 'approved' ? 'Aprovado' :
                       selectedRefund.status === 'pending' ? 'Pendente' :
                       selectedRefund.status === 'rejected' ? 'Rejeitado' : 'Cancelado'}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Original</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedRefund.originalAmount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Reembolso</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedRefund.refundAmount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                    <p className="text-sm text-gray-900">{getReasonLabel(selectedRefund.reason)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Reembolso</label>
                    <p className="text-sm text-gray-900">{getRefundMethodLabel(selectedRefund.refundMethod)}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="customer" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                    <p className="text-sm text-gray-900">{selectedRefund.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedRefund.customerEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pacote</label>
                    <p className="text-sm text-gray-900">{selectedRefund.metadata.packageName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                    <p className="text-sm text-gray-900">{selectedRefund.metadata.destination}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID da Reserva</label>
                    <p className="text-sm text-gray-900">{selectedRefund.metadata.bookingId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento Original</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedRefund.metadata.originalPaymentMethod}</p>
                  </div>
                </div>

                {selectedRefund.bankDetails && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Dados Bancários</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                        <p className="text-sm text-gray-900">{selectedRefund.bankDetails.bank}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Agência</label>
                        <p className="text-sm text-gray-900">{selectedRefund.bankDetails.agency}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                        <p className="text-sm text-gray-900">{selectedRefund.bankDetails.account}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
                        <p className="text-sm text-gray-900">{selectedRefund.bankDetails.accountType}</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gateway</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedRefund.metadata.gateway}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data da Solicitação</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedRefund.requestDate)}</p>
                  </div>
                  {selectedRefund.processedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Processamento</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedRefund.processedDate)}</p>
                    </div>
                  )}
                  {selectedRefund.approvedBy && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aprovado por</label>
                      <p className="text-sm text-gray-900">{selectedRefund.approvedBy}</p>
                    </div>
                  )}
                  {selectedRefund.rejectionReason && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Rejeição</label>
                      <p className="text-sm text-red-600">{selectedRefund.rejectionReason}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <p className="text-sm text-gray-900">{selectedRefund.notes}</p>
                  </div>
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
              {selectedRefund.status === 'pending' && (
                <Button
                  onClick={() => handleProcessRefund(selectedRefund)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Processar Reembolso
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Process Refund Modal */}
      <Modal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        title={`Processar Reembolso - ${selectedRefund?.id}`}
        size="lg"
      >
        {selectedRefund && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Revisar Solicitação</p>
                  <p>Analise os detalhes da solicitação antes de aprovar ou rejeitar o reembolso.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <p className="text-sm text-gray-900">{selectedRefund.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <p className="text-sm text-gray-900">{formatCurrency(selectedRefund.refundAmount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <p className="text-sm text-gray-900">{getReasonLabel(selectedRefund.reason)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                <p className="text-sm text-gray-900">{getRefundMethodLabel(selectedRefund.refundMethod)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Ação</h4>
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleApproveRefund(selectedRefund.id)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar Reembolso
                </Button>
                
                <Button
                  onClick={() => handleCompleteRefund(selectedRefund.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Marcar como Concluído
                </Button>
                
                <Button
                  onClick={() => handleRejectRefund(selectedRefund.id, 'Rejeitado pelo analista')}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar Reembolso
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowProcessModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export { RefundManager };
export type { RefundRequest, RefundFilters, RefundManagerProps };
