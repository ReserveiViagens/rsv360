'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react';

export function PwaRegister() {
  const [isSupported, setIsSupported] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Verificar se Service Workers são suportados
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
      registerServiceWorker();
    }

    // Verificar se o app está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listener para quando o app é instalado
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      // PWA pode ser instalado
    });
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      setRegistration(registration);

      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              setUpdateAvailable(true);
            }
          });
        }
      });

      // Verificar se há atualização disponível
      await registration.update();
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  };

  const updateServiceWorker = async () => {
    if (registration) {
      try {
        await registration.update();
        // Recarregar a página após atualização
        window.location.reload();
      } catch (error) {
        console.error('Erro ao atualizar Service Worker:', error);
      }
    }
  };

  const installPWA = async () => {
    // Este evento será disparado quando o usuário quiser instalar
    // A implementação real depende do evento beforeinstallprompt
    alert('Para instalar o app, use o menu do navegador ou a opção "Adicionar à tela inicial"');
  };

  if (!isSupported) {
    return null; // Não mostrar nada se não for suportado
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
                Clique em "Atualizar" para carregar a versão mais recente.
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

      {/* Indicador de instalação (opcional, pode ser removido) */}
      {isInstalled && (
        <div className="fixed bottom-4 left-4 text-xs text-muted-foreground flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>App instalado</span>
        </div>
      )}
    </>
  );
}

