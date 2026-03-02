// ===================================================================
// NOTIFICATION CENTER - CENTRO DE NOTIFICAÇÕES INTERATIVO
// ===================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useRouter } from 'next/router';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Star,
  Calendar,
  CreditCard,
  Users,
  Settings,
  MessageSquare
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'unread' | 'booking' | 'payment' | 'customer' | 'system' | 'marketing';
type SortType = 'newest' | 'oldest' | 'priority';

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { state, markAsRead, markAllAsRead, removeNotification, getNotificationsByType } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  
  const centerRef = useRef<HTMLDivElement>(null);

  // ===================================================================
  // EFEITOS
  // ===================================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (centerRef.current && !centerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // ===================================================================
  // FUNÇÕES DE UTILIDADE
  // ===================================================================

  const getNotificationIcon = (type: string, priority: string) => {
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
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-300 bg-white';
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
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return timestamp.toLocaleDateString('pt-BR');
  };

  // ===================================================================
  // FILTROS E ORDENAÇÃO
  // ===================================================================

  const getFilteredNotifications = () => {
    let filtered = [...state.notifications];

    // Aplicar filtro de tipo
    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.read);
      } else {
        filtered = filtered.filter(n => n.type === filter);
      }
    }

    // Aplicar busca
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    return filtered;
  };

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
  };

  const handleSelectNotification = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleBulkAction = (action: 'read' | 'delete') => {
    selectedNotifications.forEach(id => {
      if (action === 'read') {
        markAsRead(id);
      } else {
        removeNotification(id);
      }
    });
    setSelectedNotifications(new Set());
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  if (!isOpen) return null;

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" />
      
      <div className="relative flex justify-end h-full">
        <div
          ref={centerRef}
          className="w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notificações
              </h2>
              {state.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {state.unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            </div>

          {/* Controls */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar notificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  title="Filtrar notificações"
                  aria-label="Filtrar notificações por tipo"
                >
                  <option value="all">Todas</option>
                  <option value="unread">Não lidas</option>
                  <option value="booking">Reservas</option>
                  <option value="payment">Pagamentos</option>
                  <option value="customer">Clientes</option>
                  <option value="system">Sistema</option>
                  <option value="marketing">Marketing</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  title="Ordenar notificações"
                  aria-label="Ordenar notificações"
                >
                  <option value="newest">Mais recentes</option>
                  <option value="oldest">Mais antigas</option>
                  <option value="priority">Prioridade</option>
                </select>
              </div>

              <div className="flex space-x-1">
                {selectedNotifications.size > 0 && (
                  <>
                                    <button
                  onClick={() => handleBulkAction('read')}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="Marcar como lidas"
                  aria-label="Marcar notificações selecionadas como lidas"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Excluir"
                  aria-label="Excluir notificações selecionadas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                  </>
                )}
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Marcar todas como lidas"
                  aria-label="Marcar todas as notificações como lidas"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectNotification(notification.id);
                        }}
                        className="mt-1"
                        title="Selecionar notificação"
                        aria-label={`Selecionar notificação: ${notification.title}`}
                      />
                      
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(notification.priority)}
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {notification.actionUrl && (
                          <div className="mt-2">
                            <span className="text-xs text-blue-600 hover:text-blue-800">
                              Ver detalhes →
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {!notification.read && (
                      <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{filteredNotifications.length} notificação(ões)</span>
              <span>{state.unreadCount} não lida(s)</span>
            </div>
          </div>
        </div>
        </div>
    </div>
  );
};

export default NotificationCenter;