'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Star,
  Award,
  Target,
  TrendingUp,
  Users,
  Zap,
  Brain,
  Globe,
  Shield
} from 'lucide-react';

const LearningPaths: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Dados mock para demonstração
  const learningPaths = [
    {
      id: 'beginner',
      title: 'Iniciante - Sistema RSV',
      description: 'Trilha completa para novos usuários do sistema',
      duration: '4 semanas',
      difficulty: 'Iniciante',
      progress: 75,
      status: 'in-progress',
      modules: 8,
      completed: 6,
      rating: 4.8,
      students: 24,
      color: 'blue',
      modules: [
        { id: 1, title: 'Introdução ao Sistema', duration: '30 min', completed: true },
        { id: 2, title: 'Navegação Básica', duration: '45 min', completed: true },
        { id: 3, title: 'Criando Primeira Reserva', duration: '60 min', completed: true },
        { id: 4, title: 'Gestão de Clientes', duration: '45 min', completed: true },
        { id: 5, title: 'Relatórios Básicos', duration: '30 min', completed: true },
        { id: 6, title: 'Configurações', duration: '30 min', completed: true },
        { id: 7, title: 'Troubleshooting', duration: '45 min', completed: false },
        { id: 8, title: 'Certificação', duration: '60 min', completed: false }
      ]
    },
    {
      id: 'intermediate',
      title: 'Intermediário - Gestão Avançada',
      description: 'Aprofunde seus conhecimentos em gestão e operações',
      duration: '6 semanas',
      difficulty: 'Intermediário',
      progress: 0,
      status: 'not-started',
      modules: 12,
      completed: 0,
      rating: 4.9,
      students: 18,
      color: 'green',
      modules: [
        { id: 1, title: 'Analytics Avançados', duration: '60 min', completed: false },
        { id: 2, title: 'Automação de Processos', duration: '45 min', completed: false },
        { id: 3, title: 'Integrações', duration: '90 min', completed: false },
        { id: 4, title: 'Gestão de Equipe', duration: '60 min', completed: false }
      ]
    },
    {
      id: 'advanced',
      title: 'Avançado - Especialista RSV',
      description: 'Torne-se um especialista em todas as funcionalidades',
      duration: '8 semanas',
      difficulty: 'Avançado',
      progress: 0,
      status: 'locked',
      modules: 15,
      completed: 0,
      rating: 5.0,
      students: 8,
      color: 'purple',
      modules: [
        { id: 1, title: 'Arquitetura do Sistema', duration: '90 min', completed: false },
        { id: 2, title: 'Customizações Avançadas', duration: '120 min', completed: false },
        { id: 3, title: 'API e Desenvolvimento', duration: '150 min', completed: false },
        { id: 4, title: 'Otimização de Performance', duration: '90 min', completed: false }
      ]
    }
  ];

  const achievements = [
    {
      id: 1,
      title: 'Primeiro Curso',
      description: 'Complete seu primeiro módulo',
      icon: '🎯',
      earned: true,
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Estudante Dedicado',
      description: 'Complete 5 módulos em sequência',
      icon: '📚',
      earned: true,
      date: '2024-01-20'
    },
    {
      id: 3,
      title: 'Especialista em Tempo',
      description: 'Complete um curso em tempo recorde',
      icon: '⚡',
      earned: false,
      date: null
    },
    {
      id: 4,
      title: 'Mentor',
      description: 'Ajude 3 colegas a completar cursos',
      icon: '👥',
      earned: false,
      date: null
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 text-blue-900',
      green: 'border-green-200 bg-green-50 text-green-900',
      purple: 'border-purple-200 bg-purple-50 text-purple-900'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
      case 'not-started':
        return <Badge variant="outline">Não Iniciado</Badge>;
      case 'locked':
        return <Badge variant="outline" className="opacity-50">Bloqueado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">Trilhas Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-sm text-gray-600">Módulos Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-gray-600">Conquistas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-sm text-gray-600">Avaliação Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Paths */}
      <div className="space-y-4">
        {learningPaths.map((path) => (
          <Card key={path.id} className={`${getColorClasses(path.color)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>{path.title}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {path.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  {getStatusBadge(path.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress and Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{path.duration}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{path.students} alunos</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{path.rating}</span>
                    </span>
                  </div>
                  <div className="text-sm">
                    {path.completed}/{path.modules} módulos
                  </div>
                </div>

                {/* Progress Bar */}
                {path.status === 'in-progress' && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progresso</span>
                      <span>{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="h-2" />
                  </div>
                )}

                {/* Modules */}
                {selectedPath === path.id && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Módulos:</h4>
                    {path.modules.map((module) => (
                      <div key={module.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center space-x-2">
                          {module.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                          )}
                          <span className={module.completed ? 'line-through text-gray-500' : ''}>
                            {module.title}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{module.duration}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
                  >
                    {selectedPath === path.id ? 'Ocultar Módulos' : 'Ver Módulos'}
                  </Button>
                  <Button
                    disabled={path.status === 'locked'}
                    variant={path.status === 'in-progress' ? 'default' : 'outline'}
                  >
                    {path.status === 'in-progress' ? 'Continuar' :
                     path.status === 'not-started' ? 'Iniciar' : 'Bloqueado'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span>Conquistas</span>
          </CardTitle>
          <CardDescription>
            Badges e conquistas que você pode ganhar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${
                achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${achievement.earned ? 'text-green-900' : 'text-gray-700'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${achievement.earned ? 'text-green-700' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                  {achievement.earned && achievement.date && (
                    <p className="text-xs text-green-600 mt-1">
                      Conquistado em {new Date(achievement.date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                {achievement.earned && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningPaths;
