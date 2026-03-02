'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { 
  AIEngine,
  PredictiveAnalytics,
  SmartAutomation,
  ChatbotAI,
  OptimizationEngine
} from '@/components/ai'
import { 
  Brain,
  Cpu,
  Zap,
  Bot,
  Target,
  Activity,
  TrendingUp,
  Settings,
  BarChart3,
  MessageSquare,
  Gauge,
  ArrowRight
} from 'lucide-react'

const AISystemTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const systemComponents = [
    {
      id: 'ai-engine',
      name: 'Motor de IA',
      description: 'Análise inteligente de dados e tomada de decisão',
      icon: Brain,
      status: 'active',
      metrics: {
        accuracy: 94.7,
        processing_speed: '2.3s',
        data_processed: '1.2TB',
        insights_generated: 847
      }
    },
    {
      id: 'predictive-analytics',
      name: 'Análise Preditiva',
      description: 'Machine learning para previsões e tendências',
      icon: TrendingUp,
      status: 'active',
      metrics: {
        accuracy: 89.2,
        models_active: 12,
        predictions_today: 3456,
        confidence_avg: 87.5
      }
    },
    {
      id: 'smart-automation',
      name: 'Automação Inteligente',
      description: 'Automação baseada em padrões identificados',
      icon: Zap,
      status: 'active',
      metrics: {
        automations_active: 34,
        success_rate: 96.8,
        time_saved: '128h',
        tasks_automated: 2789
      }
    },
    {
      id: 'chatbot-ai',
      name: 'Chatbot IA',
      description: 'Atendimento automatizado inteligente',
      icon: MessageSquare,
      status: 'active',
      metrics: {
        interactions_today: 1567,
        satisfaction_rate: 4.6,
        resolution_rate: 92.3,
        avg_response_time: '1.2s'
      }
    },
    {
      id: 'optimization-engine',
      name: 'Motor de Otimização',
      description: 'Otimização automática de processos e recursos',
      icon: Target,
      status: 'active',
      metrics: {
        optimizations_running: 8,
        improvement_avg: 34.5,
        cost_savings: 'R$ 125k',
        efficiency_gain: 28.7
      }
    }
  ]

  const systemStats = {
    total_ai_operations: 15672,
    processing_power: '85%',
    system_efficiency: '94.2%',
    cost_optimization: 'R$ 347k',
    prediction_accuracy: '91.8%',
    automation_coverage: '76%'
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
          <h1 className="text-4xl font-bold text-gray-900">Sistema de IA e Automação</h1>
          <p className="text-xl text-gray-600 mt-2">
            FASE 24: Inteligência Artificial e Automação Avançada
          </p>
          <p className="text-gray-500 mt-1">
            Motor de IA, análise preditiva, automação inteligente, chatbot AI e otimização
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
            <Brain className="w-5 h-5 mr-2" />
            Sistema Ativo
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="ai-engine">Motor IA</TabsTrigger>
          <TabsTrigger value="predictive">Preditiva</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
          <TabsTrigger value="optimization">Otimização</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas Gerais do Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Operações IA</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {systemStats.total_ai_operations.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">Hoje</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Poder Processamento</CardTitle>
                <Cpu className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {systemStats.processing_power}
                </div>
                <p className="text-xs text-gray-600">Utilização</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
                <Gauge className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {systemStats.system_efficiency}
                </div>
                <p className="text-xs text-gray-600">Sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {systemStats.cost_optimization}
                </div>
                <p className="text-xs text-gray-600">Este mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precisão</CardTitle>
                <BarChart3 className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {systemStats.prediction_accuracy}
                </div>
                <p className="text-xs text-gray-600">Previsões</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cobertura</CardTitle>
                <Zap className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {systemStats.automation_coverage}
                </div>
                <p className="text-xs text-gray-600">Automação</p>
              </CardContent>
            </Card>
          </div>

          {/* Componentes do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Componentes do Sistema de IA</CardTitle>
              <CardDescription>
                Status e métricas dos módulos de inteligência artificial
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

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(component.metrics).map(([key, value]) => (
                          <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 capitalize">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {typeof value === 'number' && value < 100 && key !== 'models_active' && key !== 'automations_active' && key !== 'interactions_today' && key !== 'predictions_today' && key !== 'tasks_automated' && key !== 'insights_generated'
                                ? `${value}%` 
                                : value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Resumo de Benefícios */}
          <Card>
            <CardHeader>
              <CardTitle>Benefícios da Implementação</CardTitle>
              <CardDescription>
                Impacto da inteligência artificial no sistema Onboarding RSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Benefícios Técnicos</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Análise inteligente de dados em tempo real</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Previsões precisas com machine learning</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>Automação inteligente de processos</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span>Otimização automática de recursos</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>Atendimento automatizado 24/7</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Benefícios Empresariais</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Redução de custos operacionais em 35%</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      <span>Aumento da eficiência em 40%</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full" />
                      <span>Tomada de decisão baseada em dados</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full" />
                      <span>Melhoria contínua dos processos</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                      <span>Experiência do cliente aprimorada</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-engine">
          <AIEngine />
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="automation">
          <SmartAutomation />
        </TabsContent>

        <TabsContent value="chatbot">
          <ChatbotAI />
        </TabsContent>

        <TabsContent value="optimization">
          <OptimizationEngine />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AISystemTest
