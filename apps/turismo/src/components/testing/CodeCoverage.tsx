import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, FileText, Code, GitBranch, Download, Eye, EyeOff, Filter, Search } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, Progress } from '../ui';
import { useUIStore } from '../../stores/useUIStore';

interface CoverageData {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory' | 'function';
  lines: {
    total: number;
    covered: number;
    uncovered: number;
    partial: number;
  };
  functions: {
    total: number;
    covered: number;
    uncovered: number;
  };
  branches: {
    total: number;
    covered: number;
    uncovered: number;
  };
  statements: {
    total: number;
    covered: number;
    uncovered: number;
  };
  lastUpdated: Date;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface CoverageSummary {
  totalFiles: number;
  totalLines: number;
  coveredLines: number;
  uncoveredLines: number;
  partialLines: number;
  totalFunctions: number;
  coveredFunctions: number;
  totalBranches: number;
  coveredBranches: number;
  totalStatements: number;
  coveredStatements: number;
  overallCoverage: number;
  trend: 'up' | 'down' | 'stable';
}

interface CodeCoverageProps {
  onCoverageReport?: (summary: CoverageSummary) => void;
  onFileAnalyzed?: (file: CoverageData) => void;
}

const CodeCoverage: React.FC<CodeCoverageProps> = ({ onCoverageReport, onFileAnalyzed }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [coverageData, setCoverageData] = useState<CoverageData[]>([]);
  const [summary, setSummary] = useState<CoverageSummary | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUncovered, setShowUncovered] = useState(false);
  const [sortBy, setSortBy] = useState('coverage');
  const { showNotification } = useUIStore();

