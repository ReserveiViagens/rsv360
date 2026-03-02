'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Settings,
  Eye,
  Share2,
  Save,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage';
  label: string;
  required: boolean;
  category: 'customer' | 'booking' | 'financial' | 'analytics' | 'marketing';
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  fields: ReportField[];
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  filters: string[];
}

interface ReportConfig {
  id: string;
  name: string;
  template: string;
  fields: string[];
  filters: Record<string, any>;
  dateRange: {
    start: string;
    end: string;
  };
  chartType?: string;
  format: 'pdf' | 'excel' | 'csv';
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    email: string;
  };
}

// ===================================================================
// DADOS MOCK
// ===================================================================

const reportTemplates: ReportTemplate[] = [
  {
    id: 'customer-analysis',
    name: 'Análise de Clientes',
    description: 'Relatório completo de análise de clientes e comportamento',
    category: 'customer',
    icon: <Users className="w-5 h-5" />,
    fields: [
      { id: 'customer_name', name: 'customer_name', type: 'text', label: 'Nome do Cliente', required: true, category: 'customer' },
      { id: 'total_bookings', name: 'total_bookings', type: 'number', label: 'Total de Reservas', required: true, category: 'customer' },
      { id: 'total_spent', name: 'total_spent', type: 'currency', label: 'Valor Total Gasto', required: true, category: 'customer' },
      { id: 'last_booking', name: 'last_booking', type: 'date', label: 'Última Reserva', required: false, category: 'customer' },
      { id: 'satisfaction_rate', name: 'satisfaction_rate', type: 'percentage', label: 'Taxa de Satisfação', required: false, category: 'customer' }
    ],
    chartType: 'bar',
    filters: ['date_range', 'customer_segment', 'booking_status']
  },
  {
    id: 'financial-summary',
    name: 'Resumo Financeiro',
    description: 'Relatório de receitas, despesas e lucratividade',
    category: 'financial',
    icon: <DollarSign className="w-5 h-5" />,
    fields: [
      { id: 'revenue', name: 'revenue', type: 'currency', label: 'Receita Total', required: true, category: 'financial' },
      { id: 'expenses', name: 'expenses', type: 'currency', label: 'Despesas', required: true, category: 'financial' },
      { id: 'profit', name: 'profit', type: 'currency', label: 'Lucro', required: true, category: 'financial' },
      { id: 'profit_margin', name: 'profit_margin', type: 'percentage', label: 'Margem de Lucro', required: true, category: 'financial' },
      { id: 'booking_count', name: 'booking_count', type: 'number', label: 'Número de Reservas', required: true, category: 'financial' }
    ],
    chartType: 'line',
    filters: ['date_range', 'payment_status', 'booking_type']
  },
  {
    id: 'booking-analytics',
    name: 'Analytics de Reservas',
    description: 'Análise detalhada de reservas e tendências',
    category: 'booking',
    icon: <BarChart3 className="w-5 h-5" />,
    fields: [
      { id: 'booking_id', name: 'booking_id', type: 'text', label: 'ID da Reserva', required: true, category: 'booking' },
      { id: 'destination', name: 'destination', type: 'text', label: 'Destino', required: true, category: 'booking' },
      { id: 'booking_date', name: 'booking_date', type: 'date', label: 'Data da Reserva', required: true, category: 'booking' },
      { id: 'travel_date', name: 'travel_date', type: 'date', label: 'Data da Viagem', required: true, category: 'booking' },
      { id: 'total_value', name: 'total_value', type: 'currency', label: 'Valor Total', required: true, category: 'booking' },
      { id: 'status', name: 'status', type: 'text', label: 'Status', required: true, category: 'booking' }
    ],
    chartType: 'pie',
    filters: ['date_range', 'destination', 'status', 'travel_type']
  },
  {
    id: 'marketing-performance',
    name: 'Performance de Marketing',
    description: 'Métricas de campanhas e conversões',
    category: 'marketing',
    icon: <TrendingUp className="w-5 h-5" />,
    fields: [
      { id: 'campaign_name', name: 'campaign_name', type: 'text', label: 'Nome da Campanha', required: true, category: 'marketing' },
      { id: 'impressions', name: 'impressions', type: 'number', label: 'Impressões', required: true, category: 'marketing' },
      { id: 'clicks', name: 'clicks', type: 'number', label: 'Cliques', required: true, category: 'marketing' },
      { id: 'conversions', name: 'conversions', type: 'number', label: 'Conversões', required: true, category: 'marketing' },
      { id: 'conversion_rate', name: 'conversion_rate', type: 'percentage', label: 'Taxa de Conversão', required: true, category: 'marketing' },
      { id: 'cost', name: 'cost', type: 'currency', label: 'Custo', required: true, category: 'marketing' }
    ],
    chartType: 'area',
    filters: ['date_range', 'campaign_type', 'channel']
  }
];

