'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { 
  Settings, 
  Bell, 
  BellOff, 
  Clock, 
  Smartphone, 
  Monitor, 
  Globe,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  User,
  Users,
  Building
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPreferences {
  // Notificações gerais
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  desktop: boolean;
  mobile: boolean;
  
  // Tipos de notificação
  system: boolean;
  updates: boolean;
  reminders: boolean;
  alerts: boolean;
  marketing: boolean;
  
  // Configurações de tempo
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
  timezone: string;
  
  // Configurações de frequência
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  batchNotifications: boolean;
  maxPerHour: number;
  
  // Configurações de privacidade
  showContent: boolean;
  showSender: boolean;
  allowTracking: boolean;
  
  // Configurações de dispositivo
  deviceSpecific: boolean;
  mobileOptimized: boolean;
  desktopOptimized: boolean;
  
  // Configurações de grupo
  groupNotifications: boolean;
  groupByType: boolean;
  groupBySender: boolean;
  
  // Configurações de retenção
  retentionDays: number;
  autoArchive: boolean;
  maxNotifications: number;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack' | 'teams';
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  config: Record<string, any>;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  sound: true,
  vibration: true,
  desktop: true,
  mobile: true,
  system: true,
  updates: true,
  reminders: true,
  alerts: true,
  marketing: false,
  quietHours: false,
  quietStart: '22:00',
  quietEnd: '08:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  frequency: 'immediate',
  batchNotifications: false,
  maxPerHour: 10,
  showContent: true,
  showSender: true,
  allowTracking: false,
  deviceSpecific: true,
  mobileOptimized: true,
  desktopOptimized: true,
  groupNotifications: true,
  groupByType: true,
  groupBySender: false,
  retentionDays: 30,
  autoArchive: true,
  maxNotifications: 100
};

