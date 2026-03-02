// ===================================================================
// NOTIFICATION TOAST - SISTEMA DE TOAST PARA NOTIFICAÇÕES
// ===================================================================

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useRouter } from 'next/router';
import {
  Bell,
  X,
  Calendar,
  CreditCard,
  Users,
  Settings,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Info,
  Star
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface ToastProps {
  notification: any;
  onClose: () => void;
  onAction?: () => void;
}

// ===================================================================
// COMPONENTE DE TOAST INDIVIDUAL
// ===================================================================

const Toast: React.FC<ToastProps> = ({ notification, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close após 5 segundos
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    handleClose();
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    
    switch (type) {
      case 'booking':
        return <Calendar className={`${iconClass} text-blue-500`} />;
      case 'payment':
        return <CreditCard className={`${iconClass} text-green-500`} />;
      case 'customer':
        return <Users className={`${iconClass} text-purple-500`} />;
      case 'system':
        return <Settings className={`${iconClass} text-orange-500`} />;
      case 'marketing':
        return <MessageSquare className={`${iconClass} text-pink-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 border-red-500';
      case 'high':
        return 'bg-orange-500 border-orange-500';
      case 'medium':
        return 'bg-blue-500 border-blue-500';
      case 'low':
        return 'bg-gray-500 border-gray-500';
      default:
        return 'bg-blue-500 border-blue-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <Star className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getPriorityColor(notification.priority)}
      `}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h4>
              <div className="flex items-center space-x-1">
                {getPriorityIcon(notification.priority)}
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                  title="Fechar notificação"
                  aria-label="Fechar notificação"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                {new Date(notification.timestamp).toLocaleTimeString('pt-BR')}
              </span>
              
              {notification.actionUrl && (
                <button
                  onClick={handleAction}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver detalhes →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// CONTAINER DE TOASTS
// ===================================================================

const NotificationToastContainer: React.FC = () => {
  const { state } = useNotifications();
  const router = useRouter();
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    // Adicionar nova notificação como toast
    if (state.lastNotification && !state.lastNotification.read) {
      const newToast = {
        id: state.lastNotification.id,
        notification: state.lastNotification
      };
      
      setToasts(prev => [...prev, newToast]);
    }
  }, [state.lastNotification]);

  const handleCloseToast = (toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  const handleToastAction = (notification: any) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          notification={toast.notification}
          onClose={() => handleCloseToast(toast.id)}
          onAction={() => handleToastAction(toast.notification)}
        />
      ))}
    </div>
  );
};

export default NotificationToastContainer;
