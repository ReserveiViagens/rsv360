// Serviço de Notificações Push para o sistema RSV Onboarding
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPermission {
  granted: boolean;
  permission: NotificationPermission;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;

  private constructor() {
    this.isSupported = this.checkSupport();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private checkSupport(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  public async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications não são suportadas neste navegador');
      return false;
    }

    try {
      // Registrar service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', this.swRegistration);

      // Verificar permissões
      const permission = await this.requestPermission();
      if (!permission.granted) {
        console.warn('Permissão para notificações negada');
        return false;
      }

      // Configurar listener para mensagens do service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));

      return true;
    } catch (error) {
      console.error('Erro ao inicializar notificações push:', error);
      return false;
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return { granted: false, permission: 'denied' as NotificationPermission };
    }

    try {
      const permission = await Notification.requestPermission();
      return {
        granted: permission === 'granted',
        permission
      };
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return { granted: false, permission: 'denied' as NotificationPermission };
    }
  }

  public async getCurrentPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return { granted: false, permission: 'denied' as NotificationPermission };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      permission
    };
  }

  public async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration || !this.isSupported) {
      console.warn('Service Worker não registrado ou push não suportado');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
      });

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh') || []))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth') || [])))
        }
      };
    } catch (error) {
      console.error('Erro ao se inscrever para push:', error);
      return null;
    }
  }

  public async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      return false;
    }
  }

  public async showNotification(payload: NotificationPayload): Promise<Notification | null> {
    if (!this.isSupported) {
      return null;
    }

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/badge.png',
        image: payload.image,
        tag: payload.tag,
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        timestamp: payload.timestamp || Date.now()
      });

      // Configurar listeners para ações
      notification.onclick = (event) => {
        this.handleNotificationClick(event, payload);
      };

      notification.onclose = () => {
        this.handleNotificationClose(payload);
      };

      return notification;
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
      return null;
    }
  }

  public async sendNotificationToServiceWorker(payload: NotificationPayload): Promise<void> {
    if (!this.swRegistration) {
      return;
    }

    try {
      await this.swRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/badge.png',
        image: payload.image,
        tag: payload.tag,
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        timestamp: payload.timestamp || Date.now()
      });
    } catch (error) {
      console.error('Erro ao enviar notificação para service worker:', error);
    }
  }

  public async scheduleNotification(payload: NotificationPayload, delay: number): Promise<void> {
    setTimeout(() => {
      this.showNotification(payload);
    }, delay);
  }

  public async schedulePeriodicNotification(
    payload: NotificationPayload,
    interval: number,
    maxCount: number = -1
  ): Promise<NodeJS.Timeout> {
    let count = 0;
    const intervalId = setInterval(() => {
      if (maxCount > 0 && count >= maxCount) {
        clearInterval(intervalId);
        return;
      }
      this.showNotification(payload);
      count++;
    }, interval);

    return intervalId;
  }

  public async cancelScheduledNotification(intervalId: NodeJS.Timeout): Promise<void> {
    clearInterval(intervalId);
  }

  private handleNotificationClick(event: Event, payload: NotificationPayload): void {
    // Focar na janela se existir
    if (window) {
      window.focus();
    }

    // Executar ação personalizada se definida
    if (payload.data?.action) {
      this.executeNotificationAction(payload.data.action, payload.data);
    }

    // Fechar a notificação
    const notification = event.target as Notification;
    if (notification) {
      notification.close();
    }
  }

  private handleNotificationClose(payload: NotificationPayload): void {
    // Executar ação de fechamento se definida
    if (payload.data?.onClose) {
      this.executeNotificationAction(payload.data.onClose, payload.data);
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    switch (type) {
      case 'NOTIFICATION_CLICK':
        this.handleNotificationClick(event, data);
        break;
      case 'NOTIFICATION_CLOSE':
        this.handleNotificationClose(data);
        break;
      case 'PUSH_RECEIVED':
        this.handlePushReceived(data);
        break;
      default:
        console.log('Mensagem desconhecida do service worker:', type);
    }
  }

  private handlePushReceived(data: any): void {
    // Processar dados recebidos via push
    console.log('Push recebido:', data);
    
    // Mostrar notificação com os dados recebidos
    if (data.notification) {
      this.showNotification(data.notification);
    }
  }

  private executeNotificationAction(action: string, data: any): void {
    switch (action) {
      case 'OPEN_URL':
        if (data.url) {
          window.open(data.url, '_blank');
        }
        break;
      case 'NAVIGATE':
        if (data.route) {
          // Implementar navegação baseada no roteador usado
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = data.route;
          }
        }
        break;
      case 'CALLBACK':
        if (data.callback && typeof data.callback === 'function') {
          data.callback(data);
        }
        break;
      default:
        console.log('Ação de notificação não reconhecida:', action);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  public async getSubscription(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (!subscription) {
        return null;
      }

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh') || []))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth') || [])))
        }
      };
    } catch (error) {
      console.error('Erro ao obter subscription:', error);
      return null;
    }
  }

  public async isSubscribed(): Promise<boolean> {
    const subscription = await this.getSubscription();
    return subscription !== null;
  }

  public destroy(): void {
    // Limpar listeners e referências
    if (navigator.serviceWorker) {
      navigator.serviceWorker.removeEventListener('message', this.handleServiceWorkerMessage.bind(this));
    }
    this.swRegistration = null;
  }
}

export default PushNotificationService;
