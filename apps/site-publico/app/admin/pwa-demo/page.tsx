'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePWA } from '@/hooks/usePWA';
import { PWAInfo } from '@/components/ui/PWAInstallPrompt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Trash2,
  HardDrive,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export default function PWADemoPage() {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    installPWA,
    updateServiceWorker
  } = usePWA();

  // PWA features simplified for demo
  const pushSupported = false;
  const pushPermission = 'denied';
  const subscription = null;
  const requestPermission = () => {};
  const subscribeToPush = () => {};
  const unsubscribeFromPush = () => {};

  const cacheSize = 0;
  const cacheKeys = [];
  const clearCache = () => {};
  const getCacheInfo = () => ({});

  const [isTestingOffline, setIsTestingOffline] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleTestOffline = () => {
    setIsTestingOffline(true);
    // Simular modo offline
    setTimeout(() => {
      setIsTestingOffline(false);
    }, 3000);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={status ? "default" : "secondary"}>
        {status ? trueText : falseText}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl font-bold text-foreground mb-4"
          >
            📱 PWA Demo
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-muted-foreground mb-6"
          >
            Explore as funcionalidades do Progressive Web App
          </motion.p>

          <PWAInfo />
        </motion.div>

        {/* Status do PWA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Smartphone className="h-5 w-5 text-primary" />
                <span>Instalação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Instalável:</span>
                {getStatusIcon(isInstallable)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Instalado:</span>
                {getStatusIcon(isInstalled)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Atualização:</span>
                {getStatusIcon(isUpdateAvailable)}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                <span>Conexão</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                {getStatusBadge(isOnline, 'Online', 'Offline')}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Service Worker:</span>
                {getStatusIcon(true)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cache:</span>
                {getStatusIcon(cacheKeys.length > 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Bell className="h-5 w-5 text-primary" />
                <span>Notificações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Suporte:</span>
                {getStatusIcon(pushSupported)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Permissão:</span>
                <Badge variant={pushPermission === 'granted' ? 'default' : 'secondary'}>
                  {pushPermission}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Inscrito:</span>
                {getStatusIcon(!!subscription)}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <HardDrive className="h-5 w-5 text-primary" />
                <span>Cache</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tamanho:</span>
                <span className="text-sm font-medium">{formatBytes(cacheSize)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Itens:</span>
                <span className="text-sm font-medium">{cacheKeys.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                {getStatusIcon(cacheSize > 0)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ações do PWA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-primary" />
                <span>Instalação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isInstallable && !isInstalled && (
                <Button onClick={installPWA} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Instalar PWA
                </Button>
              )}

              {isInstalled && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">PWA instalado com sucesso!</span>
                </div>
              )}

              {isUpdateAvailable && (
                <Button onClick={updateServiceWorker} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar PWA
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Notificações Push</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pushSupported ? (
                <>
                  {pushPermission === 'default' && (
                    <Button onClick={requestPermission} className="w-full">
                      <Bell className="h-4 w-4 mr-2" />
                      Solicitar Permissão
                    </Button>
                  )}

                  {pushPermission === 'granted' && !subscription && (
                    <Button onClick={subscribeToPush} className="w-full">
                      <Bell className="h-4 w-4 mr-2" />
                      Inscrever-se
                    </Button>
                  )}

                  {subscription && (
                    <Button onClick={unsubscribeFromPush} variant="outline" className="w-full">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar Inscrição
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Notificações push não suportadas</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Gerenciamento de Cache */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-primary" />
                <span>Gerenciamento de Cache</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Tamanho do Cache: {formatBytes(cacheSize)}</p>
                  <p className="text-xs text-muted-foreground">{cacheKeys.length} itens em cache</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={getCacheInfo} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button onClick={clearCache} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>

              {cacheKeys.length > 0 && (
                <div className="max-h-40 overflow-y-auto">
                  <p className="text-sm font-medium mb-2">Itens em Cache:</p>
                  <div className="space-y-1">
                    {cacheKeys.slice(0, 10).map((key, index) => (
                      <div key={index} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        {key}
                      </div>
                    ))}
                    {cacheKeys.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        ... e mais {cacheKeys.length - 10} itens
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Teste de Funcionalidades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span>Teste de Funcionalidades</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleTestOffline}
                  variant="outline"
                  disabled={isTestingOffline}
                >
                  {isTestingOffline ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 mr-2" />
                      Simular Offline
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar Página
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Funcionalidades Testáveis:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Instalação do PWA no dispositivo</li>
                  <li>• Funcionamento offline com cache</li>
                  <li>• Notificações push (se suportado)</li>
                  <li>• Atualizações automáticas</li>
                  <li>• Sincronização em background</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Informações Técnicas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-primary" />
                <span>Informações Técnicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Service Worker:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Cache First para recursos estáticos</li>
                    <li>• Network First para APIs</li>
                    <li>• Stale While Revalidate para outros</li>
                    <li>• Fallback offline automático</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Manifest:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Display: standalone</li>
                    <li>• Orientação: portrait-primary</li>
                    <li>• Tema: #3b82f6</li>
                    <li>• Atalhos configurados</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
