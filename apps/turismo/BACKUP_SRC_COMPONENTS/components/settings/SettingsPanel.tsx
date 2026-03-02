import React, { useState, useEffect } from 'react';
import { Settings, User, Shield, Bell, Palette, Globe, Database, Key, Save, RefreshCw, Eye, EyeOff, Trash2, Plus, Edit, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { cn } from '../../utils/cn';

export interface SystemSettings {
  general: {
    companyName: string;
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
    decimalPlaces: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    sidebarCollapsed: boolean;
    compactMode: boolean;
    animations: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    loginAttempts: number;
  };
  integrations: {
    autoSync: boolean;
    syncInterval: number;
    webhookTimeout: number;
    retryAttempts: number;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    includeFiles: boolean;
    includeDatabase: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  preferences: {
    dashboardLayout: string;
    defaultPage: string;
    language: string;
    timezone: string;
  };
}

export interface SettingsPanelProps {
  className?: string;
}

const timezoneOptions: SelectOption[] = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Belem', label: 'Belém (GMT-3)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (GMT-3)' },
  { value: 'America/Recife', label: 'Recife (GMT-3)' },
  { value: 'America/Maceio', label: 'Maceió (GMT-3)' },
  { value: 'America/Aracaju', label: 'Aracaju (GMT-3)' },
  { value: 'America/Salvador', label: 'Salvador (GMT-3)' },
  { value: 'America/Vitoria', label: 'Vitória (GMT-3)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' },
];

const languageOptions: SelectOption[] = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
];

