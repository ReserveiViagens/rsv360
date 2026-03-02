import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
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
  Settings as SettingsIcon,
  Share2,
  Printer,
  MonitorPlay,
  LayoutDashboard,
  Layers,
  BookmarkPlus,
  FolderPlus,
  Globe2
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

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
  categoria?: 'hotel' | 'parque' | 'atracao' | 'transporte' | 'outros';
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
  const [modalType, setModalType] = useState<'novo' | 'editar' | 'visualizar' | 'excluir' | 'compartilhar' | 'salvarTemplate' | 'importar' | 'exportar' | 'qrcode' | 'editor'>('novo');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<string>('dataCriacao');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
  const [templateCategory, setTemplateCategory] = useState<'hotel' | 'parque' | 'atracao' | 'transporte' | 'outros'>('hotel');
  const formRef = useRef<HTMLFormElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [importPreview, setImportPreview] = useState<Voucher[]>([]);
  const [exportContent, setExportContent] = useState<string>('');
  const [exportStatus, setExportStatus] = useState<string>('');
  const [selectedVoucherForQr, setSelectedVoucherForQr] = useState<string>('');
  const categoriesOptions = useMemo(() => ([
    { value: 'hotel', label: 'Hotéis' },
    { value: 'parque', label: 'Parques' },
    { value: 'atracao', label: 'Atrações' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'outros', label: 'Outros' },
  ]), []);

  const generateId = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 11);

  const generateVoucherCode = () => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `VCH-${today}-${randomSuffix}`;
  };

  const createEmptyVoucher = (): Voucher => {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const end = new Date(today);
    end.setDate(end.getDate() + 1);
    const endDate = end.toISOString().split('T')[0];
    const validity = new Date(today);
    validity.setDate(validity.getDate() + 30);
    const validityDate = validity.toISOString().split('T')[0];

    return {
      id: generateId(),
      codigo: generateVoucherCode(),
      cliente: '',
      tipo: 'hotel',
      destino: '',
      dataInicio: startDate,
      dataFim: endDate,
      valor: 0,
      status: 'ativo',
      agencia: '',
      agente: '',
      observacoes: '',
      beneficios: [],
      validade: validityDate,
      criadoEm: new Date().toISOString(),
      documentos: [],
      categoria: 'hotel'
    };
  };

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
      documentos: ['voucher.pdf', 'comprovante.pdf'],
      categoria: 'hotel'
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
      documentos: ['voucher.pdf'],
      categoria: 'hotel'
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
      documentos: ['passagem.pdf', 'voucher.pdf'],
      categoria: 'transporte'
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
      documentos: ['ingresso.pdf'],
      categoria: 'atracao'
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
      documentos: ['contrato.pdf', 'voucher.pdf'],
      categoria: 'transporte'
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
    const novoVoucher = createEmptyVoucher();
    setSelectedVoucher(novoVoucher);
    setTemplateCategory('hotel');
    setModalType('novo');
    setShowModal(true);
  };

  const handleEditorVouchers = () => {
    setSelectedVoucher(null);
    setModalType('editor');
    setShowModal(true);
  };

  const handleEditarVoucher = (voucher: Voucher) => {
    setModalType('editar');
    setSelectedVoucher(voucher);
    setTemplateCategory(voucher.categoria || 'outros');
    setShowModal(true);
  };

  const handleVisualizarVoucher = (voucher: Voucher) => {
    setModalType('visualizar');
    setSelectedVoucher(voucher);
    setTemplateCategory(voucher.categoria || 'outros');
    setShowModal(true);
  };

  const handleCompartilharVoucher = (voucher: Voucher) => {
    setModalType('compartilhar');
    setSelectedVoucher(voucher);
    setShowModal(true);
  };

  const handleSalvarTemplateVoucher = (voucher: Voucher) => {
    setModalType('salvarTemplate');
    setSelectedVoucher(voucher);
  setTemplateCategory(voucher.categoria || 'outros');
    setShowModal(true);
  };

  const handleVisualizacaoTempoReal = (voucher: Voucher) => {
    console.log('Visualização em tempo real', voucher.codigo);
  };

  const handleVisualizarImpressao = (voucher: Voucher) => {
    setModalType('visualizar');
    setSelectedVoucher(voucher);
    setShowModal(true);
  };

  const handleImprimirVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    window.print();
  };

  const handleOpenImportModal = () => {
    setSelectedVoucher(null);
    setImportStatus({ type: null, message: '' });
    setImportPreview([]);
    setModalType('importar');
    setShowModal(true);
  };

  const handleOpenExportModal = () => {
    const content = JSON.stringify(filteredVouchers, null, 2);
    setSelectedVoucher(null);
    setExportContent(content);
    setExportStatus('');
    setModalType('exportar');
    setShowModal(true);
  };

  const handleOpenQrCodeModal = () => {
    const firstVoucher = vouchers[0];
    setSelectedVoucher(null);
    setSelectedVoucherForQr(firstVoucher ? firstVoucher.id : '');
    setModalType('qrcode');
    setShowModal(true);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedArray: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.vouchers)
          ? parsed.vouchers
          : [];

      if (importedArray.length === 0) {
        setImportStatus({ type: 'error', message: 'Nenhum voucher encontrado no arquivo selecionado.' });
        return;
      }

      const normalized: Voucher[] = importedArray.map((item, index) => ({
        id: item.id || generateId(),
        codigo: item.codigo || generateVoucherCode(),
        cliente: item.cliente || `Cliente ${index + 1}`,
        tipo: (item.tipo as Voucher['tipo']) || 'hotel',
        destino: item.destino || 'Destino não informado',
        dataInicio: item.dataInicio || item.data || '',
        dataFim: item.dataFim || item.data || '',
        valor: Number(item.valor) || 0,
        status: (item.status as Voucher['status']) || 'ativo',
        agencia: item.agencia || 'Reservei Viagens',
        agente: item.agente || 'Atendimento Reservei',
        observacoes: item.observacoes || '',
        beneficios: Array.isArray(item.beneficios) ? item.beneficios : [],
        validade: item.validade || '',
        criadoEm: item.criadoEm || new Date().toISOString(),
        documentos: Array.isArray(item.documentos) ? item.documentos : [],
        categoria: item.categoria || 'hotel'
      }));

      setVouchers((prev) => {
        const merged = [...prev, ...normalized];
        calcularEstatisticas(merged);
        return merged;
      });

      setImportPreview(normalized.slice(0, 5));
      setImportStatus({
        type: 'success',
        message: `${normalized.length} voucher${normalized.length > 1 ? 's' : ''} importado${normalized.length > 1 ? 's' : ''} com sucesso.`
      });
    } catch (error: any) {
      setImportStatus({ type: 'error', message: `Falha ao importar vouchers: ${error.message || 'Erro desconhecido.'}` });
    }
  };

  const handleCopyExport = async () => {
    if (!exportContent) return;
    try {
      await navigator.clipboard.writeText(exportContent);
      setExportStatus('Dados copiados para a área de transferência.');
    } catch (error) {
      setExportStatus('Não foi possível copiar os dados.');
    }
  };

  const handleDownloadExport = () => {
    if (!exportContent) return;
    const blob = new Blob([exportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vouchers-export.json';
    link.click();
    URL.revokeObjectURL(url);
    setExportStatus('Arquivo exportado com sucesso.');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVoucher(null);
    setTemplateCategory('hotel');
    setImportStatus({ type: null, message: '' });
    setImportPreview([]);
    setExportContent('');
    setExportStatus('');
    setSelectedVoucherForQr('');
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  };

  const handleSubmitVoucherForm = () => {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const getValue = (key: string) => formData.get(key)?.toString().trim() ?? '';

    const baseVoucher = modalType === 'editar' && selectedVoucher
      ? { ...selectedVoucher }
      : createEmptyVoucher();

    const beneficios = getValue('beneficios')
      ? getValue('beneficios')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const documentos = getValue('documentos')
      ? getValue('documentos')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const voucherData: Voucher = {
      ...baseVoucher,
      codigo: getValue('codigo') || baseVoucher.codigo || generateVoucherCode(),
      cliente: getValue('cliente'),
      tipo: (getValue('tipo') as Voucher['tipo']) || 'hotel',
      categoria: (getValue('categoria') as Voucher['categoria']) || baseVoucher.categoria || 'hotel',
      destino: getValue('destino'),
      dataInicio: normalizeDateInput(getValue('dataInicio'), baseVoucher.dataInicio),
      dataFim: normalizeDateInput(getValue('dataFim'), baseVoucher.dataFim),
      valor: parseFloat(getValue('valor')) || 0,
      status: (getValue('status') as Voucher['status']) || 'ativo',
      agencia: getValue('agencia'),
      agente: getValue('agente'),
      validade: normalizeDateInput(getValue('validade'), baseVoucher.validade),
      observacoes: getValue('observacoes'),
      beneficios,
      documentos,
      criadoEm: modalType === 'editar' && selectedVoucher ? selectedVoucher.criadoEm : new Date().toISOString(),
    };

    setTemplateCategory(voucherData.categoria || 'hotel');

    if (modalType === 'novo') {
      const updated = [...vouchers, voucherData];
      setVouchers(updated);
      calcularEstatisticas(updated);
    }

    if (modalType === 'editar' && selectedVoucher) {
      const updated = vouchers.map((voucher) =>
        voucher.id === selectedVoucher.id ? voucherData : voucher
      );
      setVouchers(updated);
      calcularEstatisticas(updated);
    }

    handleCloseModal();
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

  const safeFormatDate = (value: string | undefined | null, fallback: string = '-') => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString('pt-BR');
  };

  const normalizeDateInput = (value: string, fallback: string) => {
    if (!value) return fallback;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallback : value;
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Visualizar em tempo real</p>
              <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
            </div>
            <button
              onClick={() => {
                if (sortedVouchers[0]) handleVisualizacaoTempoReal(sortedVouchers[0]);
              }}
              className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
              title="Visualizar em tempo real"
            >
              <MonitorPlay className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Visualização de impressão</p>
              <h3 className="text-lg font-semibold text-gray-900">Preview PDF</h3>
            </div>
            <button
              onClick={() => {
                if (sortedVouchers[0]) handleVisualizarImpressao(sortedVouchers[0]);
              }}
              className="p-2 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100"
              title="Visualizar impressão"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Exportar ou imprimir</p>
              <h3 className="text-lg font-semibold text-gray-900">Impressão</h3>
            </div>
            <button
              onClick={() => {
                if (sortedVouchers[0]) handleImprimirVoucher(sortedVouchers[0]);
              }}
              className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100"
              title="Imprimir"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Salvar e compartilhar modelo</p>
              <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
            </div>
            <button
              onClick={() => {
                if (sortedVouchers[0]) handleSalvarTemplateVoucher(sortedVouchers[0]);
              }}
              className="p-2 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100"
              title="Salvar como modelo"
            >
              <BookmarkPlus className="w-5 h-5" />
            </button>
          </div>
        </div>
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

              <button
                onClick={handleOpenImportModal}
                className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Upload className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">Importar Vouchers</span>
              </button>

              <button
                onClick={handleOpenExportModal}
                className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Download className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-700">Exportar Relatório</span>
              </button>

              <button
                onClick={handleOpenQrCodeModal}
                className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
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
                  aria-label="Filtrar por status"
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
                  aria-label="Filtrar por tipo"
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
                  aria-label="Ordenar por"
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
                      aria-label="Selecionar todos os vouchers"
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
                      aria-label={`Selecionar voucher ${voucher.codigo}`}
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
                        {safeFormatDate(voucher.dataInicio)}
                      </div>
                      <div className="text-sm text-gray-500">
                        até {safeFormatDate(voucher.dataFim)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {voucher.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-gray-500">
                        Válido até {safeFormatDate(voucher.validade)}
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
                        <button
                          onClick={() => handleVisualizacaoTempoReal(voucher)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Visualizar em tempo real"
                        >
                          <MonitorPlay className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVisualizarImpressao(voucher)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Visualizar impressão"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleImprimirVoucher(voucher)}
                          className="text-green-600 hover:text-green-900"
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCompartilharVoucher(voucher)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Compartilhar"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSalvarTemplateVoucher(voucher)}
                          className="text-orange-500 hover:text-orange-700"
                          title="Salvar como modelo"
                        >
                          <BookmarkPlus className="w-4 h-4" />
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
                  {modalType === 'compartilhar' && 'Compartilhar Voucher'}
                  {modalType === 'salvarTemplate' && 'Salvar como Modelo'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  aria-label="Fechar modal"
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
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        setVouchers(vouchers.filter(v => v.id !== selectedVoucher.id));
                        calcularEstatisticas(vouchers.filter(v => v.id !== selectedVoucher.id));
                        handleCloseModal();
                      }}
                      className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}

              {(modalType === 'novo' || modalType === 'editar' || modalType === 'visualizar') && (
                <form
                  ref={modalType === 'visualizar' ? undefined : formRef}
                  className="space-y-6"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="voucher-codigo" className="block text-sm font-medium text-gray-700 mb-2">
                        Código do Voucher
                      </label>
                      <input
                        name="codigo"
                        id="voucher-codigo"
                        type="text"
                        defaultValue={selectedVoucher?.codigo || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="voucher-cliente" className="block text-sm font-medium text-gray-700 mb-2">
                        Cliente
                      </label>
                      <input
                        name="cliente"
                        id="voucher-cliente"
                        type="text"
                        defaultValue={selectedVoucher?.cliente || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="voucher-tipo" className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        name="tipo"
                        id="voucher-tipo"
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
                      <label htmlFor="voucher-categoria" className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria
                      </label>
                      <select
                        name="categoria"
                        id="voucher-categoria"
                        defaultValue={selectedVoucher?.categoria || 'hotel'}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus-border-transparent disabled:bg-gray-100"
                      >
                        {categoriesOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="voucher-destino" className="block text-sm font-medium text-gray-700 mb-2">
                        Destino
                      </label>
                      <input
                        name="destino"
                        id="voucher-destino"
                        type="text"
                        defaultValue={selectedVoucher?.destino || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="voucher-data-inicio" className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Início
                      </label>
                      <input
                        name="dataInicio"
                        id="voucher-data-inicio"
                        type="date"
                        defaultValue={selectedVoucher?.dataInicio || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="voucher-data-fim" className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Fim
                      </label>
                      <input
                        name="dataFim"
                        id="voucher-data-fim"
                        type="date"
                        defaultValue={selectedVoucher?.dataFim || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="voucher-valor" className="block text-sm font-medium text-gray-700 mb-2">
                        Valor
                      </label>
                      <input
                        name="valor"
                        id="voucher-valor"
                        type="number"
                        step="0.01"
                        defaultValue={selectedVoucher?.valor || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="voucher-status" className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        id="voucher-status"
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
                      <label htmlFor="voucher-agencia" className="block text-sm font-medium text-gray-700 mb-2">
                        Agência
                      </label>
                      <input
                        name="agencia"
                        id="voucher-agencia"
                        type="text"
                        defaultValue={selectedVoucher?.agencia || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="voucher-agente" className="block text-sm font-medium text-gray-700 mb-2">
                        Agente
                      </label>
                      <input
                        name="agente"
                        id="voucher-agente"
                        type="text"
                        defaultValue={selectedVoucher?.agente || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="voucher-validade" className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Validade
                      </label>
                      <input
                        name="validade"
                        id="voucher-validade"
                        type="date"
                        defaultValue={selectedVoucher?.validade || ''}
                        disabled={modalType === 'visualizar'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="voucher-observacoes" className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      name="observacoes"
                      id="voucher-observacoes"
                      rows={3}
                      defaultValue={selectedVoucher?.observacoes || ''}
                      disabled={modalType === 'visualizar'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  {modalType !== 'visualizar' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="voucher-beneficios" className="block text-sm font-medium text-gray-700 mb-2">
                          Benefícios (separados por vírgula)
                        </label>
                        <textarea
                          name="beneficios"
                          id="voucher-beneficios"
                          rows={3}
                          defaultValue={selectedVoucher?.beneficios.join(', ') || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="voucher-documentos" className="block text-sm font-medium text-gray-700 mb-2">
                          Documentos (separados por vírgula)
                        </label>
                        <textarea
                          name="documentos"
                          id="voucher-documentos"
                          rows={3}
                          defaultValue={selectedVoucher?.documentos.join(', ') || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus-border-transparent"
                        />
                      </div>
                    </div>
                  )}

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
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {modalType === 'visualizar' ? 'Fechar' : 'Cancelar'}
                    </button>
                    {modalType !== 'visualizar' && (
                      <button
                        type="button"
                        onClick={handleSubmitVoucherForm}
                        className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                      >
                        {modalType === 'novo' ? 'Criar' : 'Salvar'}
                      </button>
                    )}
                  </div>
                </form>
              )}

              {modalType === 'compartilhar' && selectedVoucher && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg">
                    <Share2 className="w-5 h-5 mr-2" />
                    Compartilhe este voucher com clientes ou parceiros.
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link compartilhável</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          readOnly
                          value={`https://reservei.viagens/vouchers/${selectedVoucher.codigo}`}
                        aria-label="Link compartilhável do voucher"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(`https://reservei.viagens/vouchers/${selectedVoucher.codigo}`)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button className="flex items-center justify-center px-3 py-2 border rounded-md hover:bg-blue-50">
                        <Mail className="w-4 h-4 mr-2" />E-mail
                      </button>
                      <button className="flex items-center justify-center px-3 py-2 border rounded-md hover:bg-green-50">
                        <Phone className="w-4 h-4 mr-2" />WhatsApp
                      </button>
                      <button className="flex items-center justify-center px-3 py-2 border rounded-md hover:bg-purple-50">
                        <Globe2 className="w-4 h-4 mr-2" />Portal Cliente
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Concluído
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'editor' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded">
                    Utilize o editor rápido para localizar, visualizar ou editar vouchers existentes.
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-3">
                    {vouchers.map((voucher) => (
                      <div key={voucher.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{voucher.codigo} · {voucher.cliente}</p>
                          <p className="text-xs text-gray-500">{voucher.destino} · {safeFormatDate(voucher.criadoEm)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleVisualizarVoucher(voucher)}
                            className="px-3 py-1.5 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
                          >
                            Visualizar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditarVoucher(voucher)}
                            className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    ))}
                    {vouchers.length === 0 && (
                      <p className="text-sm text-gray-500 text-center">Nenhum voucher cadastrado ainda.</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Fechar
                    </button>
                    <button
                      type="button"
                      onClick={handleNovoVoucher}
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Criar Novo Voucher
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'importar' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                    Faça upload de um arquivo JSON contendo vouchers para importar em massa.
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="import-file" className="block text-sm font-medium text-gray-700 mb-2">
                        Arquivo (.json)
                      </label>
                      <input
                        ref={importInputRef}
                        id="import-file"
                        type="file"
                        accept="application/json"
                        onChange={handleImportFile}
                        className="block w-full text-sm text-gray-700"
                      />
                      <p className="mt-1 text-xs text-gray-500">Formato suportado: array de objetos de voucher. Campos opcionais serão preenchidos automaticamente.</p>
                    </div>
                    {importStatus.type && (
                      <div className={`p-3 rounded border ${importStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        {importStatus.message}
                      </div>
                    )}
                    {importPreview.length > 0 && (
                      <div className="border border-gray-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Pré-visualização ({importPreview.length} primeiro(s))</p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {importPreview.map((item) => (
                            <li key={item.id} className="flex justify-between">
                              <span>{item.codigo} · {item.cliente}</span>
                              <span className="text-xs text-gray-400">{item.destino}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => importInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Selecionar outro arquivo
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'exportar' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    Exportar os vouchers filtrados em formato JSON para uso externo.
                  </div>
                  <div>
                    <label htmlFor="export-content" className="block text-sm font-medium text-gray-700 mb-2">
                      Conteúdo exportado ({filteredVouchers.length} itens)
                    </label>
                    <textarea
                      id="export-content"
                      rows={12}
                      readOnly
                      value={exportContent}
                      className="w-full font-mono text-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {exportStatus && (
                      <p className="mt-2 text-xs text-gray-500">{exportStatus}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleCopyExport}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Copiar
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadExport}
                      className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                    >
                      Baixar JSON
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'qrcode' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded">
                    Gere um QR Code para compartilhar rapidamente um voucher específico.
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="voucher-qrcode-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Selecionar voucher
                      </label>
                      <select
                        id="voucher-qrcode-select"
                        value={selectedVoucherForQr}
                        onChange={(e) => setSelectedVoucherForQr(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Selecione um voucher</option>
                        {vouchers.map((voucher) => (
                          <option key={voucher.id} value={voucher.id}>
                            {voucher.codigo} · {voucher.cliente}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedVoucherForQr && (
                      (() => {
                        const voucher = vouchers.find((v) => v.id === selectedVoucherForQr);
                        if (!voucher) return null;
                        const qrData = `https://reservei.viagens/vouchers/${voucher.codigo}`;
                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;
                        return (
                          <div className="flex flex-col items-center space-y-3">
                            <img src={qrUrl} alt={`QR Code para o voucher ${voucher.codigo}`} className="w-44 h-44" />
                            <p className="text-xs text-gray-500">Link: {qrData}</p>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(qrData)}
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Copiar link
                              </button>
                              <button
                                type="button"
                                onClick={() => window.open(qrUrl, '_blank')}
                                className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                              >
                                Abrir QR Code
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'salvarTemplate' && selectedVoucher && (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded">
                    Configure o modelo para reutilizar este voucher em futuras propostas.
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="template-nome" className="block text-sm font-medium text-gray-700 mb-1">Nome do modelo</label>
                      <input
                        type="text"
                        id="template-nome"
                        defaultValue={`Modelo - ${selectedVoucher.destino}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="template-categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select
                        value={templateCategory}
                        id="template-categoria"
                        onChange={(e) => setTemplateCategory(e.target.value as typeof templateCategory)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {categoriesOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="template-descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea
                        id="template-descricao"
                        rows={3}
                        defaultValue={selectedVoucher.observacoes}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Salvar template', templateCategory);
                        handleCloseModal();
                      }}
                      className="px-4 py-2 bg-orange-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-orange-700"
                    >
                      Salvar Modelo
                    </button>
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