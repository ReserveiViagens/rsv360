/**
 * Componente de Gerenciamento de Disaster Recovery
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  Activity, 
  Play, 
  TestTube, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/providers/toast-wrapper';

interface SystemHealth {
  database: string;
  cache: string;
  storage: string;
  api: string;
  overall: string;
  lastChecked: string;
  issues: Array<{
    component: string;
    severity: string;
    message: string;
    detectedAt: string;
  }>;
}

interface RecoveryPlan {
  id: number;
  name: string;
  description?: string;
  priority: string;
  rto: number;
  rpo: number;
  enabled: boolean;
  lastTested?: string;
  lastExecuted?: string;
}

export function DisasterRecovery() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [plans, setPlans] = useState<RecoveryPlan[]>([]);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    loadData();
    // Verificar saúde a cada 30 segundos
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    await Promise.all([loadPlans(), checkHealth()]);
  };

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/disaster-recovery/plans');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPlans(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const checkHealth = async () => {
    try {
      setCheckingHealth(true);
      const response = await fetch('/api/disaster-recovery/health');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHealth(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar saúde:', error);
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleExecutePlan = async (planId: number, test: boolean = false) => {
    if (!test && !confirm('Tem certeza que deseja executar este plano de recuperação? Esta ação pode afetar o sistema.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/disaster-recovery/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          test,
          reason: test ? 'Teste de plano' : 'Execução manual',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: test ? 'Teste executado' : 'Plano executado',
          description: data.message || 'Execução iniciada com sucesso',
        });
        await loadData();
      } else {
        throw new Error('Erro ao executar plano');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao executar plano',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'down':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Saudável</Badge>;
      case 'degraded':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Degradado</Badge>;
      case 'down':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Indisponível</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-50 text-red-700 border-red-200',
      high: 'bg-orange-50 text-orange-700 border-orange-200',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      low: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return (
      <Badge variant="outline" className={colors[priority] || ''}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Saúde do Sistema */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Saúde do Sistema
              </CardTitle>
              <CardDescription>
                Monitoramento em tempo real do status dos componentes
              </CardDescription>
            </div>
            <Button
              onClick={checkHealth}
              disabled={checkingHealth}
              size="sm"
              variant="outline"
            >
              {checkingHealth ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Verificar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {health ? (
            <div className="space-y-4">
              {/* Status Geral */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Status Geral</span>
                  {getStatusBadge(health.overall)}
                </div>
                {health.overall !== 'healthy' && (
                  <Alert variant={health.overall === 'down' ? 'destructive' : 'default'} className="mt-2">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                      O sistema está {health.overall === 'down' ? 'indisponível' : 'degradado'}.
                      Considere executar um plano de recuperação.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Componentes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(health.database)}
                    <span className="text-sm font-medium">Banco de Dados</span>
                  </div>
                  {getStatusBadge(health.database)}
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(health.cache)}
                    <span className="text-sm font-medium">Cache</span>
                  </div>
                  {getStatusBadge(health.cache)}
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(health.storage)}
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  {getStatusBadge(health.storage)}
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(health.api)}
                    <span className="text-sm font-medium">API</span>
                  </div>
                  {getStatusBadge(health.api)}
                </div>
              </div>

              {/* Issues */}
              {health.issues && health.issues.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Problemas Detectados</h4>
                  <div className="space-y-2">
                    {health.issues.map((issue, idx) => (
                      <Alert
                        key={idx}
                        variant={issue.severity === 'critical' ? 'destructive' : 'default'}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <AlertTitle>{issue.component}</AlertTitle>
                        <AlertDescription>{issue.message}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Última verificação: {new Date(health.lastChecked).toLocaleString('pt-BR')}
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Carregando status do sistema...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planos de Recuperação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Planos de Recuperação
          </CardTitle>
          <CardDescription>
            Gerencie seus planos de recuperação de desastres
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum plano de recuperação encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{plan.name}</h4>
                        {getPriorityBadge(plan.priority)}
                        {plan.enabled ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          RTO: {plan.rto} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          RPO: {plan.rpo} min
                        </span>
                        {plan.lastTested && (
                          <span>
                            Último teste: {new Date(plan.lastTested).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {plan.lastExecuted && (
                          <span>
                            Última execução: {new Date(plan.lastExecuted).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleExecutePlan(plan.id, true)}
                        disabled={loading}
                        size="sm"
                        variant="outline"
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        Testar
                      </Button>
                      <Button
                        onClick={() => handleExecutePlan(plan.id, false)}
                        disabled={loading}
                        size="sm"
                        variant="destructive"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Executar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

