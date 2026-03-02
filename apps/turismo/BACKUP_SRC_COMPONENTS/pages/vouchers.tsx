import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Star,
  FileText,
  Send,
  Copy,
  QrCode,
  BarChart3,
  Settings,
  MoreHorizontal,
  ArrowRight,
  CalendarDays,
  Hotel,
  Plane,
  Car,
  Camera,
  Gift,
  Tag,
  Percent,
  Award,
  Shield,
  Zap,
  Globe,
  Smartphone,
  Mail,
  Phone,
  User,
  Building,
  CreditCard as CreditCardIcon,
  Receipt,
  Wallet,
  Key,
  Lock,
  Unlock,
  EyeOff,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Home,
  ArrowLeft,
  Palette,
  Type,
  Image,
  Settings as SettingsIcon
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import { useRouter } from 'next/router';

interface Voucher {
  id: string;
  codigo: string;
  cliente: string;
  tipo: 'hotel' | 'voo' | 'pacote' | 'atracao' | 'transporte' | 'servico';
  destino: string;
  dataInicio: string;
  dataFim: string;
  valor: number;
  status: 'ativo' | 'usado' | 'expirado' | 'cancelado' | 'pendente';
  agencia: string;
  agente: string;
  observacoes: string;
  beneficios: string[];
  validade: string;
  criadoEm: string;
  usadoEm?: string;
  qrCode?: string;
  documentos: string[];
}

interface VoucherStats {
  total: number;
  ativos: number;
  usados: number;
  expirados: number;
  cancelados: number;
  valorTotal: number;
  valorMedio: number;
  taxaUtilizacao: number;
}