  // Mock data
  useEffect(() => {
    const mockCoverageData: CoverageData[] = [
      {
        id: 'dashboard-page',
        name: 'DashboardPage.tsx',
        path: 'src/components/dashboard/DashboardPage.tsx',
        type: 'file',
        lines: { total: 156, covered: 143, uncovered: 13, partial: 0 },
        functions: { total: 8, covered: 7, uncovered: 1 },
        branches: { total: 12, covered: 11, uncovered: 1 },
        statements: { total: 89, covered: 82, uncovered: 7 },
        lastUpdated: new Date('2024-01-15T10:30:00'),
        status: 'good'
      },
      {
        id: 'booking-modal',
        name: 'BookingModal.tsx',
        path: 'src/components/booking/BookingModal.tsx',
        type: 'file',
        lines: { total: 203, covered: 158, uncovered: 45, partial: 0 },
        functions: { total: 12, covered: 9, uncovered: 3 },
        branches: { total: 18, covered: 15, uncovered: 3 },
        statements: { total: 134, covered: 112, uncovered: 22 },
        lastUpdated: new Date('2024-01-15T09:15:00'),
        status: 'warning'
      },
      {
        id: 'customer-list',
        name: 'CustomerList.tsx',
        path: 'src/components/customers/CustomerList.tsx',
        type: 'file',
        lines: { total: 89, covered: 85, uncovered: 4, partial: 0 },
        functions: { total: 5, covered: 5, uncovered: 0 },
        branches: { total: 6, covered: 6, uncovered: 0 },
        statements: { total: 67, covered: 64, uncovered: 3 },
        lastUpdated: new Date('2024-01-15T08:45:00'),
        status: 'excellent'
      },
      {
        id: 'travel-card',
        name: 'TravelCard.tsx',
        path: 'src/components/travel/TravelCard.tsx',
        type: 'file',
        lines: { total: 67, covered: 59, uncovered: 8, partial: 0 },
        functions: { total: 3, covered: 3, uncovered: 0 },
        branches: { total: 4, covered: 4, uncovered: 0 },
        statements: { total: 45, covered: 41, uncovered: 4 },
        lastUpdated: new Date('2024-01-15T08:30:00'),
        status: 'good'
      },
      {
        id: 'payment-gateway',
        name: 'PaymentGateway.tsx',
        path: 'src/components/payments/PaymentGateway.tsx',
        type: 'file',
        lines: { total: 234, covered: 152, uncovered: 82, partial: 0 },
        functions: { total: 15, covered: 10, uncovered: 5 },
        branches: { total: 22, covered: 18, uncovered: 4 },
        statements: { total: 167, covered: 118, uncovered: 49 },
        lastUpdated: new Date('2024-01-15T07:15:00'),
        status: 'critical'
      }
    ];

    setCoverageData(mockCoverageData);

    // Calcular resumo
    const totalFiles = mockCoverageData.length;
    const totalLines = mockCoverageData.reduce((sum, file) => sum + file.lines.total, 0);
    const coveredLines = mockCoverageData.reduce((sum, file) => sum + file.lines.covered, 0);
    const uncoveredLines = mockCoverageData.reduce((sum, file) => sum + file.lines.uncovered, 0);
    const totalFunctions = mockCoverageData.reduce((sum, file) => sum + file.functions.total, 0);
    const coveredFunctions = mockCoverageData.reduce((sum, file) => sum + file.functions.covered, 0);
    const totalBranches = mockCoverageData.reduce((sum, file) => sum + file.branches.total, 0);
    const coveredBranches = mockCoverageData.reduce((sum, file) => sum + file.branches.covered, 0);
    const totalStatements = mockCoverageData.reduce((sum, file) => sum + file.statements.total, 0);
    const coveredStatements = mockCoverageData.reduce((sum, file) => sum + file.statements.covered, 0);
    const overallCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;

    const coverageSummary: CoverageSummary = {
      totalFiles,
      totalLines,
      coveredLines,
      uncoveredLines,
      partialLines: 0,
      totalFunctions,
      coveredFunctions,
      totalBranches,
      coveredBranches,
      totalStatements,
      coveredStatements,
      overallCoverage: Math.round(overallCoverage * 100) / 100,
      trend: 'up'
    };

    setSummary(coverageSummary);
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
      case 'excellent': return '🟢';
      case 'good': return '🔵';
      case 'warning': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  const getCoveragePercentage = (covered: number, total: number) => {
    return total > 0 ? Math.round((covered / total) * 100) : 0;
  };

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const analyzeFile = (file: CoverageData) => {
    setSelectedFile(file.id);
    
    if (onFileAnalyzed) {
      onFileAnalyzed(file);
    }
    
    showNotification({
      title: 'Análise de Cobertura',
      description: `Analisando ${file.name} - ${getCoveragePercentage(file.lines.covered, file.lines.total)}% de cobertura`,
      type: 'info'
    });
  };

  const generateCoverageReport = () => {
    if (!summary) return;
    
    const report = {
      timestamp: new Date(),
      summary: summary,
      files: coverageData,
      recommendations: coverageData
        .filter(file => file.lines.uncovered > 0)
        .map(file => ({
          file: file.name,
          uncoveredLines: file.lines.uncovered,
          priority: file.status === 'critical' ? 'Alta' : file.status === 'warning' ? 'Média' : 'Baixa'
        }))
    };

    // Simular download do relatório
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coverage-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification({
      title: 'Relatório Gerado',
      description: 'Relatório de cobertura exportado com sucesso',
      type: 'success'
    });
  };

  const filteredData = coverageData.filter(file => {
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUncovered = !showUncovered || file.lines.uncovered > 0;
    
    return matchesType && matchesStatus && matchesSearch && matchesUncovered;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const coverageA = getCoveragePercentage(a.lines.covered, a.lines.total);
    const coverageB = getCoveragePercentage(b.lines.covered, b.lines.total);
    
    switch (sortBy) {
      case 'coverage':
        return coverageB - coverageA;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'uncovered':
        return b.lines.uncovered - a.lines.uncovered;
      case 'updated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return 0;
    }
  });

  if (!summary) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cobertura de Código</h2>
            <p className="text-gray-600">Análise detalhada da cobertura de testes</p>
          </div>
          <Button onClick={generateCoverageReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Resumo Geral */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.overallCoverage}%</div>
            <div className="text-sm text-blue-600">Cobertura Geral</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summary.coveredLines}</div>
            <div className="text-sm text-green-600">Linhas Cobertas</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{summary.uncoveredLines}</div>
            <div className="text-sm text-red-600">Linhas Não Cobertas</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{summary.totalFiles}</div>
            <div className="text-sm text-purple-600">Arquivos</div>
          </div>
        </div>

        {/* Barra de Progresso Geral */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Cobertura Geral:</span>
            <span className="font-medium">{summary.overallCoverage}%</span>
          </div>
          <Progress value={summary.overallCoverage} className="h-3" />
        </div>
      </Card>

      {/* Filtros e Busca */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <option value="all">Todos os Tipos</option>
            <option value="file">Arquivos</option>
            <option value="directory">Diretórios</option>
            <option value="function">Funções</option>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <option value="all">Todos os Status</option>
            <option value="excellent">Excelente</option>
            <option value="good">Bom</option>
            <option value="warning">Atenção</option>
            <option value="critical">Crítico</option>
          </Select>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <option value="coverage">Por Cobertura</option>
            <option value="name">Por Nome</option>
            <option value="uncovered">Por Linhas Não Cobertas</option>
            <option value="updated">Por Data</option>
          </Select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showUncovered}
              onChange={(e) => setShowUncovered(e.target.checked)}
              className="rounded"
              aria-label="Mostrar apenas arquivos não cobertos"
            />
            <span className="text-sm">Apenas Não Cobertos</span>
          </label>
        </div>
      </Card>

      {/* Tabs de Análise */}
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="files">Arquivos</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cobertura por Tipo */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Cobertura por Tipo</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Linhas</span>
                    <span className="text-sm font-medium">
                      {getCoveragePercentage(summary.coveredLines, summary.totalLines)}%
                    </span>
                  </div>
                  <Progress 
                    value={getCoveragePercentage(summary.coveredLines, summary.totalLines)} 
                    className="h-2" 
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Funções</span>
                    <span className="text-sm font-medium">
                      {getCoveragePercentage(summary.coveredFunctions, summary.totalFunctions)}%
                    </span>
                  </div>
                  <Progress 
                    value={getCoveragePercentage(summary.coveredFunctions, summary.totalFunctions)} 
                    className="h-2" 
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Branches</span>
                    <span className="text-sm font-medium">
                      {getCoveragePercentage(summary.coveredBranches, summary.totalBranches)}%
                    </span>
                  </div>
                  <Progress 
                    value={getCoveragePercentage(summary.coveredBranches, summary.totalBranches)} 
                    className="h-2" 
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Statements</span>
                    <span className="text-sm font-medium">
                      {getCoveragePercentage(summary.coveredStatements, summary.totalStatements)}%
                    </span>
                  </div>
                  <Progress 
                    value={getCoveragePercentage(summary.coveredStatements, summary.totalStatements)} 
                    className="h-2" 
                  />
                </div>
              </div>

              {/* Status dos Arquivos */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Status dos Arquivos</h4>
                <div className="space-y-3">
                  {['excellent', 'good', 'warning', 'critical'].map(status => {
                    const count = coverageData.filter(file => file.status === status).length;
                    const percentage = (count / coverageData.length) * 100;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span>{getStatusIcon(status)}</span>
                          <span className="text-sm text-gray-600 capitalize">{status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-sm text-gray-400">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Arquivos */}
          <TabsContent value="files" className="p-6">
            <div className="space-y-4">
              {sortedData.map((file) => {
                const lineCoverage = getCoveragePercentage(file.lines.covered, file.lines.total);
                const functionCoverage = getCoveragePercentage(file.functions.covered, file.functions.total);
                const branchCoverage = getCoveragePercentage(file.branches.covered, file.branches.total);
                
                return (
                  <div
                    key={file.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedFile === file.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => analyzeFile(file)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{file.name}</h4>
                          <Badge className={getStatusColor(file.status)}>
                            {file.status === 'excellent' ? 'Excelente' :
                             file.status === 'good' ? 'Bom' :
                             file.status === 'warning' ? 'Atenção' : 'Crítico'}
                          </Badge>
                          <Badge variant="outline">{file.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{file.path}</p>
                        
                        {/* Métricas de Cobertura */}
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{lineCoverage}%</div>
                            <div className="text-gray-500">Linhas</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{functionCoverage}%</div>
                            <div className="text-gray-500">Funções</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{branchCoverage}%</div>
                            <div className="text-gray-500">Branches</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">
                              {file.lines.uncovered}
                            </div>
                            <div className="text-gray-500">Não Cobertas</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-500">
                        <div>Atualizado em</div>
                        <div>{file.lastUpdated.toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    {/* Barra de Progresso */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Cobertura de Linhas</span>
                        <span>{lineCoverage}%</span>
                      </div>
                      <Progress 
                        value={lineCoverage} 
                        className={`h-2 ${getCoverageColor(lineCoverage)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Detalhes */}
          <TabsContent value="details" className="p-6">
            {selectedFile ? (
              <div className="space-y-6">
                {(() => {
                  const file = coverageData.find(f => f.id === selectedFile);
                  if (!file) return <div>Arquivo não encontrado</div>;
                  
                  return (
                    <>
                      <div className="border-b pb-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{file.name}</h4>
                        <p className="text-gray-600">{file.path}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{file.lines.total}</div>
                          <div className="text-sm text-gray-600">Total de Linhas</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{file.lines.covered}</div>
                          <div className="text-sm text-green-600">Linhas Cobertas</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{file.lines.uncovered}</div>
                          <div className="text-sm text-red-600">Linhas Não Cobertas</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {getCoveragePercentage(file.lines.covered, file.lines.total)}%
                          </div>
                          <div className="text-sm text-blue-600">Cobertura</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h5 className="font-medium text-gray-900">Detalhamento por Tipo</h5>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="p-4 border rounded-lg">
                            <h6 className="font-medium text-gray-900 mb-3">Funções</h6>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Cobertas:</span>
                                <span className="font-medium text-green-600">{file.functions.covered}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Não Cobertas:</span>
                                <span className="font-medium text-red-600">{file.functions.uncovered}</span>
                              </div>
                              <Progress 
                                value={getCoveragePercentage(file.functions.covered, file.functions.total)} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <h6 className="font-medium text-gray-900 mb-3">Branches</h6>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Cobertos:</span>
                                <span className="font-medium text-green-600">{file.branches.covered}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Não Cobertos:</span>
                                <span className="font-medium text-red-600">{file.branches.uncovered}</span>
                              </div>
                              <Progress 
                                value={getCoveragePercentage(file.branches.covered, file.branches.total)} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <h6 className="font-medium text-gray-900 mb-3">Statements</h6>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Cobertos:</span>
                                <span className="font-medium text-green-600">{file.statements.covered}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Não Cobertos:</span>
                                <span className="font-medium text-red-600">{file.statements.uncovered}</span>
                              </div>
                              <Progress 
                                value={getCoveragePercentage(file.statements.covered, file.statements.total)} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Selecione um arquivo para ver os detalhes da cobertura</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export { CodeCoverage };
export type { CoverageData, CoverageSummary, CodeCoverageProps };
