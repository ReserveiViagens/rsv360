import React, { useState } from 'react';
import { 
  FileText, 
  BarChart3, 
  Calendar, 
  Download, 
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { 
  CustomReportBuilder, 
  ReportTemplates, 
  ReportScheduler, 
  ReportExport 
} from '../components/reports';
import { useUIStore } from '../stores/useUIStore';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [quickStats, setQuickStats] = useState({
    totalReports: 156,
    scheduledReports: 12,
    recentExports: 8,
    successRate: 94.2
  });
  
  const { showNotification } = useUIStore();

  const handleReportGenerated = (report: any) => {
    showNotification(`Relatório "${report.title}" gerado com sucesso!`, 'success');
    // Aqui seria implementada a lógica para salvar o relatório
  };

  const handleScheduleCreated = (schedule: any) => {
    showNotification(`Agendamento "${schedule.name}" criado com sucesso!`, 'success');
    // Aqui seria implementada a lógica para salvar o agendamento
  };

  const handleExportRequested = (exportJob: any) => {
    showNotification(`Exportação "${exportJob.reportName}" solicitada!`, 'success');
    // Aqui seria implementada a lógica para processar a exportação
  };

  const handleExportCompleted = (exportJob: any) => {
    showNotification(`Exportação "${exportJob.reportName}" concluída!`, 'success');
    // Aqui seria implementada a lógica para notificar o usuário
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
            <p className="text-gray-600">Sistema completo de relatórios personalizados e analytics avançados</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Histórico
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Relatórios</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.totalReports}</p>
                <p className="text-xs text-green-600">+12% este mês</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Agendados</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.scheduledReports}</p>
                <p className="text-xs text-blue-600">Ativos</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Exportações Recentes</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.recentExports}</p>
                <p className="text-xs text-green-600">Últimas 24h</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.successRate}%</p>
                <p className="text-xs text-green-600">+2.1% vs mês passado</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-14">
            <TabsTrigger value="builder" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Construtor</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Agendamento</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportação</span>
            </TabsTrigger>
          </TabsList>

          {/* Construtor de Relatórios */}
          <TabsContent value="builder" className="p-6">
            <CustomReportBuilder onReportGenerated={handleReportGenerated} />
          </TabsContent>

          {/* Templates de Relatórios */}
          <TabsContent value="templates" className="p-6">
            <ReportTemplates 
              onTemplateSelect={(template) => {
                showNotification(`Template "${template.name}" selecionado`, 'success');
                setActiveTab('builder');
              }}
              onTemplateEdit={(template) => {
                showNotification(`Template "${template.name}" editado`, 'success');
              }}
            />
          </TabsContent>

          {/* Agendamento de Relatórios */}
          <TabsContent value="scheduler" className="p-6">
            <ReportScheduler 
              onScheduleCreated={handleScheduleCreated}
              onScheduleUpdated={(schedule) => {
                showNotification(`Agendamento "${schedule.name}" atualizado`, 'success');
              }}
            />
          </TabsContent>

          {/* Exportação de Relatórios */}
          <TabsContent value="export" className="p-6">
            <ReportExport 
              onExportRequested={handleExportRequested}
              onExportCompleted={handleExportCompleted}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Actions Footer */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => setActiveTab('builder')}
          >
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium">Criar Relatório</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => setActiveTab('templates')}
          >
            <BarChart3 className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium">Usar Template</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => setActiveTab('scheduler')}
          >
            <Calendar className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium">Agendar</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => setActiveTab('export')}
          >
            <Download className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Relatório de Vendas exportado</p>
              <p className="text-xs text-gray-600">PDF gerado com sucesso - 2.4 MB</p>
            </div>
            <span className="text-xs text-gray-500">2 min atrás</span>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Agendamento criado</p>
              <p className="text-xs text-gray-600">Relatório semanal de clientes - Segunda 9h</p>
            </div>
            <span className="text-xs text-gray-500">15 min atrás</span>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Exportação falhou</p>
              <p className="text-xs text-gray-600">Relatório financeiro - Erro de dados</p>
            </div>
            <span className="text-xs text-gray-500">1 hora atrás</span>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Template personalizado criado</p>
              <p className="text-xs text-gray-600">Análise de segmentação de clientes</p>
            </div>
            <span className="text-xs text-gray-500">3 horas atrás</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ReportsPage };
