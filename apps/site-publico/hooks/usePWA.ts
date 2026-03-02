"use client";

import { useState, useEffect, useCallback } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  installPrompt: PWAInstallPrompt | null;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isStandalone: false,
    installPrompt: null,
    updateAvailable: false,
    registration: null,
  });

  // Verificar se está em modo standalone (instalado)
  const checkStandalone = useCallback(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setPwaState(prev => ({ ...prev, isStandalone }));
  }, []);

  // Verificar status da conexão
  const updateOnlineStatus = useCallback(() => {
    if (typeof window !== 'undefined') {
      setPwaState(prev => ({ ...prev, isOnline: navigator.onLine }));
    }
  }, []);

  // Gerenciar prompt de instalação
  const handleInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    setPwaState(prev => ({
      ...prev,
      isInstallable: true,
      installPrompt: e as any,
    }));
  }, []);

  // Instalar PWA
  const installPWA = useCallback(async () => {
    if (!pwaState.installPrompt) return false;

    try {
      await pwaState.installPrompt.prompt();
      const choiceResult = await pwaState.installPrompt.userChoice;

      setPwaState(prev => ({
        ...prev,
        isInstallable: false,
        installPrompt: null,
      }));

      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      return false;
    }
  }, [pwaState.installPrompt]);

  // Registrar Service Worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        setPwaState(prev => ({ ...prev, registration }));

        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setPwaState(prev => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });

        return registration;
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Atualizar PWA
  const updatePWA = useCallback(async () => {
    if (pwaState.registration && pwaState.registration.waiting) {
      pwaState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [pwaState.registration]);

  // Solicitar permissão para notificações
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Enviar notificação
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options,
      });
    }
  }, []);

  // Verificar se pode enviar notificações
  const canSendNotifications = useCallback(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  }, []);

  // Sincronizar dados offline
  const syncOfflineData = useCallback(async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
        return true;
      } catch (error) {
        console.error('Erro ao sincronizar dados offline:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Verificar recursos PWA
  const checkPWACapabilities = useCallback(() => {
    const capabilities = {
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      installPrompt: 'BeforeInstallPromptEvent' in window,
      share: 'share' in navigator,
      clipboard: 'clipboard' in navigator,
      geolocation: 'geolocation' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    };

    return capabilities;
  }, []);

  // Compartilhar conteúdo
  const shareContent = useCallback(async (data: ShareData) => {
    if ('share' in navigator) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Copiar para clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    if ('clipboard' in navigator) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.error('Erro ao copiar:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Efeitos
  useEffect(() => {
    // Verificar modo standalone
    checkStandalone();

    // Escutar mudanças na conexão
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Escutar prompt de instalação
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Registrar Service Worker
    registerServiceWorker();

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, [checkStandalone, updateOnlineStatus, handleInstallPrompt, registerServiceWorker]);

  return {
    ...pwaState,
    installPWA,
    updatePWA,
    requestNotificationPermission,
    sendNotification,
    canSendNotifications,
    syncOfflineData,
    checkPWACapabilities,
    shareContent,
    copyToClipboard,
  };
}
