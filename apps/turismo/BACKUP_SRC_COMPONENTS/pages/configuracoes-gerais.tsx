'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Settings,
  Save,
  RefreshCw,
  Globe,
  Clock,
  Mail,
  Bell,
  Shield,
  Palette,
  Database,
  Server,
  Users,
  MapPin,
  Phone,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';

interface SystemConfig {
  general: {
    company_name: string;
    company_description: string;
    company_logo: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    company_website: string;
    timezone: string;
    language: string;
    currency: string;
  };
  business: {
    commission_rate: number;
    default_payment_method: string;
    booking_expiry_hours: number;
    auto_confirm_bookings: boolean;
    require_deposit: boolean;
    deposit_percentage: number;
    cancellation_policy: string;
    refund_policy: string;
  };
  notifications: {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    booking_confirmation: boolean;
    payment_received: boolean;
    cancellation_alert: boolean;
    reminder_24h: boolean;
    newsletter_enabled: boolean;
  };
  security: {
    two_factor_required: boolean;
    session_timeout: number;
    password_min_length: number;
    password_require_special: boolean;
    max_login_attempts: number;
    audit_logs_enabled: boolean;
    data_retention_days: number;
    backup_frequency: string;
  };
  appearance: {
    theme: string;
    primary_color: string;
    secondary_color: string;
    logo_position: string;
    sidebar_collapsed: boolean;
    show_company_logo: boolean;
    custom_css: string;
    favicon_url: string;
  };
  integrations: {
    google_analytics_id: string;
    facebook_pixel_id: string;
    whatsapp_api_key: string;
    payment_gateway_key: string;
    email_service_key: string;
    maps_api_key: string;
    weather_api_key: string;
  };
}

const DEFAULT_CONFIG: SystemConfig = {
  general: {
    company_name: 'Reservei Viagens',
    company_description: 'Agência especializada em Caldas Novas e região',
    company_logo: '',
    company_address: 'Rua RP5, Residencial Primavera 2, Caldas Novas, GO',
    company_phone: '(64) 99319-7555',
    company_email: 'reservas@reserveiviagens.com.br',
    company_website: 'reserveiviagens.com.br',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    currency: 'BRL'
  },
  business: {
    commission_rate: 10,
    default_payment_method: 'credit_card',
    booking_expiry_hours: 24,
    auto_confirm_bookings: false,
    require_deposit: true,
    deposit_percentage: 30,
    cancellation_policy: 'flexible',
    refund_policy: 'partial'
  },
  notifications: {
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    booking_confirmation: true,
    payment_received: true,
    cancellation_alert: true,
    reminder_24h: true,
    newsletter_enabled: false
  },
  security: {
    two_factor_required: false,
    session_timeout: 30,
    password_min_length: 8,
    password_require_special: true,
    max_login_attempts: 5,
    audit_logs_enabled: true,
    data_retention_days: 365,
    backup_frequency: 'daily'
  },
  appearance: {
    theme: 'light',
    primary_color: '#2563EB',
    secondary_color: '#10B981',
    logo_position: 'left',
    sidebar_collapsed: false,
    show_company_logo: true,
    custom_css: '',
    favicon_url: ''
  },
  integrations: {
    google_analytics_id: '',
    facebook_pixel_id: '',
    whatsapp_api_key: '',
    payment_gateway_key: '',
    email_service_key: '',
    maps_api_key: '',
    weather_api_key: ''
  }
};

