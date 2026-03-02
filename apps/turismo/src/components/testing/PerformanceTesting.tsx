import React, { useState, useEffect } from 'react';
import { Zap, Clock, TrendingUp, BarChart3, Play, Square, RotateCcw, Download, Activity, Gauge, Memory, Cpu, HardDrive } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Progress } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  category: 'load' | 'stress' | 'endurance' | 'spike' | 'scalability';
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration: number;
  startTime: Date | null;
  endTime: Date | null;
  results: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
  };
  config: {
    users: number;
    rampUp: number;
    duration: number;
    target: string;
  };
}

interface PerformanceTestingProps {
  onTestCompleted?: (test: PerformanceTest) => void;
  onPerformanceAlert?: (metric: PerformanceMetric) => void;
}

const PerformanceTesting: React.FC<PerformanceTestingProps> = ({ onTestCompleted, onPerformanceAlert }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceTests, setPerformanceTests] = useState<PerformanceTest[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockTests: PerformanceTest[] = [
      {
        id: 'load-test-1',
        name: 'Teste de Carga - Dashboard',
        description: 'Teste de carga para o dashboard principal com 100 usuários simultâneos',
        category: 'load',
        status: 'completed',
        duration: 180,
        startTime: new Date('2024-01-15T10:00:00'),
        endTime: new Date('2024-01-15T10:03:00'),
        results: {
          responseTime: 245,
          throughput: 1250,
          errorRate: 0.2,
          cpuUsage: 45,
          memoryUsage: 68,
          networkLatency: 12
        },
        config: {
          users: 100,
          rampUp: 30,
          duration: 180,
          target: 'https://dashboard.reserveiviagens.com'
        }
      },
      {
        id: 'stress-test-1',
        name: 'Teste de Estresse - Sistema de Reservas',
        description: 'Teste de estresse para o sistema de reservas com carga máxima',
        category: 'stress',
        status: 'running',
        duration: 0,
        startTime: new Date('2024-01-15T11:00:00'),
        endTime: null,
        results: {
          responseTime: 0,
          throughput: 0,
          errorRate: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          networkLatency: 0
        },
        config: {
          users: 500,
          rampUp: 60,
          duration: 300,
          target: 'https://reservas.reserveiviagens.com'
        }
      },
      {
        id: 'endurance-test-1',
        name: 'Teste de Resistência - API',
        description: 'Teste de resistência para APIs com carga constante por 1 hora',
        category: 'endurance',
        status: 'pending',
        duration: 0,
        startTime: null,
        endTime: null,
        results: {
          responseTime: 0,
          throughput: 0,
          errorRate: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          networkLatency: 0
        },
        config: {
          users: 200,
          rampUp: 45,
          duration: 3600,
          target: 'https://api.reserveiviagens.com'
        }
      }
    ];

    setPerformanceTests(mockTests);

    const mockMetrics: PerformanceMetric[] = [
      {
        id: 'response-time',
        name: 'Tempo de Resposta',
        value: 245,
        unit: 'ms',
        threshold: 500,
        status: 'excellent',
        trend: 'down',
        description: 'Tempo médio de resposta das requisições'
      },
      {
        id: 'throughput',
        name: 'Throughput',
        value: 1250,
        unit: 'req/s',
        threshold: 1000,
        status: 'excellent',
        trend: 'up',
        description: 'Número de requisições por segundo'
      },
      {
        id: 'error-rate',
        name: 'Taxa de Erro',
        value: 0.2,
        unit: '%',
        threshold: 1.0,
        status: 'excellent',
        trend: 'stable',
        description: 'Porcentagem de requisições com erro'
      },
      {
        id: 'cpu-usage',
        name: 'Uso de CPU',
        value: 45,
        unit: '%',
        threshold: 80,
        status: 'good',
        trend: 'stable',
        description: 'Utilização média do processador'
      },
      {
        id: 'memory-usage',
        name: 'Uso de Memória',
        value: 68,
        unit: '%',
        threshold: 85,
        status: 'good',
        trend: 'up',
        description: 'Utilização média da memória RAM'
      },
      {
        id: 'network-latency',
        name: 'Latência de Rede',
        value: 12,
        unit: 'ms',
        threshold: 50,
        status: 'excellent',
        trend: 'stable',
        description: 'Latência média da rede'
      }
    ];

    setMetrics(mockMetrics);
  }, []);

  const runTest = async (testId: string) => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentTest(testId);
    
    // Atualizar status para running
    setPerformanceTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'running', startTime: new Date() } : test
    ));
    
    const test = performanceTests.find(t => t.id === testId);
    if (!test) return;
    
    // Simular execução do teste
    await new Promise(resolve => setTimeout(resolve, test.config.duration * 1000));
    
    // Simular resultados
    const results = {
      responseTime: Math.floor(Math.random() * 300) + 100,
      throughput: Math.floor(Math.random() * 500) + 1000,
      errorRate: Math.random() * 2,
      cpuUsage: Math.floor(Math.random() * 40) + 30,
      memoryUsage: Math.floor(Math.random() * 30) + 50,
      networkLatency: Math.floor(Math.random() * 20) + 5
    };
    
    const updatedTest = {
      ...test,
      status: 'completed',
      endTime: new Date(),
      duration: test.config.duration,
      results
    };
    
    setPerformanceTests(prev => prev.map(t => 
      t.id === testId ? updatedTest : t
    ));
    
    setIsRunning(false);
    setCurrentTest('');
    
    if (onTestCompleted) {
      onTestCompleted(updatedTest);
    }
    
    showNotification({
      title: 'Teste Concluído',
      description: `${test.name} - Teste de performance finalizado`,
      type: 'success'
    });
  };

  const stopTest = (testId: string) => {
    setPerformanceTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'failed', endTime: new Date() } : test
    ));
    
    if (currentTest === testId) {
      setIsRunning(false);
      setCurrentTest('');
    }
    
    showNotification({
      title: 'Teste Interrompido',
      description: 'Teste de performance interrompido pelo usuário',
      type: 'warning'
    });
  };

  const createTest = () => {
    const newTest: PerformanceTest = {
      id: `test-${Date.now()}`,
      name: 'Novo Teste de Performance',
      description: 'Descrição do teste de performance',
      category: 'load',
      status: 'pending',
      duration: 0,
      startTime: null,
      endTime: null,
      results: {
        responseTime: 0,
        throughput: 0,
        errorRate: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        networkLatency: 0
      },
      config: {
        users: 100,
        rampUp: 30,
        duration: 300,
        target: 'https://example.com'
      }
    };
    
    setPerformanceTests(prev => [...prev, newTest]);
    
    showNotification({
      title: 'Teste Criado',
      description: 'Novo teste de performance criado',
      type: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'load': return 'bg-blue-100 text-blue-800';
      case 'stress': return 'bg-orange-100 text-orange-800';
      case 'endurance': return 'bg-purple-100 text-purple-800';
      case 'spike': return 'bg-red-100 text-red-800';
      case 'scalability': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const generatePerformanceReport = () => {
    const report = {
      timestamp: new Date(),
      tests: performanceTests,
      metrics: metrics,
      summary: {
        totalTests: performanceTests.length,
        completedTests: performanceTests.filter(t => t.status === 'completed').length,
        runningTests: performanceTests.filter(t => t.status === 'running').length,
        failedTests: performanceTests.filter(t => t.status === 'failed').length,
        averageResponseTime: performanceTests
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.results.responseTime, 0) / 
          performanceTests.filter(t => t.status === 'completed').length || 0
      }
    };

    // Simular download do relatório
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification({
      title: 'Relatório Gerado',
      description: 'Relatório de performance exportado com sucesso',
      type: 'success'
    });
  };

  const filteredTests = performanceTests.filter(test => {
    const matchesCategory = filterCategory === 'all' || test.category === filterCategory;
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const overallPerformance = metrics.reduce((sum, metric) => {
    const score = (metric.value / metric.threshold) * 100;
    return sum + Math.min(score, 100);
  }, 0) / metrics.length;

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Testes de Performance</h2>
            <p className="text-gray-600">Execute e analise testes de performance do sistema</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={createTest} className="bg-blue-600 hover:bg-blue-700">
              <Zap className="w-4 h-4 mr-2" />
              Novo Teste
            </Button>
            <Button onClick={generatePerformanceReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Score de Performance Geral */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-6">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {overallPerformance.toFixed(1)}%
          </div>
          <div className="text-lg text-gray-600 mb-4">Score de Performance Geral</div>
          <Progress value={overallPerformance} className="h-3 max-w-md mx-auto" />
        </div>
      </Card>

      {/* Métricas de Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Métricas de Performance</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{metric.name}</h4>
                  {getTrendIcon(metric.trend)}
                </div>
                <Badge className={getMetricStatusColor(metric.status)}>
                  {metric.status === 'excellent' ? 'Excelente' :
                   metric.status === 'good' ? 'Bom' :
                   metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                </Badge>
              </div>
              
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {metric.value}{metric.unit}
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                {metric.description}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Limite:</span>
                  <span className="font-medium">{metric.threshold}{metric.unit}</span>
                </div>
                <Progress 
                  value={Math.min((metric.value / metric.threshold) * 100, 100)} 
                  className="h-2" 
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filtros e Busca */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar testes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Select
            value={filterCategory}
            onValueChange={setFilterCategory}
          >
            <option value="all">Todas as Categorias</option>
            <option value="load">Carga</option>
            <option value="stress">Estresse</option>
            <option value="endurance">Resistência</option>
            <option value="spike">Pico</option>
            <option value="scalability">Escalabilidade</option>
          </Select>
        </div>
      </Card>

      {/* Tabs de Testes */}
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="tests">Testes</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumo dos Testes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Resumo dos Testes</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {performanceTests.filter(t => t.status === 'completed').length}
                    </div>
                    <div className="text-sm text-green-600">Concluídos</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {performanceTests.filter(t => t.status === 'running').length}
                    </div>
                    <div className="text-sm text-blue-600">Executando</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {performanceTests.filter(t => t.status === 'failed').length}
                    </div>
                    <div className="text-sm text-red-600">Falharam</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {performanceTests.filter(t => t.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pendentes</div>
                  </div>
                </div>
              </div>

              {/* Categorias de Teste */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Testes por Categoria</h4>
                <div className="space-y-3">
                  {['load', 'stress', 'endurance', 'spike', 'scalability'].map(category => {
                    const count = performanceTests.filter(test => test.category === category).length;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(category)}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Testes */}
          <TabsContent value="tests" className="p-6">
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <div key={test.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{test.name}</h4>
                        <Badge className={getStatusColor(test.status)}>
                          {test.status === 'completed' ? 'Concluído' :
                           test.status === 'running' ? 'Executando' :
                           test.status === 'failed' ? 'Falhou' : 'Pendente'}
                        </Badge>
                        <Badge className={getCategoryColor(test.category)}>
                          {test.category.charAt(0).toUpperCase() + test.category.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{test.description}</p>
                      
                      {/* Configuração do Teste */}
                      <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{test.config.users}</div>
                          <div className="text-gray-500">Usuários</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{test.config.rampUp}s</div>
                          <div className="text-gray-500">Ramp Up</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{test.config.duration}s</div>
                          <div className="text-gray-500">Duração</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            {test.status === 'completed' ? test.results.responseTime : '-'}ms
                          </div>
                          <div className="text-gray-500">Response Time</div>
                        </div>
                      </div>
                      
                      {/* Resultados (se concluído) */}
                      {test.status === 'completed' && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{test.results.throughput}</div>
                            <div className="text-gray-500">req/s</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{test.results.errorRate.toFixed(2)}%</div>
                            <div className="text-gray-500">Error Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{test.results.cpuUsage}%</div>
                            <div className="text-gray-500">CPU Usage</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {test.status === 'pending' && (
                        <Button
                          onClick={() => runTest(test.id)}
                          disabled={isRunning}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Executar
                        </Button>
                      )}
                      
                      {test.status === 'running' && (
                        <Button
                          onClick={() => stopTest(test.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Parar
                        </Button>
                      )}
                      
                      {test.status === 'completed' && (
                        <Button
                          onClick={() => setSelectedTest(test.id)}
                          size="sm"
                          variant="outline"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Detalhes
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Barra de Progresso para testes em execução */}
                  {test.status === 'running' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Executando...</span>
                        <span>{test.config.duration}s</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Detalhes do Teste Selecionado */}
      {selectedTest && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Detalhes do Teste</h3>
            <Button
              onClick={() => setSelectedTest('')}
              variant="outline"
              size="sm"
            >
              Fechar
            </Button>
          </div>
          
          {(() => {
            const test = performanceTests.find(t => t.id === selectedTest);
            if (!test || test.status !== 'completed') return <div>Teste não encontrado ou não concluído</div>;
            
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{test.results.responseTime}ms</div>
                    <div className="text-sm text-blue-600">Response Time</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{test.results.throughput}</div>
                    <div className="text-sm text-green-600">Throughput (req/s)</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{test.results.errorRate.toFixed(2)}%</div>
                    <div className="text-sm text-yellow-600">Error Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{test.results.cpuUsage}%</div>
                    <div className="text-sm text-purple-600">CPU Usage</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Recursos do Sistema</h5>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h6 className="font-medium text-gray-900 mb-3">CPU</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uso:</span>
                          <span className="font-medium">{test.results.cpuUsage}%</span>
                        </div>
                        <Progress value={test.results.cpuUsage} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h6 className="font-medium text-gray-900 mb-3">Memória</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uso:</span>
                          <span className="font-medium">{test.results.memoryUsage}%</span>
                        </div>
                        <Progress value={test.results.memoryUsage} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h6 className="font-medium text-gray-900 mb-3">Rede</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Latência:</span>
                          <span className="font-medium">{test.results.networkLatency}ms</span>
                        </div>
                        <Progress value={(test.results.networkLatency / 100) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
};

export { PerformanceTesting };
export type { PerformanceMetric, PerformanceTest, PerformanceTestingProps };
