// ===================================================================
// NOTIFICATION DEMO - COMPONENTE DE DEMONSTRAÇÃO
// ===================================================================

import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { webSocketService } from '../../services/websocket';
import { Button } from '../ui/button';
import {
  Bell,
  Calendar,
  CreditCard,
  Users,
  Settings,
  MessageSquare,
  Zap
} from 'lucide-react';

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const NotificationDemo: React.FC = () => {
  const { addNotification } = useNotifications();

  // ===================================================================
  // FUNÇÕES DE DEMONSTRAÇÃO
  // ===================================================================

  const simulateBookingNotification = () => {
    const notification = {
      id: `booking_${Date.now()}`,
      type: 'booking' as const,
      title: 'Nova Reserva',
      message: 'João Silva fez uma reserva para Caldas Novas - GO',
      timestamp: new Date(),
      read: false,
      priority: 'medium' as const,
      actionUrl: '/reservations',
      metadata: {
        bookingId: '12345',
        customerName: 'João Silva',
        destination: 'Caldas Novas'
      }
    };
    addNotification(notification);
  };

  const simulatePaymentNotification = () => {
    const notification = {
      id: `payment_${Date.now()}`,
      type: 'payment' as const,
      title: 'Pagamento Recebido',
      message: 'Pagamento de R$ 1.500,00 confirmado para reserva #12345',
      timestamp: new Date(),
      read: false,
      priority: 'high' as const,
      actionUrl: '/payments',
      metadata: {
        paymentId: '67890',
        amount: 1500,
        bookingId: '12345'
      }
    };
    addNotification(notification);
  };

  const simulateCustomerMessage = () => {
    const notification = {
      id: `message_${Date.now()}`,
      type: 'customer' as const,
      title: 'Nova Mensagem',
      message: 'Maria Santos: Olá, gostaria de saber sobre pacotes para Fernando de Noronha',
      timestamp: new Date(),
      read: false,
      priority: 'low' as const,
      actionUrl: '/chat',
      metadata: {
        messageId: '11111',
        customerName: 'Maria Santos',
        content: 'Olá, gostaria de saber sobre pacotes para Fernando de Noronha'
      }
    };
    addNotification(notification);
  };

  const simulateSystemAlert = () => {
    const notification = {
      id: `system_${Date.now()}`,
      type: 'system' as const,
      title: 'Alerta do Sistema',
      message: 'Servidor de pagamentos com alta latência detectada',
      timestamp: new Date(),
      read: false,
      priority: 'urgent' as const,
      actionUrl: '/system',
      metadata: {
        alertId: '22222',
        severity: 'high',
        component: 'payment-gateway'
      }
    };
    addNotification(notification);
  };

  const simulateMarketingNotification = () => {
    const notification = {
      id: `marketing_${Date.now()}`,
      type: 'marketing' as const,
      title: 'Campanha Ativa',
      message: 'Campanha "Verão em Caldas Novas" atingiu 500 visualizações',
      timestamp: new Date(),
      read: false,
      priority: 'low' as const,
      actionUrl: '/marketing',
      metadata: {
        campaignId: '33333',
        views: 500,
        campaignName: 'Verão em Caldas Novas'
      }
    };
    addNotification(notification);
  };

  const simulateWebSocketNotification = () => {
    webSocketService.simulateNotification();
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Bell className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Demonstração de Notificações
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button
          onClick={simulateBookingNotification}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Calendar className="w-4 h-4" />
          <span>Nova Reserva</span>
        </Button>

        <Button
          onClick={simulatePaymentNotification}
          className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pagamento</span>
        </Button>

        <Button
          onClick={simulateCustomerMessage}
          className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white"
        >
          <Users className="w-4 h-4" />
          <span>Mensagem</span>
        </Button>

        <Button
          onClick={simulateSystemAlert}
          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white"
        >
          <Settings className="w-4 h-4" />
          <span>Alerta Sistema</span>
        </Button>

        <Button
          onClick={simulateMarketingNotification}
          className="flex items-center space-x-2 bg-pink-500 hover:bg-pink-600 text-white"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Marketing</span>
        </Button>

        <Button
          onClick={simulateWebSocketNotification}
          className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          <Zap className="w-4 h-4" />
          <span>WebSocket</span>
        </Button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Como usar:
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Clique nos botões acima para simular diferentes tipos de notificações</li>
          <li>• As notificações aparecerão como toast no canto superior direito</li>
          <li>• Clique no sino de notificações para ver o centro de notificações</li>
          <li>• Use os filtros e ações no centro de notificações</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationDemo;
