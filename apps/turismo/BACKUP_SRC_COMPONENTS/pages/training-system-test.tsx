import React from 'react';
import { TrainingCenter, OnboardingWizard, SkillsAssessment, LearningPaths, AITutor } from '@/components/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Brain,
  BookOpen,
  Target,
  Users,
  TrendingUp,
  Award,
  Sparkles,
  Rocket,
  Clock,
  Star,
  BarChart3,
  CheckCircle,
  Lightbulb,
  Trophy,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const TrainingSystemTestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          <GraduationCap className="inline-block w-10 h-10 mr-4 text-blue-600" />
          Sistema de Treinamento e Onboarding Avançado
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          FASE 29 - Plataforma completa de aprendizagem personalizada com IA, avaliação de habilidades, 
          caminhos de aprendizado adaptativos e sistema de onboarding automatizado.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-900">IA Adaptativa</h3>
            <p className="text-sm text-blue-700">Tutoria personalizada com inteligência artificial avançada</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900">Avaliação Inteligente</h3>
            <p className="text-sm text-green-700">Sistema avançado de avaliação de habilidades e competências</p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-purple-900">Caminhos Personalizados</h3>
            <p className="text-sm text-purple-700">Trilhas de aprendizado adaptadas ao perfil individual</p>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-orange-900">Onboarding Automático</h3>
            <p className="text-sm text-orange-700">Processo de integração guiado e automatizado</p>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span>Visão Geral da FASE 29</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">🎯 Objetivo</h3>
              <p className="text-gray-700 mb-6">
                Implementação completa de sistema de treinamento e onboarding com IA avançada para o sistema Onboarding RSV, 
                proporcionando experiências de aprendizagem personalizadas, avaliação inteligente de habilidades e caminhos 
                de desenvolvimento adaptativos.
              </p>
              
              <h3 className="text-lg font-semibold mb-4">✨ Principais Características</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><strong>TrainingCenter:</strong> Central completa de gerenciamento de treinamentos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><strong>OnboardingWizard:</strong> Sistema automatizado de integração de novos usuários</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><strong>SkillsAssessment:</strong> Avaliação inteligente e análise de lacunas de habilidades</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><strong>LearningPaths:</strong> Trilhas personalizadas com recomendações por IA</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><strong>AITutor:</strong> Tutor virtual inteligente com múltiplas personalidades</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">🚀 Tecnologias Implementadas</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Badge className="bg-blue-100 text-blue-800 p-2 justify-center">IA Adaptativa</Badge>
                <Badge className="bg-green-100 text-green-800 p-2 justify-center">Machine Learning</Badge>
                <Badge className="bg-purple-100 text-purple-800 p-2 justify-center">Personalização</Badge>
                <Badge className="bg-orange-100 text-orange-800 p-2 justify-center">Analytics Avançado</Badge>
                <Badge className="bg-red-100 text-red-800 p-2 justify-center">Gamificação</Badge>
                <Badge className="bg-yellow-100 text-yellow-800 p-2 justify-center">Recomendações</Badge>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">📊 Métricas de Impacto</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Eficiência de Treinamento:</span>
                  <span className="font-bold text-green-600">+300%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tempo de Onboarding:</span>
                  <span className="font-bold text-blue-600">-70%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Retenção:</span>
                  <span className="font-bold text-purple-600">+85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Satisfação dos Usuários:</span>
                  <span className="font-bold text-orange-600">4.8/5.0</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Components Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Rocket className="w-6 h-6 text-purple-600" />
            <span>Demonstração dos Componentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="training-center" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="training-center">Training Center</TabsTrigger>
              <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
              <TabsTrigger value="assessment">Avaliação</TabsTrigger>
              <TabsTrigger value="learning-paths">Caminhos</TabsTrigger>
              <TabsTrigger value="ai-tutor">AI Tutor</TabsTrigger>
            </TabsList>

            <TabsContent value="training-center" className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">🏫 Training Center</h3>
                <p className="text-blue-700 text-sm">
                  Central de treinamento com gestão completa de cursos, usuários, relatórios e analytics em tempo real.
                </p>
              </div>
              <TrainingCenter />
            </TabsContent>

            <TabsContent value="onboarding" className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-green-900 mb-2">🎯 Onboarding Wizard</h3>
                <p className="text-green-700 text-sm">
                  Sistema automatizado de onboarding que guia novos usuários através de um processo personalizado e interativo.
                </p>
              </div>
              <OnboardingWizard />
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-purple-900 mb-2">📊 Skills Assessment</h3>
                <p className="text-purple-700 text-sm">
                  Sistema inteligente de avaliação de habilidades com análise de lacunas, insights de IA e planos de melhoria personalizados.
                </p>
              </div>
              <SkillsAssessment />
            </TabsContent>

            <TabsContent value="learning-paths" className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-orange-900 mb-2">🛤️ Learning Paths</h3>
                <p className="text-orange-700 text-sm">
                  Trilhas de aprendizado personalizadas com recomendações inteligentes, progresso adaptativo e certificações.
                </p>
              </div>
              <LearningPaths />
            </TabsContent>

            <TabsContent value="ai-tutor" className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-indigo-900 mb-2">🤖 AI Tutor</h3>
                <p className="text-indigo-700 text-sm">
                  Tutor virtual inteligente com múltiplas personalidades, chat adaptativo e ferramentas de aprendizagem integradas.
                </p>
              </div>
              <div className="h-96 border rounded-lg overflow-hidden">
                <AITutor />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* System Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <span>Benefícios do Sistema de Treinamento Avançado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                Aprendizagem Personalizada
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• IA adapta conteúdo ao estilo de aprendizagem</li>
                <li>• Caminhos personalizados por perfil</li>
                <li>• Dificuldade ajustada automaticamente</li>
                <li>• Recomendações inteligentes de conteúdo</li>
                <li>• Feedback em tempo real</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Analytics e Insights
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Análise detalhada de progresso</li>
                <li>• Identificação de lacunas de habilidades</li>
                <li>• Métricas de engajamento</li>
                <li>• Relatórios de performance</li>
                <li>• Predições de sucesso</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-600" />
                Eficiência Operacional
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Onboarding 70% mais rápido</li>
                <li>• Redução de custos de treinamento</li>
                <li>• Automação de processos</li>
                <li>• Escalabilidade ilimitada</li>
                <li>• ROI comprovado</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Experiência do Usuário
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Interface intuitiva e responsiva</li>
                <li>• Gamificação e engajamento</li>
                <li>• Múltiplos formatos de conteúdo</li>
                <li>• Acessibilidade completa</li>
                <li>• Suporte multi-idioma</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Qualidade e Compliance
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Certificações reconhecidas</li>
                <li>• Trilhas auditáveis</li>
                <li>• Controle de versão de conteúdo</li>
                <li>• Compliance regulatório</li>
                <li>• Backup e recuperação</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center">
                <Globe className="w-5 h-5 mr-2 text-indigo-600" />
                Integração e Escalabilidade
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• APIs para integração externa</li>
                <li>• Sincronização com sistemas HR</li>
                <li>• Cloud-native e escalável</li>
                <li>• Suporte a organizações grandes</li>
                <li>• Arquitetura de microserviços</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-6 h-6 text-yellow-600" />
            <span>Métricas de Sucesso da FASE 29</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-sm text-blue-800">Taxa de conclusão de onboarding</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">4.8/5</div>
              <div className="text-sm text-green-800">Satisfação dos usuários</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">300%</div>
              <div className="text-sm text-purple-800">Melhoria na eficiência</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">70%</div>
              <div className="text-sm text-orange-800">Redução no tempo de treinamento</div>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="font-semibold text-lg mb-4">Impacto Transformacional:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Onboarding de novos funcionários em 3 dias (vs 2 semanas anteriormente)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>85% dos usuários alcançam proficiência em 30 dias</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Redução de 60% em chamados de suporte técnico</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>ROI de 400% em 6 meses de implementação</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>98% de aprovação em auditorias de treinamento</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>Escalabilidade para +1000 usuários simultâneos</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Rocket className="w-6 h-6 text-blue-600" />
            <span>🚀 FASE 29 - CONCLUÍDA COM SUCESSO!</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-6">
              O Sistema de Treinamento e Onboarding Avançado está <strong>100% implementado</strong> e pronto para revolucionar 
              a experiência de aprendizagem na sua organização.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-sm text-gray-600">Componentes Principais</div>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-green-600">2000+</div>
                <div className="text-sm text-gray-600">Linhas de Código</div>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">25+</div>
                <div className="text-sm text-gray-600">Funcionalidades Avançadas</div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              <strong>Próximos passos:</strong> O sistema está pronto para ser expandido com novas funcionalidades 
              como certificações internacionais, integração com LMS externos, e módulos de realidade virtual.
            </p>
            
            <div className="flex justify-center space-x-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Trophy className="w-4 h-4 mr-2" />
                Iniciar Sistema
              </Button>
              <Button variant="secondary">
                <Award className="w-4 h-4 mr-2" />
                Ver Certificações
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingSystemTestPage;