const mockReportData = {
  'customer-analysis': [
    { customer_name: 'João Silva', total_bookings: 5, total_spent: 12500, last_booking: '2024-01-15', satisfaction_rate: 95 },
    { customer_name: 'Maria Santos', total_bookings: 3, total_spent: 8900, last_booking: '2024-01-10', satisfaction_rate: 88 },
    { customer_name: 'Pedro Costa', total_bookings: 7, total_spent: 15600, last_booking: '2024-01-20', satisfaction_rate: 92 },
    { customer_name: 'Ana Oliveira', total_bookings: 2, total_spent: 4200, last_booking: '2024-01-05', satisfaction_rate: 90 },
    { customer_name: 'Carlos Lima', total_bookings: 4, total_spent: 9800, last_booking: '2024-01-18', satisfaction_rate: 85 }
  ],
  'financial-summary': [
    { revenue: 125000, expenses: 85000, profit: 40000, profit_margin: 32, booking_count: 45 },
    { revenue: 98000, expenses: 72000, profit: 26000, profit_margin: 26.5, booking_count: 38 },
    { revenue: 156000, expenses: 110000, profit: 46000, profit_margin: 29.5, booking_count: 52 }
  ],
  'booking-analytics': [
    { booking_id: 'RSV-001', destination: 'Fernando de Noronha', booking_date: '2024-01-15', travel_date: '2024-02-15', total_value: 2500, status: 'Confirmada' },
    { booking_id: 'RSV-002', destination: 'Caldas Novas', booking_date: '2024-01-10', travel_date: '2024-02-10', total_value: 1800, status: 'Pendente' },
    { booking_id: 'RSV-003', destination: 'Bonito', booking_date: '2024-01-20', travel_date: '2024-02-20', total_value: 3200, status: 'Confirmada' }
  ],
  'marketing-performance': [
    { campaign_name: 'Verão 2024', impressions: 50000, clicks: 2500, conversions: 125, conversion_rate: 5, cost: 5000 },
    { campaign_name: 'Férias de Julho', impressions: 75000, clicks: 3750, conversions: 188, conversion_rate: 5.01, cost: 7500 },
    { campaign_name: 'Black Friday', impressions: 100000, clicks: 8000, conversions: 400, conversion_rate: 5, cost: 10000 }
  ]
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const ReportBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    id: '',
    name: '',
    template: '',
    fields: [],
    filters: {},
    dateRange: { start: '', end: '' },
    format: 'pdf'
  });
  const [activeTab, setActiveTab] = useState<'templates' | 'config' | 'preview' | 'schedule'>('templates');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedReports, setSavedReports] = useState<ReportConfig[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setReportConfig(prev => ({
      ...prev,
      template: template.id,
      name: template.name,
      fields: template.fields.map(f => f.id)
    }));
    setActiveTab('config');
  };

  const handleFieldToggle = (fieldId: string) => {
    setReportConfig(prev => ({
      ...prev,
      fields: prev.fields.includes(fieldId)
        ? prev.fields.filter(f => f !== fieldId)
        : [...prev.fields, fieldId]
    }));
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    setReportConfig(prev => ({
      ...prev,
      filters: { ...prev.filters, [filterKey]: value }
    }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simular geração de relatório
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    setActiveTab('preview');
  };

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    
    // Simular exportação
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Aqui seria implementada a lógica real de exportação
    console.log(`Exportando relatório em formato ${format}`, reportConfig);
    
    setIsGenerating(false);
    
    // Simular download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `relatorio-${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}.${format}`;
    link.click();
  };

  const handleSaveReport = () => {
    const newReport: ReportConfig = {
      ...reportConfig,
      id: `report-${Date.now()}`
    };
    setSavedReports(prev => [...prev, newReport]);
    alert('Relatório salvo com sucesso!');
  };

  const handleScheduleReport = () => {
    setActiveTab('schedule');
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Construtor de Relatórios
          </h1>
          <p className="text-gray-600">
            Crie relatórios personalizados e exporte dados em diferentes formatos
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" /> },
                { id: 'config', label: 'Configuração', icon: <Settings className="w-4 h-4" /> },
                { id: 'preview', label: 'Visualização', icon: <Eye className="w-4 h-4" /> },
                { id: 'schedule', label: 'Agendamento', icon: <Calendar className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Escolha um Template
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reportTemplates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                          {template.icon}
                        </div>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {template.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {template.fields.length} campos
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuration Tab */}
            {activeTab === 'config' && selectedTemplate && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configurar Relatório: {selectedTemplate.name}
                  </h3>
                  <button
                    onClick={handleSaveReport}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Campos */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Campos do Relatório</h4>
                    <div className="space-y-3">
                      {selectedTemplate.fields.map(field => (
                        <label key={field.id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={reportConfig.fields.includes(field.id)}
                            onChange={() => handleFieldToggle(field.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">
                              {field.label}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({field.type})
                            </span>
                            {field.required && (
                              <span className="text-xs text-red-500 ml-1">*</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Filtros */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Filtros</h4>
                    <div className="space-y-4">
                      {/* Período */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Período
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={reportConfig.dateRange.start}
                            onChange={(e) => setReportConfig(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, start: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Data de início do período"
                          />
                          <input
                            type="date"
                            value={reportConfig.dateRange.end}
                            onChange={(e) => setReportConfig(prev => ({
                              ...prev,
                              dateRange: { ...prev.dateRange, end: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Data de fim do período"
                          />
                        </div>
                      </div>

                      {/* Filtros específicos do template */}
                      {selectedTemplate.filters.map(filter => (
                        <div key={filter}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                          <select
                            value={reportConfig.filters[filter] || ''}
                            onChange={(e) => handleFilterChange(filter, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title={`Filtro por ${filter.replace('_', ' ')}`}
                          >
                            <option value="">Todos</option>
                            <option value="option1">Opção 1</option>
                            <option value="option2">Opção 2</option>
                            <option value="option3">Opção 3</option>
                          </select>
                        </div>
                      ))}

                      {/* Formato de exportação */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Formato de Exportação
                        </label>
                        <select
                          value={reportConfig.format}
                          onChange={(e) => setReportConfig(prev => ({
                            ...prev,
                            format: e.target.value as 'pdf' | 'excel' | 'csv'
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="Selecione o formato de exportação"
                        >
                          <option value="pdf">PDF</option>
                          <option value="excel">Excel</option>
                          <option value="csv">CSV</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    ← Voltar
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleScheduleReport}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Agendar</span>
                    </button>
                    <button
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Gerando...</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Visualizar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && selectedTemplate && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Visualização do Relatório
                  </h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleExportReport('pdf')}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => handleExportReport('excel')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Excel</span>
                    </button>
                    <button
                      onClick={() => handleExportReport('csv')}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>

                {/* Preview do Relatório */}
                <div ref={reportRef} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedTemplate.name}
                    </h2>
                    <p className="text-gray-600">
                      Período: {reportConfig.dateRange.start} a {reportConfig.dateRange.end}
                    </p>
                    <p className="text-sm text-gray-500">
                      Gerado em: {new Date().toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {/* Tabela de dados */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          {reportConfig.fields.map(fieldId => {
                            const field = selectedTemplate.fields.find(f => f.id === fieldId);
                            return field ? (
                              <th key={fieldId} className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                                {field.label}
                              </th>
                            ) : null;
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {mockReportData[selectedTemplate.id as keyof typeof mockReportData]?.slice(0, 5).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {reportConfig.fields.map(fieldId => {
                              const field = selectedTemplate.fields.find(f => f.id === fieldId);
                              const value = row[fieldId as keyof typeof row];
                              
                              return field ? (
                                <td key={fieldId} className="border border-gray-300 px-4 py-2 text-gray-700">
                                  {field.type === 'currency' && typeof value === 'number' 
                                    ? `R$ ${value.toLocaleString('pt-BR')}`
                                    : field.type === 'percentage' && typeof value === 'number'
                                    ? `${value}%`
                                    : value?.toString() || '-'
                                  }
                                </td>
                              ) : null;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 text-center text-sm text-gray-500">
                    Mostrando 5 de {mockReportData[selectedTemplate.id as keyof typeof mockReportData]?.length || 0} registros
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Agendar Relatório
                </h3>
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={reportConfig.schedule?.enabled || false}
                        onChange={(e) => setReportConfig(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule!, enabled: e.target.checked }
                        }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Ativar agendamento automático
                      </span>
                    </label>
                  </div>

                  {reportConfig.schedule?.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frequência
                        </label>
                        <select
                          value={reportConfig.schedule?.frequency || 'weekly'}
                          onChange={(e) => setReportConfig(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule!, frequency: e.target.value as any }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="Selecione a frequência do agendamento"
                        >
                          <option value="daily">Diário</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Horário
                        </label>
                        <input
                          type="time"
                          value={reportConfig.schedule?.time || '09:00'}
                          onChange={(e) => setReportConfig(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule!, time: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="Horário para envio do relatório"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email para envio
                        </label>
                        <input
                          type="email"
                          value={reportConfig.schedule?.email || ''}
                          onChange={(e) => setReportConfig(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule!, email: e.target.value }
                          }))}
                          placeholder="seu@email.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="Email para receber o relatório agendado"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setActiveTab('config')}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ← Voltar
                    </button>
                    <button
                      onClick={() => {
                        alert('Agendamento configurado com sucesso!');
                        setActiveTab('preview');
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Salvar Agendamento
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Relatórios Salvos */}
        {savedReports.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Relatórios Salvos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedReports.map(report => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <div className="flex space-x-2">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Editar relatório"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Excluir relatório"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Template: {reportTemplates.find(t => t.id === report.template)?.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {report.format.toUpperCase()}
                      </span>
                      <button
                        onClick={() => handleExportReport(report.format)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Exportar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportBuilder;
