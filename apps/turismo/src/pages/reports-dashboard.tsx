import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Target,
  Eye,
  Clock,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Mail,
  Printer,
  Archive
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';
import { useToast } from '../components/ToastContainer';

interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  lastGenerated?: string;
  schedule?: string;
  recipients?: string[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
}

interface ReportData {
  id: string;
  name: string;
  type: string;
  status: 'completed' | 'processing' | 'failed' | 'scheduled';
  createdAt: string;
  completedAt?: string;
  size: string;
  format: string;
  downloadUrl?: string;
}

interface ReportMetrics {
  totalReports: number;
  completedReports: number;
  failedReports: number;
  scheduledReports: number;
  totalRecipients: number;
  averageGenerationTime: number;
  storageUsed: string;
  reportsByCategory: {
    financial: number;
    marketing: number;
    sales: number;
    analytics: number;
    operational: number;
  };
  recentReports: ReportData[];
  popularTemplates: ReportTemplate[];
}

const ReportsDashboard: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalReports: 0,
    completedReports: 0,
    failedReports: 0,
    scheduledReports: 0,
    totalRecipients: 0,
    averageGenerationTime: 0,
    storageUsed: '0 MB',
    reportsByCategory: {
      financial: 0,
      marketing: 0,
      sales: 0,
      analytics: 0,
      operational: 0
    },
    recentReports: [],
    popularTemplates: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');

  // Templates de relatórios disponíveis
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'financial-summary',
      name: 'Relatório Financeiro Mensal',
      category: 'financial',
      description: 'Resumo completo das finanças do mês',
      icon: 'DollarSign',
      format: 'pdf'
    },
    {
      id: 'sales-performance',
      name: 'Performance de Vendas',
      category: 'sales',
      description: 'Análise detalhada do desempenho de vendas',
      icon: 'ShoppingCart',
      format: 'excel'
    },
    {
      id: 'marketing-campaigns',
      name: 'Relatório de Campanhas',
      category: 'marketing',
      description: 'Resultados das campanhas de marketing',
      icon: 'Target',
      format: 'pdf'
    },
    {
      id: 'user-analytics',
      name: 'Analytics de Usuários',
      category: 'analytics',
      description: 'Comportamento e métricas dos usuários',
      icon: 'Users',
      format: 'csv'
    },
    {
      id: 'operational-kpis',
      name: 'KPIs Operacionais',
      category: 'operational',
      description: 'Indicadores de performance operacional',
      icon: 'BarChart3',
      format: 'excel'
    },
    {
      id: 'revenue-analysis',
      name: 'Análise de Receita',
      category: 'financial',
      description: 'Análise detalhada da receita por período',
      icon: 'TrendingUp',
      format: 'pdf'
    },
    {
      id: 'customer-segments',
      name: 'Segmentação de Clientes',
      category: 'analytics',
      description: 'Análise de segmentos de clientes',
      icon: 'Users',
      format: 'excel'
    },
    {
      id: 'inventory-status',
      name: 'Status do Inventário',
      category: 'operational',
      description: 'Relatório de estoque e disponibilidade',
      icon: 'Archive',
      format: 'csv'
    }
  ];

  useEffect(() => {
    loadReportsData();
  }, [dateRange]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      // Simular dados de relatórios (em produção, viria da API)
      const mockData: ReportMetrics = {
        totalReports: 156,
        completedReports: 142,
        failedReports: 8,
        scheduledReports: 6,
        totalRecipients: 45,
        averageGenerationTime: 2.5,
        storageUsed: '2.4 GB',
        reportsByCategory: {
          financial: 45,
          marketing: 32,
          sales: 38,
          analytics: 28,
          operational: 13
        },
        recentReports: [
          {
            id: 'RPT-001',
            name: 'Relatório Financeiro Dezembro 2024',
            type: 'financial',
            status: 'completed',
            createdAt: '2024-12-15 09:30',
            completedAt: '2024-12-15 09:32',
            size: '2.4 MB',
            format: 'pdf',
            downloadUrl: '/reports/financial-dec-2024.pdf'
          },
          {
            id: 'RPT-002',
            name: 'Performance de Vendas Q4',
            type: 'sales',
            status: 'completed',
            createdAt: '2024-12-14 14:15',
            completedAt: '2024-12-14 14:18',
            size: '1.8 MB',
            format: 'excel',
            downloadUrl: '/reports/sales-q4-2024.xlsx'
          },
          {
            id: 'RPT-003',
            name: 'Campanhas Marketing Novembro',
            type: 'marketing',
            status: 'processing',
            createdAt: '2024-12-15 10:00',
            size: '0 MB',
            format: 'pdf'
          },
          {
            id: 'RPT-004',
            name: 'Analytics de Usuários',
            type: 'analytics',
            status: 'failed',
            createdAt: '2024-12-14 16:30',
            size: '0 MB',
            format: 'csv'
          },
          {
            id: 'RPT-005',
            name: 'KPIs Operacionais',
            type: 'operational',
            status: 'scheduled',
            createdAt: '2024-12-15 08:00',
            size: '0 MB',
            format: 'excel'
          }
        ],
        popularTemplates: [
          reportTemplates[0], // Financial Summary
          reportTemplates[1], // Sales Performance
          reportTemplates[2], // Marketing Campaigns
          reportTemplates[3]  // User Analytics
        ]
      };
      
      setMetrics(mockData);
      showSuccess('Sucesso', 'Dados de relatórios carregados com sucesso');
    } catch (error) {
      showError('Erro', 'Falha ao carregar dados de relatórios');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (template: ReportTemplate) => {
    try {
      showSuccess('Sucesso', `Gerando relatório: ${template.name}`);
      // Simular geração de relatório
      setTimeout(() => {
        showSuccess('Sucesso', `Relatório "${template.name}" gerado com sucesso!`);
      }, 2000);
    } catch (error) {
      showError('Erro', 'Falha ao gerar relatório');
    }
  };

  const downloadReport = (report: ReportData) => {
    if (report.status === 'completed' && report.downloadUrl) {
      showSuccess('Sucesso', `Baixando relatório: ${report.name}`);
      // Simular download
      window.open(report.downloadUrl, '_blank');
    } else {
      showError('Erro', 'Relatório não está disponível para download');
    }
  };

  const scheduleReport = (template: ReportTemplate) => {
    showSuccess('Sucesso', `Agendando relatório: ${template.name}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'sales': return <ShoppingCart className="h-4 w-4" />;
      case 'marketing': return <Target className="h-4 w-4" />;
      case 'analytics': return <Users className="h-4 w-4" />;
      case 'operational': return <BarChart3 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredTemplates = reportTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesFormat = selectedFormat === 'all' || template.format === selectedFormat;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesFormat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Carregando dados de relatórios...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Relatórios Avançados</h1>
          <p className="text-gray-600">Geração, agendamento e gestão de relatórios especializados</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadReportsData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Relatórios</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalReports}</p>
              <p className="text-sm text-gray-500 mt-1">Gerados este mês</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Concluídos</p>
              <p className="text-2xl font-bold text-green-600">{metrics.completedReports}</p>
              <p className="text-sm text-gray-500 mt-1">91% de sucesso</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.averageGenerationTime}s</p>
              <p className="text-sm text-gray-500 mt-1">Por relatório</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Armazenamento</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.storageUsed}</p>
              <p className="text-sm text-gray-500 mt-1">Utilizado</p>
            </div>
            <Archive className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Relatórios</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as categorias</option>
              <option value="financial">Financeiro</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Vendas</option>
              <option value="analytics">Analytics</option>
              <option value="operational">Operacional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os formatos</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates de Relatórios */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates de Relatórios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(template.category)}
                  <span className="text-sm font-medium text-gray-900">{template.name}</span>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase">
                  {template.format}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => generateReport(template)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  <span>Gerar</span>
                </button>
                <button
                  onClick={() => scheduleReport(template)}
                  className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  title="Agendar"
                >
                  <Calendar className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relatórios Recentes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios Recentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relatório</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.recentReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.name}</div>
                    <div className="text-sm text-gray-500">{report.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(report.type)}
                      <span className="text-sm text-gray-900 capitalize">{report.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {report.status === 'completed' && (
                        <button
                          onClick={() => downloadReport(report)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        title="Compartilhar"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        title="Enviar por Email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relatórios por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios por Categoria</h3>
          <div className="space-y-3">
            {Object.entries(metrics.reportsByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(category)}
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / metrics.totalReports) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates Populares</h3>
          <div className="space-y-3">
            {metrics.popularTemplates.map((template, index) => (
              <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.category}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase">
                  {template.format}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <FileText className="h-4 w-4" />
            <span>Novo Relatório</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Calendar className="h-4 w-4" />
            <span>Agendar Lote</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <Archive className="h-4 w-4" />
            <span>Arquivar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard; 
