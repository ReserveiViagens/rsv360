"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '@/hooks/usePWA';
import { Button } from './button';
import { X, Download, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';

interface PWAInstallPromptProps {
  className?: string;
  showOfflineIndicator?: boolean;
  showInstallPrompt?: boolean;
}

export function PWAInstallPrompt({
  className = "",
  showOfflineIndicator = true,
  showInstallPrompt = true
}: PWAInstallPromptProps) {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    isStandalone,
    installPWA,
    updateAvailable,
    updatePWA,
  } = usePWA();

  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Mostrar prompt de instalação
  useEffect(() => {
    if (showInstallPrompt && isInstallable && !isInstalled && !isStandalone && !dismissed) {
      // Aguardar um pouco antes de mostrar
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isStandalone, dismissed, showInstallPrompt]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Salvar no localStorage para não mostrar novamente
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleUpdate = () => {
    updatePWA();
  };

  // Verificar se foi dispensado anteriormente
  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <AnimatePresence>
        {/* Indicador de Status Offline */}
        {showOfflineIndicator && !isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="mb-4"
          >
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
              <WifiOff className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">Modo Offline</div>
                <div className="text-xs opacity-90">Algumas funcionalidades podem estar limitadas</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Indicador de Status Online */}
        {showOfflineIndicator && isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="mb-4"
          >
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
              <Wifi className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">Online</div>
                <div className="text-xs opacity-90">Todas as funcionalidades disponíveis</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Prompt de Atualização */}
        {updateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="mb-4"
          >
            <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <div className="font-semibold">Atualização Disponível</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUpdate}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm opacity-90 mb-3">
                Uma nova versão do app está disponível. Atualize para ter acesso às últimas funcionalidades.
              </p>
              <Button
                onClick={handleUpdate}
                className="w-full bg-white text-blue-500 hover:bg-gray-100"
                size="sm"
              >
                Atualizar Agora
              </Button>
            </div>
          </motion.div>
        )}

        {/* Prompt de Instalação */}
        {showPrompt && showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-lg max-w-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">RSV</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Instalar RSV 360</div>
                  <div className="text-xs text-muted-foreground">Acesso rápido e offline</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="w-4 h-4" />
                <span>Funciona como app nativo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <WifiOff className="w-4 h-4" />
                <span>Funciona offline</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Monitor className="w-4 h-4" />
                <span>Acesso rápido</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleInstall}
                className="flex-1"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Instalar
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                size="sm"
              >
                Agora não
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente de status de conexão simples
export function ConnectionStatus() {
  const { isOnline } = usePWA();

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isOnline ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm"
      >
        <WifiOff className="w-4 h-4" />
        <span>Offline</span>
      </motion.div>
    </div>
  );
}
