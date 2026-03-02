import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Printer,
  Share2,
  Eye,
  Clock,
  Calendar,
  User,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Percent,
  Star,
  MessageSquare,
  Camera,
  Scan,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  History,
  Archive,
  Trash2,
  Edit,
  Plus,
  Settings,
  Bell,
  Shield,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
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
  Star as StarIcon,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Thermometer,
  Droplet,
  Umbrella,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Sun,
  Moon,
  CloudOff,
  CloudDrizzle,
  CloudFog,
  Wind,
  Snowflake,
  ThermometerSun,
  ThermometerSnowflake,
  Droplet as DropletIcon,
  Umbrella as UmbrellaIcon,
  CloudRain as CloudRainIcon,
  CloudLightning as CloudLightningIcon,
  CloudSnow as CloudSnowIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  CloudOff as CloudOffIcon,
  CloudDrizzle as CloudDrizzleIcon,
  CloudFog as CloudFogIcon,
  Wind as WindIcon,
  Snowflake as SnowflakeIcon,
  ThermometerSun as ThermometerSunIcon,
  ThermometerSnowflake as ThermometerSnowflakeIcon
} from 'lucide-react';

interface Voucher {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  validationStatus: 'pending' | 'valid' | 'invalid' | 'expired';
  createdAt: string;
  usedAt?: string;
  usedBy?: string;
  location?: string;
  device?: string;
  notes: string;
  qrCode: string;
  barcode: string;
  validityPeriod: string;
  remainingUses: number;
  maxUses: number;
  category: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface ValidationLog {
  id: string;
  voucherId: string;
  voucherCode: string;
  validationStatus: 'success' | 'failed' | 'expired' | 'already_used';
  validatedAt: string;
  validatedBy: string;
  location: string;
  device: string;
  ipAddress: string;
  userAgent: string;
  notes: string;
  amount: number;
  customerName: string;
  serviceType: string;
}

const ValidationPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([
    {
      id: 'VOU001',
      code: 'VOU2025001',
      customerName: 'Maria Silva',
      customerEmail: 'maria.silva@email.com',
      customerPhone: '(11) 99999-9999',
      serviceType: 'Hotel',
      destination: 'Rio de Janeiro',
      checkIn: '2025-08-15',
      checkOut: '2025-08-20',
      guests: 2,
      totalAmount: 2500.00,
      status: 'active',
      validationStatus: 'pending',
      createdAt: '2025-07-25',
      notes: 'Voucher VIP com benefícios especiais',
      qrCode: 'VOU2025001_QR',
      barcode: '1234567890123',
      validityPeriod: '2025-12-31',
      remainingUses: 1,
      maxUses: 1,
      category: 'Premium',
      priority: 'high',
      tags: ['VIP', 'Premium', 'Hotel']
    },
    {
      id: 'VOU002',
      code: 'VOU2025002',
      customerName: 'Carlos Oliveira',
      customerEmail: 'carlos.oliveira@email.com',
      customerPhone: '(21) 88888-8888',
      serviceType: 'Pacote',
      destination: 'Fernando de Noronha',
      checkIn: '2025-09-10',
      checkOut: '2025-09-15',
      guests: 4,
      totalAmount: 4500.00,
      status: 'used',
      validationStatus: 'valid',
      createdAt: '2025-07-26',
      usedAt: '2025-08-01',
      usedBy: 'João Santos',
      location: 'São Paulo, SP',
      device: 'iPhone 13',
      notes: 'Pacote completo com passeios',
      qrCode: 'VOU2025002_QR',
      barcode: '1234567890124',
      validityPeriod: '2025-12-31',
      remainingUses: 0,
      maxUses: 1,
      category: 'Standard',
      priority: 'medium',
      tags: ['Pacote', 'Ilha', 'Passeios']
    },
    {
      id: 'VOU003',
      code: 'VOU2025003',
      customerName: 'Patrícia Lima',
      customerEmail: 'patricia.lima@email.com',
      customerPhone: '(31) 77777-7777',
      serviceType: 'Voo',
      destination: 'São Paulo',
      checkIn: '2025-08-05',
      checkOut: '2025-08-05',
      guests: 1,
      totalAmount: 800.00,
      status: 'expired',
      validationStatus: 'expired',
      createdAt: '2025-07-20',
      notes: 'Voo executivo',
      qrCode: 'VOU2025003_QR',
      barcode: '1234567890125',
      validityPeriod: '2025-07-31',
      remainingUses: 1,
      maxUses: 1,
      category: 'Economy',
      priority: 'low',
      tags: ['Voo', 'Executivo']
    }
  ]);

