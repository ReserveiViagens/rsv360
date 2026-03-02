import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, FileText, CheckCircle, XCircle, Clock, AlertTriangle, BarChart3, Settings } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Progress } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: number;
  error?: string;
  timestamp: Date;
  category: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: number;
}

interface TestRunnerProps {
  onTestCompleted?: (results: TestResult[]) => void;
  onSuiteCompleted?: (suite: TestSuite) => void;
}

const TestRunner: React.FC<TestRunnerProps> = ({ onTestCompleted, onSuiteCompleted }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSuite, setCurrentSuite] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<string>('');
  const [autoRun, setAutoRun] = useState(false);
  const [parallelExecution, setParallelExecution] = useState(true);
  const [maxRetries, setMaxRetries] = useState(3);
  const { showNotification } = useUIStore();

  // Mock test suites
  useEffect(() => {
    const mockSuites: TestSuite[] = [
      {
        id: 'unit-tests',
        name: 'Testes Unitários',
        description: 'Testes de componentes e funções individuais',
        tests: [],
        totalTests: 45,
        passedTests: 42,
        failedTests: 3,
        coverage: 93.3
      },
      {
        id: 'integration-tests',
        name: 'Testes de Integração',
        description: 'Testes de integração entre componentes',
        tests: [],
        totalTests: 28,
        passedTests: 26,
        failedTests: 2,
        coverage: 92.9
      },
      {
        id: 'e2e-tests',
        name: 'Testes End-to-End',
        description: 'Testes de fluxos completos do usuário',
        tests: [],
        totalTests: 15,
        passedTests: 14,
        failedTests: 1,
        coverage: 93.3
      },
      {
        id: 'performance-tests',
        name: 'Testes de Performance',
        description: 'Testes de velocidade e eficiência',
        tests: [],
        totalTests: 12,
        passedTests: 11,
        failedTests: 1,
        coverage: 91.7
      }
    ];
    setTestSuites(mockSuites);
  }, []);

  const runTestSuite = async (suiteId: string) => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentSuite(suiteId);
    
    const suite = testSuites.find(s => s.id === suiteId);
    if (!suite) return;

    // Simular execução de testes
    const mockTests: TestResult[] = [];
    const totalTests = suite.totalTests;
    
    for (let i = 0; i < totalTests; i++) {
      const test: TestResult = {
        id: `${suiteId}-test-${i}`,
        name: `Teste ${i + 1} - ${suite.name}`,
        status: 'running',
        duration: 0,
        timestamp: new Date(),
        category: suite.name
      };
      
      mockTests.push(test);
      setTestResults(prev => [...prev, test]);
      
      // Simular tempo de execução
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      // Simular resultado
      const passed = Math.random() > 0.1; // 90% pass rate
      const finalTest = {
        ...test,
        status: passed ? 'passed' : 'failed',
        duration: Math.floor(Math.random() * 2000) + 100,
        error: passed ? undefined : `Erro no teste ${i + 1}`
      };
      
      setTestResults(prev => prev.map(t => t.id === test.id ? finalTest : t));
    }
    
    // Atualizar suite
    const passedTests = mockTests.filter(t => t.status === 'passed').length;
    const failedTests = mockTests.filter(t => t.status === 'failed').length;
    const coverage = (passedTests / totalTests) * 100;
    
    const updatedSuite = {
      ...suite,
      tests: mockTests,
      passedTests,
      failedTests,
      coverage: Math.round(coverage * 10) / 10
    };
    
    setTestSuites(prev => prev.map(s => s.id === suiteId ? updatedSuite : s));
    
    setIsRunning(false);
    setCurrentSuite('');
    
    if (onSuiteCompleted) {
      onSuiteCompleted(updatedSuite);
    }
    
    showNotification({
      title: 'Suite de Testes Concluída',
      description: `${suite.name} - ${passedTests} passaram, ${failedTests} falharam`,
      type: failedTests === 0 ? 'success' : 'warning'
    });
  };

  const runAllTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    
    for (const suite of testSuites) {
      await runTestSuite(suite.id);
    }
    
    setIsRunning(false);
    
    showNotification({
      title: 'Todos os Testes Concluídos',
      description: 'Execução completa de todas as suites de teste',
      type: 'success'
    });
  };

  const stopTests = () => {
    setIsRunning(false);
    setCurrentSuite('');
  };

  const clearResults = () => {
    setTestResults([]);
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      tests: [],
      passedTests: 0,
      failedTests: 0,
      coverage: 0
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
  const overallCoverage = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Test Runner</h2>
            <p className="text-gray-600">Execute e gerencie testes automatizados</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Executar Todos
            </Button>
            <Button
              onClick={stopTests}
              disabled={!isRunning}
              variant="destructive"
            >
              <Square className="w-4 h-4 mr-2" />
              Parar
            </Button>
            <Button
              onClick={clearResults}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
            <div className="text-sm text-blue-600">Total de Testes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalPassed}</div>
            <div className="text-sm text-green-600">Passaram</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <div className="text-sm text-red-600">Falharam</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{overallCoverage.toFixed(1)}%</div>
            <div className="text-sm text-purple-600">Cobertura</div>
          </div>
        </div>

        {/* Configurações */}
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
              className="rounded"
              aria-label="Execução Automática"
            />
            <span className="text-sm">Execução Automática</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={parallelExecution}
              onChange={(e) => setParallelExecution(e.target.checked)}
              className="rounded"
              aria-label="Execução Paralela"
            />
            <span className="text-sm">Execução Paralela</span>
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Tentativas:</span>
            <input
              type="number"
              value={maxRetries}
              onChange={(e) => setMaxRetries(parseInt(e.target.value))}
              className="w-16 px-2 py-1 border rounded text-sm"
              min="1"
              max="10"
              aria-label="Número máximo de tentativas"
            />
          </div>
        </div>
      </Card>

      {/* Suites de Teste */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Suites de Teste</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {testSuites.map((suite) => (
            <div
              key={suite.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedSuite === suite.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedSuite(suite.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{suite.name}</h4>
                <Badge className={getStatusColor(suite.passedTests > 0 ? 'passed' : 'pending')}>
                  {suite.passedTests > 0 ? `${suite.passedTests}/${suite.totalTests}` : suite.totalTests}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{suite.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cobertura:</span>
                  <span className="font-medium">{suite.coverage}%</span>
                </div>
                <Progress value={suite.coverage} className="h-2" />
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  runTestSuite(suite.id);
                }}
                disabled={isRunning}
                size="sm"
                className="w-full mt-3"
              >
                {isRunning && currentSuite === suite.id ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Executar
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
            <Button
              onClick={() => setTestResults([])}
              variant="outline"
              size="sm"
            >
              Limpar Resultados
            </Button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <div className="font-medium text-gray-900">{test.name}</div>
                    <div className="text-sm text-gray-500">{test.category}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(test.status)}>
                    {test.status === 'passed' ? 'Passou' : 
                     test.status === 'failed' ? 'Falhou' : 
                     test.status === 'running' ? 'Executando' : 'Pendente'}
                  </Badge>
                  {test.duration > 0 && (
                    <span className="text-sm text-gray-500">{test.duration}ms</span>
                  )}
                  <span className="text-sm text-gray-400">
                    {test.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export { TestRunner };
export type { TestResult, TestSuite, TestRunnerProps };
