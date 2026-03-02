import React, { useState, useMemo } from 'react';
import { Download, FileText, BarChart3, PieChart, TrendingUp, Calendar, Filter, RefreshCw, Eye, Printer, Mail, Share2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

export interface ReportConfig {
  id: string;
  name: string;
  type: 'financial' | 'operational' | 'customer' | 'marketing';
  format: 'pdf' | 'excel' | 'csv';
  schedule?: 'daily' | 'weekly' | 'monthly';
  filters: ReportFilters;
}

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  destinations?: string[];
  customerSegments?: string[];
  bookingStatus?: string[];
  minValue?: number;
  maxValue?: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportConfig['type'];
  icon: React.ReactNode;
  popular?: boolean;
}

export interface ReportGeneratorProps {
  className?: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'financial-summary',
    name: 'Resumo Financeiro',
    description: 'Relatório completo de receitas, despesas e lucros',
    type: 'financial',
    icon: <BarChart3 className="w-5 h-5" />,
    popular: true,
  },
  {
    id: 'operational-metrics',
    name: 'Métricas Operacionais',
    description: 'KPIs de performance e eficiência operacional',
    type: 'operational',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: 'customer-analysis',
    name: 'Análise de Clientes',
    description: 'Comportamento, segmentação e satisfação dos clientes',
    type: 'customer',
    icon: <PieChart className="w-5 h-5" />,
    popular: true,
  },
  {
    id: 'marketing-performance',
    name: 'Performance de Marketing',
    description: 'Efetividade de campanhas e canais de aquisição',
    type: 'marketing',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: 'destination-report',
    name: 'Relatório por Destino',
    description: 'Análise detalhada por destino turístico',
    type: 'operational',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    id: 'seasonal-analysis',
    name: 'Análise Sazonal',
    description: 'Tendências e padrões sazonais de negócio',
    type: 'operational',
    icon: <TrendingUp className="w-5 h-5" />,
  },
];

const destinationOptions: SelectOption[] = [
  { value: 'caldas-novas', label: 'Caldas Novas' },
  { value: 'rio-janeiro', label: 'Rio de Janeiro' },
  { value: 'sao-paulo', label: 'São Paulo' },
  { value: 'salvador', label: 'Salvador' },
  { value: 'recife', label: 'Recife' },
  { value: 'fortaleza', label: 'Fortaleza' },
  { value: 'gramado', label: 'Gramado' },
  { value: 'bonito', label: 'Bonito' },
];

const customerSegmentOptions: SelectOption[] = [
  { value: 'premium', label: 'Premium' },
  { value: 'business', label: 'Business' },
  { value: 'leisure', label: 'Leisure' },
  { value: 'group', label: 'Group' },
  { value: 'family', label: 'Family' },
  { value: 'couple', label: 'Couple' },
];

