'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { 
  APIGateway,
  MicroservicesManager,
  WebhookManager,
  ServiceDiscovery,
  IntegrationHub
} from '@/components/integrations'
import { 
  Globe,
  Server,
  Webhook,
  Search,
  Package,
  Network,
  Activity,
  TrendingUp,
  Settings,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Database,
  Cloud,
  Router,
  Code
} from 'lucide-react'

const IntegrationSystemTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const systemComponents = [
    {
      id: 'api-gateway',
      name: 'API Gateway',
      description: 'Gateway centralizado para gerenciar APIs externas',
      icon: Globe,
      status: 'active',
      metrics: {
        endpoints: 15,
        requests_hour: 2456,
        response_time: '156ms',
        success_rate: 99.2
      },
      features: ['Rate Limiting', 'Load Balancing', 'Authentication', 'Monitoring']
    },
    {
      id: 'microservices',
      name: 'Microservices Manager',
      description: 'Orquestração e monitoramento de microsserviços',
      icon: Server,
      status: 'active',
      metrics: {
        services: 5,
        instances: 12,
        cpu_avg: 47,
        memory_total: '4.7GB'
      },
      features: ['Service Discovery', 'Health Checks', 'Auto Scaling', 'Deployment']
    },
    {
      id: 'webhooks',
      name: 'Webhook Manager',
      description: 'Sistema de webhooks bidirecionais',
      icon: Webhook,
      status: 'active',
      metrics: {
        endpoints: 4,
        deliveries_day: 4736,
        success_rate: 96.2,
        avg_response: '156ms'
      },
      features: ['Event Routing', 'Retry Logic', 'Security', 'Monitoring']
    },
    {
      id: 'service-discovery',
      name: 'Service Discovery',
      description: 'Descoberta automática de serviços',
      icon: Search,
      status: 'active',
      metrics: {
        services_registered: 5,
        registries_active: 2,
        health_checks: 2847,
        availability: '99.7%'
      },
      features: ['Auto Registration', 'Health Monitoring', 'Load Balancing', 'Circuit Breaker']
    },
    {
      id: 'integration-hub',
      name: 'Integration Hub',
      description: 'Central de integrações disponíveis',
      icon: Package,
      status: 'active',
      metrics: {
        integrations_total: 8,
        installed: 4,
        requests_day: 47892,
        success_rate: '98.7%'
      },
      features: ['Marketplace', 'Templates', 'Developer Tools', 'Analytics']
    }
  ]

  const systemStats = {
    total_apis: 32,
    requests_per_hour: 15672,
    system_uptime: '99.8%',
    integrations_active: 15,
    microservices_running: 12,
    webhook_deliveries: 8934,
    avg_response_time: '142ms',
    success_rate: '98.4%'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Sistema de Integração</h1>
          <p className="text-xl text-gray-600 mt-2">
            FASE 25: Integração com APIs Externas e Microsserviços
          </p>
          <p className="text-gray-500 mt-1">
            API Gateway, gerenciamento de microsserviços, webhooks, service discovery e hub de integrações
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
            <Network className="w-5 h-5 mr-2" />
            Sistema Ativo
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="api-gateway">API Gateway</TabsTrigger>
          <TabsTrigger value="microservices">Microsserviços</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="service-discovery">Service Discovery</TabsTrigger>
          <TabsTrigger value="integration-hub">Integration Hub</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas Gerais do Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
                <Globe className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {systemStats.total_apis}
                </div>
                <p className="text-xs text-gray-600">Ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requests/h</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {systemStats.requests_per_hour.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">Última hora</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {systemStats.system_uptime}
                </div>
                <p className="text-xs text-gray-600">Sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Integrações</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {systemStats.integrations_active}
                </div>
                <p className="text-xs text-gray-600">Ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Microsserviços</CardTitle>
                <Server className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {systemStats.microservices_running}
                </div>
                <p className="text-xs text-gray-600">Em execução</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
                <Webhook className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {systemStats.webhook_deliveries.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">Entregas hoje</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Resp.</CardTitle>
                <Zap className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {systemStats.avg_response_time}
                </div>
                <p className="text-xs text-gray-600">Médio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa Sucesso</CardTitle>
                <CheckCircle className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {systemStats.success_rate}
                </div>
                <p className="text-xs text-gray-600">Geral</p>
              </CardContent>
            </Card>
          </div>

          {/* Componentes do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Componentes do Sistema de Integração</CardTitle>
              <CardDescription>
                Módulos de integração com APIs externas e microsserviços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {systemComponents.map((component) => {
                  const IconComponent = component.icon
                  
                  return (
                    <div key={component.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-xl">{component.name}</h3>
                            <p className="text-gray-600">{component.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(component.status)}>
                            {component.status}
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => setActiveTab(component.id)}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Acessar
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {Object.entries(component.metrics).map(([key, value]) => (
                          <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 capitalize">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Principais funcionalidades:</p>
                        <div className="flex flex-wrap gap-2">
                          {component.features.map((feature, index) => (
                            <Badge key={index} variant="secondary">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Arquitetura do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Arquitetura do Sistema</CardTitle>
              <CardDescription>
                Visão geral da arquitetura de integração e microsserviços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Componentes Principais</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">API Gateway</p>
                        <p className="text-sm text-gray-600">Ponto de entrada unificado</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Server className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Microsserviços</p>
                        <p className="text-sm text-gray-600">Serviços distribuídos</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Webhook className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Webhooks</p>
                        <p className="text-sm text-gray-600">Comunicação assíncrona</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Search className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Service Discovery</p>
                        <p className="text-sm text-gray-600">Descoberta de serviços</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Benefícios da Arquitetura</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Escalabilidade horizontal automática</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Tolerância a falhas com circuit breakers</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>Comunicação assíncrona eficiente</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span>Descoberta automática de serviços</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>Monitoramento centralizado</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Integração simplificada com APIs externas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrações Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle>Integrações Disponíveis</CardTitle>
              <CardDescription>
                APIs e serviços integrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Stripe', category: 'Pagamentos', icon: CreditCard, status: 'active' },
                  { name: 'SendGrid', category: 'Email', icon: Mail, status: 'active' },
                  { name: 'Google Maps', category: 'Mapas', icon: MapPin, status: 'active' },
                  { name: 'AWS S3', category: 'Armazenamento', icon: Cloud, status: 'configuring' },
                  { name: 'Twilio', category: 'SMS', icon: MessageSquare, status: 'available' },
                  { name: 'Slack', category: 'Comunicação', icon: Users, status: 'available' },
                  { name: 'Salesforce', category: 'CRM', icon: Building, status: 'available' },
                  { name: 'WhatsApp', category: 'Mensagens', icon: Phone, status: 'available' }
                ].map((integration, index) => (
                  <div key={index} className="p-4 border rounded-lg text-center">
                    <integration.icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <h5 className="font-medium">{integration.name}</h5>
                    <p className="text-sm text-gray-600">{integration.category}</p>
                    <Badge className={getStatusColor(integration.status)} size="sm">
                      {integration.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-gateway">
          <APIGateway />
        </TabsContent>

        <TabsContent value="microservices">
          <MicroservicesManager />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookManager />
        </TabsContent>

        <TabsContent value="service-discovery">
          <ServiceDiscovery />
        </TabsContent>

        <TabsContent value="integration-hub">
          <IntegrationHub />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IntegrationSystemTest
