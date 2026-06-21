// ===================================================================
// WEBSOCKET SERVICE - SISTEMA DE NOTIFICAÇÕES EM TEMPO REAL
// ===================================================================

import { io, Socket } from 'socket.io-client';

export interface NotificationData {
  id: string;
  type: 'booking' | 'payment' | 'customer' | 'system' | 'marketing';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface WebSocketEvents {
  'notification:new': (notification: NotificationData) => void;
  'notification:read': (notificationId: string) => void;
  'booking:created': (booking: unknown) => void;
  'booking:updated': (booking: unknown) => void;
  'payment:received': (payment: unknown) => void;
  'customer:message': (message: unknown) => void;
  'system:alert': (alert: unknown) => void;
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  // ===================================================================
  // CONEXÃO E CONFIGURAÇÃO
  // ===================================================================

  connect(userId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.socket?.connected) {
        resolve();
        return;
      }

      this.isConnecting = true;

      const serverUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      
      this.socket = io(serverUrl, {
        auth: {
          userId,
          token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      this.socket.on('connect', () => {
        console.log('🔌 WebSocket conectado:', this.socket?.id);
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erro de conexão WebSocket:', error);
        this.isConnecting = false;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket desconectado:', reason);
        this.handleReconnection();
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 WebSocket reconectado após', attemptNumber, 'tentativas');
        this.reconnectAttempts = 0;
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Erro de reconexão:', error);
        this.reconnectAttempts++;
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Falha na reconexão WebSocket');
        this.isConnecting = false;
      });
    });
  }

  // ===================================================================
  // GERENCIAMENTO DE RECONEXÃO
  // ===================================================================

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.socket?.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  // ===================================================================
  // LISTENERS DE EVENTOS
  // ===================================================================

  on<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ): void {
    if (this.socket) {
      this.socket.on(event, callback as never);
    }
  }

  off<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ): void {
    if (this.socket) {
      this.socket.off(event, callback as never);
    }
  }

  // ===================================================================
  // EMISSÃO DE EVENTOS
  // ===================================================================

  emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ WebSocket não conectado. Evento não enviado:', event);
    }
  }

  // ===================================================================
  // MÉTODOS ESPECÍFICOS
  // ===================================================================

  markNotificationAsRead(notificationId: string): void {
    this.emit('notification:read', { notificationId });
  }

  sendMessage(room: string, message: unknown): void {
    this.emit('message:send', { room, message });
  }

  joinRoom(room: string): void {
    this.emit('room:join', { room });
  }

  leaveRoom(room: string): void {
    this.emit('room:leave', { room });
  }

  // ===================================================================
  // STATUS E UTILIDADES
  // ===================================================================

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  // ===================================================================
  // SIMULAÇÃO DE DADOS PARA DESENVOLVIMENTO
  // ===================================================================

  simulateNotification(): void {
    if (this.socket?.connected) {
      const mockNotification: NotificationData = {
        id: `notif_${Date.now()}`,
        type: 'booking',
        title: 'Nova Reserva',
        message: 'João Silva fez uma nova reserva para Caldas Novas',
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        actionUrl: '/reservations',
        metadata: {
          bookingId: '12345',
          customerName: 'João Silva',
          destination: 'Caldas Novas'
        }
      };

      // Simular evento de nova notificação
      setTimeout(() => {
        this.socket?.emit('notification:new', mockNotification);
      }, 1000);
    }
  }
}

// ===================================================================
// INSTÂNCIA SINGLETON
// ===================================================================

export const webSocketService = new WebSocketService();

// ===================================================================
// HOOK PERSONALIZADO PARA REACT
// ===================================================================

export const useWebSocket = () => {
  return {
    connect: webSocketService.connect.bind(webSocketService),
    disconnect: webSocketService.disconnect.bind(webSocketService),
    on: webSocketService.on.bind(webSocketService),
    off: webSocketService.off.bind(webSocketService),
    emit: webSocketService.emit.bind(webSocketService),
    isConnected: webSocketService.isConnected.bind(webSocketService),
    markNotificationAsRead: webSocketService.markNotificationAsRead.bind(webSocketService),
    simulateNotification: webSocketService.simulateNotification.bind(webSocketService)
  };
};

export default webSocketService;
