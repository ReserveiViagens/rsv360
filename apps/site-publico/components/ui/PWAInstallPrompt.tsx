'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Download,
  X,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className = '' }) => {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    installPWA,
    updateServiceWorker
  } = usePWA();

  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Mostrar prompt se for instalável e não foi dispensado
    if (isInstallable && !isInstalled && !isDismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isInstallable, isInstalled, isDismissed]);

  const handleInstall = async () => {
    await installPWA();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    // Salvar no localStorage para não mostrar novamente
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleUpdate = () => {
    updateServiceWorker();
  };

  // Verificar se foi dispensado anteriormente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto ${className}`}
        >
          <Card className="bg-background/95 backdrop-blur-md border shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Download className="h-5 w-5 text-primary" />
                  <span>Instalar RSV 360</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Instale o RSV 360 no seu dispositivo para acesso rápido e funcionalidade offline.
              </p>

              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Smartphone className="h-4 w-4" />
                  <span>Acesso rápido</span>
                </div>
                <div className="flex items-center space-x-1">
                  <WifiOff className="h-4 w-4" />
                  <span>Funciona offline</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Monitor className="h-4 w-4" />
                  <span>Experiência nativa</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleInstall} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Instalar
                </Button>
                <Button variant="outline" onClick={handleDismiss}>
                  Agora não
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Prompt de atualização */}
      {isUpdateAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <Card className="bg-background/95 backdrop-blur-md border shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span>Atualização Disponível</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Uma nova versão do RSV 360 está disponível. Atualize para ter acesso às últimas funcionalidades.
              </p>

              <div className="flex space-x-2">
                <Button onClick={handleUpdate} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente de status de conexão
export const ConnectionStatus: React.FC = () => {
  const { isOnline } = usePWA();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true);
    } else {
      // Esconder após 3 segundos quando voltar online
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="bg-background/95 backdrop-blur-md border shadow-lg">
            <CardContent className="flex items-center space-x-2 py-2 px-4">
              {isOnline ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Conectado</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Modo Offline</span>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente de informações do PWA
export const PWAInfo: React.FC = () => {
  const { isInstalled, isOnline } = usePWA();

  if (!isInstalled) return null;

  return (
    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>
      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
      <span>PWA</span>
    </div>
  );
};
