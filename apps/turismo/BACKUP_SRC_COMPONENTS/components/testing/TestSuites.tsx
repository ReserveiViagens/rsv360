import React, { useState, useEffect } from 'react';
import { Play, Square, Settings, Plus, Edit, Trash2, Copy, Save, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Modal } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  lastRun: Date | null;
  tags: string[];
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  category: string;
  testCases: TestCase[];
  config: {
    timeout: number;
    retries: number;
    parallel: boolean;
    environment: string;
    tags: string[];
  };
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun: Date | null;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  averageDuration: number;
}

interface TestSuitesProps {
  onSuiteCreated?: (suite: TestSuite) => void;
  onSuiteUpdated?: (suite: TestSuite) => void;
  onSuiteDeleted?: (suiteId: string) => void;
  onSuiteExecuted?: (suite: TestSuite, results: TestCase[]) => void;
}

const TestSuites: React.FC<TestSuitesProps> = ({ 
  onSuiteCreated, 
  onSuiteUpdated, 
  onSuiteDeleted, 
  onSuiteExecuted 
}) => {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSuite, setEditingSuite] = useState<Partial<TestSuite>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockSuites: TestSuite[] = [
      {
        id: 'unit-tests',
        name: 'Testes Unitários',
        description: 'Suite completa de testes unitários para todos os componentes',
        category: 'unit',
        testCases: [
          {
            id: 'ut-1',
            name: 'Teste de Renderização do Dashboard',
            description: 'Verifica se o dashboard renderiza corretamente',
            category: 'component',
            priority: 'high',
            status: 'passed',
            duration: 150,
            lastRun: new Date('2024-01-15T10:30:00'),
            tags: ['dashboard', 'render', 'component']
          },
          {
            id: 'ut-2',
            name: 'Teste de Validação de Formulário',
            description: 'Valida regras de formulário de reserva',
            category: 'form',
            priority: 'critical',
            status: 'passed',
            duration: 89,
            lastRun: new Date('2024-01-15T10:32:00'),
            tags: ['form', 'validation', 'booking']
          }
        ],
        config: {
          timeout: 5000,
          retries: 2,
          parallel: true,
          environment: 'development',
          tags: ['unit', 'fast']
        },
        status: 'completed',
        lastRun: new Date('2024-01-15T10:35:00'),
        totalTests: 45,
        passedTests: 42,
        failedTests: 3,
        skippedTests: 0,
        averageDuration: 120
      },
      {
        id: 'integration-tests',
        name: 'Testes de Integração',
        description: 'Testes de integração entre componentes e APIs',
        category: 'integration',
        testCases: [
          {
            id: 'it-1',
            name: 'Teste de Fluxo de Reserva',
            description: 'Testa o fluxo completo de criação de reserva',
            category: 'flow',
            priority: 'high',
            status: 'passed',
            duration: 1200,
            lastRun: new Date('2024-01-15T09:15:00'),
            tags: ['booking', 'flow', 'api']
          }
        ],
        config: {
          timeout: 15000,
          retries: 1,
          parallel: false,
          environment: 'staging',
          tags: ['integration', 'api']
        },
        status: 'completed',
        lastRun: new Date('2024-01-15T09:20:00'),
        totalTests: 28,
        passedTests: 26,
        failedTests: 2,
        skippedTests: 0,
        averageDuration: 850
      },
      {
        id: 'e2e-tests',
        name: 'Testes End-to-End',
        description: 'Testes de fluxos completos do usuário',
        category: 'e2e',
        testCases: [
          {
            id: 'e2e-1',
            name: 'Teste de Reserva Completa',
            description: 'Testa reserva completa do início ao fim',
            category: 'user-flow',
            priority: 'critical',
            status: 'running',
            duration: 0,
            lastRun: null,
            tags: ['e2e', 'user-flow', 'critical']
          }
        ],
        config: {
          timeout: 30000,
          retries: 0,
          parallel: false,
          environment: 'production',
          tags: ['e2e', 'user-flow']
        },
        status: 'running',
        lastRun: new Date('2024-01-15T11:00:00'),
        totalTests: 15,
        passedTests: 14,
        failedTests: 1,
        skippedTests: 0,
        averageDuration: 2500
      }
    ];
    setSuites(mockSuites);
  }, []);

  const createSuite = () => {
    setIsCreating(true);
    setEditingSuite({
      name: '',
      description: '',
      category: 'unit',
      config: {
        timeout: 5000,
        retries: 2,
        parallel: true,
        environment: 'development',
        tags: []
      }
    });
  };

  const editSuite = (suite: TestSuite) => {
    setIsEditing(true);
    setEditingSuite(suite);
  };

  const deleteSuite = (suiteId: string) => {
    if (confirm('Tem certeza que deseja excluir esta suite de testes?')) {
      setSuites(prev => prev.filter(s => s.id !== suiteId));
      if (onSuiteDeleted) {
        onSuiteDeleted(suiteId);
      }
      showNotification({
        title: 'Suite Excluída',
        description: 'Suite de testes removida com sucesso',
        type: 'success'
      });
    }
  };

  const duplicateSuite = (suite: TestSuite) => {
    const newSuite: TestSuite = {
      ...suite,
      id: `${suite.id}-copy-${Date.now()}`,
      name: `${suite.name} (Cópia)`,
      status: 'idle',
      lastRun: null,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      averageDuration: 0
    };
    
    setSuites(prev => [...prev, newSuite]);
    
    if (onSuiteCreated) {
      onSuiteCreated(newSuite);
    }
    
    showNotification({
      title: 'Suite Duplicada',
      description: 'Suite de testes duplicada com sucesso',
      type: 'success'
    });
  };

  const saveSuite = () => {
    if (!editingSuite.name || !editingSuite.description) {
      showNotification({
        title: 'Erro',
        description: 'Nome e descrição são obrigatórios',
        type: 'error'
      });
      return;
    }

    if (isCreating) {
      const newSuite: TestSuite = {
        ...editingSuite,
        id: `suite-${Date.now()}`,
        testCases: [],
        status: 'idle',
        lastRun: null,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        averageDuration: 0
      } as TestSuite;
      
      setSuites(prev => [...prev, newSuite]);
      
      if (onSuiteCreated) {
        onSuiteCreated(newSuite);
      }
      
      showNotification({
        title: 'Suite Criada',
        description: 'Nova suite de testes criada com sucesso',
        type: 'success'
      });
    } else {
      setSuites(prev => prev.map(s => 
        s.id === editingSuite.id ? { ...s, ...editingSuite } : s
      ));
      
      if (onSuiteUpdated) {
        onSuiteUpdated(editingSuite as TestSuite);
      }
      
      showNotification({
        title: 'Suite Atualizada',
        description: 'Suite de testes atualizada com sucesso',
        type: 'success'
      });
    }
    
    setIsCreating(false);
    setIsEditing(false);
    setEditingSuite({});
  };

  const executeSuite = async (suite: TestSuite) => {
    if (suite.status === 'running') return;
    
    // Atualizar status para running
    setSuites(prev => prev.map(s => 
      s.id === suite.id ? { ...s, status: 'running' } : s
    ));
    
    // Simular execução
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular resultados
    const results = suite.testCases.map(test => ({
      ...test,
      status: Math.random() > 0.1 ? 'passed' : 'failed',
      duration: Math.floor(Math.random() * 1000) + 100,
      lastRun: new Date()
    }));
    
    const passedTests = results.filter(t => t.status === 'passed').length;
    const failedTests = results.filter(t => t.status === 'failed').length;
    const averageDuration = results.reduce((sum, t) => sum + t.duration, 0) / results.length;
    
    const updatedSuite = {
      ...suite,
      status: failedTests === 0 ? 'completed' : 'failed',
      lastRun: new Date(),
      passedTests,
      failedTests,
      averageDuration
    };
    
    setSuites(prev => prev.map(s => 
      s.id === suite.id ? updatedSuite : s
    ));
    
    if (onSuiteExecuted) {
      onSuiteExecuted(updatedSuite, results);
    }
    
    showNotification({
      title: 'Suite Executada',
      description: `${suite.name} - ${passedTests} passaram, ${failedTests} falharam`,
      type: failedTests === 0 ? 'success' : 'warning'
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSuites = suites.filter(suite => {
    const matchesCategory = filterCategory === 'all' || suite.category === filterCategory;
    const matchesSearch = suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suite.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Suites de Teste</h2>
            <p className="text-gray-600">Organize e gerencie suas suites de teste</p>
          </div>
          <Button onClick={createSuite} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Suite
          </Button>
        </div>

        {/* Filtros e Busca */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar suites de teste..."
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
            <option value="unit">Unitários</option>
            <option value="integration">Integração</option>
            <option value="e2e">End-to-End</option>
            <option value="performance">Performance</option>
          </Select>
        </div>
      </Card>

      {/* Lista de Suites */}
      <div className="space-y-4">
        {filteredSuites.map((suite) => (
          <Card key={suite.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{suite.name}</h3>
                  <Badge className={getStatusColor(suite.status)}>
                    {suite.status === 'completed' ? 'Concluída' :
                     suite.status === 'running' ? 'Executando' :
                     suite.status === 'failed' ? 'Falhou' : 'Ociosa'}
                  </Badge>
                  <Badge variant="outline">{suite.category.toUpperCase()}</Badge>
                </div>
                <p className="text-gray-600 mb-3">{suite.description}</p>
                
                {/* Estatísticas */}
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{suite.totalTests}</div>
                    <div className="text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">{suite.passedTests}</div>
                    <div className="text-gray-500">Passaram</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-600">{suite.failedTests}</div>
                    <div className="text-gray-500">Falharam</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-yellow-600">{suite.skippedTests}</div>
                    <div className="text-gray-500">Pularam</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{suite.averageDuration}ms</div>
                    <div className="text-gray-500">Duração</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  onClick={() => executeSuite(suite)}
                  disabled={suite.status === 'running'}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {suite.status === 'running' ? (
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
                <Button
                  onClick={() => editSuite(suite)}
                  size="sm"
                  variant="outline"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => duplicateSuite(suite)}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => deleteSuite(suite.id)}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Test Cases */}
            {suite.testCases.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Casos de Teste</h4>
                <div className="space-y-2">
                  {suite.testCases.map((testCase) => (
                    <div
                      key={testCase.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {testCase.status === 'passed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {testCase.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                          {testCase.status === 'running' && <Clock className="w-4 h-4 text-blue-500 animate-spin" />}
                          {testCase.status === 'pending' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{testCase.name}</div>
                          <div className="text-sm text-gray-500">{testCase.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getPriorityColor(testCase.priority)}>
                          {testCase.priority}
                        </Badge>
                        {testCase.duration > 0 && (
                          <span className="text-sm text-gray-500">{testCase.duration}ms</span>
                        )}
                        {testCase.lastRun && (
                          <span className="text-sm text-gray-400">
                            {testCase.lastRun.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Modal de Criação/Edição */}
      <Modal
        isOpen={isCreating || isEditing}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setEditingSuite({});
        }}
        title={isCreating ? 'Nova Suite de Teste' : 'Editar Suite de Teste'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Suite
            </label>
            <Input
              value={editingSuite.name || ''}
              onChange={(e) => setEditingSuite(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome da suite"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <Input
              value={editingSuite.description || ''}
              onChange={(e) => setEditingSuite(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a suite de testes"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <Select
              value={editingSuite.category || 'unit'}
              onValueChange={(value) => setEditingSuite(prev => ({ ...prev, category: value }))}
            >
              <option value="unit">Unitários</option>
              <option value="integration">Integração</option>
              <option value="e2e">End-to-End</option>
              <option value="performance">Performance</option>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (ms)
              </label>
              <Input
                type="number"
                value={editingSuite.config?.timeout || 5000}
                onChange={(e) => setEditingSuite(prev => ({
                  ...prev,
                  config: { ...prev.config!, timeout: parseInt(e.target.value) }
                }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tentativas
              </label>
              <Input
                type="number"
                value={editingSuite.config?.retries || 2}
                onChange={(e) => setEditingSuite(prev => ({
                  ...prev,
                  config: { ...prev.config!, retries: parseInt(e.target.value) }
                }))}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={editingSuite.config?.parallel || false}
              onChange={(e) => setEditingSuite(prev => ({
                ...prev,
                config: { ...prev.config!, parallel: e.target.checked }
              }))}
              className="rounded"
              aria-label="Execução paralela"
            />
            <span className="text-sm">Execução paralela</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setIsCreating(false);
              setIsEditing(false);
              setEditingSuite({});
            }}
          >
            Cancelar
          </Button>
          <Button onClick={saveSuite} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export { TestSuites };
export type { TestCase, TestSuite, TestSuitesProps };
