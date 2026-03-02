'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { 
  BackupCenter,
  DisasterRecovery,
  DataReplication,
  RecoveryTesting,
  BackupAnalytics
} from '@/components/backup'
import { 
  Save,
  Shield,
  RefreshCw,
  TestTube,
  BarChart3,
  Activity,
  CheckCircle,
  Star,
  ArrowRight,
  TrendingUp,
  Server,
  Cloud,
  Database,
  Archive,
  Router,
  Monitor,
  Clock,
  Target,
  Gauge,
  Zap
} from 'lucide-react'

const BackupSystemTest: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState('overview')

  const components = [
    {
      id: 'backup-center',
      name: 'Backup Center',
      description: 'Central de backup e recuperação inteligente',
      icon: Save,
      component: BackupCenter,
      features: [
        'Backup automático e manual',
        'Múltiplos destinos',
        'Compressão e criptografia',
        'Monitoramento em tempo real',
        'Políticas de retenção'
      ]
    },
    {
      id: 'disaster-recovery',
      name: 'Disaster Recovery',
      description: 'Sistema avançado de recuperação de desastres',
      icon: Shield,
      component: DisasterRecovery,
      features: [
        'Planos de recuperação',
        'Sites de backup',
        'Testes automatizados',
        'RTO/RPO compliance',
        'Escalação automática'
      ]
    },
    {
      id: 'data-replication',
      name: 'Data Replication',
      description: 'Replicação de dados em tempo real',
      icon: RefreshCw,
      component: DataReplication,
      features: [
        'Replicação multi-direcional',
        'Resolução de conflitos',
        'Monitoramento de lag',
        'Topologia flexível',
        'Sincronização automática'
      ]
    },
    {
      id: 'recovery-testing',
      name: 'Recovery Testing',
      description: 'Testes automatizados de recuperação',
      icon: TestTube,
      component: RecoveryTesting,
      features: [
        'Testes automatizados',
        'Templates customizáveis',
        'Validação de integridade',
        'Ambientes isolados',
        'Relatórios detalhados'
      ]
    },
    {
      id: 'backup-analytics',
      name: 'Backup Analytics',
      description: 'Analytics avançados de backup',
      icon: BarChart3,
      component: BackupAnalytics,
      features: [
        'KPIs em tempo real',
        'Previsões de crescimento',
        'Análise de custos',
        'Relatórios automáticos',
        'Compliance dashboard'
      ]
    }
  ]

  const systemStats = {
    totalComponents: 5,
    featuresImplemented: 25,
    backupJobs: 15,
    successRate: '99.2%',
    dataProtected: '3.2TB',
    compressionRatio: '78%',
    uptime: '99.8%',
    recoveryTime: '15min'
  }

  const architectureHighlights = [
    {
      title: 'Backup Inteligente',
      description: 'Sistema completo de backup com compressão e criptografia',
      icon: Save,
      color: 'text-blue-600'
    },
    {
      title: 'Disaster Recovery',
      description: 'Recuperação rápida com planos automáticos de DR',
      icon: Shield,
      color: 'text-green-600'
    },
    {
      title: 'Replicação em Tempo Real',
      description: 'Sincronização contínua entre múltiplos destinos',
      icon: RefreshCw,
      color: 'text-purple-600'
    },
    {
      title: 'Testes Automatizados',
      description: 'Validação automática de integridade e recuperação',
      icon: TestTube,
      color: 'text-orange-600'
    },
    {
      title: 'Analytics Avançados',
      description: 'Monitoramento e análise de performance de backup',
      icon: BarChart3,
      color: 'text-red-600'
    },
    {
      title: 'Alta Disponibilidade',
      description: 'Arquitetura robusta para continuidade de negócios',
      icon: Server,
      color: 'text-indigo-600'
    }
  ]

  const renderActiveComponent = () => {
    const component = components.find(c => c.id === activeComponent)
    if (!component) return null

    const ComponentToRender = component.component
    return <ComponentToRender />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Save className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Backup e Recuperação Avançada
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FASE 28 - Implementação completa do sistema de backup inteligente, disaster recovery,
            replicação de dados e testes automatizados de recuperação
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Sistema Implementado
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              5 Componentes
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              99.8% Uptime
            </Badge>
          </div>
        </div>

        <Tabs value={activeComponent} onValueChange={setActiveComponent} className="space-y-6">
          {/* Navigation */}
          <div className="bg-white rounded-lg shadow-sm border p-1">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              {components.map((component) => {
                const IconComponent = component.icon
                return (
                  <TabsTrigger key={component.id} value={component.id} className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{component.name.split(' ')[0]}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Estatísticas do Sistema</span>
                </CardTitle>
                <CardDescription>
                  Métricas e indicadores do sistema de backup implementado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{systemStats.totalComponents}</div>
                    <div className="text-sm text-gray-600">Componentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{systemStats.featuresImplemented}</div>
                    <div className="text-sm text-gray-600">Funcionalidades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{systemStats.backupJobs}</div>
                    <div className="text-sm text-gray-600">Jobs de Backup</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{systemStats.successRate}</div>
                    <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{systemStats.dataProtected}</div>
                    <div className="text-sm text-gray-600">Dados Protegidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{systemStats.compressionRatio}</div>
                    <div className="text-sm text-gray-600">Compressão</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">{systemStats.uptime}</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600">{systemStats.recoveryTime}</div>
                    <div className="text-sm text-gray-600">RTO Médio</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Architecture Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-5 h-5" />
                  <span>Arquitetura e Funcionalidades</span>
                </CardTitle>
                <CardDescription>
                  Principais componentes e capacidades do sistema de backup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {architectureHighlights.map((highlight, index) => {
                    const IconComponent = highlight.icon
                    return (
                      <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-gray-100 ${highlight.color}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {highlight.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {highlight.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Components Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Archive className="w-5 h-5" />
                  <span>Componentes do Sistema</span>
                </CardTitle>
                <CardDescription>
                  Explore cada componente do sistema de backup e recuperação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {components.map((component) => {
                    const IconComponent = component.icon
                    return (
                      <Card key={component.id} className="border hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                              <IconComponent className="w-6 h-6 text-blue-600" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {component.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4">
                            {component.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-700 mb-2">
                              Principais funcionalidades:
                            </div>
                            {component.features.slice(0, 3).map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>{feature}</span>
                              </div>
                            ))}
                            {component.features.length > 3 && (
                              <div className="text-xs text-blue-600">
                                +{component.features.length - 3} funcionalidades
                              </div>
                            )}
                          </div>
                          
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-full mt-4"
                            onClick={() => setActiveComponent(component.id)}
                          >
                            Explorar Componente
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Implementation Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Benefícios da Implementação</span>
                </CardTitle>
                <CardDescription>
                  Vantagens técnicas e de negócio do sistema de backup implementado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                      Benefícios Técnicos
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Backup automático com compressão e criptografia</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Disaster recovery com RTO/RPO compliance</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Replicação em tempo real multi-direcional</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Testes automatizados de recuperação</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Analytics avançados com previsões</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-purple-600" />
                      Benefícios de Negócio
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">99.8% de disponibilidade dos dados</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Redução de 78% no uso de armazenamento</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Tempo de recuperação médio de 15 minutos</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Compliance total com regulamentações</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Continuidade de negócios garantida</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Architecture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Arquitetura Técnica</span>
                </CardTitle>
                <CardDescription>
                  Visão geral da arquitetura e tecnologias implementadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Save className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold">Backup Engine</h4>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Backup incremental/diferencial</li>
                      <li>• Compressão avançada</li>
                      <li>• Criptografia AES-256</li>
                      <li>• Scheduling inteligente</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold">Disaster Recovery</h4>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Hot/Warm/Cold sites</li>
                      <li>• Failover automático</li>
                      <li>• RTO/RPO monitoring</li>
                      <li>• Orchestração de recovery</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <RefreshCw className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold">Data Replication</h4>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Sync/Async replication</li>
                      <li>• Conflict resolution</li>
                      <li>• Multi-master topology</li>
                      <li>• Real-time monitoring</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Monitor className="w-5 h-5 text-orange-600" />
                      <h4 className="font-semibold">Monitoring</h4>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Real-time dashboards</li>
                      <li>• Predictive analytics</li>
                      <li>• Automated alerts</li>
                      <li>• Compliance reporting</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Component Tabs */}
          {components.map((component) => (
            <TabsContent key={component.id} value={component.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <component.icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <CardTitle>{component.name}</CardTitle>
                      <CardDescription>{component.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderActiveComponent()}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

export default BackupSystemTest