export default function ConfiguracoesGerais() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // Simular carregamento de configurações
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Em produção, isso viria do backend
      const savedConfig = localStorage.getItem('system_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Em produção, isso iria para o backend
      localStorage.setItem('system_config', JSON.stringify(config));

      setHasChanges(false);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão? Todas as alterações serão perdidas.')) {
      setConfig(DEFAULT_CONFIG);
      setHasChanges(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ⚙️ Configurações Gerais RSV 360
            </h1>
            <p className="text-gray-600">
              Configure todos os aspectos do sistema para sua agência de viagens
            </p>
          </div>

          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button onClick={resetToDefaults} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Restaurar Padrões
            </Button>
            <Button
              onClick={saveConfig}
              disabled={!hasChanges || isSaving}
              className={hasChanges ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>

        {/* Status de Alterações */}
        {hasChanges && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-orange-800 font-medium">
                  Você possui alterações não salvas. Clique em "Salvar Alterações" para aplicá-las.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">
              <Globe className="h-4 w-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="business">
              <CreditCard className="h-4 w-4 mr-2" />
              Negócio
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Server className="h-4 w-4 mr-2" />
              Integrações
            </TabsTrigger>
          </TabsList>

          {/* Configurações Gerais */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                  <CardDescription>Dados básicos da sua agência de viagens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="company_name">Nome da Empresa</Label>
                    <Input
                      id="company_name"
                      value={config.general.company_name}
                      onChange={(e) => updateConfig('general', 'company_name', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="company_description">Descrição</Label>
                    <Textarea
                      id="company_description"
                      value={config.general.company_description}
                      onChange={(e) => updateConfig('general', 'company_description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="company_address">Endereço</Label>
                    <Textarea
                      id="company_address"
                      value={config.general.company_address}
                      onChange={(e) => updateConfig('general', 'company_address', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company_phone">Telefone</Label>
                      <Input
                        id="company_phone"
                        value={config.general.company_phone}
                        onChange={(e) => updateConfig('general', 'company_phone', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="company_email">Email</Label>
                      <Input
                        id="company_email"
                        type="email"
                        value={config.general.company_email}
                        onChange={(e) => updateConfig('general', 'company_email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company_website">Website</Label>
                    <Input
                      id="company_website"
                      value={config.general.company_website}
                      onChange={(e) => updateConfig('general', 'company_website', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações Regionais</CardTitle>
                  <CardDescription>Fuso horário, idioma e moeda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select value={config.general.timezone} onValueChange={(value) => updateConfig('general', 'timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">América/São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="America/Manaus">América/Manaus (GMT-4)</SelectItem>
                        <SelectItem value="America/Rio_Branco">América/Rio Branco (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={config.general.language} onValueChange={(value) => updateConfig('general', 'language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="currency">Moeda</Label>
                    <Select value={config.general.currency} onValueChange={(value) => updateConfig('general', 'currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                        <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Negócio */}
          <TabsContent value="business">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Comerciais</CardTitle>
                  <CardDescription>Parâmetros de vendas e comissões</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
                    <Input
                      id="commission_rate"
                      type="number"
                      min="0"
                      max="100"
                      value={config.business.commission_rate}
                      onChange={(e) => updateConfig('business', 'commission_rate', parseFloat(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="default_payment_method">Método de Pagamento Padrão</Label>
                    <Select value={config.business.default_payment_method} onValueChange={(value) => updateConfig('business', 'default_payment_method', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="booking_expiry_hours">Expiração de Reserva (horas)</Label>
                    <Input
                      id="booking_expiry_hours"
                      type="number"
                      min="1"
                      max="168"
                      value={config.business.booking_expiry_hours}
                      onChange={(e) => updateConfig('business', 'booking_expiry_hours', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_confirm_bookings"
                      checked={config.business.auto_confirm_bookings}
                      onCheckedChange={(checked) => updateConfig('business', 'auto_confirm_bookings', checked)}
                    />
                    <Label htmlFor="auto_confirm_bookings">Auto-confirmar reservas</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Políticas de Pagamento</CardTitle>
                  <CardDescription>Depósitos, cancelamentos e reembolsos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require_deposit"
                      checked={config.business.require_deposit}
                      onCheckedChange={(checked) => updateConfig('business', 'require_deposit', checked)}
                    />
                    <Label htmlFor="require_deposit">Exigir depósito</Label>
                  </div>

                  {config.business.require_deposit && (
                    <div>
                      <Label htmlFor="deposit_percentage">Percentual do Depósito (%)</Label>
                      <Input
                        id="deposit_percentage"
                        type="number"
                        min="0"
                        max="100"
                        value={config.business.deposit_percentage}
                        onChange={(e) => updateConfig('business', 'deposit_percentage', parseFloat(e.target.value))}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="cancellation_policy">Política de Cancelamento</Label>
                    <Select value={config.business.cancellation_policy} onValueChange={(value) => updateConfig('business', 'cancellation_policy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flexible">Flexível</SelectItem>
                        <SelectItem value="moderate">Moderada</SelectItem>
                        <SelectItem value="strict">Rígida</SelectItem>
                        <SelectItem value="non_refundable">Não reembolsável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="refund_policy">Política de Reembolso</Label>
                    <Select value={config.business.refund_policy} onValueChange={(value) => updateConfig('business', 'refund_policy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Reembolso total</SelectItem>
                        <SelectItem value="partial">Reembolso parcial</SelectItem>
                        <SelectItem value="credit">Crédito para futura viagem</SelectItem>
                        <SelectItem value="none">Sem reembolso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Notificações */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>Configure como e quando enviar notificações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Canais de Comunicação</h4>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="email_enabled"
                        checked={config.notifications.email_enabled}
                        onCheckedChange={(checked) => updateConfig('notifications', 'email_enabled', checked)}
                      />
                      <Label htmlFor="email_enabled">Email</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sms_enabled"
                        checked={config.notifications.sms_enabled}
                        onCheckedChange={(checked) => updateConfig('notifications', 'sms_enabled', checked)}
                      />
                      <Label htmlFor="sms_enabled">SMS</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="push_enabled"
                        checked={config.notifications.push_enabled}
                        onCheckedChange={(checked) => updateConfig('notifications', 'push_enabled', checked)}
                      />
                      <Label htmlFor="push_enabled">Push Notifications</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Eventos de Reserva</h4>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="booking_confirmation"
                        checked={config.notifications.booking_confirmation}
                        onCheckedChange={(checked) => updateConfig('notifications', 'booking_confirmation', checked)}
                      />
                      <Label htmlFor="booking_confirmation">Confirmação de reserva</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="payment_received"
                        checked={config.notifications.payment_received}
                        onCheckedChange={(checked) => updateConfig('notifications', 'payment_received', checked)}
                      />
                      <Label htmlFor="payment_received">Pagamento recebido</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="cancellation_alert"
                        checked={config.notifications.cancellation_alert}
                        onCheckedChange={(checked) => updateConfig('notifications', 'cancellation_alert', checked)}
                      />
                      <Label htmlFor="cancellation_alert">Alerta de cancelamento</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Lembretes e Marketing</h4>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="reminder_24h"
                        checked={config.notifications.reminder_24h}
                        onCheckedChange={(checked) => updateConfig('notifications', 'reminder_24h', checked)}
                      />
                      <Label htmlFor="reminder_24h">Lembrete 24h antes</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="newsletter_enabled"
                        checked={config.notifications.newsletter_enabled}
                        onCheckedChange={(checked) => updateConfig('notifications', 'newsletter_enabled', checked)}
                      />
                      <Label htmlFor="newsletter_enabled">Newsletter</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Segurança */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Autenticação e Senhas</CardTitle>
                  <CardDescription>Configurações de segurança de acesso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="two_factor_required"
                      checked={config.security.two_factor_required}
                      onCheckedChange={(checked) => updateConfig('security', 'two_factor_required', checked)}
                    />
                    <Label htmlFor="two_factor_required">Exigir autenticação de dois fatores</Label>
                  </div>

                  <div>
                    <Label htmlFor="session_timeout">Timeout de sessão (minutos)</Label>
                    <Input
                      id="session_timeout"
                      type="number"
                      min="5"
                      max="480"
                      value={config.security.session_timeout}
                      onChange={(e) => updateConfig('security', 'session_timeout', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="password_min_length">Tamanho mínimo da senha</Label>
                    <Input
                      id="password_min_length"
                      type="number"
                      min="4"
                      max="20"
                      value={config.security.password_min_length}
                      onChange={(e) => updateConfig('security', 'password_min_length', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="password_require_special"
                      checked={config.security.password_require_special}
                      onCheckedChange={(checked) => updateConfig('security', 'password_require_special', checked)}
                    />
                    <Label htmlFor="password_require_special">Exigir caracteres especiais</Label>
                  </div>

                  <div>
                    <Label htmlFor="max_login_attempts">Máximo de tentativas de login</Label>
                    <Input
                      id="max_login_attempts"
                      type="number"
                      min="3"
                      max="10"
                      value={config.security.max_login_attempts}
                      onChange={(e) => updateConfig('security', 'max_login_attempts', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logs e Backup</CardTitle>
                  <CardDescription>Auditoria e proteção de dados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="audit_logs_enabled"
                      checked={config.security.audit_logs_enabled}
                      onCheckedChange={(checked) => updateConfig('security', 'audit_logs_enabled', checked)}
                    />
                    <Label htmlFor="audit_logs_enabled">Logs de auditoria</Label>
                  </div>

                  <div>
                    <Label htmlFor="data_retention_days">Retenção de dados (dias)</Label>
                    <Input
                      id="data_retention_days"
                      type="number"
                      min="30"
                      max="3650"
                      value={config.security.data_retention_days}
                      onChange={(e) => updateConfig('security', 'data_retention_days', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="backup_frequency">Frequência de backup</Label>
                    <Select value={config.security.backup_frequency} onValueChange={(value) => updateConfig('security', 'backup_frequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">A cada hora</SelectItem>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Aparência */}
          <TabsContent value="appearance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tema e Cores</CardTitle>
                  <CardDescription>Personalize a aparência do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="theme">Tema</Label>
                    <Select value={config.appearance.theme} onValueChange={(value) => updateConfig('appearance', 'theme', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="auto">Automático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="primary_color">Cor Primária</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={config.appearance.primary_color}
                        onChange={(e) => updateConfig('appearance', 'primary_color', e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={config.appearance.primary_color}
                        onChange={(e) => updateConfig('appearance', 'primary_color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={config.appearance.secondary_color}
                        onChange={(e) => updateConfig('appearance', 'secondary_color', e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={config.appearance.secondary_color}
                        onChange={(e) => updateConfig('appearance', 'secondary_color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Layout e Logo</CardTitle>
                  <CardDescription>Configurações de layout e branding</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="logo_position">Posição do Logo</Label>
                    <Select value={config.appearance.logo_position} onValueChange={(value) => updateConfig('appearance', 'logo_position', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sidebar_collapsed"
                      checked={config.appearance.sidebar_collapsed}
                      onCheckedChange={(checked) => updateConfig('appearance', 'sidebar_collapsed', checked)}
                    />
                    <Label htmlFor="sidebar_collapsed">Sidebar colapsada por padrão</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_company_logo"
                      checked={config.appearance.show_company_logo}
                      onCheckedChange={(checked) => updateConfig('appearance', 'show_company_logo', checked)}
                    />
                    <Label htmlFor="show_company_logo">Mostrar logo da empresa</Label>
                  </div>

                  <div>
                    <Label htmlFor="custom_css">CSS Personalizado</Label>
                    <Textarea
                      id="custom_css"
                      value={config.appearance.custom_css}
                      onChange={(e) => updateConfig('appearance', 'custom_css', e.target.value)}
                      rows={4}
                      placeholder="/* Adicione seu CSS personalizado aqui */"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Integrações */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Chaves de API e Integrações</CardTitle>
                    <CardDescription>Configure integrações com serviços externos</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                  >
                    {showApiKeys ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showApiKeys ? 'Ocultar' : 'Mostrar'} Chaves
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                      <Input
                        id="google_analytics_id"
                        type={showApiKeys ? 'text' : 'password'}
                        value={config.integrations.google_analytics_id}
                        onChange={(e) => updateConfig('integrations', 'google_analytics_id', e.target.value)}
                        placeholder="UA-XXXXXXXXX-X"
                      />
                    </div>

                    <div>
                      <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                      <Input
                        id="facebook_pixel_id"
                        type={showApiKeys ? 'text' : 'password'}
                        value={config.integrations.facebook_pixel_id}
                        onChange={(e) => updateConfig('integrations', 'facebook_pixel_id', e.target.value)}
                        placeholder="XXXXXXXXXXXXXXXX"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp_api_key">WhatsApp API Key</Label>
                      <Input
                        id="whatsapp_api_key"
                        type={showApiKeys ? 'text' : 'password'}
                        value={config.integrations.whatsapp_api_key}
                        onChange={(e) => updateConfig('integrations', 'whatsapp_api_key', e.target.value)}
                        placeholder="API Key do WhatsApp Business"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="payment_gateway_key">Payment Gateway Key</Label>
                      <Input
                        id="payment_gateway_key"
                        type={showApiKeys ? 'text' : 'password'}
                        value={config.integrations.payment_gateway_key}
                        onChange={(e) => updateConfig('integrations', 'payment_gateway_key', e.target.value)}
                        placeholder="Chave do gateway de pagamento"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email_service_key">Email Service Key</Label>
                      <Input
                        id="email_service_key"
                        type={showApiKeys ? 'text' : 'password'}
                        value={config.integrations.email_service_key}
                        onChange={(e) => updateConfig('integrations', 'email_service_key', e.target.value)}
                        placeholder="Chave do serviço de email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maps_api_key">Google Maps API Key</Label>
                      <Input
                        id="maps_api_key"
                        type={showApiKeys ? 'text' : 'password'}
                        value={config.integrations.maps_api_key}
                        onChange={(e) => updateConfig('integrations', 'maps_api_key', e.target.value)}
                        placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rodapé com informações */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <div className="text-blue-800">
                <p className="font-medium">Dica:</p>
                <p className="text-sm">
                  As configurações são salvas automaticamente no navegador.
                  Para aplicar em produção, clique em "Salvar Alterações".
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
