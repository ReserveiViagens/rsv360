import React, { useState } from 'react';
import { Play, BarChart3, Code, Zap, TrendingUp, CheckCircle, AlertTriangle, Clock, FileText, Activity } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui';
import {
  TestRunner,
  QualityMetrics,
  TestSuites,
  CodeCoverage,
  PerformanceTesting
} from '../components/testing';
import { useUIStore } from '../stores/useUIStore';

const TestingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('test-runner');
  const [quickStats, setQuickStats] = useState({
    totalTests: 100,
    passedTests: 87,
    failedTests: 8,
    skippedTests: 5,
    coverage: 87.5,
    performance: 92.3,
    quality: 78.5
  });
  const { showNotification } = useUIStore();

  const handleTestCompleted = (results: any) => {
    showNotification({
      title: 'Testes Concluídos',
      description: `${results.length} testes executados com sucesso`,
      type: 'success'
    });
  };

  const handleSuiteCompleted = (suite: any) => {
    showNotification({
      title: 'Suite Concluída',
      description: `${suite.name} - ${suite.passedTests} passaram, ${suite.failedTests} falharam`,
      type: suite.failedTests === 0 ? 'success' : 'warning'
    });
  };

  const handleQualityAlert = (metric: any) => {
    showNotification({
      title: 'Alerta de Qualidade',
      description: `${metric.name} está em estado ${metric.status}`,
      type: metric.status === 'critical' ? 'error' : 'warning'
    });
  };

  const handleFileAnalysis = (file: any) => {
    showNotification({
      title: 'Análise de Arquivo',
      description: `Analisando ${file.name} - ${file.issues} issues encontrados`,
      type: file.status === 'critical' ? 'error' : file.status === 'warning' ? 'warning' : 'success'
    });
  };

  const handleCoverageReport = (summary: any) => {
    showNotification({
      title: 'Relatório de Cobertura',
      description: `Cobertura geral: ${summary.overallCoverage}%`,
      type: 'info'
    });
  };

  const handlePerformanceAlert = (metric: any) => {
    showNotification({
      title: 'Alerta de Performance',
      description: `${metric.name} está em estado ${metric.status}`,
      type: metric.status === 'critical' ? 'error' : 'warning'
    });
  };

  const handleTestSuiteCreated = (suite: any) => {
    showNotification({
      title: 'Suite Criada',
      description: `Nova suite de testes "${suite.name}" criada`,
      type: 'success'
    });
  };

  const handleTestSuiteUpdated = (suite: any) => {
    showNotification({
      title: 'Suite Atualizada',
      description: `Suite "${suite.name}" atualizada com sucesso`,
      type: 'success'
    });
  };

  const handleTestSuiteDeleted = (suiteId: string) => {
    showNotification({
      title: 'Suite Excluída',
      description: 'Suite de testes removida com sucesso',
      type: 'success'
    });
  };

  const handleTestSuiteExecuted = (suite: any, results: any) => {
    showNotification({
      title: 'Suite Executada',
      description: `${suite.name} - ${results.length} testes executados`,
      type: 'success'
    });
  };

  const handlePerformanceTestCompleted = (test: any) => {
    showNotification({
      title: 'Teste de Performance Concluído',
      description: `${test.name} - Response time: ${test.results.responseTime}ms`,
      type: 'success'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🧪 Sistema de Testes e Qualidade</h1>
            <p className="text-lg text-gray-600">Gerencie testes, qualidade de código e performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="bg-white">
              <FileText className="w-4 h-4 mr-2" />
              Documentação
            </Button>
            <Button variant="outline" className="bg-white">
              <Activity className="w-4 h-4 mr-2" />
              Status
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{quickStats.totalTests}</div>
            <div className="text-sm text-gray-600">Total de Testes</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{quickStats.passedTests}</div>
            <div className="text-sm text-gray-600">Passaram</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{quickStats.failedTests}</div>
            <div className="text-sm text-gray-600">Falharam</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{quickStats.skippedTests}</div>
            <div className="text-sm text-gray-600">Pularam</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{quickStats.coverage}%</div>
            <div className="text-sm text-gray-600">Cobertura</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{quickStats.performance}%</div>
            <div className="text-sm text-gray-600">Performance</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{quickStats.quality}%</div>
            <div className="text-sm text-gray-600">Qualidade</div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Executar Todos os Testes
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Gerar Relatório Completo
          </Button>
          <Button variant="outline">
            <Code className="w-4 h-4 mr-2" />
            Análise de Qualidade
          </Button>
          <Button variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            Teste de Performance
          </Button>
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Métricas de Cobertura
          </Button>
        </div>
      </Card>

      {/* Main Content */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-14">
            <TabsTrigger value="test-runner" className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Test Runner</span>
            </TabsTrigger>
            <TabsTrigger value="quality-metrics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Qualidade</span>
            </TabsTrigger>
            <TabsTrigger value="test-suites" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Suites</span>
            </TabsTrigger>
            <TabsTrigger value="code-coverage" className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Cobertura</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test-runner" className="p-6">
            <TestRunner
              onTestCompleted={handleTestCompleted}
              onSuiteCompleted={handleSuiteCompleted}
            />
          </TabsContent>

          <TabsContent value="quality-metrics" className="p-6">
            <QualityMetrics
              onQualityAlert={handleQualityAlert}
              onFileAnalysis={handleFileAnalysis}
            />
          </TabsContent>

          <TabsContent value="test-suites" className="p-6">
            <TestSuites
              onSuiteCreated={handleTestSuiteCreated}
              onSuiteUpdated={handleTestSuiteUpdated}
              onSuiteDeleted={handleTestSuiteDeleted}
              onSuiteExecuted={handleTestSuiteExecuted}
            />
          </TabsContent>

          <TabsContent value="code-coverage" className="p-6">
            <CodeCoverage
              onCoverageReport={handleCoverageReport}
              onFileAnalyzed={handleFileAnalysis}
            />
          </TabsContent>

          <TabsContent value="performance" className="p-6">
            <PerformanceTesting
              onTestCompleted={handlePerformanceTestCompleted}
              onPerformanceAlert={handlePerformanceAlert}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Quick Actions Footer */}
      <Card className="p-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">
                {quickStats.passedTests} testes passaram
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-600">
                {quickStats.failedTests} testes falharam
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">
                {quickStats.skippedTests} testes pularam
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Exportar Tudo
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Activity className="w-4 h-4 mr-2" />
              Atualizar Status
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Suite de Testes Unitários concluída</div>
              <div className="text-xs text-gray-500">42 de 45 testes passaram</div>
            </div>
            <span className="text-xs text-gray-400">2 min atrás</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Análise de qualidade executada</div>
              <div className="text-xs text-gray-500">Score geral: 78.5%</div>
            </div>
            <span className="text-xs text-gray-400">15 min atrás</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Zap className="w-5 h-5 text-purple-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Teste de performance iniciado</div>
              <div className="text-xs text-gray-500">Dashboard com 100 usuários simultâneos</div>
            </div>
            <span className="text-xs text-gray-400">1 hora atrás</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Code className="w-5 h-5 text-orange-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Relatório de cobertura gerado</div>
              <div className="text-xs text-gray-500">Cobertura geral: 87.5%</div>
            </div>
            <span className="text-xs text-gray-400">2 horas atrás</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export { TestingPage };
