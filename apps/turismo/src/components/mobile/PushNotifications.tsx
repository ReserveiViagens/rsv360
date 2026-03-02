import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Settings, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../stores/useUIStore';

export interface PushNotificationsProps {
  className?: string;
  enableNotifications?: boolean;
}

const PushNotifications: React.FC<PushNotificationsProps> = ({
  className,
  enableNotifications = true
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useUIStore();

  useEffect(() => {
    checkSupport();
    checkPermission();
  }, []);

  const checkSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        showNotification('Notificações push ativadas!', 'success');
        await subscribeToPush();
      } else {
        showNotification('Permissão para notificações negada', 'warning');
      }
    } catch (error) {
      showNotification('Erro ao solicitar permissão', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, showNotification]);

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });
      
      setSubscription(subscription);
      showNotification('Inscrição em notificações push realizada!', 'success');
    } catch (error) {
      showNotification('Erro ao inscrever em notificações push', 'error');
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      showNotification('Inscrição em notificações push cancelada', 'info');
    } catch (error) {
      showNotification('Erro ao cancelar inscrição', 'error');
    }
  };

  const sendTestNotification = () => {
    if (permission !== 'granted') return;

    new Notification('RSV Travel - Teste', {
      body: 'Esta é uma notificação de teste do sistema RSV',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'test-notification'
    });
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Permitido' };
      case 'denied':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Negado' };
      default:
        return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pendente' };
    }
  };

  const statusConfig = getPermissionStatus();
  const StatusIcon = statusConfig.icon;

  if (!enableNotifications) return null;

  return (
    <div className={cn('push-notifications', className)}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notificações Push</h3>
              <p className="text-sm text-gray-600">Gerencie notificações push para dispositivos móveis</p>
            </div>
          </div>
          
          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium", statusConfig.bg)}>
            <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
            <span className={statusConfig.color}>{statusConfig.text}</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status do Suporte */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Suporte ao Navegador</span>
            <span className={cn("text-sm font-medium", isSupported ? "text-green-600" : "text-red-600")}>
              {isSupported ? "Suportado" : "Não Suportado"}
            </span>
          </div>

          {/* Status da Inscrição */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Inscrição Ativa</span>
            <span className={cn("text-sm font-medium", subscription ? "text-green-600" : "text-gray-600")}>
              {subscription ? "Ativa" : "Inativa"}
            </span>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-3">
            {permission === 'default' && (
              <button
                onClick={requestPermission}
                disabled={!isSupported || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Bell className="w-4 h-4" />
                {isLoading ? "Solicitando..." : "Ativar Notificações"}
              </button>
            )}

            {permission === 'granted' && !subscription && (
              <button
                onClick={subscribeToPush}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Inscrever
              </button>
            )}

            {subscription && (
              <>
                <button
                  onClick={sendTestNotification}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  Testar Notificação
                </button>
                
                <button
                  onClick={unsubscribeFromPush}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <BellOff className="w-4 h-4" />
                  Cancelar Inscrição
                </button>
              </>
            )}

            {permission === 'denied' && (
              <button
                onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Abrir Configurações
              </button>
            )}
          </div>

          {/* Informações */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• As notificações push funcionam apenas em dispositivos móveis</p>
            <p>• Requer HTTPS para funcionar corretamente</p>
            <p>• Você pode cancelar a qualquer momento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PushNotifications };
export type { PushNotificationsProps };
