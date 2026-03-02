/**
 * ✅ WEBSOCKET CLIENT
 * Cliente Socket.io para uso no frontend
 */

'use client';

import { io, Socket } from 'socket.io-client';

export interface WebSocketEvents {
  // Conexão
  'connected': (data: { message: string; userId: number; timestamp: string }) => void;
  'disconnect': (reason: string) => void;
  
  // Chat
  'chat:message': (message: {
    id: string;
    room_id: string;
    user_id: number;
    user_name: string;
    message: string;
    timestamp: string;
    type?: string;
  }) => void;
  'chat:user_joined': (data: { user_id: number; user_name: string; room_id: string }) => void;
  'chat:user_left': (data: { user_id: number; user_name: string; room_id: string }) => void;
  'chat:typing': (data: { user_id: number; user_name: string; room_id: string; typing: boolean }) => void;
  
  // Notificações
  'notification': (notification: {
    title: string;
    message: string;
    type?: string;
    timestamp: string;
    data?: any;
  }) => void;
  
  // Reservas
  'booking:update': (update: {
    booking_id: number;
    type: string;
    data: any;
    timestamp: string;
  }) => void;
  
  // Usuários
  'user:online': (data: { userId: number; userName: string }) => void;
  'user:offline': (data: { userId: number; userName: string }) => void;
  'user:status_update': (data: { userId: number; userName: string; status: string }) => void;
  
  // Erros
  'error': (error: { message: string }) => void;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Conectar ao servidor WebSocket
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.socket?.connected) {
        resolve();
        return;
      }

      this.isConnecting = true;

      // Usar porta separada para WebSocket se configurada, senão usar mesma origem
      const wsPort = process.env.NEXT_PUBLIC_WS_PORT || '3001';
      const serverUrl = process.env.NEXT_PUBLIC_WS_URL || 
                       (typeof window !== 'undefined' 
                         ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:${wsPort}`
                         : `ws://localhost:${wsPort}`);

      this.socket = io(serverUrl, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket conectado:', this.socket?.id);
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

  /**
   * Desconectar
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  /**
   * Verificar se está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Escutar evento
   */
  on<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ): void {
    if (!this.socket) return;

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    this.socket.on(event, callback as any);
  }

  /**
   * Remover listener
   */
  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback as any);
      this.listeners.get(event)?.delete(callback);
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  /**
   * Emitir evento
   */
  emit(event: string, data?: any): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('WebSocket não conectado, ignorando evento:', event);
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Entrar em room de chat
   */
  joinChatRoom(roomId: string): void {
    this.emit('chat:join', { room_id: roomId });
  }

  /**
   * Sair de room de chat
   */
  leaveChatRoom(roomId: string): void {
    this.emit('chat:leave', { room_id: roomId });
  }

  /**
   * Enviar mensagem no chat
   */
  sendChatMessage(roomId: string, message: string): void {
    this.emit('chat:message', {
      room_id: roomId,
      message
    });
  }

  /**
   * Indicar que está digitando
   */
  setTyping(roomId: string, typing: boolean): void {
    this.emit('chat:typing', {
      room_id: roomId,
      typing
    });
  }

  /**
   * Entrar em room de reserva
   */
  joinBookingRoom(bookingId: number): void {
    this.emit('booking:join', { booking_id: bookingId });
  }

  /**
   * Sair de room de reserva
   */
  leaveBookingRoom(bookingId: number): void {
    this.emit('booking:leave', { booking_id: bookingId });
  }

  /**
   * Atualizar status do usuário
   */
  updateUserStatus(status: 'online' | 'away' | 'busy'): void {
    this.emit('user:status', status);
  }

  /**
   * Gerenciar reconexão
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Máximo de tentativas de reconexão atingido');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      if (!this.socket?.connected) {
        this.socket?.connect();
      }
    }, delay);
  }
}

// Instância singleton
let wsClientInstance: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!wsClientInstance) {
    wsClientInstance = new WebSocketClient();
  }
  return wsClientInstance;
}

export default WebSocketClient;

