import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  DollarSign,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  CreditCard,
  Building,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  AlertTriangle,
  Info,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Globe,
  Settings,
  Database,
  Server,
  Zap,
  Target,
  Award,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Bell,
  Lock,
  Unlock,
  Key,
  UserCheck,
  Users,
  UserPlus,
  UserX,
  UserCog,
  UserMinus,
  UserSearch,
  UserCheck2,
  UserX2,
  UserCog2,
  UserMinus2
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Refund {
  id: string;
  customer_name: string;
  customer_email: string;
  order_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  payment_method: string;
  transaction_id: string;
  notes: string;
  documents: string[];
}

export default function RefundsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);

  // Dados simulados
  const [stats] = useState({
    total_refunds: 156,
    pending_refunds: 23,
    approved_refunds: 89,
    rejected_refunds: 12,
    completed_refunds: 32,
    total_amount: 45000,
    average_amount: 288.46,
    processing_time: 3.2
  });

  // Cards clicáveis de estatísticas
  const statsCards = [
    {
      id: 'total_refunds',
      title: 'Total de Reembolsos',
      value: stats.total_refunds.toString(),
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Reembolsos solicitados'
    },
    {
      id: 'pending_refunds',
      title: 'Pendentes',
      value: stats.pending_refunds.toString(),
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      description: 'Aguardando aprovação'
    },
    {
      id: 'approved_refunds',
      title: 'Aprovados',
      value: stats.approved_refunds.toString(),
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Reembolsos aprovados'
    },
    {
      id: 'rejected_refunds',
      title: 'Rejeitados',
      value: stats.rejected_refunds.toString(),
      icon: <XCircle className="h-6 w-6" />,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      description: 'Reembolsos rejeitados'
    },
    {
      id: 'total_amount',
      title: 'Valor Total',
      value: `R$ ${stats.total_amount.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Valor total dos reembolsos'
    },
    {
      id: 'processing_time',
      title: 'Tempo Médio',
      value: `${stats.processing_time} dias`,
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      description: 'Tempo médio de processamento'
    }
  ];

  const [refunds] = useState<Refund[]>([
    {
      id: 'REF001',
      customer_name: 'João Silva',
      customer_email: 'joao.silva@email.com',
      order_id: 'ORD001',
      amount: 850.00,
      reason: 'Produto com defeito',
      status: 'pending',
      created_at: '2024-01-15',
      updated_at: '2024-01-16',
      payment_method: 'Cartão de Crédito',
      transaction_id: 'TXN001',
      notes: 'Cliente solicitou reembolso devido a defeito no produto',
      documents: ['nota_fiscal.pdf', 'foto_defeito.jpg']
    },
    {
      id: 'REF002',
      customer_name: 'Maria Santos',
      customer_email: 'maria.santos@email.com',
      order_id: 'ORD002',
      amount: 1200.00,
      reason: 'Cancelamento de viagem',
      status: 'approved',
      created_at: '2024-01-14',
      updated_at: '2024-01-15',
      payment_method: 'PIX',
      transaction_id: 'TXN002',
      notes: 'Cancelamento devido a emergência médica',
      documents: ['atestado_medico.pdf', 'comprovante_cancelamento.pdf']
    },
    {
      id: 'REF003',
      customer_name: 'Pedro Costa',
      customer_email: 'pedro.costa@email.com',
      order_id: 'ORD003',
      amount: 650.00,
      reason: 'Produto não recebido',
      status: 'completed',
      created_at: '2024-01-13',
      updated_at: '2024-01-14',
      payment_method: 'Cartão de Débito',
      transaction_id: 'TXN003',
      notes: 'Produto não foi entregue no prazo',
      documents: ['comprovante_entrega.pdf']
    },
    {
      id: 'REF004',
      customer_name: 'Ana Oliveira',
      customer_email: 'ana.oliveira@email.com',
      order_id: 'ORD004',
      amount: 950.00,
      reason: 'Arrependimento',
      status: 'rejected',
      created_at: '2024-01-12',
      updated_at: '2024-01-13',
      payment_method: 'Boleto',
      transaction_id: 'TXN004',
      notes: 'Reembolso rejeitado - produto já utilizado',
      documents: ['comprovante_uso.pdf']
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'pending', name: 'Pendentes', icon: Clock },
    { id: 'approved', name: 'Aprovados', icon: CheckCircle },
    { id: 'rejected', name: 'Rejeitados', icon: XCircle },
    { id: 'completed', name: 'Concluídos', icon: CheckCircle }
  ];

  const handleCardClick = (cardId: string) => {
    setSelectedRefund(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada card
  };

  const handleQuickAction = (action: string) => {
    setSelectedRefund(null);
    setShowModal(true);
    // Aqui você pode implementar lógica específica para cada ação
  };

  const handleRefundClick = (refund: Refund) => {
    setSelectedRefund(refund);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'completed':
        return 'Concluído';
      default:
        return 'Desconhecido';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = refund.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || refund.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationButtons />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Reembolsos</h1>
              <p className="mt-2 text-gray-600">
                Gerencie solicitações de reembolso e processe pagamentos
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleQuickAction('export')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button
                onClick={() => handleQuickAction('new')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Reembolso
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statsCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 ${card.bgColor} rounded-lg`}>
                        <div className={card.textColor}>
                          {card.icon}
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      </div>
                    </div>
                    <div className="text-gray-400 hover:text-gray-600">
                      <span className="text-xs">Clique para detalhes</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => handleQuickAction('approve')}
                  className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Aprovar Lote</span>
                </button>
                <button
                  onClick={() => handleQuickAction('reject')}
                  className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-700">Rejeitar Lote</span>
                </button>
                <button
                  onClick={() => handleQuickAction('export')}
                  className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Exportar Dados</span>
                </button>
                <button
                  onClick={() => handleQuickAction('import')}
                  className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Upload className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-700">Importar Dados</span>
                </button>
              </div>
            </div>

            {/* Refunds List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Reembolsos Recentes</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar reembolsos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="pending">Pendentes</option>
                      <option value="approved">Aprovados</option>
                      <option value="rejected">Rejeitados</option>
                      <option value="completed">Concluídos</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pedido
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                    {filteredRefunds.map((refund) => (
                      <tr key={refund.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRefundClick(refund)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{refund.customer_name}</div>
                            <div className="text-sm text-gray-500">{refund.customer_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {refund.order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(refund.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(refund.status)}`}>
                            {getStatusText(refund.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(refund.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h3>
            <p className="text-gray-600">
              Conteúdo específico para a aba {tabs.find(tab => tab.id === activeTab)?.name} será implementado aqui.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedRefund ? 'Detalhes do Reembolso' : 'Ação do Sistema'}
              </h3>
              {selectedRefund ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ID do Reembolso</p>
                    <p className="text-sm text-gray-900">{selectedRefund.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cliente</p>
                    <p className="text-sm text-gray-900">{selectedRefund.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valor</p>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedRefund.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRefund.status)}`}>
                      {getStatusText(selectedRefund.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Motivo</p>
                    <p className="text-sm text-gray-900">{selectedRefund.reason}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Funcionalidade em desenvolvimento. Esta ação será implementada em breve.
                </p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 