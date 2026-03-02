// ===================================================================
// NOTIFICATION CONTEXT - GERENCIAMENTO GLOBAL DE NOTIFICAÇÕES
// ===================================================================

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { webSocketService, NotificationData } from '../services/websocket';
import { useAuth } from './AuthContext';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface NotificationState {
  notifications: NotificationData[];
  unreadCount: number;
  isConnected: boolean;
  lastNotification: NotificationData | null;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: NotificationData }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'LOAD_NOTIFICATIONS'; payload: NotificationData[] }
  | { type: 'CLEAR_NOTIFICATIONS' };

interface NotificationContextType {
  state: NotificationState;
  addNotification: (notification: NotificationData) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  getNotificationsByType: (type: NotificationData['type']) => NotificationData[];
  getUnreadNotifications: () => NotificationData[];
}

// ===================================================================
// REDUCER
// ===================================================================

const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotification = action.payload;
      const existingIndex = state.notifications.findIndex(n => n.id === newNotification.id);
      
      if (existingIndex >= 0) {
        // Atualizar notificação existente
        const updatedNotifications = [...state.notifications];
        updatedNotifications[existingIndex] = newNotification;
        return {
          ...state,
          notifications: updatedNotifications,
          unreadCount: newNotification.read ? state.unreadCount : state.unreadCount + 1,
          lastNotification: newNotification
        };
      } else {
        // Adicionar nova notificação
        return {
          ...state,
          notifications: [newNotification, ...state.notifications],
          unreadCount: newNotification.read ? state.unreadCount : state.unreadCount + 1,
          lastNotification: newNotification
        };
      }

    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, read: true }
          : notification
      );
      
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount
      };

    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(notification => ({
        ...notification,
        read: true
      }));
      
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      };

    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      
      const newUnreadCount = filteredNotifications.filter(n => !n.read).length;
      
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: newUnreadCount
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload
      };

    case 'LOAD_NOTIFICATIONS':
      const unreadCountFromLoaded = action.payload.filter(n => !n.read).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount: unreadCountFromLoaded
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
        lastNotification: null
      };

    default:
      return state;
  }
};

// ===================================================================
// CONTEXT
// ===================================================================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ===================================================================
// PROVIDER
// ===================================================================

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    unreadCount: 0,
    isConnected: false,
    lastNotification: null
  });

  // ===================================================================
  // CONEXÃO WEBSOCKET
  // ===================================================================

  useEffect(() => {
    if (user?.id) {
      const connectWebSocket = async () => {
        try {
          await webSocketService.connect(user.id, user.token || '');
          dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
          
          // Configurar listeners
          setupWebSocketListeners();
          
          // Carregar notificações existentes
          loadExistingNotifications();
          
        } catch (error) {
          console.error('Erro ao conectar WebSocket:', error);
          dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
        }
      };

      connectWebSocket();
    }

    return () => {
      webSocketService.disconnect();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    };
  }, [user?.id]);

  // ===================================================================
  // CONFIGURAÇÃO DE LISTENERS
  // ===================================================================

  const setupWebSocketListeners = () => {
    // Nova notificação
    webSocketService.on('notification:new', (notification: NotificationData) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      
      // Mostrar toast se não estiver lida
      if (!notification.read) {
        showNotificationToast(notification);
      }
    });

    // Notificação marcada como lida
    webSocketService.on('notification:read', (notificationId: string) => {
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    });

    // Nova reserva
    webSocketService.on('booking:created', (booking: any) => {
      const notification: NotificationData = {
        id: `booking_${booking.id}`,
        type: 'booking',
        title: 'Nova Reserva',
        message: `${booking.customerName} fez uma reserva para ${booking.destination}`,
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        actionUrl: `/reservations/${booking.id}`,
        metadata: { booking }
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    });

    // Pagamento recebido
    webSocketService.on('payment:received', (payment: any) => {
      const notification: NotificationData = {
        id: `payment_${payment.id}`,
        type: 'payment',
        title: 'Pagamento Recebido',
        message: `Pagamento de R$ ${payment.amount} confirmado`,
        timestamp: new Date(),
        read: false,
        priority: 'high',
        actionUrl: `/payments/${payment.id}`,
        metadata: { payment }
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    });

    // Mensagem de cliente
    webSocketService.on('customer:message', (message: any) => {
      const notification: NotificationData = {
        id: `message_${message.id}`,
        type: 'customer',
        title: 'Nova Mensagem',
        message: `${message.customerName}: ${message.content.substring(0, 50)}...`,
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        actionUrl: `/chat/${message.customerId}`,
        metadata: { message }
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    });

    // Alerta do sistema
    webSocketService.on('system:alert', (alert: any) => {
      const notification: NotificationData = {
        id: `alert_${alert.id}`,
        type: 'system',
        title: 'Alerta do Sistema',
        message: alert.message,
        timestamp: new Date(),
        read: false,
        priority: alert.priority || 'high',
        actionUrl: alert.actionUrl,
        metadata: { alert }
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    });
  };

  // ===================================================================
  // CARREGAMENTO DE NOTIFICAÇÕES EXISTENTES
  // ===================================================================

  const loadExistingNotifications = async () => {
    try {
      // Simular carregamento de notificações existentes
      const mockNotifications: NotificationData[] = [
        {
          id: '1',
          type: 'booking',
          title: 'Reserva Confirmada',
          message: 'Maria Santos confirmou reserva para Porto de Galinhas',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
          read: false,
          priority: 'medium',
          actionUrl: '/reservations/1'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Pagamento Processado',
          message: 'Pagamento de R$ 1.500,00 processado com sucesso',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
          read: true,
          priority: 'high',
          actionUrl: '/payments/2'
        },
        {
          id: '3',
          type: 'customer',
          title: 'Nova Mensagem',
          message: 'João Silva enviou uma mensagem sobre sua viagem',
          timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 horas atrás
          read: false,
          priority: 'low',
          actionUrl: '/chat/3'
        }
      ];

      dispatch({ type: 'LOAD_NOTIFICATIONS', payload: mockNotifications });
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // ===================================================================
  // TOAST DE NOTIFICAÇÃO
  // ===================================================================

  const showNotificationToast = (notification: NotificationData) => {
    // Implementar toast system aqui
    console.log('🔔 Nova notificação:', notification);
    
    // Em um ambiente real, você usaria um sistema de toast
    // como react-hot-toast ou react-toastify
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  // ===================================================================
  // MÉTODOS DO CONTEXT
  // ===================================================================

  const addNotification = (notification: NotificationData) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
    webSocketService.markNotificationAsRead(id);
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
    // Marcar todas como lidas no servidor
    state.notifications.forEach(notification => {
      if (!notification.read) {
        webSocketService.markNotificationAsRead(notification.id);
      }
    });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const getNotificationsByType = (type: NotificationData['type']): NotificationData[] => {
    return state.notifications.filter(notification => notification.type === type);
  };

  const getUnreadNotifications = (): NotificationData[] => {
    return state.notifications.filter(notification => !notification.read);
  };

  // ===================================================================
  // VALOR DO CONTEXT
  // ===================================================================

  const contextValue: NotificationContextType = {
    state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    getNotificationsByType,
    getUnreadNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// ===================================================================
// HOOK PERSONALIZADO
// ===================================================================

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

export default NotificationContext;
