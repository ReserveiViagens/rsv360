'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  User,
  Activity,
  Shield,
  Database,
  Settings,
  Users,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { cn } from '@/lib/utils';

interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  category: 'auth' | 'user' | 'system' | 'data' | 'security' | 'admin';
  details: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  timestamp: Date;
  status: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

interface AuditFilters {
  search: string;
  category: string;
  status: string;
  severity: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
}

export const AuditLog: React.FC = () => {
  const { user } = useAuth();
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({
    search: '',
    category: '',
    status: '',
    severity: '',
    userId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockEntries: AuditEntry[] = [
      {
        id: '1',
        userId: '1',
        userName: 'João Silva',
        userEmail: 'joao.silva@rsv.com',
        action: 'LOGIN_SUCCESS',
        category: 'auth',
        details: 'Login realizado com sucesso via email/senha',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'São Paulo, BR',
        timestamp: new Date(),
        status: 'success',
        severity: 'low',
        metadata: { method: 'email', twoFactor: false }
      },
      {
        id: '2',
        userId: '2',
        userName: 'Maria Santos',
        userEmail: 'maria.santos@rsv.com',
        action: 'USER_CREATED',
        category: 'user',
        details: 'Novo usuário criado: pedro.oliveira@rsv.com',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        location: 'Rio de Janeiro, BR',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'success',
        severity: 'medium',
        metadata: { newUserId: '3', role: 'user' }
      },
      {
        id: '3',
        userId: 'unknown',
        userName: 'N/A',
        userEmail: 'hacker@example.com',
        action: 'LOGIN_FAILED',
        category: 'security',
        details: 'Tentativa de login falhou - credenciais inválidas',
        ipAddress: '203.0.113.1',
        userAgent: 'Mozilla/5.0 (compatible; Bot/1.0)',
        location: 'Unknown',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'failure',
        severity: 'high',
        metadata: { attempts: 5, blocked: true }
      },
      {
        id: '4',
        userId: '1',
        userName: 'João Silva',
        userEmail: 'joao.silva@rsv.com',
        action: 'DATA_EXPORTED',
        category: 'data',
        details: 'Exportação de relatório de clientes em CSV',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'São Paulo, BR',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success',
        severity: 'medium',
        metadata: { reportType: 'clients', format: 'csv', recordCount: 156 }
      },
      {
        id: '5',
        userId: '1',
        userName: 'João Silva',
        userEmail: 'joao.silva@rsv.com',
        action: 'SETTINGS_CHANGED',
        category: 'system',
        details: 'Configurações de segurança alteradas',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'São Paulo, BR',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'success',
        severity: 'high',
        metadata: { setting: 'password_policy', oldValue: 'weak', newValue: 'strong' }
      }
    ];

    setAuditEntries(mockEntries);
    setFilteredEntries(mockEntries);
    setLoading(false);
  }, []);

  // Filtrar entradas
  useEffect(() => {
    let filtered = auditEntries;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.action.toLowerCase().includes(searchLower) ||
        entry.details.toLowerCase().includes(searchLower) ||
        entry.userName.toLowerCase().includes(searchLower) ||
        entry.userEmail.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(entry => entry.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(entry => entry.status === filters.status);
    }

    if (filters.severity) {
      filtered = filtered.filter(entry => entry.severity === filters.severity);
    }

    if (filters.userId) {
      filtered = filtered.filter(entry => entry.userId === filters.userId);
    }

    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filtered = filtered.filter(entry => entry.timestamp >= dateFrom);
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      filtered = filtered.filter(entry => entry.timestamp <= dateTo);
    }

    setFilteredEntries(filtered);
  }, [auditEntries, filters]);

  const refreshData = async () => {
    setRefreshing(true);
    // Simular refresh da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const exportAuditLog = () => {
    const csvContent = [
      ['ID', 'Usuário', 'Ação', 'Categoria', 'Status', 'Severidade', 'Data/Hora', 'IP', 'Localização'],
      ...filteredEntries.map(entry => [
        entry.id,
        entry.userName,
        entry.action,
        entry.category,
        entry.status,
        entry.severity,
        entry.timestamp.toLocaleString('pt-BR'),
        entry.ipAddress,
        entry.location
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_log.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <Shield className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      case 'admin': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failure': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      auth: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      user: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      system: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      data: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      security: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      admin: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    };
    return colors[category as keyof typeof colors] || colors.system;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Log de Auditoria
          </CardTitle>
          <CardDescription>
            Rastreamento completo de todas as ações dos usuários no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
              >
                {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSensitiveData ? 'Ocultar' : 'Mostrar'} Dados Sensíveis
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportAuditLog}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar no log..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <select
              title="Filtrar por categoria"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              <option value="auth">Autenticação</option>
              <option value="user">Usuários</option>
              <option value="system">Sistema</option>
              <option value="data">Dados</option>
              <option value="security">Segurança</option>
              <option value="admin">Administração</option>
            </select>

            <select
              title="Filtrar por status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="success">Sucesso</option>
              <option value="failure">Falha</option>
              <option value="warning">Aviso</option>
            </select>

            <select
              title="Filtrar por severidade"
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as severidades</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>

          {/* Filtros de Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  search: '',
                  category: '',
                  status: '',
                  severity: '',
                  userId: '',
                  dateFrom: '',
                  dateTo: ''
                })}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Lista de Entradas */}
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card 
                key={entry.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedEntry(entry)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getCategoryIcon(entry.category)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.action}</span>
                          <Badge className={getCategoryColor(entry.category)}>
                            {entry.category}
                          </Badge>
                          <Badge className={getSeverityColor(entry.severity)}>
                            {entry.severity}
                          </Badge>
                          {getStatusIcon(entry.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.details}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.userName} ({entry.userEmail})
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {entry.timestamp.toLocaleString('pt-BR')}
                          </div>
                          {showSensitiveData && (
                            <>
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {entry.ipAddress}
                              </div>
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {entry.location}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {filteredEntries.length} de {auditEntries.length} entradas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {selectedEntry && (
        <Card className="fixed inset-4 bg-white dark:bg-gray-900 z-50 overflow-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detalhes da Entrada de Auditoria</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedEntry(null)}
              >
                Fechar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Informações Básicas</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {selectedEntry.id}</div>
                  <div><strong>Ação:</strong> {selectedEntry.action}</div>
                  <div><strong>Categoria:</strong> {selectedEntry.category}</div>
                  <div><strong>Status:</strong> {selectedEntry.status}</div>
                  <div><strong>Severidade:</strong> {selectedEntry.severity}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Usuário</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Nome:</strong> {selectedEntry.userName}</div>
                  <div><strong>Email:</strong> {selectedEntry.userEmail}</div>
                  <div><strong>ID:</strong> {selectedEntry.userId}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Detalhes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedEntry.details}
              </p>
            </div>
            
            {showSensitiveData && (
              <div>
                <h4 className="font-medium mb-2">Dados Técnicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>IP:</strong> {selectedEntry.ipAddress}</div>
                  <div><strong>Localização:</strong> {selectedEntry.location}</div>
                  <div><strong>User Agent:</strong> {selectedEntry.userAgent}</div>
                  <div><strong>Timestamp:</strong> {selectedEntry.timestamp.toISOString()}</div>
                </div>
              </div>
            )}
            
            {selectedEntry.metadata && Object.keys(selectedEntry.metadata).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Metadados</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(selectedEntry.metadata, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditLog;
