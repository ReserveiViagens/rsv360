// ===================================================================
// REPORT BUILDER - CONSTRUTOR DE RELATÓRIOS AVANÇADO
// ===================================================================

import React, { useState, useRef } from 'react';
import {
  Download,
  FileText,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  DollarSign,
  MapPin,
  Star,
  Settings,
  Eye,
  Share2,
  Mail,
  Printer
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface ReportConfig {
  title: string;
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: string[];
  charts: string[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeData: boolean;
  includeInsights: boolean;
}

interface ReportBuilderProps {
  data: any;
  onGenerateReport: (config: ReportConfig) => void;
}

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const ReportBuilder: React.FC<ReportBuilderProps> = ({ data, onGenerateReport }) => {
  const [config, setConfig] = useState<ReportConfig>({
    title: 'Relatório de Performance',
    description: 'Análise completa do negócio de viagens',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    metrics: ['revenue', 'bookings', 'customers'],
    charts: ['revenue', 'bookings'],
    format: 'pdf',
    includeCharts: true,
    includeData: true,
    includeInsights: true
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // ===================================================================
  // OPÇÕES DISPONÍVEIS
  // ===================================================================

  const availableMetrics = [
    { id: 'revenue', name: 'Receita', icon: DollarSign, description: 'Receita total e por período' },
    { id: 'bookings', name: 'Reservas', icon: Calendar, description: 'Número de reservas e status' },
    { id: 'customers', name: 'Clientes', icon: Users, description: 'Segmentação e comportamento' },
    { id: 'destinations', name: 'Destinos', icon: MapPin, description: 'Performance por destino' },
    { id: 'ratings', name: 'Avaliações', icon: Star, description: 'Satisfação dos clientes' },
    { id: 'conversion', name: 'Conversão', icon: BarChart3, description: 'Taxa de conversão' }
  ];

  const availableCharts = [
    { id: 'revenue', name: 'Gráfico de Receita', icon: LineChart, description: 'Evolução da receita ao longo do tempo' },
    { id: 'bookings', name: 'Status das Reservas', icon: BarChart3, description: 'Distribuição por status' },
    { id: 'customers', name: 'Segmentos de Clientes', icon: PieChart, description: 'Distribuição por segmento' },
    { id: 'destinations', name: 'Top Destinos', icon: MapPin, description: 'Performance por destino' }
  ];

  const exportFormats = [
    { id: 'pdf', name: 'PDF', description: 'Relatório completo com gráficos' },
    { id: 'excel', name: 'Excel', description: 'Dados em planilha editável' },
    { id: 'csv', name: 'CSV', description: 'Dados em formato CSV' },
    { id: 'json', name: 'JSON', description: 'Dados em formato JSON' }
  ];

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleConfigChange = (key: keyof ReportConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMetricToggle = (metricId: string) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(id => id !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const handleChartToggle = (chartId: string) => {
    setConfig(prev => ({
      ...prev,
      charts: prev.charts.includes(chartId)
        ? prev.charts.filter(id => id !== chartId)
        : [...prev.charts, chartId]
    }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simular geração de relatório
    setTimeout(() => {
      onGenerateReport(config);
      setIsGenerating(false);
    }, 2000);
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Construtor de Relatórios</h2>
            <p className="text-gray-600">Crie relatórios personalizados com dados e gráficos</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Editar' : 'Visualizar'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!previewMode ? (
          <div className="space-y-6">
            {/* Configurações Básicas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Relatório
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o título do relatório"
                    title="Título do relatório"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato de Exportação
                  </label>
                  <select
                    value={config.format}
                    onChange={(e) => handleConfigChange('format', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Formato de exportação do relatório"
                    aria-label="Selecionar formato de exportação"
                  >
                    {exportFormats.map(format => (
                      <option key={format.id} value={format.id}>
                        {format.name} - {format.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={config.description}
                  onChange={(e) => handleConfigChange('description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite uma descrição para o relatório"
                  title="Descrição do relatório"
                />
              </div>
            </div>

            {/* Período */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Período de Análise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={config.dateRange.start}
                    onChange={(e) => handleConfigChange('dateRange', {
                      ...config.dateRange,
                      start: e.target.value
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Data inicial do período de análise"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={config.dateRange.end}
                    onChange={(e) => handleConfigChange('dateRange', {
                      ...config.dateRange,
                      end: e.target.value
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Data final do período de análise"
                  />
                </div>
              </div>
            </div>

            {/* Métricas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas Incluídas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableMetrics.map(metric => (
                  <div
                    key={metric.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      config.metrics.includes(metric.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleMetricToggle(metric.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <metric.icon className={`w-5 h-5 ${
                        config.metrics.includes(metric.id) ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{metric.name}</h4>
                        <p className="text-sm text-gray-600">{metric.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráficos */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gráficos Incluídos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCharts.map(chart => (
                  <div
                    key={chart.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      config.charts.includes(chart.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleChartToggle(chart.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <chart.icon className={`w-5 h-5 ${
                        config.charts.includes(chart.id) ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{chart.name}</h4>
                        <p className="text-sm text-gray-600">{chart.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opções Adicionais */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Opções Adicionais</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.includeCharts}
                    onChange={(e) => handleConfigChange('includeCharts', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Incluir gráficos no relatório</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.includeData}
                    onChange={(e) => handleConfigChange('includeData', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Incluir dados brutos</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.includeInsights}
                    onChange={(e) => handleConfigChange('includeInsights', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Incluir insights e recomendações</span>
                </label>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => setPreviewMode(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                <span>Visualizar</span>
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isGenerating ? 'Gerando...' : 'Gerar Relatório'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Preview do Relatório */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
              <p className="text-gray-600 mt-2">{config.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                Período: {new Date(config.dateRange.start).toLocaleDateString('pt-BR')} - {new Date(config.dateRange.end).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.metrics.map(metricId => {
                const metric = availableMetrics.find(m => m.id === metricId);
                if (!metric) return null;
                
                return (
                  <div key={metricId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <metric.icon className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">{metric.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setPreviewMode(false)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Gerar Relatório</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportBuilder;
