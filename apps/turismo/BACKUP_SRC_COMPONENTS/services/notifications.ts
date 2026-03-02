// Sistema de Notificações em Tempo Real para Onion RSV 360
// Usa WebSocket para comunicação em tempo real

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action_url?: string;
  metadata?: any;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    system: boolean;
    bookings: boolean;
    payments: boolean;
    security: boolean;
    marketing: boolean;
  };
}

class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, (notification: Notification) => void> = new Map();
  private isConnected = false;
  private messageQueue: Notification[] = [];

  constructor() {
    this.initializeWebSocket();
    this.setupServiceWorker();
  }

  private initializeWebSocket() {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/notifications';
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔌 WebSocket conectado');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.processMessageQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleNotification(data);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
      };
    } catch (error) {
      console.error('Erro ao inicializar WebSocket:', error);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.initializeWebSocket();
      }, delay);
    } else {
      console.error('❌ Máximo de tentativas de reconexão atingido');
    }
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const notification = this.messageQueue.shift();
      if (notification) {
        this.handleNotification(notification);
      }
    }
  }

  private handleNotification(data: any) {
    const notification: Notification = {
      id: data.id || this.generateId(),
      type: data.type || 'info',
      title: data.title || 'Notificação',
      message: data.message || '',
      timestamp: new Date(data.timestamp || Date.now()),
      read: false,
      action_url: data.action_url,
      metadata: data.metadata,
    };

    // Notificar todos os listeners
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Erro no listener de notificação:', error);
      }
    });

    // Mostrar notificação visual
    this.showVisualNotification(notification);

    // Salvar no localStorage
    this.saveNotification(notification);
  }

  private showVisualNotification(notification: Notification) {
    // Verificar se o navegador suporta notificações
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.type === 'error',
      });
    }

    // Mostrar toast notification
    this.showToast(notification);
  }

  private showToast(notification: Notification) {
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    // Definir cores baseadas no tipo
    const colors = {
      info: 'bg-blue-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      error: 'bg-red-500 text-white',
    };

    toast.className += ` ${colors[notification.type]}`;
    
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-1">
          <h4 class="font-medium">${notification.title}</h4>
          <p class="text-sm opacity-90">${notification.message}</p>
        </div>
        <button class="ml-2 text-white opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">
          ×
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Animar entrada
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);

    // Auto-remover após 5 segundos
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private saveNotification(notification: Notification) {
    try {
      const notifications = this.getStoredNotifications();
      notifications.unshift(notification);
      
      // Manter apenas as últimas 100 notificações
      if (notifications.length > 100) {
        notifications.splice(100);
      }
      
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
    }
  }

  private getStoredNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      return [];
    }
  }

  private setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration);
        })
        .catch((error) => {
          console.error('❌ Erro ao registrar Service Worker:', error);
        });
    }
  }

  // Métodos públicos
  public subscribe(listenerId: string, callback: (notification: Notification) => void) {
    this.listeners.set(listenerId, callback);
  }

  public unsubscribe(listenerId: string) {
    this.listeners.delete(listenerId);
  }

  public sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
    };

    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(fullNotification));
    } else {
      this.messageQueue.push(fullNotification);
    }
  }

  public getNotifications(): Notification[] {
    return this.getStoredNotifications();
  }

  public markAsRead(notificationId: string) {
    const notifications = this.getStoredNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }

  public markAllAsRead() {
    const notifications = this.getStoredNotifications();
    notifications.forEach(n => n.read = true);
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  public deleteNotification(notificationId: string) {
    const notifications = this.getStoredNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem('notifications', JSON.stringify(filtered));
  }

  public clearAllNotifications() {
    localStorage.removeItem('notifications');
  }

  public getUnreadCount(): number {
    const notifications = this.getStoredNotifications();
    return notifications.filter(n => !n.read).length;
  }

  public requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      return Notification.requestPermission().then(permission => {
        return permission === 'granted';
      });
    }
    return Promise.resolve(false);
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

// Instância singleton
export const notificationService = new NotificationService();

