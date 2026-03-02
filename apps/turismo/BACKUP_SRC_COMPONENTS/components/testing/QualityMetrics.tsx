import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock, FileText, Code, GitBranch, Activity } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Progress } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

interface CodeQualityMetric {
  id: string;
  name: string;
  value: number;
  maxValue: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface FileQuality {
  path: string;
  name: string;
  complexity: number;
  lines: number;
  issues: number;
  coverage: number;
  lastModified: Date;
  status: 'clean' | 'warning' | 'critical';
}

interface QualityMetricsProps {
  onQualityAlert?: (metric: CodeQualityMetric) => void;
  onFileAnalysis?: (file: FileQuality) => void;
}

const QualityMetrics: React.FC<QualityMetricsProps> = ({ onQualityAlert, onFileAnalysis }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<CodeQualityMetric[]>([]);
  const [fileQuality, setFileQuality] = useState<FileQuality[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [timeRange, setTimeRange] = useState('7d');
  const { showNotification } = useUIStore();

  // Mock metrics data
  useEffect(() => {
    const mockMetrics: CodeQualityMetric[] = [
      {
        id: 'code-coverage',
        name: 'Cobertura de Código',
        value: 87.5,
        maxValue: 100,
        unit: '%',
        status: 'good',
        trend: 'up',
        description: 'Porcentagem de código coberto por testes'
      },
      {
        id: 'cyclomatic-complexity',
        name: 'Complexidade Ciclomática',
        value: 3.2,
        maxValue: 10,
        unit: '',
        status: 'excellent',
        trend: 'stable',
        description: 'Medida de complexidade do código'
      },
      {
        id: 'duplication',
        name: 'Duplicação de Código',
        value: 2.1,
        maxValue: 5,
        unit: '%',
        status: 'good',
        trend: 'down',
        description: 'Porcentagem de código duplicado'
      },
      {
        id: 'maintainability',
        name: 'Índice de Manutenibilidade',
        value: 78.5,
        maxValue: 100,
        unit: '',
        status: 'good',
        trend: 'up',
        description: 'Facilidade de manutenção do código'
      },
      {
        id: 'technical-debt',
        name: 'Débito Técnico',
        value: 15.3,
        maxValue: 30,
        unit: 'h',
        status: 'warning',
        trend: 'up',
        description: 'Tempo estimado para resolver problemas'
      },
      {
        id: 'code-smells',
        name: 'Code Smells',
        value: 8,
        maxValue: 20,
        unit: '',
        status: 'good',
        trend: 'down',
        description: 'Indicadores de problemas no código'
      }
    ];
    setMetrics(mockMetrics);

    const mockFileQuality: FileQuality[] = [
      {
        path: 'src/components/dashboard/DashboardPage.tsx',
        name: 'DashboardPage.tsx',
        complexity: 4,
        lines: 156,
        issues: 2,
        coverage: 92,
        lastModified: new Date('2024-01-15'),
        status: 'clean'
      },
      {
        path: 'src/components/booking/BookingModal.tsx',
        name: 'BookingModal.tsx',
        complexity: 7,
        lines: 203,
        issues: 5,
        coverage: 78,
        lastModified: new Date('2024-01-14'),
        status: 'warning'
      },
      {
        path: 'src/components/customers/CustomerList.tsx',
        name: 'CustomerList.tsx',
        complexity: 3,
        lines: 89,
        issues: 0,
        coverage: 95,
        lastModified: new Date('2024-01-13'),
        status: 'clean'
      },
      {
        path: 'src/components/travel/TravelCard.tsx',
        name: 'TravelCard.tsx',
        complexity: 2,
        lines: 67,
        issues: 1,
        coverage: 88,
        lastModified: new Date('2024-01-12'),
        status: 'clean'
      },
      {
        path: 'src/components/payments/PaymentGateway.tsx',
        name: 'PaymentGateway.tsx',
        complexity: 9,
        lines: 234,
        issues: 8,
        coverage: 65,
        lastModified: new Date('2024-01-11'),
        status: 'critical'
      }
    ];
    setFileQuality(mockFileQuality);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const analyzeFile = (file: FileQuality) => {
    if (onFileAnalysis) {
      onFileAnalysis(file);
    }
    
    showNotification({
      title: 'Análise de Arquivo',
      description: `Analisando ${file.name} - ${file.issues} issues encontrados`,
      type: file.status === 'critical' ? 'error' : file.status === 'warning' ? 'warning' : 'success'
    });
  };

  const generateReport = () => {
    const report = {
      timestamp: new Date(),
      metrics: metrics,
      fileQuality: fileQuality,
      summary: {
        totalFiles: fileQuality.length,
        cleanFiles: fileQuality.filter(f => f.status === 'clean').length,
        warningFiles: fileQuality.filter(f => f.status === 'warning').length,
        criticalFiles: fileQuality.filter(f => f.status === 'critical').length,
        averageCoverage: fileQuality.reduce((sum, f) => sum + f.coverage, 0) / fileQuality.length
      }
    };

    // Simular download do relatório
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quality-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification({
      title: 'Relatório Gerado',
      description: 'Relatório de qualidade exportado com sucesso',
      type: 'success'
    });
  };

  const overallQuality = metrics.reduce((sum, metric) => {
    const score = (metric.value / metric.maxValue) * 100;
    return sum + score;
  }, 0) / metrics.length;

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Métricas de Qualidade</h2>
            <p className="text-gray-600">Análise e monitoramento da qualidade do código</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
              aria-label="Período de análise"
            >
              <option value="1d">Último dia</option>
              <option value="7d">Última semana</option>
              <option value="30d">Último mês</option>
              <option value="90d">Último trimestre</option>
            </select>
            <Button onClick={generateReport} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </div>

        {/* Score Geral */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-6">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {overallQuality.toFixed(1)}%
          </div>
          <div className="text-lg text-gray-600 mb-4">Score de Qualidade Geral</div>
          <Progress value={overallQuality} className="h-3 max-w-md mx-auto" />
        </div>
      </Card>

      {/* Tabs de Métricas */}
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="metrics">Métricas Detalhadas</TabsTrigger>
            <TabsTrigger value="files">Qualidade dos Arquivos</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMetric === metric.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMetric(metric.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(metric.status)}
                      <h4 className="font-medium text-gray-900">{metric.name}</h4>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {metric.value}{metric.unit}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    {metric.description}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Meta:</span>
                      <span className="font-medium">{metric.maxValue}{metric.unit}</span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.maxValue) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <Badge className={`mt-3 ${getStatusColor(metric.status)}`}>
                    {metric.status === 'excellent' ? 'Excelente' :
                     metric.status === 'good' ? 'Bom' :
                     metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Métricas Detalhadas */}
          <TabsContent value="metrics" className="p-6">
            <div className="space-y-6">
              {metrics.map((metric) => (
                <div key={metric.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{metric.name}</h4>
                      <p className="text-gray-600">{metric.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {metric.value}{metric.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        de {metric.maxValue}{metric.unit}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progresso:</span>
                      <span className="font-medium">
                        {((metric.value / metric.maxValue) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.maxValue) * 100} 
                      className="h-3" 
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status === 'excellent' ? 'Excelente' :
                           metric.status === 'good' ? 'Bom' :
                           metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Tendência:</span>
                        {getTrendIcon(metric.trend)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Qualidade dos Arquivos */}
          <TabsContent value="files" className="p-6">
            <div className="space-y-4">
              {fileQuality.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Code className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{file.name}</div>
                      <div className="text-sm text-gray-500">{file.path}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Complexidade</div>
                      <div className="font-medium">{file.complexity}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Linhas</div>
                      <div className="font-medium">{file.lines}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Issues</div>
                      <div className="font-medium">{file.issues}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Cobertura</div>
                      <div className="font-medium">{file.coverage}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Status</div>
                      <Badge className={getFileStatusColor(file.status)}>
                        {file.status === 'clean' ? 'Limpo' :
                         file.status === 'warning' ? 'Atenção' : 'Crítico'}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => analyzeFile(file)}
                      size="sm"
                      variant="outline"
                    >
                      Analisar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export { QualityMetrics };
export type { CodeQualityMetric, FileQuality, QualityMetricsProps };
