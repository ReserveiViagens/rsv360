// ===================================================================
// NOTIFICATION BELL - SINO DE NOTIFICAÇÕES INTERATIVO
// ===================================================================

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, X } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const NotificationBell: React.FC = () => {
  const { state } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // ===================================================================
  // EFEITOS
  // ===================================================================

  useEffect(() => {
    // Detectar nova notificação
    if (state.lastNotification && !state.lastNotification.read) {
      setHasNewNotification(true);
      
      // Resetar flag após 5 segundos
      const timer = setTimeout(() => {
        setHasNewNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [state.lastNotification]);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    setHasNewNotification(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <>
      <div className="relative">
        <button
          onClick={handleBellClick}
          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Notificações"
        >
          <Bell className="w-6 h-6" />
          
          {/* Badge de notificações não lidas */}
          {state.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {state.unreadCount > 99 ? '99+' : state.unreadCount}
            </span>
          )}
          
          {/* Indicador de nova notificação */}
          {hasNewNotification && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </button>
        
        {/* Indicador de conexão */}
        <div className="absolute -bottom-1 -right-1">
          <div
            className={`w-2 h-2 rounded-full ${
              state.isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={state.isConnected ? 'Conectado' : 'Desconectado'}
          />
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default NotificationBell;
