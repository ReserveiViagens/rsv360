import React, { useState } from 'react';
import { FileText, GraduationCap, HelpCircle, BookOpen, MessageCircle, Plus, BarChart3, Users, CheckCircle, Star, Activity, Clock, TrendingUp } from 'lucide-react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui';
import {
  DocumentationSystem,
  TrainingSystem,
  HelpSystem,
  TutorialSystem,
  FAQSystem
} from '../components/documentation';
import { useUIStore } from '../stores/useUIStore';

const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('documentation');
  const [quickStats, setQuickStats] = useState({
    totalDocuments: 45,
    totalCourses: 12,
    totalFAQs: 67,
    totalTutorials: 8,
    activeUsers: 234,
    completionRate: 78,
    helpfulResponses: 456,
    totalViews: 12345
  });
  
  const { showNotification } = useUIStore();

  const handleDocumentCreated = (document: any) => {
    showNotification('Documento criado com sucesso!', 'success');
    // Atualizar estatísticas
    setQuickStats(prev => ({
      ...prev,
      totalDocuments: prev.totalDocuments + 1
    }));
  };

  const handleDocumentUpdated = (document: any) => {
    showNotification('Documento atualizado com sucesso!', 'success');
  };

  const handleDocumentDeleted = (id: string) => {
    showNotification('Documento excluído com sucesso!', 'success');
    // Atualizar estatísticas
    setQuickStats(prev => ({
      ...prev,
      totalDocuments: prev.totalDocuments - 1
    }));
  };

  const handleCourseCreated = (course: any) => {
    showNotification('Curso criado com sucesso!', 'success');
    setQuickStats(prev => ({
      ...prev,
      totalCourses: prev.totalCourses + 1
    }));
  };

  const handleCourseUpdated = (course: any) => {
    showNotification('Curso atualizado com sucesso!', 'success');
  };

  const handleCourseDeleted = (id: string) => {
    showNotification('Curso excluído com sucesso!', 'success');
    setQuickStats(prev => ({
      ...prev,
      totalCourses: prev.totalCourses - 1
    }));
  };

  const handleUserEnrolled = (userId: string, courseId: string) => {
    showNotification('Usuário inscrito no curso!', 'success');
  };

  const handleUserStarted = (userId: string, tutorialId: string) => {
    showNotification('Usuário iniciou tutorial!', 'success');
  };

  const handleUserCompleted = (userId: string, tutorialId: string) => {
    showNotification('Usuário concluiu tutorial!', 'success');
    setQuickStats(prev => ({
      ...prev,
      completionRate: Math.min(100, prev.completionRate + 1)
    }));
  };

  const handleFAQCreated = (faq: any) => {
    showNotification('FAQ criada com sucesso!', 'success');
    setQuickStats(prev => ({
      ...prev,
      totalFAQs: prev.totalFAQs + 1
    }));
  };

  const handleFAQUpdated = (faq: any) => {
    showNotification('FAQ atualizada com sucesso!', 'success');
  };

  const handleFAQDeleted = (id: string) => {
    showNotification('FAQ excluída com sucesso!', 'success');
    setQuickStats(prev => ({
      ...prev,
      totalFAQs: prev.totalFAQs - 1
    }));
  };

  const handleFAQViewed = (id: string) => {
    setQuickStats(prev => ({
      ...prev,
      totalViews: prev.totalViews + 1
    }));
  };

  const handleArticleCreated = (article: any) => {
    showNotification('Artigo de ajuda criado com sucesso!', 'success');
  };

  const handleArticleUpdated = (article: any) => {
    showNotification('Artigo de ajuda atualizado com sucesso!', 'success');
  };

  const handleArticleDeleted = (id: string) => {
    showNotification('Artigo de ajuda excluído com sucesso!', 'success');
  };

  const handleTicketCreated = (ticket: any) => {
    showNotification('Ticket de suporte criado com sucesso!', 'success');
  };

  const handleTicketUpdated = (ticket: any) => {
    showNotification('Ticket de suporte atualizado com sucesso!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentação e Treinamento</h1>
        <p className="text-gray-600">
          Sistema completo de documentação, treinamento e suporte para usuários do RSV
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Documentos</p>
              <p className="text-2xl font-bold text-gray-900">{quickStats.totalDocuments}</p>
              <p className="text-xs text-gray-500">Total de documentos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cursos</p>
              <p className="text-2xl font-bold text-gray-900">{quickStats.totalCourses}</p>
              <p className="text-xs text-gray-500">Cursos disponíveis</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <HelpCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">FAQs</p>
              <p className="text-2xl font-bold text-gray-900">{quickStats.totalFAQs}</p>
              <p className="text-xs text-gray-500">Perguntas frequentes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tutoriais</p>
              <p className="text-2xl font-bold text-gray-900">{quickStats.totalTutorials}</p>
              <p className="text-xs text-gray-500">Tutoriais interativos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Usuários Ativos</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{quickStats.activeUsers}</p>
            <p className="text-sm text-gray-500">Usuários treinando</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Taxa de Conclusão</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{quickStats.completionRate}%</p>
            <p className="text-sm text-gray-500">Cursos concluídos</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Respostas Úteis</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{quickStats.helpfulResponses}</p>
            <p className="text-sm text-gray-500">FAQs marcadas como úteis</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Documento
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Criar Curso
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Nova FAQ
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Criar Tutorial
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Novo Ticket
          </Button>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-14">
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentação
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Treinamento
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Ajuda
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Tutoriais
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documentation" className="p-6">
            <DocumentationSystem
              onDocumentCreated={handleDocumentCreated}
              onDocumentUpdated={handleDocumentUpdated}
              onDocumentDeleted={handleDocumentDeleted}
            />
          </TabsContent>

          <TabsContent value="training" className="p-6">
            <TrainingSystem
              onCourseCreated={handleCourseCreated}
              onCourseUpdated={handleCourseUpdated}
              onCourseDeleted={handleCourseDeleted}
              onUserEnrolled={handleUserEnrolled}
            />
          </TabsContent>

          <TabsContent value="help" className="p-6">
            <HelpSystem
              onArticleCreated={handleArticleCreated}
              onArticleUpdated={handleArticleUpdated}
              onArticleDeleted={handleArticleDeleted}
              onTicketCreated={handleTicketCreated}
              onTicketUpdated={handleTicketUpdated}
            />
          </TabsContent>

          <TabsContent value="tutorials" className="p-6">
            <TutorialSystem
              onUserStarted={handleUserStarted}
              onUserCompleted={handleUserCompleted}
            />
          </TabsContent>

          <TabsContent value="faq" className="p-6">
            <FAQSystem
              onFAQCreated={handleFAQCreated}
              onFAQUpdated={handleFAQUpdated}
              onFAQDeleted={handleFAQDeleted}
              onFAQViewed={handleFAQViewed}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Novo documento criado</p>
              <p className="text-xs text-gray-500">Guia de Configuração Avançada</p>
            </div>
            <span className="text-xs text-gray-400">2 min atrás</span>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Curso concluído</p>
              <p className="text-xs text-gray-500">João Silva completou "Introdução ao Sistema RSV"</p>
            </div>
            <span className="text-xs text-gray-400">15 min atrás</span>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HelpCircle className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nova FAQ criada</p>
              <p className="text-xs text-gray-500">Como configurar notificações por email</p>
            </div>
            <span className="text-xs text-gray-400">1 hora atrás</span>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BookOpen className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Tutorial iniciado</p>
              <p className="text-xs text-gray-500">Maria Santos começou "Gestão de Clientes"</p>
            </div>
            <span className="text-xs text-gray-400">2 horas atrás</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export { DocumentationPage };
