'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Target,
  TrendingUp,
  Star,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Award,
  BarChart3,
  PieChart
} from 'lucide-react';

const SkillsAssessment: React.FC = () => {
  const [currentAssessment, setCurrentAssessment] = useState('overview');

  // Dados mock para demonstração
  const skillsData = {
    technical: {
      'Sistema RSV': 85,
      'Gestão de Reservas': 78,
      'Relatórios': 65,
      'Integrações': 45
    },
    soft: {
      'Atendimento': 92,
      'Comunicação': 88,
      'Trabalho em Equipe': 85,
      'Resolução de Problemas': 80
    },
    industry: {
      'Turismo': 90,
      'Vendas': 82,
      'Marketing': 70,
      'Operações': 75
    }
  };

  const recommendations = [
    {
      id: 1,
      title: 'Melhorar Conhecimento em Integrações',
      description: 'Foque em aprender sobre APIs e integrações de terceiros',
      priority: 'high',
      impact: 'Alto impacto na produtividade',
      estimatedTime: '2 semanas'
    },
    {
      id: 2,
      title: 'Desenvolver Habilidades de Marketing',
      description: 'Aprenda estratégias de marketing digital para turismo',
      priority: 'medium',
      impact: 'Médio impacto nas vendas',
      estimatedTime: '1 mês'
    },
    {
      id: 3,
      title: 'Aprofundar Conhecimento em Relatórios',
      description: 'Domine a criação de relatórios avançados',
      priority: 'medium',
      impact: 'Médio impacto na análise',
      estimatedTime: '3 semanas'
    }
  ];

  const assessments = [
    {
      id: 1,
      title: 'Avaliação Técnica - Sistema RSV',
      description: 'Teste seus conhecimentos sobre o sistema',
      questions: 25,
      duration: 30,
      difficulty: 'Intermediário',
      status: 'completed',
      score: 85
    },
    {
      id: 2,
      title: 'Avaliação de Soft Skills',
      description: 'Avalie suas habilidades interpessoais',
      questions: 20,
      duration: 25,
      difficulty: 'Básico',
      status: 'in-progress',
      score: 0
    },
    {
      id: 3,
      title: 'Avaliação do Setor de Turismo',
      description: 'Conhecimento sobre o mercado de turismo',
      questions: 30,
      duration: 35,
      difficulty: 'Avançado',
      status: 'not-started',
      score: 0
    }
  ];

  const renderSkillBar = (skill: string, value: number) => (
    <div key={skill} className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{skill}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">85</p>
                <p className="text-sm text-gray-600">Score Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-600">Habilidades Avaliadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">+15%</p>
                <p className="text-sm text-gray-600">Melhoria Mensal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">Recomendações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span>Habilidades Técnicas</span>
            </CardTitle>
            <CardDescription>
              Conhecimento em sistemas e ferramentas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(skillsData.technical).map(([skill, value]) =>
                renderSkillBar(skill, value)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span>Soft Skills</span>
            </CardTitle>
            <CardDescription>
              Habilidades interpessoais e comportamentais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(skillsData.soft).map(([skill, value]) =>
                renderSkillBar(skill, value)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span>Conhecimento do Setor</span>
            </CardTitle>
            <CardDescription>
              Expertise em turismo e mercado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(skillsData.industry).map(([skill, value]) =>
                renderSkillBar(skill, value)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <span>Recomendações de Desenvolvimento</span>
          </CardTitle>
          <CardDescription>
            Sugestões personalizadas baseadas na sua avaliação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  rec.priority === 'high' ? 'bg-red-500' :
                  rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{rec.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{rec.impact}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{rec.estimatedTime}</span>
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Começar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assessments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Avaliações Disponíveis</span>
          </CardTitle>
          <CardDescription>
            Teste seus conhecimentos e acompanhe seu progresso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{assessment.title}</h3>
                    <Badge variant={
                      assessment.status === 'completed' ? 'default' :
                      assessment.status === 'in-progress' ? 'secondary' : 'outline'
                    }>
                      {assessment.status === 'completed' ? 'Concluído' :
                       assessment.status === 'in-progress' ? 'Em Andamento' : 'Não Iniciado'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{assessment.questions} perguntas</span>
                    <span>{assessment.duration} min</span>
                    <span>{assessment.difficulty}</span>
                    {assessment.status === 'completed' && (
                      <span className="font-semibold text-green-600">
                        Score: {assessment.score}%
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant={assessment.status === 'completed' ? 'outline' : 'default'}
                  disabled={assessment.status === 'in-progress'}
                >
                  {assessment.status === 'completed' ? 'Refazer' :
                   assessment.status === 'in-progress' ? 'Continuar' : 'Iniciar'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsAssessment;
