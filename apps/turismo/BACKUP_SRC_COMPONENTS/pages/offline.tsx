'use client';

import React from 'react';
import { Wifi, RefreshCw, Home, Phone, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const retryConnection = async () => {
    if ('serviceWorker' in navigator) {
      try {
        // Tentar reativar conexão
        const registration = await navigator.serviceWorker.ready;
        if (registration.sync) {
          await registration.sync.register('connectivity-check');
        }
        handleRefresh();
      } catch (error) {
        console.error('Erro ao tentar reconectar:', error);
        handleRefresh();
      }
    } else {
      handleRefresh();
    }
  };

  const getOfflineCapabilities = () => [
    {
      icon: <Home className="h-6 w-6" />,
      title: 'Navegação Local',
      description: 'Acesse páginas visitadas recentemente do RSV 360'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Dados em Cache',
      description: 'Visualize informações de hotéis e reservas já carregadas'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Contato de Emergência',
      description: 'Acesse informações de contato para suporte urgente'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Ícone de status */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Wifi className="h-10 w-10 text-gray-400" />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span className="text-orange-500 font-medium">Você está offline</span>
            </div>
          </div>

          {/* Título e descrição */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Sem conexão com a internet
          </h1>
          <p className="text-gray-600 mb-6">
            Verifique sua conexão e tente novamente. Enquanto isso, você ainda pode acessar algumas funcionalidades do RSV 360.
          </p>

          {/* Botões de ação */}
          <div className="space-y-3 mb-8">
            <Button
              onClick={retryConnection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Reconectar
            </Button>

            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para Início
            </Button>
          </div>

          {/* Funcionalidades offline */}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              O que você pode fazer offline:
            </h3>

            <div className="space-y-4">
              {getOfflineCapabilities().map((capability, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="text-blue-600">
                      {capability.icon}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {capability.title}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      {capability.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Informações de contato */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3 text-center">
            📞 Contato de Emergência
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Suporte 24h:</span>
              <a
                href="tel:+5511999999999"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                (11) 99999-9999
              </a>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">WhatsApp:</span>
              <a
                href="https://wa.me/5511999999999"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                (11) 99999-9999
              </a>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <a
                href="mailto:suporte@rsv360.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                suporte@rsv360.com
              </a>
            </div>
          </div>
        </div>

        {/* Dicas de conectividade */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
            💡 Dicas para restaurar a conexão:
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Verifique se o Wi-Fi está ativado</li>
            <li>• Tente alternar entre Wi-Fi e dados móveis</li>
            <li>• Reinicie o roteador se necessário</li>
            <li>• Verifique se há instabilidade na região</li>
          </ul>
        </div>

        {/* Status de sincronização */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Os dados serão sincronizados automaticamente quando a conexão for restaurada
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente para indicador de status offline
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 text-sm text-center z-50">
      <div className="flex items-center justify-center space-x-2">
        <Wifi className="h-4 w-4" />
        <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
      </div>
    </div>
  );
}