export default function VouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [stats, setStats] = useState<VoucherStats>({
    total: 0,
    ativos: 0,
    usados: 0,
    expirados: 0,
    cancelados: 0,
    valorTotal: 0,
    valorMedio: 0,
    taxaUtilizacao: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'novo' | 'editar' | 'visualizar' | 'excluir'>('novo');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<string>('dataCriacao');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);

  // Dados simulados
  const mockVouchers: Voucher[] = [
    {
      id: '1',
      codigo: 'VCH-2025-001',
      cliente: 'Claudia Helena Ivonika',
      tipo: 'pacote',
      destino: 'Lcqua Diroma Resort',
      dataInicio: '2025-02-15',
      dataFim: '2025-02-20',
      valor: 2850.00,
      status: 'ativo',
      agencia: 'Reservei Viagens',
      agente: 'Maria Silva',
      observacoes: 'Pacote completo com hospedagem e passeios',
      beneficios: ['Wi-Fi gratuito', 'Café da manhã', 'Transfer aeroporto'],
      validade: '2025-12-31',
      criadoEm: '2025-01-15',
      documentos: ['voucher.pdf', 'comprovante.pdf']
    },
    {
      id: '2',
      codigo: 'VCH-2025-002',
      cliente: 'João Santos',
      tipo: 'hotel',
      destino: 'Hotel Maravilha',
      dataInicio: '2025-03-10',
      dataFim: '2025-03-15',
      valor: 1200.00,
      status: 'usado',
      agencia: 'Reservei Viagens',
      agente: 'Pedro Costa',
      observacoes: 'Quarto duplo com vista para o mar',
      beneficios: ['Estacionamento', 'Piscina', 'Academia'],
      validade: '2025-06-30',
      criadoEm: '2025-01-20',
      usadoEm: '2025-03-10',
      documentos: ['voucher.pdf']
    },
    {
      id: '3',
      codigo: 'VCH-2025-003',
      cliente: 'Ana Oliveira',
      tipo: 'voo',
      destino: 'São Paulo - Rio de Janeiro',
      dataInicio: '2025-04-05',
      dataFim: '2025-04-05',
      valor: 450.00,
      status: 'ativo',
      agencia: 'Reservei Viagens',
      agente: 'Carlos Lima',
      observacoes: 'Voo direto, classe econômica',
      beneficios: ['Bagagem incluída', 'Refeição a bordo'],
      validade: '2025-08-31',
      criadoEm: '2025-01-25',
      documentos: ['passagem.pdf', 'voucher.pdf']
    },
    {
      id: '4',
      codigo: 'VCH-2025-004',
      cliente: 'Roberto Silva',
      tipo: 'atracao',
      destino: 'Cristo Redentor',
      dataInicio: '2025-05-20',
      dataFim: '2025-05-20',
      valor: 80.00,
      status: 'expirado',
      agencia: 'Reservei Viagens',
      agente: 'Fernanda Santos',
      observacoes: 'Ingresso com guia turístico',
      beneficios: ['Guia local', 'Transporte ida e volta'],
      validade: '2025-05-20',
      criadoEm: '2025-02-01',
      documentos: ['ingresso.pdf']
    },
    {
      id: '5',
      codigo: 'VCH-2025-005',
      cliente: 'Lucia Mendes',
      tipo: 'transporte',
      destino: 'Aluguel de Carro - Rio de Janeiro',
      dataInicio: '2025-06-10',
      dataFim: '2025-06-15',
      valor: 320.00,
      status: 'ativo',
      agencia: 'Reservei Viagens',
      agente: 'Ricardo Alves',
      observacoes: 'Carro compacto com seguro completo',
      beneficios: ['Seguro completo', 'GPS', 'Seguro adicional'],
      validade: '2025-09-30',
      criadoEm: '2025-02-05',
      documentos: ['contrato.pdf', 'voucher.pdf']
    }
  ];

  useEffect(() => {
    setVouchers(mockVouchers);
    calcularEstatisticas(mockVouchers);
  }, []);

  const calcularEstatisticas = (vouchersList: Voucher[]) => {
    const total = vouchersList.length;
    const ativos = vouchersList.filter(v => v.status === 'ativo').length;
    const usados = vouchersList.filter(v => v.status === 'usado').length;
    const expirados = vouchersList.filter(v => v.status === 'expirado').length;
    const cancelados = vouchersList.filter(v => v.status === 'cancelado').length;
    const valorTotal = vouchersList.reduce((sum, v) => sum + v.valor, 0);
    const valorMedio = total > 0 ? valorTotal / total : 0;
    const taxaUtilizacao = total > 0 ? (usados / total) * 100 : 0;

    setStats({
      total,
      ativos,
      usados,
      expirados,
      cancelados,
      valorTotal,
      valorMedio,
      taxaUtilizacao
    });
  };

  const handleNovoVoucher = () => {
    // Implementar criação de novo voucher
    console.log('Criar novo voucher');
  };

  const handleEditorVouchers = () => {
    router.push('/voucher-editor');
  };

  const handleEditarVoucher = (voucher: Voucher) => {
    setModalType('editar');
    setSelectedVoucher(voucher);
    setShowModal(true);
  };

  const handleVisualizarVoucher = (voucher: Voucher) => {
    setModalType('visualizar');
    setSelectedVoucher(voucher);
    setShowModal(true);
  };

  const handleExcluirVoucher = (voucher: Voucher) => {
    setModalType('excluir');
    setSelectedVoucher(voucher);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'usado': return 'bg-blue-100 text-blue-800';
      case 'expirado': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'hotel': return <Hotel className="w-4 h-4" />;
      case 'voo': return <Plane className="w-4 h-4" />;
      case 'pacote': return <Gift className="w-4 h-4" />;
      case 'atracao': return <Camera className="w-4 h-4" />;
      case 'transporte': return <Car className="w-4 h-4" />;
      case 'servico': return <Settings className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'hotel': return 'Hotel';
      case 'voo': return 'Voo';
      case 'pacote': return 'Pacote';
      case 'atracao': return 'Atração';
      case 'transporte': return 'Transporte';
      case 'servico': return 'Serviço';
      default: return 'Outro';
    }
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.destino.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || voucher.status === filterStatus;
    const matchesTipo = filterTipo === 'todos' || voucher.tipo === filterTipo;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const sortedVouchers = [...filteredVouchers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'dataCriacao':
        aValue = new Date(a.criadoEm);
        bValue = new Date(b.criadoEm);
        break;
      case 'valor':
        aValue = a.valor;
        bValue = b.valor;
        break;
      case 'cliente':
        aValue = a.cliente;
        bValue = b.cliente;
        break;
      case 'destino':
        aValue = a.destino;
        bValue = b.destino;
        break;
      default:
        aValue = a.codigo;
        bValue = b.codigo;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Vouchers e Reservas</h1>
                  <p className="text-sm text-gray-500">Gestão completa de vouchers e reservas</p>
                </div>
              </div>
            </div>
            <NavigationButtons className="mt-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Vouchers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ativos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Utilização</p>
                <p className="text-2xl font-bold text-gray-900">{stats.taxaUtilizacao.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <button
                onClick={handleNovoVoucher}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-600">Novo Voucher</span>
              </button>

              <button
                onClick={handleEditorVouchers}
                className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Palette className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-700">Editor de Vouchers</span>
              </button>

              <button className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                <Upload className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">Importar Vouchers</span>
              </button>

              <button className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                <Download className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-700">Exportar Relatório</span>
              </button>

              <button className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                <QrCode className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-700">Gerar QR Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar vouchers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="ativo">Ativo</option>
                  <option value="usado">Usado</option>
                  <option value="expirado">Expirado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="pendente">Pendente</option>
                </select>

                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos os Tipos</option>
                  <option value="hotel">Hotel</option>
                  <option value="voo">Voo</option>
                  <option value="pacote">Pacote</option>
                  <option value="atracao">Atração</option>
                  <option value="transporte">Transporte</option>
                  <option value="servico">Serviço</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dataCriacao-desc">Mais Recentes</option>
                  <option value="dataCriacao-asc">Mais Antigos</option>
                  <option value="valor-desc">Maior Valor</option>
                  <option value="valor-asc">Menor Valor</option>
                  <option value="cliente-asc">Cliente A-Z</option>
                  <option value="destino-asc">Destino A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Vouchers */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Vouchers ({filteredVouchers.length})
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedVouchers(selectedVouchers.length === sortedVouchers.length ? [] : sortedVouchers.map(v => v.id))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedVouchers.length === sortedVouchers.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                </button>
                {selectedVouchers.length > 0 && (
                  <span className="text-sm text-gray-500">
                    ({selectedVouchers.length} selecionados)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedVouchers.length === sortedVouchers.length && sortedVouchers.length > 0}
                      onChange={(e) => setSelectedVouchers(e.target.checked ? sortedVouchers.map(v => v.id) : [])}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedVouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedVouchers.includes(voucher.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVouchers([...selectedVouchers, voucher.id]);
                          } else {
                            setSelectedVouchers(selectedVouchers.filter(id => id !== voucher.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getTipoIcon(voucher.tipo)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{voucher.codigo}</div>
                          <div className="text-sm text-gray-500">{voucher.agencia}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{voucher.cliente}</div>
                      <div className="text-sm text-gray-500">{voucher.agente}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getTipoLabel(voucher.tipo)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{voucher.destino}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {voucher.dataInicio} - {voucher.dataFim}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(voucher.dataInicio).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        até {new Date(voucher.dataFim).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {voucher.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-gray-500">
                        Válido até {new Date(voucher.validade).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(voucher.status)}`}>
                        {voucher.status === 'ativo' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {voucher.status === 'usado' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {voucher.status === 'expirado' && <XCircle className="w-3 h-3 mr-1" />}
                        {voucher.status === 'cancelado' && <XCircle className="w-3 h-3 mr-1" />}
                        {voucher.status === 'pendente' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleVisualizarVoucher(voucher)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditarVoucher(voucher)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExcluirVoucher(voucher)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Mais opções">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedVouchers.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum voucher encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'todos' || filterTipo !== 'todos' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Comece criando um novo voucher.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={handleNovoVoucher}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Voucher
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'novo' && 'Novo Voucher'}
                  {modalType === 'editar' && 'Editar Voucher'}
                  {modalType === 'visualizar' && 'Detalhes do Voucher'}
                  {modalType === 'excluir' && 'Excluir Voucher'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {modalType === 'excluir' && selectedVoucher && (
                <div className="text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Confirmar exclusão
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Tem certeza que deseja excluir o voucher <strong>{selectedVoucher.codigo}</strong>?
                    Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setVouchers(vouchers.filter(v => v.id !== selectedVoucher.id));
                        calcularEstatisticas(vouchers.filter(v => v.id !== selectedVoucher.id));
                        setShowModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}

              {(modalType === 'novo' || modalType === 'editar' || modalType === 'visualizar') && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código do Voucher
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedVoucher?.codigo || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cliente
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedVoucher?.cliente || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        defaultValue={selectedVoucher?.tipo || 'hotel'}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="hotel">Hotel</option>
                        <option value="voo">Voo</option>
                        <option value="pacote">Pacote</option>
                        <option value="atracao">Atração</option>
                        <option value="transporte">Transporte</option>
                        <option value="servico">Serviço</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destino
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedVoucher?.destino || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Início
                      </label>
                      <input
                        type="date"
                        defaultValue={selectedVoucher?.dataInicio || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Fim
                      </label>
                      <input
                        type="date"
                        defaultValue={selectedVoucher?.dataFim || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={selectedVoucher?.valor || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        defaultValue={selectedVoucher?.status || 'ativo'}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="usado">Usado</option>
                        <option value="expirado">Expirado</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="pendente">Pendente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agência
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedVoucher?.agencia || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agente
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedVoucher?.agente || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Validade
                      </label>
                      <input
                        type="date"
                        defaultValue={selectedVoucher?.validade || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      rows={3}
                      defaultValue={selectedVoucher?.observacoes || ''}
                      disabled={modalType === 'visualizar'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {modalType === 'visualizar' && selectedVoucher && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Benefícios Inclusos
                      </label>
                      <div className="space-y-2">
                        {selectedVoucher.beneficios.map((beneficio, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm text-gray-700">{beneficio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {modalType === 'visualizar' && selectedVoucher && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Documentos
                      </label>
                      <div className="space-y-2">
                        {selectedVoucher.documentos.map((documento, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 text-gray-500 mr-2" />
                              <span className="text-sm text-gray-700">{documento}</span>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {modalType === 'visualizar' ? 'Fechar' : 'Cancelar'}
                    </button>
                    {modalType !== 'visualizar' && (
                      <button
                        onClick={() => {
                          // Aqui implementaria a lógica de salvar
                          setShowModal(false);
                        }}
                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                      >
                        {modalType === 'novo' ? 'Criar' : 'Salvar'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 