  const [validationLogs, setValidationLogs] = useState<ValidationLog[]>([
    {
      id: 'LOG001',
      voucherId: 'VOU002',
      voucherCode: 'VOU2025002',
      validationStatus: 'success',
      validatedAt: '2025-08-01 14:30:00',
      validatedBy: 'João Santos',
      location: 'São Paulo, SP',
      device: 'iPhone 13',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      notes: 'Validação realizada com sucesso',
      amount: 4500.00,
      customerName: 'Carlos Oliveira',
      serviceType: 'Pacote'
    },
    {
      id: 'LOG002',
      voucherId: 'VOU003',
      voucherCode: 'VOU2025003',
      validationStatus: 'expired',
      validatedAt: '2025-08-02 10:15:00',
      validatedBy: 'Ana Costa',
      location: 'Belo Horizonte, MG',
      device: 'Samsung Galaxy S21',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Linux; Android 11)',
      notes: 'Voucher expirado',
      amount: 800.00,
      customerName: 'Patrícia Lima',
      serviceType: 'Voo'
    }
  ]);

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'vouchers' | 'validation' | 'reports'>('vouchers');

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    used: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  const validationStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    valid: 'bg-green-100 text-green-800',
    invalid: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesStatus = filterStatus === 'all' || voucher.status === filterStatus;
    const matchesSearch = voucher.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => v.status === 'active').length,
    used: vouchers.filter(v => v.status === 'used').length,
    expired: vouchers.filter(v => v.status === 'expired').length,
    cancelled: vouchers.filter(v => v.status === 'cancelled').length,
    totalValue: vouchers.reduce((sum, v) => sum + v.totalAmount, 0),
    totalValidations: validationLogs.length,
    successRate: validationLogs.filter(log => log.validationStatus === 'success').length / validationLogs.length * 100
  };

  const handleValidation = (voucherCode: string) => {
    const voucher = vouchers.find(v => v.code === voucherCode);
    if (voucher) {
      if (voucher.status === 'active' && new Date() <= new Date(voucher.validityPeriod)) {
        // Valid voucher
        setVouchers(prev => prev.map(v => 
          v.code === voucherCode 
            ? { ...v, status: 'used', validationStatus: 'valid', usedAt: new Date().toISOString() }
            : v
        ));
        
        // Add to validation log
        const newLog: ValidationLog = {
          id: `LOG${Date.now()}`,
          voucherId: voucher.id,
          voucherCode: voucher.code,
          validationStatus: 'success',
          validatedAt: new Date().toISOString(),
          validatedBy: 'Sistema',
          location: 'São Paulo, SP',
          device: 'Scanner',
          ipAddress: '192.168.1.100',
          userAgent: 'Validation System',
          notes: 'Validação realizada com sucesso',
          amount: voucher.totalAmount,
          customerName: voucher.customerName,
          serviceType: voucher.serviceType
        };
        setValidationLogs(prev => [newLog, ...prev]);
        
        alert('✅ Voucher válido! Validação realizada com sucesso.');
      } else if (voucher.status === 'used') {
        alert('❌ Voucher já foi utilizado!');
      } else if (new Date() > new Date(voucher.validityPeriod)) {
        alert('❌ Voucher expirado!');
      } else {
        alert('❌ Voucher inválido!');
      }
    } else {
      alert('❌ Voucher não encontrado!');
    }
  };

  const handleScanCode = () => {
    if (scannedCode) {
      handleValidation(scannedCode);
      setScannedCode('');
      setShowScanner(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <QrCode className="mr-3 h-8 w-8 text-blue-600" />
                Validação de Vouchers
              </h1>
              <p className="text-gray-600 mt-2">Valide vouchers e gerencie o histórico de validações</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowScanner(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center font-medium transition-colors"
              >
                <Camera className="mr-2 h-5 w-5" />
                Scanner QR Code
              </button>
              <button
                onClick={() => setShowScanner(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center font-medium transition-colors"
              >
                <Search className="mr-2 h-5 w-5" />
                Buscar Voucher
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <QrCode className="h-6 w-6 text-blue-600" />
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
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Validações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalValidations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('vouchers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'vouchers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vouchers
              </button>
              <button
                onClick={() => setActiveTab('validation')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'validation'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Histórico de Validações
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Relatórios
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'vouchers' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por código, cliente ou destino..."
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
                    <option value="active">Ativo</option>
                    <option value="used">Usado</option>
                    <option value="expired">Expirado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vouchers List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voucher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serviço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Validade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVouchers.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{voucher.code}</div>
                            <div className="text-sm text-gray-500">{voucher.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{voucher.customerName}</div>
                            <div className="text-sm text-gray-500">{voucher.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{voucher.serviceType}</div>
                            <div className="text-sm text-gray-500">{voucher.destination}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            R$ {voucher.totalAmount.toLocaleString('pt-BR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[voucher.status]}`}>
                            {voucher.status === 'active' && 'Ativo'}
                            {voucher.status === 'used' && 'Usado'}
                            {voucher.status === 'expired' && 'Expirado'}
                            {voucher.status === 'cancelled' && 'Cancelado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(voucher.validityPeriod).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {voucher.remainingUses}/{voucher.maxUses} usos
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedVoucher(voucher);
                                setShowModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {voucher.status === 'active' && (
                              <button
                                onClick={() => handleValidation(voucher.code)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
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

        {activeTab === 'validation' && (
          <div>
            {/* Validation Logs */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Validado Por
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localização
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dispositivo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {validationLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(log.validatedAt).toLocaleString('pt-BR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.voucherCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.customerName}</div>
                          <div className="text-sm text-gray-500">{log.serviceType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            log.validationStatus === 'success' ? 'bg-green-100 text-green-800' :
                            log.validationStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            log.validationStatus === 'expired' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.validationStatus === 'success' && 'Sucesso'}
                            {log.validationStatus === 'failed' && 'Falha'}
                            {log.validationStatus === 'expired' && 'Expirado'}
                            {log.validationStatus === 'already_used' && 'Já Usado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.validatedBy}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.device}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Validation Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estatísticas de Validação</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Validações</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalValidations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Sucesso</span>
                  <span className="text-sm font-medium text-gray-900">{stats.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vouchers Ativos</span>
                  <span className="text-sm font-medium text-gray-900">{stats.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor Total</span>
                  <span className="text-sm font-medium text-gray-900">
                    R$ {stats.totalValue.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade Recente</h3>
              <div className="space-y-3">
                {validationLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.validationStatus === 'success' ? 'bg-green-500' :
                      log.validationStatus === 'failed' ? 'bg-red-500' :
                      log.validationStatus === 'expired' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{log.voucherCode}</p>
                      <p className="text-xs text-gray-500">{log.customerName}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.validatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QR Code Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Scanner QR Code
                  </h3>
                  <button
                    onClick={() => setShowScanner(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="text-center">
                  <div className="bg-gray-100 rounded-lg p-8 mb-4">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Posicione o QR code na área de captura</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <Scan className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Área de Captura</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ou digite o código manualmente:
                    </label>
                    <input
                      type="text"
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                      placeholder="Digite o código do voucher..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowScanner(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleScanCode}
                      className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Validar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voucher Details Modal */}
        {showModal && selectedVoucher && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalhes do Voucher - {selectedVoucher.code}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Voucher Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações do Voucher</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Código:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedVoucher.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Categoria:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedVoucher.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedVoucher.status]}`}>
                          {selectedVoucher.status === 'active' && 'Ativo'}
                          {selectedVoucher.status === 'used' && 'Usado'}
                          {selectedVoucher.status === 'expired' && 'Expirado'}
                          {selectedVoucher.status === 'cancelled' && 'Cancelado'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Validade:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedVoucher.validityPeriod).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações do Cliente</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nome:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedVoucher.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedVoucher.customerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Telefone:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedVoucher.customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações do Serviço</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tipo:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedVoucher.serviceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Destino:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedVoucher.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Hóspedes:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedVoucher.guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor:</span>
                        <span className="text-sm font-medium text-gray-900">
                          R$ {selectedVoucher.totalAmount.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações de Uso</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Usos Restantes:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedVoucher.remainingUses}/{selectedVoucher.maxUses}
                        </span>
                      </div>
                      {selectedVoucher.usedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Usado em:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(selectedVoucher.usedAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      )}
                      {selectedVoucher.usedBy && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Usado por:</span>
                          <span className="text-sm font-medium text-gray-900">{selectedVoucher.usedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">QR Code</h4>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <QrCode className="h-32 w-32 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{selectedVoucher.qrCode}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVoucher.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                  {selectedVoucher.status === 'active' && (
                    <button
                      onClick={() => {
                        handleValidation(selectedVoucher.code);
                        setShowModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                    >
                      Validar Voucher
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationPage; 