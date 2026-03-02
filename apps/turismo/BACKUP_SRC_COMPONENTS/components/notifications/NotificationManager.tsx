'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Send, 
  Clock, 
  Repeat, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import PushNotificationService, { 
  NotificationPayload, 
  NotificationAction,
  NotificationPermission 
} from './PushNotificationService';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  icon?: string;
  actions?: NotificationAction[];
  category: 'info' | 'success' | 'warning' | 'error' | 'custom';
}

interface ScheduledNotification {
  id: string;
  payload: NotificationPayload;
  scheduledFor: Date;
  interval?: number;
  maxCount?: number;
  intervalId?: NodeJS.Timeout;
}

export default function NotificationManager() {
  const [notificationService] = useState(() => PushNotificationService.getInstance());
  const [isInitialized, setIsInitialized] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>({ granted: false, permission: 'denied' });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Estados para notificações
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [notificationIcon, setNotificationIcon] = useState('');
  const [requireInteraction, setRequireInteraction] = useState(false);
  const [isSilent, setIsSilent] = useState(false);
  
  // Estados para agendamento
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [scheduleDelay, setScheduleDelay] = useState(5000);
  const [scheduleInterval, setScheduleInterval] = useState(30000);
  const [maxNotifications, setMaxNotifications] = useState(5);
  
  // Estados para templates
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: 'welcome',
      name: 'Bem-vindo',
      title: 'Bem-vindo ao Sistema RSV!',
      body: 'Seu sistema de onboarding está pronto para uso.',
      category: 'success',
      icon: '/icons/welcome.png'
    },
    {
      id: 'reminder',
      name: 'Lembrete',
      title: 'Lembrete Importante',
      body: 'Você tem tarefas pendentes para completar.',
      category: 'info',
      icon: '/icons/reminder.png'
    },
    {
      id: 'alert',
      name: 'Alerta',
      title: 'Atenção Necessária',
      body: 'Há uma situação que requer sua atenção imediata.',
      category: 'warning',
      icon: '/icons/alert.png'
    },
    {
      id: 'error',
      name: 'Erro',
      title: 'Erro Detectado',
      body: 'Ocorreu um erro no sistema. Verifique os logs.',
      category: 'error',
      icon: '/icons/error.png'
    }
  ]);
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Inicializar serviço
  useEffect(() => {
    initializeService();
    return () => {
      notificationService.destroy();
    };
  }, []);

  const initializeService = async () => {
    try {
      const success = await notificationService.initialize();
      if (success) {
        setIsInitialized(true);
        await checkPermission();
        await checkSubscription();
      }
    } catch (error) {
      console.error('Erro ao inicializar serviço:', error);
      toast.error('Erro ao inicializar notificações');
    }
  };

  const checkPermission = async () => {
    const currentPermission = await notificationService.getCurrentPermission();
    setPermission(currentPermission);
  };

  const checkSubscription = async () => {
    const subscribed = await notificationService.isSubscribed();
    setIsSubscribed(subscribed);
  };

  const requestPermission = async () => {
    try {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      
      if (newPermission.granted) {
        toast.success('Permissão para notificações concedida!');
        await checkSubscription();
      } else {
        toast.error('Permissão para notificações negada');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao solicitar permissão');
    }
  };

  const subscribeToPush = async () => {
    try {
      const subscription = await notificationService.subscribeToPush();
      if (subscription) {
        setIsSubscribed(true);
        toast.success('Inscrito para notificações push!');
      } else {
        toast.error('Erro ao se inscrever para push');
      }
    } catch (error) {
      console.error('Erro ao se inscrever:', error);
      toast.error('Erro ao se inscrever para push');
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      const success = await notificationService.unsubscribeFromPush();
      if (success) {
        setIsSubscribed(false);
        toast.success('Inscrição cancelada com sucesso');
      } else {
        toast.error('Erro ao cancelar inscrição');
      }
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      toast.error('Erro ao cancelar inscrição');
    }
  };

  const sendNotification = async () => {
    if (!notificationTitle.trim() || !notificationBody.trim()) {
      toast.error('Título e corpo são obrigatórios');
      return;
    }

    try {
      const payload: NotificationPayload = {
        title: notificationTitle,
        body: notificationBody,
        icon: notificationIcon || undefined,
        requireInteraction,
        silent: isSilent,
        timestamp: Date.now()
      };

      await notificationService.showNotification(payload);
      toast.success('Notificação enviada com sucesso!');
      
      // Limpar campos
      setNotificationTitle('');
      setNotificationBody('');
      setNotificationIcon('');
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    }
  };

  const scheduleNotification = async () => {
    if (!notificationTitle.trim() || !notificationBody.trim()) {
      toast.error('Título e corpo são obrigatórios');
      return;
    }

    try {
      const payload: NotificationPayload = {
        title: notificationTitle,
        body: notificationBody,
        icon: notificationIcon || undefined,
        requireInteraction,
        silent: isSilent,
        timestamp: Date.now()
      };

      const scheduledNotification: ScheduledNotification = {
        id: Date.now().toString(),
        payload,
        scheduledFor: new Date(Date.now() + scheduleDelay)
      };

      setScheduledNotifications(prev => [...prev, scheduledNotification]);
      
      // Agendar notificação
      await notificationService.scheduleNotification(payload, scheduleDelay);
      
      toast.success(`Notificação agendada para ${scheduledNotification.scheduledFor.toLocaleTimeString()}`);
      
      // Limpar campos
      setNotificationTitle('');
      setNotificationBody('');
      setNotificationIcon('');
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      toast.error('Erro ao agendar notificação');
    }
  };

  const schedulePeriodicNotification = async () => {
    if (!notificationTitle.trim() || !notificationBody.trim()) {
      toast.error('Título e corpo são obrigatórios');
      return;
    }

    try {
      const payload: NotificationPayload = {
        title: notificationTitle,
        body: notificationBody,
        icon: notificationIcon || undefined,
        requireInteraction,
        silent: isSilent,
        timestamp: Date.now()
      };

      const intervalId = await notificationService.schedulePeriodicNotification(
        payload,
        scheduleInterval,
        maxNotifications
      );

      const scheduledNotification: ScheduledNotification = {
        id: Date.now().toString(),
        payload,
        scheduledFor: new Date(Date.now() + scheduleInterval),
        interval: scheduleInterval,
        maxCount: maxNotifications,
        intervalId
      };

      setScheduledNotifications(prev => [...prev, scheduledNotification]);
      
      toast.success(`Notificação periódica configurada (${maxNotifications} vezes a cada ${scheduleInterval / 1000}s)`);
      
      // Limpar campos
      setNotificationTitle('');
      setNotificationBody('');
      setNotificationIcon('');
    } catch (error) {
      console.error('Erro ao configurar notificação periódica:', error);
      toast.error('Erro ao configurar notificação periódica');
    }
  };

  const cancelScheduledNotification = async (id: string) => {
    try {
      const notification = scheduledNotifications.find(n => n.id === id);
      if (notification?.intervalId) {
        await notificationService.cancelScheduledNotification(notification.intervalId);
      }

      setScheduledNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notificação agendada cancelada');
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
      toast.error('Erro ao cancelar notificação');
    }
  };

  const useTemplate = (template: NotificationTemplate) => {
    setNotificationTitle(template.title);
    setNotificationBody(template.body);
    setNotificationIcon(template.icon || '');
    setSelectedTemplate(template.id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Info className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Inicializando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciador de Notificações
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure e gerencie notificações push do sistema
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={permission.granted ? "default" : "secondary"}>
            {permission.granted ? 'Permitido' : 'Negado'}
          </Badge>
          <Badge variant={isSubscribed ? "default" : "outline"}>
            {isSubscribed ? 'Inscrito' : 'Não inscrito'}
          </Badge>
        </div>
      </div>

      {/* Status e Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status e Controles
          </CardTitle>
          <CardDescription>
            Gerencie permissões e inscrições para notificações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Permissões</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Status atual: {permission.permission}
                  </span>
                  {!permission.granted && (
                    <Button onClick={requestPermission} size="sm">
                      Solicitar Permissão
                    </Button>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {permission.granted 
                    ? 'Notificações estão habilitadas para este site'
                    : 'Permissão necessária para receber notificações'
                  }
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Inscrição Push</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isSubscribed ? 'Inscrito para notificações push' : 'Não inscrito'}
                  </span>
                  {permission.granted && (
                    <div className="flex gap-2">
                      {!isSubscribed ? (
                        <Button onClick={subscribeToPush} size="sm">
                          Inscrever
                        </Button>
                      ) : (
                        <Button onClick={unsubscribeFromPush} size="sm" variant="outline">
                          Cancelar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {isSubscribed 
                    ? 'Recebendo notificações em tempo real'
                    : 'Inscreva-se para receber notificações push'
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Funcionalidades */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="send">Enviar</TabsTrigger>
          <TabsTrigger value="schedule">Agendar</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Notificações Enviadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Hoje
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduledNotifications.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ativas
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {permission.granted ? 'Ativo' : 'Inativo'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sistema
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Notificações Agendadas */}
          {scheduledNotifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Notificações Agendadas
                </CardTitle>
                <CardDescription>
                  Lista de notificações programadas para envio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scheduledNotifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{notification.payload.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {notification.payload.body}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Agendada para: {notification.scheduledFor.toLocaleString()}
                          {notification.interval && ` (a cada ${notification.interval / 1000}s)`}
                        </div>
                      </div>
                      <Button
                        onClick={() => cancelScheduledNotification(notification.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Enviar Notificação */}
        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Enviar Notificação Imediata
              </CardTitle>
              <CardDescription>
                Envie uma notificação push imediatamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      placeholder="Título da notificação"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ícone (URL opcional)</label>
                    <Input
                      value={notificationIcon}
                      onChange={(e) => setNotificationIcon(e.target.value)}
                      placeholder="https://exemplo.com/icon.png"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Corpo da Mensagem</label>
                  <Textarea
                    value={notificationBody}
                    onChange={(e) => setNotificationBody(e.target.value)}
                    placeholder="Conteúdo da notificação..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={requireInteraction}
                      onCheckedChange={setRequireInteraction}
                    />
                    <label className="text-sm">Requer interação</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isSilent}
                      onCheckedChange={setIsSilent}
                    />
                    <label className="text-sm">Silenciosa</label>
                  </div>
                </div>

                <Button onClick={sendNotification} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Notificação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agendar Notificação */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Agendar Notificação
              </CardTitle>
              <CardDescription>
                Programe notificações para envio futuro ou periódico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      placeholder="Título da notificação"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ícone (URL opcional)</label>
                    <Input
                      value={notificationIcon}
                      onChange={(e) => setNotificationIcon(e.target.value)}
                      placeholder="https://exemplo.com/icon.png"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Corpo da Mensagem</label>
                  <Textarea
                    value={notificationBody}
                    onChange={(e) => setNotificationBody(e.target.value)}
                    placeholder="Conteúdo da notificação..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Delay (ms)</label>
                    <Input
                      type="number"
                      value={scheduleDelay}
                      onChange={(e) => setScheduleDelay(Number(e.target.value))}
                      placeholder="5000"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tempo até o envio
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Intervalo (ms)</label>
                    <Input
                      type="number"
                      value={scheduleInterval}
                      onChange={(e) => setScheduleInterval(Number(e.target.value))}
                      placeholder="30000"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Para notificações periódicas
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Máximo</label>
                    <Input
                      type="number"
                      value={maxNotifications}
                      onChange={(e) => setMaxNotifications(Number(e.target.value))}
                      placeholder="5"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Número máximo de envios
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={requireInteraction}
                      onCheckedChange={setRequireInteraction}
                    />
                    <label className="text-sm">Requer interação</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isSilent}
                      onCheckedChange={setIsSilent}
                    />
                    <label className="text-sm">Silenciosa</label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={scheduleNotification} className="flex-1">
                    <Clock className="h-4 w-4 mr-2" />
                    Agendar Única
                  </Button>
                  <Button onClick={schedulePeriodicNotification} className="flex-1">
                    <Repeat className="h-4 w-4 mr-2" />
                    Agendar Periódica
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Templates de Notificação
              </CardTitle>
              <CardDescription>
                Use templates pré-definidos para notificações comuns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => useTemplate(template)}
                  >
                    <div className="flex items-start gap-3">
                      {getCategoryIcon(template.category)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge className={getCategoryColor(template.category)}>
                            {template.category}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {template.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {template.body}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTemplate && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Template Selecionado: {templates.find(t => t.id === selectedTemplate)?.name}
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Use os botões acima para enviar ou agendar esta notificação
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
