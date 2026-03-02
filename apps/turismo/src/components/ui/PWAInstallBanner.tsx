import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // Não mostrar se já estiver instalado ou foi dispensado
  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Salvar preferência no localStorage
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  Instalar Reservei Viagens
                </h3>
                <p className="text-xs opacity-90">
                  Acesse rapidamente pelo seu dispositivo
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Status da conexão */}
              <div className="flex items-center space-x-1">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-300" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-300" />
                )}
                <span className="text-xs">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Botões */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleInstall}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  <span>Instalar</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  title="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
