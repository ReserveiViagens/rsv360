'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { Separator } from '@/components/ui/Separator';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Table, 
  Filter, 
  Download, 
  Save, 
  Plus, 
  Trash2, 
  Settings, 
  Eye, 
  EyeOff,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  MapPin,
  Clock,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Tipos para o sistema de relatórios
interface ReportField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  required: boolean;
  options?: string[];
  defaultValue?: any;
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  value2?: any;
}

interface ReportChart {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'table' | 'gauge' | 'funnel';
  title: string;
  dataSource: string;
  xAxis: string;
  yAxis: string;
  aggregation: 'sum' | 'count' | 'average' | 'min' | 'max';
  position: { x: number; y: number; width: number; height: number };
}

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: ReportField[];
  filters: ReportFilter[];
  charts: ReportChart[];
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  exportFormats: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Componente para campos arrastáveis
const SortableField = ({ field, onEdit, onDelete }: { 
  field: ReportField; 
  onEdit: (field: ReportField) => void; 
  onDelete: (id: string) => void; 
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-2 cursor-move hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="font-medium">{field.label}</span>
              <Badge variant="outline" className="text-xs">
                {field.type}
              </Badge>
            </div>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(field)}
                className="h-6 w-6 p-0"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(field.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente principal
export default function AdvancedReportBuilder() {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState('fields');
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState<ReportField | null>(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [editingChart, setEditingChart] = useState<ReportChart | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Dados mock para demonstração
  const mockData = useMemo(() => ({
    users: [
      { id: 1, name: 'João Silva', email: 'joao@rsv.com', role: 'Admin', status: 'Ativo', createdAt: '2024-01-15' },
      { id: 2, name: 'Maria Santos', email: 'maria@rsv.com', role: 'User', status: 'Ativo', createdAt: '2024-02-20' },
      { id: 3, name: 'Pedro Costa', email: 'pedro@rsv.com', role: 'Manager', status: 'Inativo', createdAt: '2024-03-10' },
    ],
    sales: [
      { id: 1, product: 'Produto A', amount: 1500, date: '2024-01-15', region: 'Norte' },
      { id: 2, product: 'Produto B', amount: 2300, date: '2024-02-20', region: 'Sul' },
      { id: 3, product: 'Produto C', amount: 800, date: '2024-03-10', region: 'Leste' },
    ],
    metrics: {
      totalUsers: 1250,
      activeUsers: 980,
      totalSales: 45000,
      growthRate: 12.5,
      conversionRate: 3.2
    }
  }), []);

  // Criar novo relatório
  const createNewReport = () => {
    const newReport: Report = {
      id: Date.now().toString(),
      name: 'Novo Relatório',
      description: 'Descrição do relatório',
      category: 'Geral',
      fields: [],
      filters: [],
      charts: [],
      exportFormats: ['PDF', 'Excel'],
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCurrentReport(newReport);
    setReports(prev => [...prev, newReport]);
  };

  // Adicionar campo
  const addField = (fieldData: Partial<ReportField>) => {
    if (!currentReport) return;
    
    const newField: ReportField = {
      id: Date.now().toString(),
      name: fieldData.name || '',
      type: fieldData.type || 'string',
      label: fieldData.label || '',
      required: fieldData.required || false,
      options: fieldData.options || [],
      defaultValue: fieldData.defaultValue
    };

    setCurrentReport(prev => prev ? {
      ...prev,
      fields: [...prev.fields, newField],
      updatedAt: new Date()
    } : null);
  };

  // Adicionar gráfico
  const addChart = (chartData: Partial<ReportChart>) => {
    if (!currentReport) return;
    
    const newChart: ReportChart = {
      id: Date.now().toString(),
      type: chartData.type || 'bar',
      title: chartData.title || 'Novo Gráfico',
      dataSource: chartData.dataSource || 'users',
      xAxis: chartData.xAxis || '',
      yAxis: chartData.yAxis || '',
      aggregation: chartData.aggregation || 'count',
      position: { x: 0, y: 0, width: 400, height: 300 }
    };

    setCurrentReport(prev => prev ? {
      ...prev,
      charts: [...prev.charts, newChart],
      updatedAt: new Date()
    } : null);
  };

  // Salvar relatório
  const saveReport = () => {
    if (!currentReport) return;
    
    setReports(prev => prev.map(r => 
      r.id === currentReport.id ? currentReport : r
    ));
    toast.success('Relatório salvo com sucesso!');
  };

  // Exportar relatório
  const exportReport = (format: string) => {
    if (!currentReport) return;
    
    // Simular exportação
    const data = {
      report: currentReport,
      data: mockData,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReport.name}-${format.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Relatório exportado em ${format}!`);
  };

  // Drag & Drop handlers
  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      // Implementar reordenação aqui
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Construtor de Relatórios Avançados</h1>
          <p className="text-gray-600 mt-2">
            Crie relatórios personalizados com visualizações interativas e exportação avançada
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={createNewReport} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Importar
          </Button>
        </div>
      </div>

      {/* Lista de Relatórios */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Existentes</CardTitle>
            <CardDescription>
              Selecione um relatório para editar ou criar um novo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map(report => (
                <Card 
                  key={report.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    currentReport?.id === report.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setCurrentReport(report)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{report.name}</h3>
                      <Badge variant={report.isPublic ? 'default' : 'secondary'}>
                        {report.isPublic ? 'Público' : 'Privado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{report.fields.length} campos</span>
                      <span>{report.charts.length} gráficos</span>
                      <span>{new Date(report.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor de Relatório */}
      {currentReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{currentReport.name}</CardTitle>
                <CardDescription>{currentReport.description}</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button onClick={saveReport} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Select value={currentReport.category} onValueChange={(value) => 
                  setCurrentReport(prev => prev ? { ...prev, category: value } : null)
                }>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Geral">Geral</SelectItem>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Usuários">Usuários</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Operacional">Operacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="fields">Campos</TabsTrigger>
                <TabsTrigger value="filters">Filtros</TabsTrigger>
                <TabsTrigger value="charts">Gráficos</TabsTrigger>
                <TabsTrigger value="schedule">Agendamento</TabsTrigger>
                <TabsTrigger value="export">Exportação</TabsTrigger>
              </TabsList>

              {/* Aba de Campos */}
              <TabsContent value="fields" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Campos do Relatório</h3>
                  <Button onClick={() => setShowFieldModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Campo
                  </Button>
                </div>
                
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={currentReport.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    {currentReport.fields.map(field => (
                      <SortableField
                        key={field.id}
                        field={field}
                        onEdit={setEditingField}
                        onDelete={(id) => {
                          setCurrentReport(prev => prev ? {
                            ...prev,
                            fields: prev.fields.filter(f => f.id !== id),
                            updatedAt: new Date()
                          } : null);
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                {currentReport.fields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum campo adicionado ainda</p>
                    <p className="text-sm">Adicione campos para começar a construir seu relatório</p>
                  </div>
                )}
              </TabsContent>

              {/* Aba de Filtros */}
              <TabsContent value="filters" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filtros Avançados</h3>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Filtro
                  </Button>
                </div>
                
                {currentReport.filters.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum filtro configurado</p>
                    <p className="text-sm">Configure filtros para refinar os dados do relatório</p>
                  </div>
                )}
              </TabsContent>

              {/* Aba de Gráficos */}
              <TabsContent value="charts" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Visualizações</h3>
                  <Button onClick={() => setShowChartModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Gráfico
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentReport.charts.map(chart => (
                    <Card key={chart.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{chart.title}</h4>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Badge variant="outline">{chart.type}</Badge>
                        <span>{chart.dataSource}</span>
                        <span>•</span>
                        <span>{chart.aggregation}</span>
                      </div>
                      <div className="mt-3 p-3 bg-gray-50 rounded border-2 border-dashed border-gray-200 text-center text-gray-500">
                        Preview do gráfico {chart.type}
                      </div>
                    </Card>
                  ))}
                </div>

                {currentReport.charts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma visualização criada</p>
                    <p className="text-sm">Adicione gráficos e tabelas para visualizar os dados</p>
                  </div>
                )}
              </TabsContent>

              {/* Aba de Agendamento */}
              <TabsContent value="schedule" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Agendamento de Relatórios</h3>
                  <Switch 
                    checked={currentReport.schedule?.enabled || false}
                    onCheckedChange={(checked) => {
                      setCurrentReport(prev => prev ? {
                        ...prev,
                        schedule: {
                          ...prev.schedule,
                          enabled: checked
                        }
                      } : null);
                    }}
                  />
                </div>
                
                {currentReport.schedule?.enabled && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Frequência</label>
                        <Select value={currentReport.schedule?.frequency || 'daily'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Horário</label>
                        <Input type="time" defaultValue="09:00" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Destinatários</label>
                        <Input placeholder="emails separados por vírgula" />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Aba de Exportação */}
              <TabsContent value="export" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Configurações de Exportação</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Formatos Suportados</h4>
                    <div className="space-y-2">
                      {['PDF', 'Excel', 'CSV', 'JSON', 'XML'].map(format => (
                        <div key={format} className="flex items-center space-x-2">
                          <Switch 
                            checked={currentReport.exportFormats.includes(format)}
                            onCheckedChange={(checked) => {
                              setCurrentReport(prev => prev ? {
                                ...prev,
                                exportFormats: checked 
                                  ? [...prev.exportFormats, format]
                                  : prev.exportFormats.filter(f => f !== format)
                              } : null);
                            }}
                          />
                          <span>{format}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Exportar Agora</h4>
                    <div className="space-y-2">
                      {currentReport.exportFormats.map(format => (
                        <Button
                          key={format}
                          variant="outline"
                          onClick={() => exportReport(format)}
                          className="w-full justify-start"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exportar em {format}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Modal para adicionar/editar campo */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{editingField ? 'Editar Campo' : 'Adicionar Campo'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Campo</label>
                <Input 
                  placeholder="Ex: nome_usuario"
                  defaultValue={editingField?.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rótulo</label>
                <Input 
                  placeholder="Ex: Nome do Usuário"
                  defaultValue={editingField?.label}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <Select defaultValue={editingField?.type || 'string'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="boolean">Booleano</SelectItem>
                    <SelectItem value="select">Seleção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="required" />
                <label htmlFor="required" className="text-sm">Campo obrigatório</label>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    addField({
                      name: 'campo_' + Date.now(),
                      label: 'Novo Campo',
                      type: 'string',
                      required: false
                    });
                    setShowFieldModal(false);
                    setEditingField(null);
                  }}
                  className="flex-1"
                >
                  {editingField ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowFieldModal(false);
                    setEditingField(null);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para adicionar/editar gráfico */}
      {showChartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{editingChart ? 'Editar Gráfico' : 'Adicionar Gráfico'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input 
                  placeholder="Ex: Vendas por Região"
                  defaultValue={editingChart?.title}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Gráfico</label>
                <Select defaultValue={editingChart?.type || 'bar'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Barras</SelectItem>
                    <SelectItem value="line">Linha</SelectItem>
                    <SelectItem value="pie">Pizza</SelectItem>
                    <SelectItem value="table">Tabela</SelectItem>
                    <SelectItem value="gauge">Medidor</SelectItem>
                    <SelectItem value="funnel">Funil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fonte de Dados</label>
                <Select defaultValue={editingChart?.dataSource || 'users'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Usuários</SelectItem>
                    <SelectItem value="sales">Vendas</SelectItem>
                    <SelectItem value="metrics">Métricas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    addChart({
                      title: 'Novo Gráfico',
                      type: 'bar',
                      dataSource: 'users',
                      xAxis: 'name',
                      yAxis: 'id',
                      aggregation: 'count'
                    });
                    setShowChartModal(false);
                    setEditingChart(null);
                  }}
                  className="flex-1"
                >
                  {editingChart ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowChartModal(false);
                    setEditingChart(null);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
