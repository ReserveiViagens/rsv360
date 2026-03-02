/**
 * Componente de Visualização de Logs de Auditoria
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Search, Filter, Loader2, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from '@/components/providers/toast-wrapper';

interface AuditLog {
  id: number;
  userId?: number;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  severity: string;
  timestamp: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
}

interface AuditStats {
  totalLogs: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  bySeverity: Record<string, number>;
  byUser: Record<string, number>;
}

export function AuditLogs() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    severity: '',
    startDate: '',
    endDate: '',
    userId: '',
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
  });

  useEffect(() => {
    loadData();
  }, [filters, pagination]);

  const loadData = async () => {
    await Promise.all([loadLogs(), loadStats()]);
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.action) params.append('action', filters.action);
      if (filters.resource) params.append('resource', filters.resource);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.userId) params.append('user_id', filters.userId);
      
      params.append('limit', String(pagination.limit));
      params.append('offset', String(pagination.offset));

      const response = await fetch(`/api/audit?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLogs(data.data);
          setTotal(data.pagination?.total || 0);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/audit/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.resource) params.append('resource', filters.resource);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);

      const response = await fetch(`/api/audit/export?${params.toString()}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Exportação concluída',
          description: 'Logs exportados com sucesso',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao exportar logs',
        variant: 'destructive',
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-50 text-red-700 border-red-200',
      error: 'bg-red-50 text-red-600 border-red-200',
      warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      info: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return (
      <Badge variant="outline" className={colors[severity] || ''}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Auditoria</CardTitle>
            <CardDescription>
              Visão geral das atividades registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total de Logs</p>
                <p className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ações Únicas</p>
                <p className="text-2xl font-bold">{Object.keys(stats.byAction).length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recursos</p>
                <p className="text-2xl font-bold">{Object.keys(stats.byResource).length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuários</p>
                <p className="text-2xl font-bold">{Object.keys(stats.byUser).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="action">Ação</Label>
              <Input
                id="action"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                placeholder="create, update, delete..."
              />
            </div>
            <div>
              <Label htmlFor="resource">Recurso</Label>
              <Input
                id="resource"
                value={filters.resource}
                onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
                placeholder="booking, customer..."
              />
            </div>
            <div>
              <Label htmlFor="severity">Severidade</Label>
              <Select
                value={filters.severity || 'all'}
                onValueChange={(value) => setFilters({ ...filters, severity: value === 'all' ? undefined : value })}
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleExport} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Logs de Auditoria
          </CardTitle>
          <CardDescription>
            {total.toLocaleString()} logs encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum log encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityIcon(log.severity)}
                        <span className="font-medium">{log.action}</span>
                        <Badge variant="outline">{log.resource}</Badge>
                        {log.resourceId && (
                          <Badge variant="outline">ID: {log.resourceId}</Badge>
                        )}
                        {getSeverityBadge(log.severity)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {log.userEmail && (
                          <p>Usuário: {log.userEmail} {log.userId && `(${log.userId})`}</p>
                        )}
                        {log.endpoint && (
                          <p>Endpoint: {log.method} {log.endpoint}</p>
                        )}
                        {log.ipAddress && (
                          <p>IP: {log.ipAddress}</p>
                        )}
                        {log.statusCode && (
                          <p>Status: {log.statusCode}</p>
                        )}
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div className="mt-2 p-2 bg-muted rounded">
                            <p className="font-medium mb-1">Mudanças:</p>
                            {Object.entries(log.changes).map(([key, change]) => (
                              <p key={key} className="text-xs">
                                <strong>{key}:</strong> {String(change.old)} → {String(change.new)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}

              {/* Paginação */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Mostrando {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, total)} de {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPagination({ ...pagination, offset: Math.max(0, pagination.offset - pagination.limit) })}
                    disabled={pagination.offset === 0}
                    size="sm"
                    variant="outline"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setPagination({ ...pagination, offset: pagination.offset + pagination.limit })}
                    disabled={pagination.offset + pagination.limit >= total}
                    size="sm"
                    variant="outline"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

