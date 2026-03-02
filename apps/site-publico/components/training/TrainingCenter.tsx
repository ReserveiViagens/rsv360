'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Star,
  Play,
  CheckCircle,
  Award,
  BarChart3,
  Calendar,
  Target,
  Brain,
  Zap,
  Globe
} from 'lucide-react';

const TrainingCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Dados mock para demonstração
  const trainingStats = {
    totalCourses: 15,
    activeUsers: 24,
    completionRate: 95,
    averageScore: 87
  };

  const courses = [
    {
      id: 1,
      title: 'Sistema RSV - Básico',
      description: 'Introdução ao sistema de gestão de reservas',
      duration: 45,
      difficulty: 'Iniciante',
      progress: 100,
      status: 'completed',
      rating: 4.8
    },
    {
      id: 2,
      title: 'Gestão de Clientes',
      description: 'Como gerenciar clientes e histórico',
      duration: 60,
      difficulty: 'Intermediário',
      progress: 75,
      status: 'in-progress',
      rating: 4.6
    },
    {
      id: 3,
      title: 'Relatórios e Analytics',
      description: 'Análise de dados e relatórios',
      duration: 90,
      difficulty: 'Avançado',
      progress: 0,
      status: 'not-started',
      rating: 4.9
    }
  ];

  const users = [
    {
      id: 1,
      name: 'João Silva',
      role: 'Agente de Viagens',
      progress: 85,
      coursesCompleted: 8,
      lastActivity: '2 horas atrás'
    },
    {
      id: 2,
      name: 'Maria Santos',
      role: 'Gerente',
      progress: 92,
      coursesCompleted: 12,
      lastActivity: '1 hora atrás'
    },
    {
      id: 3,
      name: 'Pedro Costa',
      role: 'Atendente',
      progress: 67,
      coursesCompleted: 5,
      lastActivity: '3 horas atrás'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{trainingStats.totalCourses}</p>
                <p className="text-sm text-gray-600">Cursos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{trainingStats.activeUsers}</p>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{trainingStats.completionRate}%</p>
                <p className="text-sm text-gray-600">Taxa de Conclusão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{trainingStats.averageScore}</p>
                <p className="text-sm text-gray-600">Nota Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Progresso Geral</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Cursos Concluídos</span>
                      <span>12/15</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Usuários Ativos</span>
                      <span>24/30</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Meta Mensal</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>Atividades Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">João Silva concluiu "Sistema RSV - Básico"</p>
                      <p className="text-xs text-gray-500">2 horas atrás</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Maria Santos iniciou "Gestão de Clientes"</p>
                      <p className="text-xs text-gray-500">1 hora atrás</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Pedro Costa ganhou badge "Primeiro Curso"</p>
                      <p className="text-xs text-gray-500">3 horas atrás</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{course.title}</h3>
                        <Badge variant={
                          course.status === 'completed' ? 'default' :
                          course.status === 'in-progress' ? 'secondary' : 'outline'
                        }>
                          {course.status === 'completed' ? 'Concluído' :
                           course.status === 'in-progress' ? 'Em Andamento' : 'Não Iniciado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration} min</span>
                        </span>
                        <span>{course.difficulty}</span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span>{course.rating}</span>
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="w-16 h-16 relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-gray-200"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - course.progress / 100)}`}
                            className="text-blue-600"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-semibold">{course.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">{user.progress}%</span>
                        <Progress value={user.progress} className="w-20 h-2" />
                      </div>
                      <p className="text-xs text-gray-500">
                        {user.coursesCompleted} cursos • {user.lastActivity}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Progresso por Departamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Vendas</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Atendimento</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Operações</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>Métricas de Engajamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo Médio por Sessão</span>
                    <span className="font-semibold">24 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de Retenção</span>
                    <span className="font-semibold">89%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Satisfação Média</span>
                    <span className="font-semibold">4.7/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cursos por Usuário</span>
                    <span className="font-semibold">8.3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingCenter;
