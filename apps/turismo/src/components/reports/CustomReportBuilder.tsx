import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Save, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Filter
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useUIStore } from '../../stores/useUIStore';

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: any;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: ReportField[];
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'table';
  filters: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    recipients: string[];
  };
}

interface CustomReportBuilderProps {
  onReportGenerated?: (report: any) => void;
}

const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({ 
  onReportGenerated 
}) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [customReport, setCustomReport] = useState<Partial<ReportTemplate>>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [reportData, setReportData] = useState<any>(null);
  
  const { showNotification } = useUIStore();

  // Templates pré-definidos
  const defaultTemplates: ReportTemplate[] = [
    {
      id: 'sales-report',
      name: 'Relatório de Vendas',
      description: 'Relatório detalhado de vendas por período',
      category: 'Vendas',
      fields: [
        { id: 'period', name: 'Período', type: 'select', required: true, options: ['Diário', 'Semanal', 'Mensal', 'Trimestral', 'Anual'] },
        { id: 'startDate', name: 'Data Início', type: 'date', required: true },
        { id: 'endDate', name: 'Data Fim', type: 'date', required: true },
        { id: 'groupBy', name: 'Agrupar por', type: 'select', required: false, options: ['Destino', 'Cliente', 'Agente', 'Status'] }
      ],
      chartType: 'bar',
      filters: ['status', 'destination', 'agent']
    },
    {
      id: 'customer-analysis',
      name: 'Análise de Clientes',
      description: 'Análise comportamental e preferências dos clientes',
      category: 'Clientes',
      fields: [
        { id: 'customerSegment', name: 'Segmento', type: 'select', required: false, options: ['Novos', 'Recorrentes', 'VIP', 'Inativos'] },
        { id: 'bookingCount', name: 'Mínimo de reservas', type: 'number', required: false, defaultValue: 1 },
        { id: 'totalSpent', name: 'Valor mínimo gasto', type: 'number', required: false, defaultValue: 0 }
      ],
      chartType: 'pie',
      filters: ['destination', 'season', 'age']
    },
    {
      id: 'financial-summary',
      name: 'Resumo Financeiro',
      description: 'Resumo financeiro com receitas, despesas e lucros',
      category: 'Financeiro',
      fields: [
        { id: 'year', name: 'Ano', type: 'select', required: true, options: ['2024', '2025', '2026'] },
        { id: 'includeExpenses', name: 'Incluir despesas', type: 'boolean', required: false, defaultValue: true },
        { id: 'groupByMonth', name: 'Agrupar por mês', type: 'boolean', required: false, defaultValue: true }
      ],
      chartType: 'line',
      filters: ['category', 'destination', 'payment_method']
    }
  ];

  useEffect(() => {
    setTemplates(defaultTemplates);
  }, []);

  const handleCreateReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setCustomReport({
      ...template,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      id: `${template.id}-${Date.now()}`
    });
    setShowTemplateModal(true);
  };

  const handleSaveReport = () => {
    if (!customReport.name) {
      showNotification('Nome do relatório é obrigatório', 'error');
      return;
    }

    const newReport = {
      ...customReport,
      id: customReport.id || `report-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setTemplates(prev => [...prev, newReport as ReportTemplate]);
    setShowTemplateModal(false);
    setCustomReport({});
    setSelectedTemplate(null);
    
    showNotification('Relatório salvo com sucesso!', 'success');
  };

  const handleGenerateReport = () => {
    // Simular geração de relatório
    const mockData = {
      title: customReport.name,
      generatedAt: new Date().toISOString(),
      data: {
        totalRecords: Math.floor(Math.random() * 1000) + 100,
        summary: {
          revenue: Math.floor(Math.random() * 100000) + 10000,
          bookings: Math.floor(Math.random() * 500) + 50,
          customers: Math.floor(Math.random() * 200) + 20
        },
        chartData: generateMockChartData(customReport.chartType || 'bar')
      }
    };

    setReportData(mockData);
    setShowPreviewModal(true);
    
    if (onReportGenerated) {
      onReportGenerated(mockData);
    }
  };

  const generateMockChartData = (chartType: string) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    
    switch (chartType) {
      case 'bar':
        return months.map(month => ({
          month,
          value: Math.floor(Math.random() * 100) + 10
        }));
      case 'line':
        return months.map(month => ({
          month,
          value: Math.floor(Math.random() * 1000) + 100
        }));
      case 'pie':
        return [
          { name: 'Caldas Novas', value: 45 },
          { name: 'Porto de Galinhas', value: 30 },
          { name: 'Fernando de Noronha', value: 15 },
          { name: 'Outros', value: 10 }
        ];
      default:
        return [];
    }
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    showNotification(`Relatório exportado em ${format.toUpperCase()}`, 'success');
    // Aqui seria implementada a lógica real de exportação
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    showNotification('Template removido com sucesso!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Construtor de Relatórios</h2>
          <p className="text-gray-600">Crie relatórios personalizados para sua agência</p>
        </div>
        <Button onClick={() => setShowTemplateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="custom">Relatórios Custom</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCreateReport(template)}
                      title="Usar template"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTemplate(template.id)}
                      title="Remover template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Campos: {template.fields.length}</span>
                  <span className="capitalize">{template.chartType}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="custom" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Seus relatórios customizados aparecerão aqui</p>
          </div>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Relatórios agendados aparecerão aqui</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Configurar Relatório"
        size="lg"
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Relatório
              </label>
              <Input
                value={customReport.name || ''}
                onChange={(e) => setCustomReport(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do relatório"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <Select
                value={customReport.category || ''}
                onValueChange={(value) => setCustomReport(prev => ({ ...prev, category: value }))}
              >
                <option value="">Selecione uma categoria</option>
                <option value="Vendas">Vendas</option>
                <option value="Clientes">Clientes</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Marketing">Marketing</option>
                <option value="Operacional">Operacional</option>
              </Select>
            </div>
          </div>

          {/* Chart Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Gráfico
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { type: 'bar', icon: BarChart3, label: 'Barras' },
                { type: 'line', icon: TrendingUp, label: 'Linha' },
                { type: 'pie', icon: PieChart, label: 'Pizza' },
                { type: 'area', icon: TrendingUp, label: 'Área' },
                { type: 'table', icon: FileText, label: 'Tabela' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setCustomReport(prev => ({ ...prev, chartType: type as any }))}
                  className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                    customReport.chartType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          {selectedTemplate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campos do Relatório
              </label>
              <div className="space-y-3">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <label className="text-sm text-gray-600">{field.name}</label>
                      <div className="mt-1">
                        {field.type === 'select' ? (
                          <Select
                            value={customReport[field.id as keyof typeof customReport] || ''}
                            onValueChange={(value) => setCustomReport(prev => ({ 
                              ...prev, 
                              [field.id]: value 
                            }))}
                          >
                            <option value="">Selecione...</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </Select>
                        ) : field.type === 'date' ? (
                          <Input
                            type="date"
                            value={customReport[field.id as keyof typeof customReport] || ''}
                            onChange={(e) => setCustomReport(prev => ({ 
                              ...prev, 
                              [field.id]: e.target.value 
                            }))}
                          />
                        ) : field.type === 'number' ? (
                          <Input
                            type="number"
                            value={customReport[field.id as keyof typeof customReport] || ''}
                            onChange={(e) => setCustomReport(prev => ({ 
                              ...prev, 
                              [field.id]: e.target.value 
                            }))}
                            placeholder={field.defaultValue?.toString()}
                          />
                        ) : field.type === 'boolean' ? (
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={customReport[field.id as keyof typeof customReport] || false}
                              onChange={(e) => setCustomReport(prev => ({ 
                                ...prev, 
                                [field.id]: e.target.checked 
                              }))}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-600">{field.name}</span>
                          </label>
                        ) : (
                          <Input
                            value={customReport[field.id as keyof typeof customReport] || ''}
                            onChange={(e) => setCustomReport(prev => ({ 
                              ...prev, 
                              [field.id]: e.target.value 
                            }))}
                            placeholder={field.name}
                          />
                        )}
                      </div>
                    </div>
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveReport}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Relatório
            </Button>
            <Button onClick={handleGenerateReport} variant="default">
              <Eye className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Prévia do Relatório"
        size="xl"
      >
        {reportData && (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">{reportData.title}</h3>
              <p className="text-sm text-gray-600">
                Gerado em: {new Date(reportData.generatedAt).toLocaleString()}
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {reportData.data.summary.revenue.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </div>
                <div className="text-sm text-blue-600">Receita Total</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {reportData.data.summary.bookings}
                </div>
                <div className="text-sm text-green-600">Reservas</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {reportData.data.summary.customers}
                </div>
                <div className="text-sm text-purple-600">Clientes</div>
              </div>
            </div>

            {/* Chart Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Visualização dos Dados</h4>
              <div className="h-64 bg-white rounded border flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Gráfico {customReport.chartType} será renderizado aqui</p>
                  <p className="text-sm">Total de registros: {reportData.data.totalRecords}</p>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                Relatório pronto para exportação
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportReport('pdf')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportReport('excel')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportReport('csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export { CustomReportBuilder };
export type { ReportTemplate, ReportField };
