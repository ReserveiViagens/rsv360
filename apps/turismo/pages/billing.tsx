import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Printer,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  Star,
  MessageSquare,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  Users,
  Percent,
  Shield,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Cloud,
  Zap,
  Target,
  Award,
  Trophy,
  Medal,
  Crown,
  Flag,
  CheckSquare,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Receipt,
  Wallet,
  Banknote,
  Coins,
  PiggyBank,
  TrendingDown,
  AlertTriangle,
  CheckSquare as CheckSquareIcon,
  XSquare,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  DollarSign as DollarSignIcon,
  Star as StarIcon,
  MessageSquare as MessageSquareIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  Activity as ActivityIcon,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  Percent as PercentIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key as KeyIcon,
  Database as DatabaseIcon,
  Server as ServerIcon,
  Cloud as CloudIcon,
  Zap as ZapIcon,
  Target as TargetIcon,
  Award as AwardIcon,
  Trophy as TrophyIcon,
  Medal as MedalIcon,
  Crown as CrownIcon,
  Flag as FlagIcon,
  CheckSquare as CheckSquareIcon2,
  Square as SquareIcon,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Hexagon as HexagonIcon,
  Octagon as OctagonIcon
} from 'lucide-react';

interface Billing {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'paypal';
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  dueDate: string;
  paidDate?: string;
  invoiceNumber: string;
  description: string;
  items: BillingItem[];
  taxes: number;
  discount: number;
  total: number;
  notes: string;
  autoRenewal: boolean;
  nextBillingDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface BillingItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const BillingPage: React.FC = () => {
  const [billings, setBillings] = useState<Billing[]>([
    {
      id: 'BIL001',
      customerName: 'Maria Silva',
      customerEmail: 'maria.silva@email.com',
      customerPhone: '(11) 99999-9999',
      planName: 'Premium',
      amount: 299.00,
      currency: 'BRL',
      status: 'paid',
      paymentMethod: 'credit_card',
      billingCycle: 'monthly',
      dueDate: '2025-08-01',
      paidDate: '2025-07-30',
      invoiceNumber: 'INV2025001',
      description: 'Assinatura Premium - Agosto 2025',
      items: [
        {
          id: 'ITEM001',
          description: 'Plano Premium',
          quantity: 1,
          unitPrice: 299.00,
          total: 299.00
        }
      ],
      taxes: 0.00,
      discount: 0.00,
      total: 299.00,
      notes: 'Pagamento realizado com sucesso',
      autoRenewal: true,
      nextBillingDate: '2025-09-01',
      createdAt: '2025-07-25',
      updatedAt: '2025-07-30'
    },
    {
      id: 'BIL002',
      customerName: 'Carlos Oliveira',
      customerEmail: 'carlos.oliveira@email.com',
      customerPhone: '(21) 88888-8888',
      planName: 'Enterprise',
      amount: 999.00,
      currency: 'BRL',
      status: 'pending',
      paymentMethod: 'pix',
      billingCycle: 'monthly',
      dueDate: '2025-08-05',
      invoiceNumber: 'INV2025002',
      description: 'Assinatura Enterprise - Agosto 2025',
      items: [
        {
          id: 'ITEM002',
          description: 'Plano Enterprise',
          quantity: 1,
          unitPrice: 999.00,
          total: 999.00
        }
      ],
      taxes: 0.00,
      discount: 0.00,
      total: 999.00,
      notes: 'Aguardando pagamento',
      autoRenewal: true,
      nextBillingDate: '2025-09-05',
      createdAt: '2025-07-26',
      updatedAt: '2025-07-26'
    },
    {
      id: 'BIL003',
      customerName: 'Patrícia Lima',
      customerEmail: 'patricia.lima@email.com',
      customerPhone: '(31) 77777-7777',
      planName: 'Básico',
      amount: 99.00,
      currency: 'BRL',
      status: 'failed',
      paymentMethod: 'debit_card',
      billingCycle: 'monthly',
      dueDate: '2025-07-25',
      invoiceNumber: 'INV2025003',
      description: 'Assinatura Básica - Julho 2025',
      items: [
        {
          id: 'ITEM003',
          description: 'Plano Básico',
          quantity: 1,
          unitPrice: 99.00,
          total: 99.00
        }
      ],
      taxes: 0.00,
      discount: 0.00,
      total: 99.00,
      notes: 'Falha no processamento do pagamento',
      autoRenewal: false,
      createdAt: '2025-07-20',
      updatedAt: '2025-07-25'
    }
  ]);

  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    refunded: 'bg-purple-100 text-purple-800'
  };

  const paymentMethodColors = {
    credit_card: 'bg-blue-100 text-blue-800',
    debit_card: 'bg-green-100 text-green-800',
    pix: 'bg-purple-100 text-purple-800',
    bank_transfer: 'bg-orange-100 text-orange-800',
    paypal: 'bg-indigo-100 text-indigo-800'
  };

  const filteredBillings = billings.filter(billing => {
    const matchesStatus = filterStatus === 'all' || billing.status === filterStatus;
    const matchesPaymentMethod = filterPaymentMethod === 'all' || billing.paymentMethod === filterPaymentMethod;
    const matchesSearch = billing.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         billing.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         billing.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPaymentMethod && matchesSearch;
  });

