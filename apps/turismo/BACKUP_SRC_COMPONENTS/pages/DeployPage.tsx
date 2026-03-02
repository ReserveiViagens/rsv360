import React, { useState } from 'react';
import { Rocket, Play, Activity, Save, CheckCircle, AlertTriangle, Clock, TrendingUp, Server, Database, Globe, Shield, Zap, BarChart3, Users, CheckCircle2, Activity2, Settings, Eye, Download, Share, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui';
import {
  FinalDeploySystem,
  GoLiveSystem,
  ProductionMonitoring,
  BackupRecoverySystem
} from '../components/deploy';
import { useUIStore } from '../stores/useUIStore';

const DeployPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('deploy');
  const [quickStats, setQuickStats] = useState({
    totalEnvironments: 3,
    activeDeploys: 1,
    servicesOnline: 5,
    activeAlerts: 2,
    totalBackups: 8,
    systemHealth: 95
  });
  const { showNotification } = useUIStore();

  const handleDeployStarted = (config: any) => {
    showNotification(`Deploy iniciado para ${config.environment}`, 'info');
  };

  const handleDeployCompleted = (status: any) => {
    showNotification(`Deploy concluído para ${status.environment}`, 'success');
  };

  const handlePhaseStarted = (phase: any) => {
    showNotification(`Fase "${phase.name}" iniciada`, 'info');
  };

  const handlePhaseCompleted = (phase: any) => {
    showNotification(`Fase "${phase.name}" concluída`, 'success');
  };

  const handleGoLiveActivated = () => {
    showNotification('🎉 GO-LIVE ATIVADO! Sistema RSV em produção!', 'success');
  };

  const handleAlertCreated = (alert: any) => {
    showNotification(`Novo alerta: ${alert.title}`, alert.severity === 'critical' ? 'error' : 'warning');
  };

  const handleAlertResolved = (alert: any) => {
    showNotification(`Alerta resolvido: ${alert.title}`, 'success');
  };

  const handleBackupStarted = (job: any) => {
    showNotification(`Backup iniciado: ${job.name}`, 'info');
  };

  const handleRecoveryStarted = (point: any) => {
    showNotification(`Recuperação iniciada do backup ${new Date(point.timestamp).toLocaleDateString()}`, 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🚀 Deploy e Go-Live</h1>
            <p className="text-gray-600">Sistema completo de deploy, monitoramento e ativação do RSV</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button>
              <Rocket className="w-4 h-4 mr-2" />
              Deploy Rápido
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Server className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ambientes</p>
                <p className="text-xl font-bold text-gray-900">{quickStats.totalEnvironments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Rocket className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Deploys Ativos</p>
                <p className="text-xl font-bold text-gray-900">{quickStats.activeDeploys}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Serviços Online</p>
                <p className="text-xl font-bold text-gray-900">{quickStats.servicesOnline}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Alertas Ativos</p>
                <p className="text-xl font-bold text-gray-900">{quickStats.activeAlerts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Save className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Backups</p>
                <p className="text-xl font-bold text-gray-900">{quickStats.totalBackups}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saúde Sistema</p>
                <p className="text-xl font-bold text-gray-900">{quickStats.systemHealth}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Status de Deploy</h3>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Produção</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Staging</span>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">Deploy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Teste</span>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600">Manutenção</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Progresso Go-Live</h3>
              <Badge variant="outline">75%</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Infraestrutura</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deploy</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Testes</span>
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ativação</span>
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Monitoramento</h3>
              <Badge variant="default">Real-time</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU</span>
                <span className="text-sm font-medium text-gray-900">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Memória</span>
                <span className="text-sm font-medium text-yellow-600">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disco</span>
                <span className="text-sm font-medium text-gray-900">65%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rede</span>
                <span className="text-sm font-medium text-gray-900">120 Mbps</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-16" onClick={() => setActiveTab('deploy')}>
              <Rocket className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">Iniciar Deploy</div>
                <div className="text-sm opacity-90">Para produção</div>
              </div>
            </Button>
            
            <Button className="h-16" variant="outline" onClick={() => setActiveTab('go-live')}>
              <Play className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">Ativar Go-Live</div>
                <div className="text-sm opacity-90">Sistema final</div>
              </div>
            </Button>
            
            <Button className="h-16" variant="outline" onClick={() => setActiveTab('monitoring')}>
              <Activity className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">Ver Status</div>
                <div className="text-sm opacity-90">Monitoramento</div>
              </div>
            </Button>
            
            <Button className="h-16" variant="outline" onClick={() => setActiveTab('backup')}>
              <Save className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">Backup Manual</div>
                <div className="text-sm opacity-90">Segurança</div>
              </div>
            </Button>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Deploy concluído com sucesso</p>
                <p className="text-xs text-gray-600">Produção • há 30 minutos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Deploy em andamento</p>
                <p className="text-xs text-gray-600">Staging • há 15 minutos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Alerta de memória alta</p>
                <p className="text-xs text-gray-600">Sistema • há 1 hora</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Save className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Backup automático concluído</p>
                <p className="text-xs text-gray-600">Banco de dados • há 2 horas</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-14">
            <TabsTrigger value="deploy" className="flex items-center space-x-2">
              <Rocket className="w-4 h-4" />
              <span>Deploy Final</span>
            </TabsTrigger>
            <TabsTrigger value="go-live" className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Go-Live</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Monitoramento</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Backup</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deploy" className="p-6">
            <FinalDeploySystem
              onDeployStarted={handleDeployStarted}
              onDeployCompleted={handleDeployCompleted}
            />
          </TabsContent>

          <TabsContent value="go-live" className="p-6">
            <GoLiveSystem
              onPhaseStarted={handlePhaseStarted}
              onPhaseCompleted={handlePhaseCompleted}
              onGoLiveActivated={handleGoLiveActivated}
            />
          </TabsContent>

          <TabsContent value="monitoring" className="p-6">
            <ProductionMonitoring
              onAlertCreated={handleAlertCreated}
              onAlertResolved={handleAlertResolved}
            />
          </TabsContent>

          <TabsContent value="backup" className="p-6">
            <BackupRecoverySystem
              onBackupStarted={handleBackupStarted}
              onRecoveryStarted={handleRecoveryStarted}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export { DeployPage };
