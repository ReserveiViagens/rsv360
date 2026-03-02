'use client';
import React, { useState } from 'react';
import { Card, Button, Tabs, Badge } from '@/components/ui';
import { Target, CheckSquare, Users, Calendar, MessageSquare, Settings, TrendingUp, BarChart3, Star, Clock, CheckCircle, AlertTriangle, FileText, Award, Zap } from 'lucide-react';
import { ProjectManager, TaskManager, TeamManager, ProjectTimeline, ProjectCollaboration } from '@/components/projects';

export default function ProjectManagementTest() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Sistema de Gestão de Projetos e Tarefas
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema completo para gestão de projetos, tarefas, equipes, cronogramas e colaboração em equipe
          </p>
          <div className="flex justify-center space-x-2 mt-4">
            <Badge className="bg-green-100 text-green-800">FASE 22</Badge>
            <Badge className="bg-blue-100 text-blue-800">CONCLUÍDA</Badge>
            <Badge className="bg-purple-100 text-purple-800">PROJETOS</Badge>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
            <p className="text-gray-600">Projetos Ativos</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">156</h3>
            <p className="text-gray-600">Tarefas</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">24</h3>
            <p className="text-gray-600">Membros da Equipe</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">78%</h3>
            <p className="text-gray-600">Progresso Geral</p>
          </Card>
        </div>

        {/* Tabs de Funcionalidades */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-wrap justify-center space-x-1 mb-8">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveTab('overview')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Visão Geral</span>
            </Button>
            <Button
              variant={activeTab === 'projects' ? 'default' : 'outline'}
              onClick={() => setActiveTab('projects')}
              className="flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Gestão de Projetos</span>
            </Button>
            <Button
              variant={activeTab === 'tasks' ? 'default' : 'outline'}
              onClick={() => setActiveTab('tasks')}
              className="flex items-center space-x-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Gestão de Tarefas</span>
            </Button>
            <Button
              variant={activeTab === 'teams' ? 'default' : 'outline'}
              onClick={() => setActiveTab('teams')}
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Gestão de Equipes</span>
            </Button>
            <Button
              variant={activeTab === 'timeline' ? 'default' : 'outline'}
              onClick={() => setActiveTab('timeline')}
              className="flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Cronogramas</span>
            </Button>
            <Button
              variant={activeTab === 'collaboration' ? 'default' : 'outline'}
              onClick={() => setActiveTab('collaboration')}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Colaboração</span>
            </Button>
          </div>

          <div className="mt-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <Card className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      🎯 Sistema Completo de Gestão de Projetos
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Implementamos um sistema robusto e intuitivo para gerenciar todos os aspectos dos projetos da empresa
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestão de Projetos</h3>
                      <p className="text-gray-600">Criação, edição e acompanhamento completo de projetos com status, prioridades e orçamentos</p>
                    </div>

                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <CheckSquare className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestão de Tarefas</h3>
                      <p className="text-gray-600">Sistema Kanban e lista para organizar tarefas com responsáveis e prazos</p>
                    </div>

                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                      <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestão de Equipes</h3>
                      <p className="text-gray-600">Controle de membros, habilidades, disponibilidade e performance da equipe</p>
                    </div>

                    <div className="text-center p-6 bg-orange-50 rounded-lg">
                      <Calendar className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Cronogramas</h3>
                      <p className="text-gray-600">Timeline visual com fases, milestones e dependências dos projetos</p>
                    </div>

                    <div className="text-center p-6 bg-red-50 rounded-lg">
                      <MessageSquare className="w-12 h-12 text-red-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Colaboração</h3>
                      <p className="text-gray-600">Comentários, atualizações, chats e compartilhamento de arquivos</p>
                    </div>

                    <div className="text-center p-6 bg-indigo-50 rounded-lg">
                      <TrendingUp className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
                      <p className="text-gray-600">Métricas, relatórios e dashboards para acompanhar o progresso</p>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      Principais Benefícios
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Organização completa de projetos e tarefas</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Visibilidade total sobre o progresso</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Colaboração eficiente entre equipes</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Controle de prazos e dependências</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Gestão de recursos e orçamentos</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Zap className="w-5 h-5 text-blue-500 mr-2" />
                      Funcionalidades Avançadas
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Visualização Kanban e Timeline</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Sistema de comentários e menções</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Chats de equipe e projeto</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Gestão de arquivos e anexos</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span>Relatórios e métricas em tempo real</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <Card className="p-6">
                <ProjectManager />
              </Card>
            )}

            {activeTab === 'tasks' && (
              <Card className="p-6">
                <TaskManager />
              </Card>
            )}

            {activeTab === 'teams' && (
              <Card className="p-6">
                <TeamManager />
              </Card>
            )}

            {activeTab === 'timeline' && (
              <Card className="p-6">
                <ProjectTimeline />
              </Card>
            )}

            {activeTab === 'collaboration' && (
              <Card className="p-6">
                <ProjectCollaboration />
              </Card>
            )}
          </div>
        </Tabs>

        {/* Footer com Informações Técnicas */}
        <Card className="mt-12 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Informações Técnicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tecnologias Utilizadas</h4>
                <ul className="space-y-1">
                  <li>• React + TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Shadcn/UI Components</li>
                  <li>• Lucide Icons</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Funcionalidades</h4>
                <ul className="space-y-1">
                  <li>• CRUD Completo</li>
                  <li>• Filtros Avançados</li>
                  <li>• Visualizações Múltiplas</li>
                  <li>• Sistema de Estados</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Componentes</h4>
                <ul className="space-y-1">
                  <li>• 5 Componentes Principais</li>
                  <li>• Interface Responsiva</li>
                  <li>• Formulários Intuitivos</li>
                  <li>• Notificações Toast</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