const dateFormatOptions: SelectOption[] = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const currencyOptions: SelectOption[] = [
  { value: 'BRL', label: 'Real (R$)' },
  { value: 'USD', label: 'Dólar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
];

const themeOptions: SelectOption[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'auto', label: 'Automático' },
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ className }) => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      companyName: 'Reservei Viagens',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      dateFormat: 'DD/MM/YYYY',
      currency: 'BRL',
      decimalPlaces: 2,
    },
    appearance: {
      theme: 'light',
      primaryColor: '#2563EB',
      sidebarCollapsed: false,
      compactMode: false,
      animations: true,
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
      },
      loginAttempts: 5,
    },
    integrations: {
      autoSync: true,
      syncInterval: 15,
      webhookTimeout: 30,
      retryAttempts: 3,
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      includeFiles: true,
      includeDatabase: true,
    },
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: 'Administrador RSV',
    email: 'admin@reserveiviagens.com.br',
    role: 'Administrador',
    preferences: {
      dashboardLayout: 'default',
      defaultPage: '/dashboard',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
    },
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSettingChange = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleNestedSettingChange = (section: keyof SystemSettings, subsection: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [key]: value,
        },
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // Aqui você implementaria a lógica de salvamento
    console.log('Salvando configurações:', settings);
    setHasUnsavedChanges(false);
    // Simular salvamento
    setTimeout(() => {
      console.log('Configurações salvas com sucesso!');
    }, 1000);
  };

  const handleResetSettings = () => {
    // Aqui você implementaria a lógica de reset
    console.log('Resetando configurações para padrão');
    setHasUnsavedChanges(false);
  };

  const handleBackup = () => {
    setIsBackupModalOpen(true);
    // Simular backup
    setTimeout(() => {
      console.log('Backup iniciado...');
    }, 1000);
  };

  const handleSecurityUpdate = () => {
    if (newPassword === confirmPassword && newPassword.length >= settings.security.passwordPolicy.minLength) {
      console.log('Senha atualizada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
      setIsSecurityModalOpen(false);
    } else {
      console.log('Erro na validação da senha');
    }
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= settings.security.passwordPolicy.minLength) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'text-red-500';
    if (strength <= 3) return 'text-yellow-500';
    if (strength <= 4) return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
          <p className="text-gray-600">Gerencie configurações, aparência e segurança do sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Alterações não salvas
            </Badge>
          )}
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button onClick={handleSaveSettings} disabled={!hasUnsavedChanges}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Tabs de Configurações */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações da Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa
                </label>
                <Input
                  value={settings.general.companyName}
                  onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuso Horário
                </label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) => handleSettingChange('general', 'timezone', value)}
                  options={timezoneOptions}
                  placeholder="Selecionar fuso horário"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma
                </label>
                <Select
                  value={settings.general.language}
                  onValueChange={(value) => handleSettingChange('general', 'language', value)}
                  options={languageOptions}
                  placeholder="Selecionar idioma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formato de Data
                </label>
                <Select
                  value={settings.general.dateFormat}
                  onValueChange={(value) => handleSettingChange('general', 'dateFormat', value)}
                  options={dateFormatOptions}
                  placeholder="Selecionar formato"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moeda
                </label>
                <Select
                  value={settings.general.currency}
                  onValueChange={(value) => handleSettingChange('general', 'currency', value)}
                  options={currencyOptions}
                  placeholder="Selecionar moeda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Casas Decimais
                </label>
                <Input
                  type="number"
                  min="0"
                  max="4"
                  value={settings.general.decimalPlaces}
                  onChange={(e) => handleSettingChange('general', 'decimalPlaces', Number(e.target.value))}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfil do Usuário</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{userProfile.name}</h4>
                  <p className="text-sm text-gray-600">{userProfile.email}</p>
                  <Badge variant="secondary">{userProfile.role}</Badge>
                </div>
              </div>
              <Button variant="outline" onClick={() => setIsProfileModalOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Configurações de Aparência */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tema e Cores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tema
                </label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleSettingChange('appearance', 'theme', value)}
                  options={themeOptions}
                  placeholder="Selecionar tema"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor Primária
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.appearance.primaryColor}
                    onChange={(e) => handleSettingChange('appearance', 'primaryColor', e.target.value)}
                    placeholder="#2563EB"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interface</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.appearance.sidebarCollapsed}
                  onChange={(e) => handleSettingChange('appearance', 'sidebarCollapsed', e.target.checked)}
                  className="rounded"
                />
                <span>Barra lateral recolhida por padrão</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.appearance.compactMode}
                  onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                  className="rounded"
                />
                <span>Modo compacto</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.appearance.animations}
                  onChange={(e) => handleSettingChange('appearance', 'animations', e.target.checked)}
                  className="rounded"
                />
                <span>Animações e transições</span>
              </label>
            </div>
          </Card>
        </TabsContent>

        {/* Configurações de Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Canais de Notificação</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                  className="rounded"
                />
                <span>Notificações por Email</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                  className="rounded"
                />
                <span>Notificações Push</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                  className="rounded"
                />
                <span>Notificações por SMS</span>
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Horário Silencioso</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notifications.quietHours.enabled}
                  onChange={(e) => handleNestedSettingChange('notifications', 'quietHours', 'enabled', e.target.checked)}
                  className="rounded"
                />
                <span>Ativar horário silencioso</span>
              </label>
              {settings.notifications.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Início
                    </label>
                    <Input
                      type="time"
                      value={settings.notifications.quietHours.start}
                      onChange={(e) => handleNestedSettingChange('notifications', 'quietHours', 'start', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fim
                    </label>
                    <Input
                      type="time"
                      value={settings.notifications.quietHours.end}
                      onChange={(e) => handleNestedSettingChange('notifications', 'quietHours', 'end', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Configurações de Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Autenticação</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                  className="rounded"
                />
                <span>Autenticação de dois fatores (2FA)</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout da Sessão (minutos)
                </label>
                <Input
                  type="number"
                  min="5"
                  max="480"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tentativas de Login
                </label>
                <Input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.security.loginAttempts}
                  onChange={(e) => handleSettingChange('security', 'loginAttempts', Number(e.target.value))}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Política de Senhas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comprimento Mínimo
                </label>
                <Input
                  type="number"
                  min="6"
                  max="20"
                  value={settings.security.passwordPolicy.minLength}
                  onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'minLength', Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.security.passwordPolicy.requireUppercase}
                    onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                    className="rounded"
                  />
                  <span>Requer maiúsculas</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.security.passwordPolicy.requireLowercase}
                    onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireLowercase', e.target.checked)}
                    className="rounded"
                  />
                  <span>Requer minúsculas</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.security.passwordPolicy.requireNumbers}
                    onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                    className="rounded"
                  />
                  <span>Requer números</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.security.passwordPolicy.requireSymbols}
                    onChange={(e) => handleNestedSettingChange('security', 'passwordPolicy', 'requireSymbols', e.target.checked)}
                    className="rounded"
                  />
                  <span>Requer símbolos</span>
                </label>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={() => setIsSecurityModalOpen(true)}>
                <Key className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Configurações de Integrações */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sincronização Automática</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.integrations.autoSync}
                  onChange={(e) => handleSettingChange('integrations', 'autoSync', e.target.checked)}
                  className="rounded"
                />
                <span>Ativar sincronização automática</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo de Sincronização (minutos)
                </label>
                <Input
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.integrations.syncInterval}
                  onChange={(e) => handleSettingChange('integrations', 'syncInterval', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout do Webhook (segundos)
                </label>
                <Input
                  type="number"
                  min="5"
                  max="300"
                  value={settings.integrations.webhookTimeout}
                  onChange={(e) => handleSettingChange('integrations', 'webhookTimeout', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tentativas de Retry
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.integrations.retryAttempts}
                  onChange={(e) => handleSettingChange('integrations', 'retryAttempts', Number(e.target.value))}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Configurações de Backup */}
        <TabsContent value="backup" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Automático</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                  className="rounded"
                />
                <span>Ativar backup automático</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência
                </label>
                <Select
                  value={settings.backup.backupFrequency}
                  onValueChange={(value) => handleSettingChange('backup', 'backupFrequency', value)}
                  options={[
                    { value: 'daily', label: 'Diário' },
                    { value: 'weekly', label: 'Semanal' },
                    { value: 'monthly', label: 'Mensal' },
                  ]}
                  placeholder="Selecionar frequência"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retenção (dias)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.backup.retentionDays}
                  onChange={(e) => handleSettingChange('backup', 'retentionDays', Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.backup.includeFiles}
                    onChange={(e) => handleSettingChange('backup', 'includeFiles', e.target.checked)}
                    className="rounded"
                  />
                  <span>Incluir arquivos</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.backup.includeDatabase}
                    onChange={(e) => handleSettingChange('backup', 'includeDatabase', e.target.checked)}
                    className="rounded"
                  />
                  <span>Incluir banco de dados</span>
                </label>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={handleBackup}>
                <Download className="w-4 h-4 mr-2" />
                Iniciar Backup Manual
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição de Perfil */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Editar Perfil"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <Input
              value={userProfile.name}
              onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              value={userProfile.email}
              onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Idioma Preferido
            </label>
            <Select
              value={userProfile.preferences.language}
              onValueChange={(value) => setUserProfile(prev => ({
                ...prev,
                preferences: { ...prev.preferences, language: value }
              }))}
              options={languageOptions}
              placeholder="Selecionar idioma"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuso Horário
            </label>
            <Select
              value={userProfile.preferences.timezone}
              onValueChange={(value) => setUserProfile(prev => ({
                ...prev,
                preferences: { ...prev.preferences, timezone: value }
              }))}
              options={timezoneOptions}
              placeholder="Selecionar fuso horário"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setIsProfileModalOpen(false)}>
            Salvar Alterações
          </Button>
        </div>
      </Modal>

      {/* Modal de Alteração de Senha */}
      <Modal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        title="Alterar Senha"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova Senha
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <div className="mt-2">
              <div className="flex items-center space-x-2 text-sm">
                <span>Força da senha:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        'w-2 h-2 rounded-full',
                        level <= getPasswordStrength(newPassword) ? getPasswordStrengthColor(getPasswordStrength(newPassword)) : 'bg-gray-200'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nova Senha
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar nova senha"
            />
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-sm text-red-600">As senhas não coincidem</p>
          )}
          {newPassword && newPassword.length < settings.security.passwordPolicy.minLength && (
            <p className="text-sm text-red-600">
              A senha deve ter pelo menos {settings.security.passwordPolicy.minLength} caracteres
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsSecurityModalOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSecurityUpdate}
            disabled={
              !newPassword || 
              !confirmPassword || 
              newPassword !== confirmPassword || 
              newPassword.length < settings.security.passwordPolicy.minLength
            }
          >
            <Key className="w-4 h-4 mr-2" />
            Alterar Senha
          </Button>
        </div>
      </Modal>

      {/* Modal de Backup */}
      <Modal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        title="Backup do Sistema"
        size="md"
      >
        <div className="text-center py-8">
          <Download className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Backup em Andamento
          </h3>
          <p className="text-gray-600 mb-6">
            O backup está sendo realizado. Esta operação pode levar alguns minutos.
          </p>
          
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Verificando integridade dos dados</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Compactando arquivos</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Enviando para armazenamento</span>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={() => setIsBackupModalOpen(false)}>
              Concluído
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { SettingsPanel };
export type { SystemSettings, UserProfile, SettingsPanelProps };
