'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, RefreshCw } from 'lucide-react';

const COTACAO_PREFIX = '/cotacao';
const LEGACY_SW_URL = '/sw.js';

function isCotacaoFunnelPath(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  return path === COTACAO_PREFIX || path.startsWith(`${COTACAO_PREFIX}/`);
}

async function unregisterLegacyServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map(async (registration) => {
      const scriptUrl = registration.active?.scriptURL ?? registration.installing?.scriptURL ?? '';
      if (scriptUrl.includes(LEGACY_SW_URL) || isCotacaoFunnelPath()) {
        await registration.unregister();
      }
    }),
  );
}

async function registerServiceWorker(
  setRegistration: (reg: ServiceWorkerRegistration) => void,
  setUpdateAvailable: (v: boolean) => void,
): Promise<void> {
  try {
    await unregisterLegacyServiceWorkers();

    const reg = await navigator.serviceWorker.register(LEGACY_SW_URL, {
      scope: '/',
    });

    setRegistration(reg);

    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          setUpdateAvailable(true);
          newWorker.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });

    await reg.update();
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
  }
}

export function PwaRegister() {
  const [isSupported, setIsSupported] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    setIsSupported(true);

    if (isCotacaoFunnelPath()) {
      void unregisterLegacyServiceWorkers();
      return;
    }

    void registerServiceWorker(setRegistration, setUpdateAvailable);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const updateServiceWorker = async () => {
    if (!registration) return;
    try {
      await registration.update();
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar Service Worker:', error);
    }
  };

  if (!isSupported || isCotacaoFunnelPath()) {
    return null;
  }

  return (
    <>
      {updateAvailable && (
        <Alert className="fixed bottom-4 right-4 max-w-md z-50 border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <span>
                <strong>Nova versão disponível!</strong>
                <br />
                Clique em &quot;Atualizar&quot; para carregar a versão mais recente.
              </span>
              <Button
                size="sm"
                onClick={updateServiceWorker}
                className="ml-4 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isInstalled && (
        <div className="fixed bottom-4 left-4 text-xs text-muted-foreground flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>App instalado</span>
        </div>
      )}
    </>
  );
}
