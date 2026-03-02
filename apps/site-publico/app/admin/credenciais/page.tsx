/**
 * ✅ PÁGINA DE CONFIGURAÇÃO DE CREDENCIAIS
 * Interface para gerenciar todas as credenciais do sistema
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/providers/toast-wrapper';
import { 
  Mail, CreditCard, Globe, MapPin, MessageSquare, 
  Calendar, Lock, CheckCircle, XCircle, Eye, EyeOff,
  Save, RefreshCw, TestTube, Activity
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Credentials {
  // SMTP
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  email_from: string;
  
  // Mercado Pago
  mercado_pago_access_token: string;
  mercado_pago_public_key: string;
  mercado_pago_webhook_secret: string;
  
  // OAuth Google
  google_client_id: string;
  google_client_secret: string;
  google_redirect_uri: string;
  
  // OAuth Facebook
  facebook_app_id: string;
  facebook_app_secret: string;
  facebook_redirect_uri: string;
  
  // Google Maps
  google_maps_api_key: string;
  
  // WhatsApp
  whatsapp_phone_id: string;
  whatsapp_token: string;
  meta_verify_token: string;
  
  // Telegram
  telegram_bot_token: string;
  
  // Messenger
  messenger_page_access_token: string;
  messenger_verify_token: string;
  
  // Google Calendar
  google_calendar_client_id: string;
  google_calendar_client_secret: string;
  google_calendar_redirect_uri: string;
  
  // Smart Locks
  yale_api_key: string;
  august_client_id: string;
  igloohome_api_key: string;
  
  // Instagram
  instagram_access_token: string;
  
  // Verificação
  unico_api_key: string;
  idwall_api_key: string;
  
  // Monitoramento e Logging
  sentry_dsn: string;
  sentry_public_dsn: string;
  logrocket_app_id: string;
}

export default function CredenciaisPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  const [credentials, setCredentials] = useState<Credentials>({
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    email_from: '',
    mercado_pago_access_token: '',
    mercado_pago_public_key: '',
    mercado_pago_webhook_secret: '',
    google_client_id: '',
    google_client_secret: '',
    google_redirect_uri: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback` : '',
    facebook_app_id: '',
    facebook_app_secret: '',
    facebook_redirect_uri: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/facebook/callback` : '',
    google_maps_api_key: '',
    whatsapp_phone_id: '',
    whatsapp_token: '',
    meta_verify_token: '',
    telegram_bot_token: '',
    messenger_page_access_token: '',
    messenger_verify_token: '',
    google_calendar_client_id: '',
    google_calendar_client_secret: '',
    google_calendar_redirect_uri: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-calendar/callback` : '',
    yale_api_key: '',
    august_client_id: '',
    igloohome_api_key: '',
    instagram_access_token: '',
    unico_api_key: '',
    idwall_api_key: '',
    sentry_dsn: '',
    sentry_public_dsn: '',
    logrocket_app_id: '',
  });

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/credentials');
      const result = await response.json();
      
      if (result.success && result.data) {
        setCredentials(prev => ({
          ...prev,
          ...result.data,
        }));
      }
    } catch (error: any) {
      console.error('Erro ao carregar credenciais:', error);
      // Fallback para localStorage
      const saved = localStorage.getItem('credentials');
      if (saved) {
        setCredentials(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials }),
      });

      const result = await response.json();

      if (result.success) {
        // Também salvar no localStorage como backup
        localStorage.setItem('credentials', JSON.stringify(credentials));
        
        toast({
          title: 'Sucesso',
          description: 'Credenciais salvas com sucesso!',
        });
      } else {
        throw new Error(result.error || 'Erro ao salvar credenciais');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar credenciais',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (service: string) => {
    try {
      setTesting(service);
      
      // Implementar testes reais para cada serviço
      const response = await fetch(`/api/admin/credentials/test?service=${service}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Teste realizado com sucesso',
          description: data.message || `Teste de ${service} concluído`,
        });
      } else {
        toast({
          title: 'Teste falhou',
          description: data.message || `Erro ao testar ${service}`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro no teste',
        description: error.message || 'Erro ao testar serviço',
        variant: 'destructive',
      });
    } finally {
      setTesting(null);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const isConfigured = (value: string) => value && value.length > 0;

  if (loading && !credentials.smtp_host) {
    return (
      <div className="container mx-auto py-8 px-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuração de Credenciais</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie todas as credenciais e integrações do sistema
        </p>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="oauth">
            <Globe className="h-4 w-4 mr-2" />
            OAuth
          </TabsTrigger>
          <TabsTrigger value="maps">
            <MapPin className="h-4 w-4 mr-2" />
            Maps
          </TabsTrigger>
          <TabsTrigger value="messaging">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Activity className="h-4 w-4 mr-2" />
            Monitoramento
          </TabsTrigger>
        </TabsList>

        {/* EMAIL (SMTP) */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configurações SMTP</CardTitle>
                  <CardDescription>
                    Configure o servidor de email para envio de notificações
                  </CardDescription>
                </div>
                <Badge variant={isConfigured(credentials.smtp_host) ? 'default' : 'secondary'}>
                  {isConfigured(credentials.smtp_host) ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Configurado</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Não configurado</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_host">Servidor SMTP *</Label>
                  <Input
                    id="smtp_host"
                    value={credentials.smtp_host}
                    onChange={(e) => setCredentials({ ...credentials, smtp_host: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">Porta *</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={credentials.smtp_port}
                    onChange={(e) => setCredentials({ ...credentials, smtp_port: e.target.value })}
                    placeholder="587"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="smtp_user">Usuário/Email *</Label>
                <Input
                  id="smtp_user"
                  type="email"
                  value={credentials.smtp_user}
                  onChange={(e) => setCredentials({ ...credentials, smtp_user: e.target.value })}
                  placeholder="seu_email@gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_pass">Senha de App *</Label>
                <div className="relative">
                  <Input
                    id="smtp_pass"
                    type={showPasswords.smtp_pass ? 'text' : 'password'}
                    value={credentials.smtp_pass}
                    onChange={(e) => setCredentials({ ...credentials, smtp_pass: e.target.value })}
                    placeholder="Sua senha de app"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility('smtp_pass')}
                  >
                    {showPasswords.smtp_pass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="email_from">Email Remetente *</Label>
                <Input
                  id="email_from"
                  type="email"
                  value={credentials.email_from}
                  onChange={(e) => setCredentials({ ...credentials, email_from: e.target.value })}
                  placeholder="noreply@rsv360.com"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleTest('SMTP')} variant="outline" disabled={testing === 'SMTP'}>
                  {testing === 'SMTP' ? (
                    <><LoadingSpinner className="mr-2" /> Testando...</>
                  ) : (
                    <><TestTube className="mr-2 h-4 w-4" /> Testar Conexão</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAGAMENTOS (MERCADO PAGO) */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mercado Pago</CardTitle>
                  <CardDescription>
                    Configure as credenciais do Mercado Pago para processamento de pagamentos
                  </CardDescription>
                </div>
                <Badge variant={isConfigured(credentials.mercado_pago_access_token) ? 'default' : 'secondary'}>
                  {isConfigured(credentials.mercado_pago_access_token) ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Configurado</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Não configurado</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mercado_pago_access_token">Access Token *</Label>
                <div className="relative">
                  <Input
                    id="mercado_pago_access_token"
                    type={showPasswords.mercado_pago_access_token ? 'text' : 'password'}
                    value={credentials.mercado_pago_access_token}
                    onChange={(e) => setCredentials({ ...credentials, mercado_pago_access_token: e.target.value })}
                    placeholder="APP_USR_..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility('mercado_pago_access_token')}
                  >
                    {showPasswords.mercado_pago_access_token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="mercado_pago_public_key">Public Key *</Label>
                <Input
                  id="mercado_pago_public_key"
                  value={credentials.mercado_pago_public_key}
                  onChange={(e) => setCredentials({ ...credentials, mercado_pago_public_key: e.target.value })}
                  placeholder="APP_USR_..."
                />
              </div>
              <div>
                <Label htmlFor="mercado_pago_webhook_secret">Webhook Secret</Label>
                <div className="relative">
                  <Input
                    id="mercado_pago_webhook_secret"
                    type={showPasswords.mercado_pago_webhook_secret ? 'text' : 'password'}
                    value={credentials.mercado_pago_webhook_secret}
                    onChange={(e) => setCredentials({ ...credentials, mercado_pago_webhook_secret: e.target.value })}
                    placeholder="Seu webhook secret"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility('mercado_pago_webhook_secret')}
                  >
                    {showPasswords.mercado_pago_webhook_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleTest('Mercado Pago')} variant="outline" disabled={testing === 'Mercado Pago'}>
                  {testing === 'Mercado Pago' ? (
                    <><LoadingSpinner className="mr-2" /> Testando...</>
                  ) : (
                    <><TestTube className="mr-2 h-4 w-4" /> Testar Conexão</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OAUTH */}
        <TabsContent value="oauth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Google</CardTitle>
              <CardDescription>Configure login social com Google</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="google_client_id">Client ID *</Label>
                <Input
                  id="google_client_id"
                  value={credentials.google_client_id}
                  onChange={(e) => setCredentials({ ...credentials, google_client_id: e.target.value })}
                  placeholder="Seu Google Client ID"
                />
              </div>
              <div>
                <Label htmlFor="google_client_secret">Client Secret *</Label>
                <div className="relative">
                  <Input
                    id="google_client_secret"
                    type={showPasswords.google_client_secret ? 'text' : 'password'}
                    value={credentials.google_client_secret}
                    onChange={(e) => setCredentials({ ...credentials, google_client_secret: e.target.value })}
                    placeholder="Seu Google Client Secret"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility('google_client_secret')}
                  >
                    {showPasswords.google_client_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="google_redirect_uri">Redirect URI</Label>
                <Input
                  id="google_redirect_uri"
                  value={credentials.google_redirect_uri}
                  onChange={(e) => setCredentials({ ...credentials, google_redirect_uri: e.target.value })}
                  placeholder="http://localhost:3000/api/auth/google/callback"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OAuth Facebook</CardTitle>
              <CardDescription>Configure login social com Facebook</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebook_app_id">App ID *</Label>
                <Input
                  id="facebook_app_id"
                  value={credentials.facebook_app_id}
                  onChange={(e) => setCredentials({ ...credentials, facebook_app_id: e.target.value })}
                  placeholder="Seu Facebook App ID"
                />
              </div>
              <div>
                <Label htmlFor="facebook_app_secret">App Secret *</Label>
                <div className="relative">
                  <Input
                    id="facebook_app_secret"
                    type={showPasswords.facebook_app_secret ? 'text' : 'password'}
                    value={credentials.facebook_app_secret}
                    onChange={(e) => setCredentials({ ...credentials, facebook_app_secret: e.target.value })}
                    placeholder="Seu Facebook App Secret"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility('facebook_app_secret')}
                  >
                    {showPasswords.facebook_app_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="facebook_redirect_uri">Redirect URI</Label>
                <Input
                  id="facebook_redirect_uri"
                  value={credentials.facebook_redirect_uri}
                  onChange={(e) => setCredentials({ ...credentials, facebook_redirect_uri: e.target.value })}
                  placeholder="http://localhost:3000/api/auth/facebook/callback"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MAPS */}
        <TabsContent value="maps" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Google Maps</CardTitle>
                  <CardDescription>
                    Configure a API Key do Google Maps para mapas e autocomplete
                  </CardDescription>
                </div>
                <Badge variant={isConfigured(credentials.google_maps_api_key) ? 'default' : 'secondary'}>
                  {isConfigured(credentials.google_maps_api_key) ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Configurado</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Não configurado</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="google_maps_api_key">API Key *</Label>
                <Input
                  id="google_maps_api_key"
                  value={credentials.google_maps_api_key}
                  onChange={(e) => setCredentials({ ...credentials, google_maps_api_key: e.target.value })}
                  placeholder="Sua Google Maps API Key"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleTest('Google Maps')} variant="outline" disabled={testing === 'Google Maps'}>
                  {testing === 'Google Maps' ? (
                    <><LoadingSpinner className="mr-2" /> Testando...</>
                  ) : (
                    <><TestTube className="mr-2 h-4 w-4" /> Testar API Key</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MENSAGENS */}
        <TabsContent value="messaging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business API</CardTitle>
              <CardDescription>Configure integração com WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatsapp_phone_id">Phone ID</Label>
                <Input
                  id="whatsapp_phone_id"
                  value={credentials.whatsapp_phone_id}
                  onChange={(e) => setCredentials({ ...credentials, whatsapp_phone_id: e.target.value })}
                  placeholder="Seu WhatsApp Phone ID"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp_token">Token</Label>
                <div className="relative">
                  <Input
                    id="whatsapp_token"
                    type={showPasswords.whatsapp_token ? 'text' : 'password'}
                    value={credentials.whatsapp_token}
                    onChange={(e) => setCredentials({ ...credentials, whatsapp_token: e.target.value })}
                    placeholder="Seu WhatsApp Token"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility('whatsapp_token')}
                  >
                    {showPasswords.whatsapp_token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="meta_verify_token">Verify Token</Label>
                <Input
                  id="meta_verify_token"
                  value={credentials.meta_verify_token}
                  onChange={(e) => setCredentials({ ...credentials, meta_verify_token: e.target.value })}
                  placeholder="Seu Meta Verify Token"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Telegram Bot</CardTitle>
              <CardDescription>Configure bot do Telegram</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="telegram_bot_token">Bot Token</Label>
                <div className="relative">
                  <Input
                    id="telegram_bot_token"
                    type={showPasswords.telegram_bot_token ? 'text' : 'password'}
                    value={credentials.telegram_bot_token}
                    onChange={(e) => setCredentials({ ...credentials, telegram_bot_token: e.target.value })}
                    placeholder="Seu Telegram Bot Token"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility('telegram_bot_token')}
                  >
                    {showPasswords.telegram_bot_token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MONITORAMENTO E LOGGING */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sentry - Error Tracking</CardTitle>
                  <CardDescription>
                    Configure o Sentry para rastreamento de erros e monitoramento de performance
                  </CardDescription>
                </div>
                <Badge variant={isConfigured(credentials.sentry_dsn) ? 'default' : 'secondary'}>
                  {isConfigured(credentials.sentry_dsn) ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Configurado</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Não configurado</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sentry_dsn">DSN (Server-side) *</Label>
                <div className="relative">
                  <Input
                    id="sentry_dsn"
                    type={showPasswords.sentry_dsn ? 'text' : 'password'}
                    value={credentials.sentry_dsn}
                    onChange={(e) => setCredentials({ ...credentials, sentry_dsn: e.target.value })}
                    placeholder="https://xxx@xxx.ingest.sentry.io/xxx"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility('sentry_dsn')}
                  >
                    {showPasswords.sentry_dsn ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  DSN para uso no servidor (Next.js API routes)
                </p>
              </div>
              <div>
                <Label htmlFor="sentry_public_dsn">DSN Público (Client-side) *</Label>
                <div className="relative">
                  <Input
                    id="sentry_public_dsn"
                    type={showPasswords.sentry_public_dsn ? 'text' : 'password'}
                    value={credentials.sentry_public_dsn}
                    onChange={(e) => setCredentials({ ...credentials, sentry_public_dsn: e.target.value })}
                    placeholder="https://xxx@xxx.ingest.sentry.io/xxx"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility('sentry_public_dsn')}
                  >
                    {showPasswords.sentry_public_dsn ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  DSN para uso no cliente (browser). Geralmente o mesmo do server-side.
                </p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Como obter o DSN:</p>
                <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Acesse <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">sentry.io</a> e crie uma conta</li>
                  <li>Crie um novo projeto ou selecione um existente</li>
                  <li>Vá em Settings → Projects → Client Keys (DSN)</li>
                  <li>Copie o DSN e cole aqui</li>
                </ol>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleTest('Sentry')} variant="outline" disabled={testing === 'Sentry'}>
                  {testing === 'Sentry' ? (
                    <><LoadingSpinner className="mr-2" /> Testando...</>
                  ) : (
                    <><TestTube className="mr-2 h-4 w-4" /> Testar Conexão</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>LogRocket - Session Replay</CardTitle>
                  <CardDescription>
                    Configure o LogRocket para gravação de sessões e debugging
                  </CardDescription>
                </div>
                <Badge variant={isConfigured(credentials.logrocket_app_id) ? 'default' : 'secondary'}>
                  {isConfigured(credentials.logrocket_app_id) ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Configurado</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Não configurado</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logrocket_app_id">App ID *</Label>
                <div className="relative">
                  <Input
                    id="logrocket_app_id"
                    type={showPasswords.logrocket_app_id ? 'text' : 'password'}
                    value={credentials.logrocket_app_id}
                    onChange={(e) => setCredentials({ ...credentials, logrocket_app_id: e.target.value })}
                    placeholder="seu-app-id"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => togglePasswordVisibility('logrocket_app_id')}
                  >
                    {showPasswords.logrocket_app_id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  App ID do seu projeto LogRocket
                </p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Como obter o App ID:</p>
                <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Acesse <a href="https://logrocket.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">logrocket.com</a> e crie uma conta</li>
                  <li>Crie um novo projeto ou selecione um existente</li>
                  <li>Vá em Settings → Project Settings</li>
                  <li>Copie o App ID e cole aqui</li>
                </ol>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleTest('LogRocket')} variant="outline" disabled={testing === 'LogRocket'}>
                  {testing === 'LogRocket' ? (
                    <><LoadingSpinner className="mr-2" /> Testando...</>
                  ) : (
                    <><TestTube className="mr-2 h-4 w-4" /> Testar Conexão</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={loadCredentials}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Recarregar
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <><LoadingSpinner className="mr-2" /> Salvando...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Salvar Todas as Credenciais</>
          )}
        </Button>
      </div>
    </div>
  );
}