// Hook React para usar notificações
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    // Carregar notificações iniciais
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());

    // Subscrever para novas notificações
    const listenerId = 'useNotifications';
    notificationService.subscribe(listenerId, (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      notificationService.unsubscribe(listenerId);
    };
  }, []);

  const markAsRead = React.useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = React.useCallback(() => {
    notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = React.useCallback((notificationId: string) => {
    notificationService.deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  }, [notifications]);

  const clearAll = React.useCallback(() => {
    notificationService.clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
};

// Utilitários para tipos específicos de notificação
export const notificationUtils = {
  // Notificações do sistema
  system: {
    maintenance: (message: string) => notificationService.sendNotification({
      type: 'warning',
      title: 'Manutenção do Sistema',
      message,
      metadata: { category: 'system' },
    }),

    update: (version: string) => notificationService.sendNotification({
      type: 'info',
      title: 'Atualização Disponível',
      message: `Nova versão ${version} disponível`,
      action_url: '/admin/updates',
      metadata: { category: 'system', version },
    }),
  },

  // Notificações de reservas
  bookings: {
    confirmed: (bookingId: string, destination: string) => notificationService.sendNotification({
      type: 'success',
      title: 'Reserva Confirmada',
      message: `Sua viagem para ${destination} foi confirmada`,
      action_url: `/travel/bookings/${bookingId}`,
      metadata: { category: 'bookings', bookingId, destination },
    }),

    cancelled: (bookingId: string, destination: string) => notificationService.sendNotification({
      type: 'error',
      title: 'Reserva Cancelada',
      message: `Sua viagem para ${destination} foi cancelada`,
      action_url: `/travel/bookings/${bookingId}`,
      metadata: { category: 'bookings', bookingId, destination },
    }),

    reminder: (bookingId: string, destination: string, daysLeft: number) => notificationService.sendNotification({
      type: 'info',
      title: 'Lembrete de Viagem',
      message: `Sua viagem para ${destination} está em ${daysLeft} dias`,
      action_url: `/travel/bookings/${bookingId}`,
      metadata: { category: 'bookings', bookingId, destination, daysLeft },
    }),
  },

  // Notificações de pagamentos
  payments: {
    successful: (amount: number, description: string) => notificationService.sendNotification({
      type: 'success',
      title: 'Pagamento Confirmado',
      message: `Pagamento de R$ ${amount.toFixed(2)} realizado: ${description}`,
      action_url: '/finance/transactions',
      metadata: { category: 'payments', amount, description },
    }),

    failed: (amount: number, description: string) => notificationService.sendNotification({
      type: 'error',
      title: 'Pagamento Falhou',
      message: `Falha no pagamento de R$ ${amount.toFixed(2)}: ${description}`,
      action_url: '/finance/transactions',
      metadata: { category: 'payments', amount, description },
    }),

    refund: (amount: number, description: string) => notificationService.sendNotification({
      type: 'success',
      title: 'Reembolso Processado',
      message: `Reembolso de R$ ${amount.toFixed(2)}: ${description}`,
      action_url: '/finance/transactions',
      metadata: { category: 'payments', amount, description },
    }),
  },

  // Notificações de segurança
  security: {
    login: (location: string, device: string) => notificationService.sendNotification({
      type: 'info',
      title: 'Novo Login Detectado',
      message: `Login realizado em ${location} (${device})`,
      action_url: '/security/activity',
      metadata: { category: 'security', location, device },
    }),

    passwordChanged: () => notificationService.sendNotification({
      type: 'success',
      title: 'Senha Alterada',
      message: 'Sua senha foi alterada com sucesso',
      action_url: '/security/settings',
      metadata: { category: 'security' },
    }),

    suspiciousActivity: (activity: string) => notificationService.sendNotification({
      type: 'warning',
      title: 'Atividade Suspeita',
      message: `Atividade suspeita detectada: ${activity}`,
      action_url: '/security/activity',
      metadata: { category: 'security', activity },
    }),
  },

  // Notificações de marketing
  marketing: {
    promotion: (title: string, description: string, discount: string) => notificationService.sendNotification({
      type: 'info',
      title,
      message: `${description} - ${discount} de desconto`,
      action_url: '/marketing/promotions',
      metadata: { category: 'marketing', discount },
    }),

    loyaltyPoints: (points: number, reason: string) => notificationService.sendNotification({
      type: 'success',
      title: 'Pontos Adicionados',
      message: `+${points} pontos adicionados: ${reason}`,
      action_url: '/loyalty',
      metadata: { category: 'marketing', points, reason },
    }),
  },
};

// Exportar React para o hook
import React from 'react'; 