'use client';
import React, { useState } from 'react';
import { Card, Button, Tabs, Badge } from '@/components/ui';
import { Workflow, Zap, CheckCircle, Eye, BarChart3, Settings, Clock, Users, TrendingUp, AlertTriangle, FileText, Star, Bookmark } from 'lucide-react';
import { WorkflowEngine, TaskAutomation, ApprovalSystem, ProcessMonitoring, WorkflowTemplates } from '@/components/workflow';

export default function WorkflowSystemTest() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Workflow className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Sistema de Workflow e Automação</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema completo de workflow e automação de processos para otimizar operações e aumentar a eficiência
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Workflow className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">5</h3>
            <p className="text-gray-600">Componentes Principais</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">15+</h3>
            <p className="text-gray-600">Funcionalidades</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">100%</h3>
            <p className="text-gray-600">Funcional</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="p-3 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">24/7</h3>
            <p className="text-gray-600">Monitoramento</p>
          </Card>
        </div>

        {/* Navegação por Abas */}
        <Card className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <div className="flex flex-wrap space-x-8 px-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  Visão Geral
                </button>
                <button
                  onClick={() => setActiveTab('workflow-engine')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'workflow-engine'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Workflow className="h-4 w-4 inline mr-2" />
                  Motor de Workflow
                </button>
                <button
                  onClick={() => setActiveTab('task-automation')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'task-automation'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Zap className="h-4 w-4 inline mr-2" />
                  Automação de Tarefas
                </button>
                <button
                  onClick={() => setActiveTab('approval-system')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'approval-system'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Sistema de Aprovações
                </button>
                <button
                  onClick={() => setActiveTab('process-monitoring')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'process-monitoring'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  Monitoramento
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'templates'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Templates
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Descrição do Sistema */}
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Sistema Completo de Workflow e Automação</h2>
                    <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                      O Sistema de Workflow e Automação RSV é uma solução completa que permite criar, gerenciar e monitorar 
                      processos de negócio automatizados. Com ferramentas visuais intuitivas, automação inteligente de tarefas, 
                      sistema de aprovações robusto e monitoramento em tempo real, o sistema transforma operações manuais em 
                      processos eficientes e escaláveis.
                    </p>
                  </div>

                  {/* Componentes Principais */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Componentes Principais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="text-center">
                          <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Workflow className="h-8 w-8 text-blue-600" />
                          </div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">Motor de Workflow</h4>
                          <p className="text-gray-600 mb-4">
                            Crie e gerencie workflows visuais com drag & drop, definindo passos, conexões e lógica de negócio.
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <Badge variant="secondary">Visual Designer</Badge>
                            <Badge variant="secondary">Drag & Drop</Badge>
                            <Badge variant="secondary">Lógica de Negócio</Badge>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="text-center">
                          <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Zap className="h-8 w-8 text-green-600" />
                          </div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">Automação de Tarefas</h4>
                          <p className="text-gray-600 mb-4">
                            Configure tarefas automatizadas com triggers, agendamentos e execução baseada em eventos.
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <Badge variant="secondary">Agendamento</Badge>
                            <Badge variant="secondary">Triggers</Badge>
                            <Badge variant="secondary">Execução Automática</Badge>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="text-center">
                          <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-purple-600" />
                          </div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">Sistema de Aprovações</h4>
                          <p className="text-gray-600 mb-4">
                            Gerencie fluxos de aprovação com múltiplos níveis, notificações e rastreamento completo.
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <Badge variant="secondary">Múltiplos Níveis</Badge>
                            <Badge variant="secondary">Notificações</Badge>
                            <Badge variant="secondary">Rastreamento</Badge>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="text-center">
                          <div className="p-3 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <BarChart3 className="h-8 w-8 text-orange-600" />
                          </div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">Monitoramento</h4>
                          <p className="text-gray-600 mb-4">
                            Acompanhe em tempo real o status, performance e alertas de todos os processos.
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <Badge variant="secondary">Tempo Real</Badge>
                            <Badge variant="secondary">Métricas</Badge>
                            <Badge variant="secondary">Alertas</Badge>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="text-center">
                          <div className="p-3 bg-indigo-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-indigo-600" />
                          </div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">Templates</h4>
                          <p className="text-gray-600 mb-4">
                            Utilize templates pré-definidos para acelerar a criação de workflows comuns.
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <Badge variant="secondary">Pré-definidos</Badge>
                            <Badge variant="secondary">Categorias</Badge>
                            <Badge variant="secondary">Reutilização</Badge>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="text-center">
                          <div className="p-3 bg-pink-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Settings className="h-8 w-8 text-pink-600" />
                          </div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">Configuração</h4>
                          <p className="text-gray-600 mb-4">
                            Configure permissões, integrações e personalizações para seu ambiente específico.
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <Badge variant="secondary">Permissões</Badge>
                            <Badge variant="secondary">Integrações</Badge>
                            <Badge variant="secondary">Personalização</Badge>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Benefícios */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Benefícios do Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Eficiência Operacional</h4>
                            <p className="text-gray-600">Reduza tempo de processamento e elimine tarefas manuais repetitivas</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Eye className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Transparência Total</h4>
                            <p className="text-gray-600">Acompanhe o progresso de cada processo em tempo real</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-100 rounded-full">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Colaboração Aprimorada</h4>
                            <p className="text-gray-600">Facilite a comunicação e coordenação entre equipes</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-orange-100 rounded-full">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Escalabilidade</h4>
                            <p className="text-gray-600">Processe volumes maiores sem aumentar a equipe</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Controle de Qualidade</h4>
                            <p className="text-gray-600">Implemente verificações e aprovações automáticas</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-indigo-100 rounded-full">
                            <Clock className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Conformidade</h4>
                            <p className="text-gray-600">Garanta que todos os processos sigam as políticas estabelecidas</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Casos de Uso */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Casos de Uso Principais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="p-6 text-center">
                        <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Workflow className="h-8 w-8 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Processamento de Reservas</h4>
                        <p className="text-gray-600 text-sm">
                          Automatize o fluxo completo de reservas desde a solicitação até a confirmação
                        </p>
                      </Card>
                      
                      <Card className="p-6 text-center">
                        <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Aprovações Financeiras</h4>
                        <p className="text-gray-600 text-sm">
                          Gerencie fluxos de aprovação para descontos, reembolsos e pagamentos
                        </p>
                      </Card>
                      
                      <Card className="p-6 text-center">
                        <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Users className="h-8 w-8 text-purple-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Atendimento ao Cliente</h4>
                        <p className="text-gray-600 text-sm">
                          Automatize o roteamento e acompanhamento de solicitações de clientes
                        </p>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'workflow-engine' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Motor de Workflow</h3>
                    <p className="text-gray-600">
                      Crie e gerencie processos de negócio automatizados com interface visual intuitiva
                    </p>
                  </div>
                  <WorkflowEngine />
                </div>
              )}

              {activeTab === 'task-automation' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Automação de Tarefas</h3>
                    <p className="text-gray-600">
                      Configure tarefas automatizadas com agendamento, triggers e execução inteligente
                    </p>
                  </div>
                  <TaskAutomation />
                </div>
              )}

              {activeTab === 'approval-system' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Aprovações</h3>
                    <p className="text-gray-600">
                      Gerencie fluxos de aprovação com múltiplos níveis e rastreamento completo
                    </p>
                  </div>
                  <ApprovalSystem />
                </div>
              )}

              {activeTab === 'process-monitoring' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Monitoramento de Processos</h3>
                    <p className="text-gray-600">
                      Acompanhe em tempo real o status e performance de todos os processos
                    </p>
                  </div>
                  <ProcessMonitoring />
                </div>
              )}

              {activeTab === 'templates' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Templates de Workflow</h3>
                    <p className="text-gray-600">
                      Explore e utilize templates pré-definidos para acelerar a criação de workflows
                    </p>
                  </div>
                  <WorkflowTemplates />
                </div>
              )}
            </div>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p>Sistema de Workflow e Automação RSV - Versão 1.0.0</p>
          <p className="text-sm mt-2">
            Desenvolvido com React, TypeScript, Tailwind CSS e Shadcn/UI
          </p>
        </div>
      </div>
    </div>
  );
}
