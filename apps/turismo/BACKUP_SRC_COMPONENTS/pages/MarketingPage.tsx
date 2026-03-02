import React, { useState } from 'react';
import { Megaphone, Target, Users, TrendingUp, BarChart3, Plus, Bell, Download, RefreshCw, Mail, Share2, UserPlus } from 'lucide-react';
import { CampaignManager } from '../components/marketing/CampaignManager';
import { LeadCapture } from '../components/marketing/LeadCapture';
import { EmailAutomation } from '../components/marketing/EmailAutomation';
import { MarketingAnalytics } from '../components/marketing/MarketingAnalytics';
import { SocialMediaIntegration } from '../components/marketing/SocialMediaIntegration';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useUIStore } from '../stores/useUIStore';

const MarketingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { showNotification } = useUIStore();

  const handleRefresh = () => {
    showNotification('Dados atualizados com sucesso!', 'success');
  };

  const handleExport = () => {
    showNotification('Exportação iniciada!', 'info');
  };

  const handleNewCampaign = () => {
    setActiveTab('campaigns');
    showNotification('Criar nova campanha', 'info');
  };

  const handleNewLead = () => {
    setActiveTab('leads');
    showNotification('Adicionar novo lead', 'info');
  };

  const handleEmailAutomation = () => {
    setActiveTab('email');
    showNotification('Configurar automação de e-mails', 'info');
  };

  const handleSocialMedia = () => {
    setActiveTab('social');
    showNotification('Gerenciar redes sociais', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-blue-600" />
              Sistema de Marketing
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie campanhas, leads e estratégias de marketing
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Megaphone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              +8% este mês
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Capturados</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              +15% este mês
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">3.2%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              +0.5% este mês
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI Médio</p>
                <p className="text-2xl font-bold text-gray-900">4.8x</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              +0.3x este mês
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={handleNewCampaign}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nova Campanha
          </Button>
          <Button
            onClick={handleNewLead}
            variant="outline"
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Novo Lead
          </Button>
          <Button
            onClick={handleEmailAutomation}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Automação de E-mails
          </Button>
          <Button
            onClick={handleSocialMedia}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Redes Sociais
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-14">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Campanhas
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              E-mails
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Redes Sociais
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resumo de Marketing
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Campanhas em Destaque</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Black Friday 2024</p>
                          <p className="text-sm text-gray-600">E-mail Marketing</p>
                        </div>
                        <Badge variant="success">Ativa</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Instagram Ads</p>
                          <p className="text-sm text-gray-600">Redes Sociais</p>
                        </div>
                        <Badge variant="success">Ativa</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Google Ads</p>
                          <p className="text-sm text-gray-600">PPC</p>
                        </div>
                        <Badge variant="warning">Pausada</Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Leads Recentes</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">João Silva</p>
                          <p className="text-sm text-gray-600">joao@email.com</p>
                        </div>
                        <Badge variant="info">Novo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Maria Santos</p>
                          <p className="text-sm text-gray-600">maria@email.com</p>
                        </div>
                        <Badge variant="success">Qualificado</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Pedro Costa</p>
                          <p className="text-sm text-gray-600">pedro@email.com</p>
                        </div>
                        <Badge variant="warning">Em Contato</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Próximas Ações
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Campanha Black Friday</p>
                        <p className="text-sm text-gray-600">Inicia em 2 dias</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Mail className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">E-mail Semanal</p>
                        <p className="text-sm text-gray-600">Programado para amanhã</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Segmentação de Leads</p>
                        <p className="text-sm text-gray-600">Atualizar em 3 dias</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="p-6">
            <CampaignManager />
          </TabsContent>

          <TabsContent value="leads" className="p-6">
            <LeadCapture />
          </TabsContent>

          <TabsContent value="email" className="p-6">
            <EmailAutomation />
          </TabsContent>

          <TabsContent value="social" className="p-6">
            <SocialMediaIntegration />
          </TabsContent>

          <TabsContent value="analytics" className="p-6">
            <MarketingAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export { MarketingPage };