const DEFAULT_CHANNELS: NotificationChannel[] = [
  {
    id: 'push',
    name: 'Notificações Push',
    type: 'push',
    enabled: true,
    priority: 'high',
    config: {}
  },
  {
    id: 'email',
    name: 'Email',
    type: 'email',
    enabled: false,
    priority: 'medium',
    config: {
      email: '',
      format: 'html'
    }
  },
  {
    id: 'sms',
    name: 'SMS',
    type: 'sms',
    enabled: false,
    priority: 'critical',
    config: {
      phone: '',
      provider: 'default'
    }
  },
  {
    id: 'webhook',
    name: 'Webhook',
    type: 'webhook',
    enabled: false,
    priority: 'low',
    config: {
      url: '',
      method: 'POST'
    }
  }
];

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [channels, setChannels] = useState<NotificationChannel[]>(DEFAULT_CHANNELS);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Carregar preferências salvas
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const savedPreferences = localStorage.getItem('notification-preferences');
      const savedChannels = localStorage.getItem('notification-channels');
      
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
      
      if (savedChannels) {
        setChannels(JSON.parse(savedChannels));
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  };

  const savePreferences = async () => {
    try {
      localStorage.setItem('notification-preferences', JSON.stringify(preferences));
      localStorage.setItem('notification-channels', JSON.stringify(channels));
      
      // Simular salvamento no servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setChannels(DEFAULT_CHANNELS);
    setHasChanges(true);
    toast.info('Configurações resetadas para padrão');
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const updateChannel = (channelId: string, updates: Partial<NotificationChannel>) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, ...updates } : channel
    ));
    setHasChanges(true);
  };

  const toggleChannel = (channelId: string) => {
    updateChannel(channelId, { enabled: !channels.find(c => c.id === channelId)?.enabled });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'push': return <Bell className="h-4 w-4" />;
      case 'email': return <Globe className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'webhook': return <Zap className="h-4 w-4" />;
      case 'slack': return <Users className="h-4 w-4" />;
      case 'teams': return <Building className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações de Notificação
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Personalize como e quando receber notificações
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Alterações não salvas
            </Badge>
          )}
          <Button onClick={savePreferences} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button onClick={resetPreferences} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Tabs de Configurações */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'Geral', icon: Settings },
            { id: 'channels', label: 'Canais', icon: Bell },
            { id: 'types', label: 'Tipos', icon: Eye },
            { id: 'timing', label: 'Tempo', icon: Clock },
            { id: 'privacy', label: 'Privacidade', icon: Shield },
            { id: 'advanced', label: 'Avançado', icon: Zap }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="space-y-6">
        {/* Configurações Gerais */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Básicas
                </CardTitle>
                <CardDescription>
                  Controle geral das notificações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Habilitar Notificações</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ativa ou desativa todas as notificações
                    </p>
                  </div>
                  <Switch
                    checked={preferences.enabled}
                    onCheckedChange={(checked) => updatePreference('enabled', checked)}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Dispositivos</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Desktop</span>
                        <Switch
                          checked={preferences.desktop}
                          onCheckedChange={(checked) => updatePreference('desktop', checked)}
                          disabled={!preferences.enabled}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mobile</span>
                        <Switch
                          checked={preferences.mobile}
                          onCheckedChange={(checked) => updatePreference('mobile', checked)}
                          disabled={!preferences.enabled}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Mídia</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Som</span>
                        <Switch
                          checked={preferences.sound}
                          onCheckedChange={(checked) => updatePreference('sound', checked)}
                          disabled={!preferences.enabled}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Vibração</span>
                        <Switch
                          checked={preferences.vibration}
                          onCheckedChange={(checked) => updatePreference('vibration', checked)}
                          disabled={!preferences.enabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Canais de Notificação */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Canais de Notificação
                </CardTitle>
                <CardDescription>
                  Configure como receber notificações através de diferentes canais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channels.map((channel) => (
                    <div key={channel.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getChannelIcon(channel.type)}
                          <div>
                            <h4 className="font-medium">{channel.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {channel.type.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getPriorityColor(channel.priority)}>
                            {channel.priority}
                          </Badge>
                          <Switch
                            checked={channel.enabled}
                            onCheckedChange={() => toggleChannel(channel.id)}
                          />
                        </div>
                      </div>

                      {channel.enabled && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div>
                              <label className="text-sm font-medium">Prioridade</label>
                              <Select
                                value={channel.priority}
                                onValueChange={(value) => updateChannel(channel.id, { priority: value as any })}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Baixa</SelectItem>
                                  <SelectItem value="medium">Média</SelectItem>
                                  <SelectItem value="high">Alta</SelectItem>
                                  <SelectItem value="critical">Crítica</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Configurações específicas por canal */}
                          {channel.type === 'email' && (
                            <div>
                              <label className="text-sm font-medium">Email</label>
                              <Input
                                type="email"
                                placeholder="seu@email.com"
                                value={channel.config.email || ''}
                                onChange={(e) => updateChannel(channel.id, {
                                  config: { ...channel.config, email: e.target.value }
                                })}
                                className="mt-1"
                              />
                            </div>
                          )}

                          {channel.type === 'sms' && (
                            <div>
                              <label className="text-sm font-medium">Telefone</label>
                              <Input
                                type="tel"
                                placeholder="+55 11 99999-9999"
                                value={channel.config.phone || ''}
                                onChange={(e) => updateChannel(channel.id, {
                                  config: { ...channel.config, phone: e.target.value }
                                })}
                                className="mt-1"
                              />
                            </div>
                          )}

                          {channel.type === 'webhook' && (
                            <div>
                              <label className="text-sm font-medium">URL do Webhook</label>
                              <Input
                                type="url"
                                placeholder="https://api.exemplo.com/webhook"
                                value={channel.config.url || ''}
                                onChange={(e) => updateChannel(channel.id, {
                                  config: { ...channel.config, url: e.target.value }
                                })}
                                className="mt-1"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tipos de Notificação */}
        {activeTab === 'types' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Tipos de Notificação
                </CardTitle>
                <CardDescription>
                  Escolha quais tipos de notificação deseja receber
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { key: 'system', label: 'Sistema', description: 'Notificações do sistema e atualizações' },
                    { key: 'updates', label: 'Atualizações', description: 'Novas funcionalidades e melhorias' },
                    { key: 'reminders', label: 'Lembretes', description: 'Lembretes e tarefas pendentes' },
                    { key: 'alerts', label: 'Alertas', description: 'Alertas importantes e críticos' },
                    { key: 'marketing', label: 'Marketing', description: 'Promoções e novidades (opcional)' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{label}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                      </div>
                      <Switch
                        checked={preferences[key as keyof NotificationPreferences] as boolean}
                        onCheckedChange={(checked) => updatePreference(key as keyof NotificationPreferences, checked)}
                        disabled={!preferences.enabled}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Configurações de Tempo */}
        {activeTab === 'timing' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Configurações de Tempo
                </CardTitle>
                <CardDescription>
                  Configure quando e com que frequência receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Horário Silencioso</h4>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={preferences.quietHours}
                      onCheckedChange={(checked) => updatePreference('quietHours', checked)}
                    />
                    <span className="text-sm">Ativar horário silencioso</span>
                  </div>
                  
                  {preferences.quietHours && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
                      <div>
                        <label className="text-sm font-medium">Início</label>
                        <Input
                          type="time"
                          value={preferences.quietStart}
                          onChange={(e) => updatePreference('quietStart', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Fim</label>
                        <Input
                          type="time"
                          value={preferences.quietEnd}
                          onChange={(e) => updatePreference('quietEnd', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Fuso Horário</label>
                        <Select
                          value={preferences.timezone}
                          onValueChange={(value) => updatePreference('timezone', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                            <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                            <SelectItem value="America/Belem">Belém (GMT-3)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Frequência de Envio</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Frequência</label>
                      <Select
                        value={preferences.frequency}
                        onValueChange={(value) => updatePreference('frequency', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Imediato</SelectItem>
                          <SelectItem value="hourly">A cada hora</SelectItem>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Máximo por hora</label>
                      <Input
                        type="number"
                        value={preferences.maxPerHour}
                        onChange={(e) => updatePreference('maxPerHour', Number(e.target.value))}
                        min="1"
                        max="100"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.batchNotifications}
                      onCheckedChange={(checked) => updatePreference('batchNotifications', checked)}
                    />
                    <span className="text-sm">Agrupar notificações similares</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Configurações de Privacidade */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacidade e Segurança
                </CardTitle>
                <CardDescription>
                  Controle o que é exibido nas notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Conteúdo das Notificações</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Mostrar conteúdo</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Exibe o texto completo da notificação
                        </p>
                      </div>
                      <Switch
                        checked={preferences.showContent}
                        onCheckedChange={(checked) => updatePreference('showContent', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Mostrar remetente</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Exibe quem enviou a notificação
                        </p>
                      </div>
                      <Switch
                        checked={preferences.showSender}
                        onCheckedChange={(checked) => updatePreference('showSender', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Rastreamento</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Permitir rastreamento</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Coleta dados de uso para melhorar o serviço
                        </p>
                      </div>
                      <Switch
                        checked={preferences.allowTracking}
                        onCheckedChange={(checked) => updatePreference('allowTracking', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Configurações Avançadas */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Configurações Avançadas
                </CardTitle>
                <CardDescription>
                  Opções avançadas para usuários experientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Otimizações de Dispositivo</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Otimizações específicas por dispositivo</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Aplica configurações específicas para cada tipo de dispositivo
                        </p>
                      </div>
                      <Switch
                        checked={preferences.deviceSpecific}
                        onCheckedChange={(checked) => updatePreference('deviceSpecific', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Otimizado para mobile</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Ajusta notificações para dispositivos móveis
                        </p>
                      </div>
                      <Switch
                        checked={preferences.mobileOptimized}
                        onCheckedChange={(checked) => updatePreference('mobileOptimized', checked)}
                        disabled={!preferences.deviceSpecific}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Otimizado para desktop</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Ajusta notificações para computadores
                        </p>
                      </div>
                      <Switch
                        checked={preferences.desktopOptimized}
                        onCheckedChange={(checked) => updatePreference('desktopOptimized', checked)}
                        disabled={!preferences.deviceSpecific}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Agrupamento</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Agrupar notificações</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Combina notificações similares em uma única notificação
                        </p>
                      </div>
                      <Switch
                        checked={preferences.groupNotifications}
                        onCheckedChange={(checked) => updatePreference('groupNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Agrupar por tipo</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Agrupa notificações do mesmo tipo
                        </p>
                      </div>
                      <Switch
                        checked={preferences.groupByType}
                        onCheckedChange={(checked) => updatePreference('groupByType', checked)}
                        disabled={!preferences.groupNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Agrupar por remetente</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Agrupa notificações do mesmo remetente
                        </p>
                      </div>
                      <Switch
                        checked={preferences.groupBySender}
                        onCheckedChange={(checked) => updatePreference('groupBySender', checked)}
                        disabled={!preferences.groupNotifications}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Retenção e Arquivo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Dias de retenção</label>
                      <Input
                        type="number"
                        value={preferences.retentionDays}
                        onChange={(e) => updatePreference('retentionDays', Number(e.target.value))}
                        min="1"
                        max="365"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Máximo de notificações</label>
                      <Input
                        type="number"
                        value={preferences.maxNotifications}
                        onChange={(e) => updatePreference('maxNotifications', Number(e.target.value))}
                        min="10"
                        max="1000"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={preferences.autoArchive}
                        onCheckedChange={(checked) => updatePreference('autoArchive', checked)}
                      />
                      <span className="text-sm">Arquivamento automático</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
