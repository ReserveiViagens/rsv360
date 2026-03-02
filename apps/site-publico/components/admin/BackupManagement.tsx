/**
 * Componente de Gerenciamento de Backups
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, FileArchive, HardDrive, Play, RotateCcw, BarChart3, Loader2 } from 'lucide-react';
import { useToast } from '@/components/providers/toast-wrapper';

interface BackupConfig {
  id: number;
  name: string;
  type: 'database' | 'files' | 'full';
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

interface BackupStats {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalSize: number;
  lastBackup?: string;
  nextBackup?: string;
}

export function BackupManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadConfigs(), loadStats()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/backup');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConfigs(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/backup/stats');
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

  const handleExecuteBackup = async (configId: number) => {
    try {
      setLoading(true);
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          config_id: configId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Backup iniciado',
          description: data.message || 'Backup em execução',
        });
        await loadData();
      } else {
        throw new Error('Erro ao executar backup');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao executar backup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'files':
        return <FileArchive className="w-4 h-4" />;
      case 'full':
        return <HardDrive className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      database: 'Banco de Dados',
      files: 'Arquivos',
      full: 'Completo',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estatísticas de Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total de Backups</p>
                <p className="text-2xl font-bold">{stats.totalBackups}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sucessos</p>
                <p className="text-2xl font-bold text-green-600">{stats.successfulBackups}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Falhas</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedBackups}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tamanho Total</p>
                <p className="text-2xl font-bold">{formatBytes(stats.totalSize)}</p>
              </div>
            </div>
            {stats.lastBackup && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Último backup: {new Date(stats.lastBackup).toLocaleString('pt-BR')}
                </p>
                {stats.nextBackup && (
                  <p className="text-sm text-muted-foreground">
                    Próximo backup: {new Date(stats.nextBackup).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configurações de Backup */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Backup</CardTitle>
          <CardDescription>
            Gerencie suas configurações de backup automatizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HardDrive className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma configuração de backup encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="p-4 border rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(config.type)}
                      <h4 className="font-medium">{config.name}</h4>
                      <Badge variant="outline">{getTypeLabel(config.type)}</Badge>
                      <Badge variant="outline">{config.schedule}</Badge>
                      {config.enabled ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline">Inativo</Badge>
                      )}
                    </div>
                    {config.lastRun && (
                      <p className="text-sm text-muted-foreground">
                        Última execução: {new Date(config.lastRun).toLocaleString('pt-BR')}
                      </p>
                    )}
                    {config.nextRun && (
                      <p className="text-sm text-muted-foreground">
                        Próxima execução: {new Date(config.nextRun).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleExecuteBackup(config.id)}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