  const stats = {
    total: billings.length,
    pending: billings.filter(b => b.status === 'pending').length,
    paid: billings.filter(b => b.status === 'paid').length,
    failed: billings.filter(b => b.status === 'failed').length,
    cancelled: billings.filter(b => b.status === 'cancelled').length,
    refunded: billings.filter(b => b.status === 'refunded').length,
    totalRevenue: billings.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.total, 0),
    pendingRevenue: billings.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.total, 0)
  };

  const handleStatusChange = (billingId: string, newStatus: Billing['status']) => {
    setBillings(prev => prev.map(b => 
      b.id === billingId ? { ...b, status: newStatus } : b
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <CreditCard className="mr-3 h-8 w-8 text-blue-600" />
                Gestão de Cobrança
              </h1>
              <p className="text-gray-600 mt-2">Gerencie cobranças e pagamentos</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center font-medium transition-colors"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nova Cobrança
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Cobranças</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pagas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, fatura ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="failed">Falhou</option>
                <option value="cancelled">Cancelado</option>
                <option value="refunded">Reembolsado</option>
              </select>

              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Métodos</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="bank_transfer">Transferência</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Billings List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fatura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano
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
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBillings.map((billing) => (
                  <tr key={billing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{billing.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">{billing.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{billing.customerName}</div>
                        <div className="text-sm text-gray-500">{billing.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{billing.planName}</div>
                      <div className="text-sm text-gray-500">
                        {billing.billingCycle === 'monthly' && 'Mensal'}
                        {billing.billingCycle === 'quarterly' && 'Trimestral'}
                        {billing.billingCycle === 'yearly' && 'Anual'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {billing.total.toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[billing.status]}`}>
                        {billing.status === 'pending' && 'Pendente'}
                        {billing.status === 'paid' && 'Pago'}
                        {billing.status === 'failed' && 'Falhou'}
                        {billing.status === 'cancelled' && 'Cancelado'}
                        {billing.status === 'refunded' && 'Reembolsado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentMethodColors[billing.paymentMethod]}`}>
                        {billing.paymentMethod === 'credit_card' && 'Cartão Crédito'}
                        {billing.paymentMethod === 'debit_card' && 'Cartão Débito'}
                        {billing.paymentMethod === 'pix' && 'PIX'}
                        {billing.paymentMethod === 'bank_transfer' && 'Transferência'}
                        {billing.paymentMethod === 'paypal' && 'PayPal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(billing.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                      {billing.paidDate && (
                        <div className="text-sm text-gray-500">
                          Pago: {new Date(billing.paidDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBilling(billing);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBilling(billing);
                            setShowCreateModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Billing Details Modal */}
        {showModal && selectedBilling && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalhes da Cobrança - {selectedBilling.invoiceNumber}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações do Cliente</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nome:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedBilling.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedBilling.customerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Telefone:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedBilling.customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Billing Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações da Cobrança</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Plano:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedBilling.planName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ciclo:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedBilling.billingCycle === 'monthly' && 'Mensal'}
                          {selectedBilling.billingCycle === 'quarterly' && 'Trimestral'}
                          {selectedBilling.billingCycle === 'yearly' && 'Anual'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedBilling.status]}`}>
                          {selectedBilling.status === 'pending' && 'Pendente'}
                          {selectedBilling.status === 'paid' && 'Pago'}
                          {selectedBilling.status === 'failed' && 'Falhou'}
                          {selectedBilling.status === 'cancelled' && 'Cancelado'}
                          {selectedBilling.status === 'refunded' && 'Reembolsado'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Método:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentMethodColors[selectedBilling.paymentMethod]}`}>
                          {selectedBilling.paymentMethod === 'credit_card' && 'Cartão Crédito'}
                          {selectedBilling.paymentMethod === 'debit_card' && 'Cartão Débito'}
                          {selectedBilling.paymentMethod === 'pix' && 'PIX'}
                          {selectedBilling.paymentMethod === 'bank_transfer' && 'Transferência'}
                          {selectedBilling.paymentMethod === 'paypal' && 'PayPal'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações Financeiras</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor Base:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedBilling.amount.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Impostos:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedBilling.taxes.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Desconto:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedBilling.discount.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="text-sm font-bold text-gray-900">
                          R$ {selectedBilling.total.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Datas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vencimento:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedBilling.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {selectedBilling.paidDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Pago em:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(selectedBilling.paidDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      {selectedBilling.nextBillingDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Próxima cobrança:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(selectedBilling.nextBillingDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Criado em:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedBilling.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Itens da Cobrança</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedBilling.items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2 text-sm text-gray-900">{item.description}</td>
                            <td className="py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="py-2 text-sm text-gray-900">
                              R$ {item.unitPrice.toLocaleString('pt-BR')}
                            </td>
                            <td className="py-2 text-sm font-medium text-gray-900">
                              R$ {item.total.toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Observações</h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedBilling.notes}</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                    <Download className="h-4 w-4 inline mr-2" />
                    Baixar Fatura
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowCreateModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                  >
                    <Edit className="h-4 w-4 inline mr-2" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage; 