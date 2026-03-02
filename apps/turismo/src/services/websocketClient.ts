import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { tokenManager } from './apiClient';

// WebSocket Configuration
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

// Notification interface
export interface Notification {
  id: string | number;
  type: 'info' | 'success' | 'warning' | 'error' | 'booking' | 'payment' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

// User status interface
export interface UserStatus {
  userId: number;
  userName: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  timestamp: string;
}

// Real-time update interface
export interface RealTimeUpdate {
  type: string;
  data: any;
  timestamp: string;
}

// WebSocket Client Class
class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  
  // Event listeners
  private notificationListeners: ((notification: Notification) => void)[] = [];
  private statusListeners: ((status: UserStatus) => void)[] = [];
  private updateListeners: ((update: RealTimeUpdate) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];

  constructor() {
    this.connect();
  }

  // Connect to WebSocket server
  connect = (): void => {
    if (this.isConnecting || this.isConnected()) {
      return;
    }

    const token = tokenManager.getAccessToken();
    if (!token) {
      console.warn('🔌 WebSocket: No auth token available');
      return;
    }

    this.isConnecting = true;
    console.log('🔌 WebSocket: Connecting...');

    this.socket = io(WS_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  };

  // Setup event listeners
  private setupEventListeners = (): void => {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket: Connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
      toast.success('Conectado ao sistema em tempo real');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket: Disconnected -', reason);
      this.isConnecting = false;
      this.notifyConnectionListeners(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, manual reconnection needed
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket: Connection error -', error);
      this.isConnecting = false;
      this.notifyConnectionListeners(false);
      
      if (error.message.includes('Authentication')) {
        toast.error('Erro de autenticação WebSocket');
        tokenManager.clearTokens();
        return;
      }
      
      this.handleReconnect();
    });

    // Welcome message
    this.socket.on('connected', (data) => {
      console.log('🎉 WebSocket: Welcome message received', data);
    });

    // Real-time notifications
    this.socket.on('notification', (notification: Notification) => {
      console.log('🔔 WebSocket: Notification received', notification);
      this.handleNotification(notification);
      this.notifyNotificationListeners(notification);
    });

    // User status updates
    this.socket.on('user_status_update', (status: UserStatus) => {
      console.log('👤 WebSocket: User status update', status);
      this.notifyStatusListeners(status);
    });

    // Real-time data updates
    this.socket.on('real_time_update', (update: RealTimeUpdate) => {
      console.log('🔄 WebSocket: Real-time update', update);
      this.notifyUpdateListeners(update);
    });

    // Typing indicators
    this.socket.on('user_typing', (data) => {
      console.log('⌨️ WebSocket: User typing', data);
      // Handle typing indicators if needed
    });
  };

  // Handle incoming notifications
  private handleNotification = (notification: Notification): void => {
    const toastOptions = {
      duration: 5000,
      position: 'top-right' as const,
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, toastOptions);
        break;
      case 'error':
        toast.error(notification.message, toastOptions);
        break;
      case 'warning':
        toast(notification.message, { ...toastOptions, icon: '⚠️' });
        break;
      case 'booking':
        toast(notification.message, { ...toastOptions, icon: '📅' });
        break;
      case 'payment':
        toast(notification.message, { ...toastOptions, icon: '💳' });
        break;
      case 'system':
        toast(notification.message, { ...toastOptions, icon: '🔧' });
        break;
      default:
        toast(notification.message, toastOptions);
    }
  };

  // Reconnection logic
  private handleReconnect = (): void => {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ WebSocket: Max reconnection attempts reached');
      toast.error('Falha na conexão em tempo real');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.reconnect();
    }, delay);
  };

  // Manual reconnection
  private reconnect = (): void => {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.connect();
  };

  // Check if connected
  isConnected = (): boolean => {
    return this.socket?.connected || false;
  };

  // Disconnect
  disconnect = (): void => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    console.log('🔌 WebSocket: Manually disconnected');
  };

  // Join a room
  joinRoom = (roomName: string): void => {
    if (this.socket?.connected) {
      this.socket.emit('join_room', roomName);
      console.log(`🏠 WebSocket: Joined room - ${roomName}`);
    }
  };

  // Leave a room
  leaveRoom = (roomName: string): void => {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', roomName);
      console.log(`🚪 WebSocket: Left room - ${roomName}`);
    }
  };

  // Update user status
  updateUserStatus = (status: 'online' | 'away' | 'busy'): void => {
    if (this.socket?.connected) {
      this.socket.emit('user_status', status);
      console.log(`👤 WebSocket: Status updated to ${status}`);
    }
  };

  // Send typing indicator
  startTyping = (room?: string): void => {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { room });
    }
  };

  stopTyping = (room?: string): void => {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { room });
    }
  };

  // Event listeners management
  onNotification = (callback: (notification: Notification) => void): () => void => {
    this.notificationListeners.push(callback);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(cb => cb !== callback);
    };
  };

  onUserStatus = (callback: (status: UserStatus) => void): () => void => {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  };

  onRealTimeUpdate = (callback: (update: RealTimeUpdate) => void): () => void => {
    this.updateListeners.push(callback);
    return () => {
      this.updateListeners = this.updateListeners.filter(cb => cb !== callback);
    };
  };

  onConnection = (callback: (connected: boolean) => void): () => void => {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  };

  // Notify listeners
  private notifyNotificationListeners = (notification: Notification): void => {
    this.notificationListeners.forEach(callback => callback(notification));
  };

  private notifyStatusListeners = (status: UserStatus): void => {
    this.statusListeners.forEach(callback => callback(status));
  };

  private notifyUpdateListeners = (update: RealTimeUpdate): void => {
    this.updateListeners.forEach(callback => callback(update));
  };

  private notifyConnectionListeners = (connected: boolean): void => {
    this.connectionListeners.forEach(callback => callback(connected));
  };
}

// Export singleton instance
export const wsClient = new WebSocketClient();

// Export hooks for React components
export const useWebSocket = () => {
  return {
    isConnected: wsClient.isConnected(),
    connect: wsClient.connect,
    disconnect: wsClient.disconnect,
    joinRoom: wsClient.joinRoom,
    leaveRoom: wsClient.leaveRoom,
    updateUserStatus: wsClient.updateUserStatus,
    startTyping: wsClient.startTyping,
    stopTyping: wsClient.stopTyping,
    onNotification: wsClient.onNotification,
    onUserStatus: wsClient.onUserStatus,
    onRealTimeUpdate: wsClient.onRealTimeUpdate,
    onConnection: wsClient.onConnection,
  };
};

export default wsClient;