const bookingStatusOptions: SelectOption[] = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'pending', label: 'Pendente' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'completed', label: 'Concluído' },
];

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ className }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    id: '',
    name: '',
    type: 'financial',
    format: 'pdf',
    filters: {
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    },
  });

  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setReportConfig(prev => ({
      ...prev,
      id: template.id,
      name: template.name,
      type: template.type,
    }));
    setIsConfigModalOpen(true);
  };

  const handleGenerateReport = () => {
    // Simular geração de relatório
    console.log('Gerando relatório:', reportConfig);
    setIsConfigModalOpen(false);
    // Aqui você implementaria a lógica real de geração
    setTimeout(() => {
      setIsPreviewModalOpen(true);
    }, 2000);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exportando relatório em ${format.toUpperCase()}`);
    // Implementar lógica de exportação
  };

  const handleSchedule = () => {
    console.log('Agendando relatório:', reportConfig);
    // Implementar lógica de agendamento
  };

  const popularTemplates = reportTemplates.filter(t => t.popular);
  const otherTemplates = reportTemplates.filter(t => !t.popular);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerador de Relatórios</h2>
          <p className="text-gray-600">Crie relatórios personalizados e agende entregas automáticas</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Templates Populares */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates Populares</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTemplates.map((template) => (
            <Card
              key={template.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-100 hover:border-blue-300"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {template.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Popular
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Outros Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Todos os Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherTemplates.map((template) => (
            <Card
              key={template.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  {template.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal de Configuração */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configurar Relatório"
        size="lg"
      >
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Informações do Relatório</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Relatório
                </label>
                <Input
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome do relatório"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formato
                </label>
                <Select
                  value={reportConfig.format}
                  onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value as 'pdf' | 'excel' | 'csv' }))}
                  options={[
                    { value: 'pdf', label: 'PDF' },
                    { value: 'excel', label: 'Excel' },
                    { value: 'csv', label: 'CSV' },
                  ]}
                  placeholder="Selecionar formato"
                />
              </div>
            </div>
          </div>

          {/* Filtros de Data */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Período</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Final
                </label>
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Filtros Avançados */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Filtros Avançados</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destinos
                </label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const newDestinations = filters.destinations || [];
                    if (!newDestinations.includes(value)) {
                      setFilters(prev => ({
                        ...prev,
                        destinations: [...(prev.destinations || []), value]
                      }));
                    }
                  }}
                  options={destinationOptions}
                  placeholder="Selecionar destinos"
                />
                {filters.destinations && filters.destinations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {filters.destinations.map((dest) => (
                      <Badge
                        key={dest}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          destinations: prev.destinations?.filter(d => d !== dest)
                        }))}
                      >
                        {destinationOptions.find(opt => opt.value === dest)?.label}
                        <span className="ml-1">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segmentos de Cliente
                </label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const newSegments = filters.customerSegments || [];
                    if (!newSegments.includes(value)) {
                      setFilters(prev => ({
                        ...prev,
                        customerSegments: [...(prev.customerSegments || []), value]
                      }));
                    }
                  }}
                  options={customerSegmentOptions}
                  placeholder="Selecionar segmentos"
                />
                {filters.customerSegments && filters.customerSegments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {filters.customerSegments.map((seg) => (
                      <Badge
                        key={seg}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          customerSegments: prev.customerSegments?.filter(s => s !== seg)
                        }))}
                      >
                        {customerSegmentOptions.find(opt => opt.value === seg)?.label}
                        <span className="ml-1">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Faixa de Valores */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Faixa de Valores</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mínimo
                </label>
                <Input
                  type="number"
                  placeholder="R$ 0,00"
                  value={filters.minValue || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    minValue: e.target.value ? Number(e.target.value) : undefined
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Máximo
                </label>
                <Input
                  type="number"
                  placeholder="R$ 10.000,00"
                  value={filters.maxValue || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    maxValue: e.target.value ? Number(e.target.value) : undefined
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Agendamento */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Agendamento (Opcional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência
                </label>
                <Select
                  value={reportConfig.schedule || ''}
                  onValueChange={(value) => setReportConfig(prev => ({ 
                    ...prev, 
                    schedule: value as 'daily' | 'weekly' | 'monthly' | undefined 
                  }))}
                  options={[
                    { value: '', label: 'Sem agendamento' },
                    { value: 'daily', label: 'Diário' },
                    { value: 'weekly', label: 'Semanal' },
                    { value: 'monthly', label: 'Mensal' },
                  ]}
                  placeholder="Selecionar frequência"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
            Cancelar
          </Button>
          {reportConfig.schedule && (
            <Button variant="outline" onClick={handleSchedule}>
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          )}
          <Button onClick={handleGenerateReport}>
            <FileText className="w-4 h-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </Modal>

      {/* Modal de Preview */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Preview do Relatório"
        size="xl"
      >
        <div className="space-y-6">
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Relatório "{reportConfig.name}" Gerado com Sucesso!
            </h3>
            <p className="text-gray-600 mb-6">
              Seu relatório está pronto para visualização e download.
            </p>
            
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
              <Button onClick={() => handleExport(reportConfig.format)}>
                <Download className="w-4 h-4 mr-2" />
                Download {reportConfig.format.toUpperCase()}
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Ações Rápidas</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                <FileText className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <FileText className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Compartilhar</h4>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Link
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { ReportGenerator };
export type { ReportConfig, ReportFilters, ReportTemplate, ReportGeneratorProps };
