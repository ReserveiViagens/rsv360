import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, MessageCircle, Megaphone, TrendingUp, Users, DollarSign, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import {
  PushNotificationSystem,
  EmailMarketing,
  SMSSystem,
  ChatSystem,
  BroadcastSystem
} from '../components/notifications';
import { useUIStore } from '../stores/useUIStore';

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('push');
  const [quickStats, setQuickStats] = useState({
    totalNotifications: 1250,
    activeChats: 8,
    emailCampaigns: 12,
    smsSent: 850,
    pushDelivered: 2300,
    broadcastReach: 15000
  });
  const { showNotification } = useUIStore();

  const handleNotificationSent = (notification: any) => {
    showNotification('Notificação enviada com sucesso!', 'success');
  };

  const handleCampaignCreated = (campaign: any) => {
    showNotification('Campanha criada com sucesso!', 'success');
  };

  const handleTemplateCreated = (template: any) => {
    showNotification('Template criado com sucesso!', 'success');
  };

  const handleListCreated = (list: any) => {
    showNotification('Lista criada com sucesso!', 'success');
  };

  const handleMessageSent = (message: any) => {
    showNotification('Mensagem enviada com sucesso!', 'success');
  };

  const handleAgentAssigned = (conversationId: string, agentId: string) => {
    showNotification('Agente atribuído com sucesso!', 'success');
  };

  const handleBroadcastCreated = (broadcast: any) => {
    showNotification('Broadcast criado com sucesso!', 'success');
  };

  const handleSegmentCreated = (segment: any) => {
    showNotification('Segmento criado com sucesso!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sistema de Notificações e Comunicação
        </h1>
        <p className="text-gray-600">
          Gerencie todas as formas de comunicação com clientes e usuários
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{quickStats.totalNotifications}</h3>
          <p className="text-sm text-gray-600">Notificações</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{quickStats.activeChats}</h3>
          <p className="text-sm text-gray-600">Chats Ativos</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <Mail className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{quickStats.emailCampaigns}</h3>
          <p className="text-sm text-gray-600">Campanhas Email</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{quickStats.smsSent}</h3>
          <p className="text-sm text-gray-600">SMS Enviados</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-3">
            <Bell className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{quickStats.pushDelivered}</h3>
          <p className="text-sm text-gray-600">Push Entregues</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-3">
            <Megaphone className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{quickStats.broadcastReach}</h3>
          <p className="text-sm text-gray-600">Alcance Broadcast</p>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-14">
            <TabsTrigger value="push" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Push
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Broadcast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="push" className="p-6">
            <PushNotificationSystem
              onNotificationSent={handleNotificationSent}
              onTemplateCreated={handleTemplateCreated}
            />
          </TabsContent>

          <TabsContent value="email" className="p-6">
            <EmailMarketing
              onCampaignCreated={handleCampaignCreated}
              onTemplateCreated={handleTemplateCreated}
              onListCreated={handleListCreated}
            />
          </TabsContent>

          <TabsContent value="sms" className="p-6">
            <SMSSystem
              onMessageSent={handleMessageSent}
              onCampaignCreated={handleCampaignCreated}
              onTemplateCreated={handleTemplateCreated}
            />
          </TabsContent>

          <TabsContent value="chat" className="p-6">
            <ChatSystem
              onConversationCreated={handleNotificationSent}
              onMessageSent={handleMessageSent}
              onAgentAssigned={handleAgentAssigned}
            />
          </TabsContent>

          <TabsContent value="broadcast" className="p-6">
            <BroadcastSystem
              onBroadcastCreated={handleBroadcastCreated}
              onTemplateCreated={handleTemplateCreated}
              onSegmentCreated={handleSegmentCreated}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Quick Actions Footer */}
      <div className="mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Bell className="w-6 h-6" />
              <span className="text-sm">Nova Notificação Push</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Mail className="w-6 h-6" />
              <span className="text-sm">Nova Campanha Email</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              <span className="text-sm">Enviar SMS</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Megaphone className="w-6 h-6" />
              <span className="text-sm">Novo Broadcast</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Notificação push enviada para 1,250 usuários
              </span>
              <span className="text-xs text-gray-400 ml-auto">2 min atrás</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Campanha de email "Promoção de Verão" criada
              </span>
              <span className="text-xs text-gray-400 ml-auto">15 min atrás</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Novo agente de chat adicionado ao sistema
              </span>
              <span className="text-xs text-gray-400 ml-auto">1 hora atrás</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Broadcast SMS enviado para 500 clientes VIP
              </span>
              <span className="text-xs text-gray-400 ml-auto">2 horas atrás</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export { NotificationsPage };
