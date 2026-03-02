/**
 * 🏪 STORE COMPLETO - RSV 360 ECOSYSTEM
 * Gerenciamento de estado TOTAL do sistema
 * Solução COMPLETA, não simplificada
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CompleteAPIGateway, ServiceConfig } from '../services/api-gateway-complete';

// ===================================================================
// TIPOS E INTERFACES COMPLETAS
// ===================================================================

export interface SystemMetrics {
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
  servicesByCategory: Record<string, number>;
  lastHealthCheck: Date;
  responseTime: number;
  uptime: number;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatar?: string;
  lastActivity: Date;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

export interface NavigationState {
  currentPage: string;
  breadcrumb: string[];
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  selectedCategory: string;
  searchQuery: string;
  recentPages: string[];
}

export interface NotificationState {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actions?: Array<{
      label: string;
      action: () => void;
    }>;
  }>;
  unreadCount: number;
}

export interface SystemState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date;
  version: string;
  environment: 'development' | 'staging' | 'production';
}

// ===================================================================
// STORE PRINCIPAL DO ECOSYSTEM
// ===================================================================

interface EcosystemStore {
  // Estado do sistema
  system: SystemState;
  metrics: SystemMetrics | null;
  user: UserSession | null;
  navigation: NavigationState;
  notifications: NotificationState;
  
  // API Gateway
  apiGateway: CompleteAPIGateway;
  servicesHealth: Map<string, boolean>;
  
  // Ações do sistema
  initializeSystem: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  updateSystemStatus: (status: Partial<SystemState>) => void;
  
  // Ações de navegação
  setCurrentPage: (page: string) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  addToRecentPages: (page: string) => void;
  
  // Ações de usuário
  setUser: (user: UserSession) => void;
  updateUserPreferences: (preferences: Partial<UserSession['preferences']>) => void;
  logout: () => void;
  
  // Ações de notificações
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Ações de API
  checkServicesHealth: () => Promise<void>;
  makeAPIRequest: <T = any>(serviceName: string, endpoint: string, config?: any) => Promise<T>;
}

// ===================================================================
// IMPLEMENTAÇÃO DO STORE
// ===================================================================

export const useEcosystemStore = create<EcosystemStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ===================================================================
        // ESTADO INICIAL
        // ===================================================================
        system: {
          isInitialized: false,
          isLoading: false,
          error: null,
          lastUpdate: new Date(),
          version: '1.0.0',
          environment: 'development'
        },
        
        metrics: null,
        user: null,
        
        navigation: {
          currentPage: '/dashboard-master',
          breadcrumb: ['Dashboard', 'Master'],
          sidebarOpen: true,
          sidebarCollapsed: false,
          selectedCategory: 'dashboards',
          searchQuery: '',
          recentPages: []
        },
        
        notifications: {
          notifications: [],
          unreadCount: 0
        },
        
        apiGateway: new CompleteAPIGateway(),
        servicesHealth: new Map(),

        // ===================================================================
        // AÇÕES DO SISTEMA
        // ===================================================================
        initializeSystem: async () => {
          set((state) => ({
            system: { ...state.system, isLoading: true, error: null }
          }));

          try {
            const { apiGateway } = get();
            
            // Verificar saúde dos serviços
            await apiGateway.checkAllServicesHealth();
            
            // Obter métricas do sistema
            const metrics = await apiGateway.getSystemMetrics();
            
            // Atualizar estado
            set((state) => ({
              system: {
                ...state.system,
                isInitialized: true,
                isLoading: false,
                lastUpdate: new Date()
              },
              metrics,
              servicesHealth: apiGateway.getAllServicesHealth()
            }));

            // Notificação de sucesso
            get().addNotification({
              type: 'success',
              title: 'Sistema Inicializado',
              message: `${metrics.healthyServices}/${metrics.totalServices} serviços ativos`
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            
            set((state) => ({
              system: {
                ...state.system,
                isLoading: false,
                error: errorMessage
              }
            }));

            get().addNotification({
              type: 'error',
              title: 'Erro na Inicialização',
              message: errorMessage
            });
          }
        },

        refreshMetrics: async () => {
          try {
            const { apiGateway } = get();
            const metrics = await apiGateway.getSystemMetrics();
            
            set((state) => ({
              metrics,
              servicesHealth: apiGateway.getAllServicesHealth(),
              system: {
                ...state.system,
                lastUpdate: new Date()
              }
            }));
          } catch (error) {
            console.error('Erro ao atualizar métricas:', error);
          }
        },

        updateSystemStatus: (status) => {
          set((state) => ({
            system: { ...state.system, ...status }
          }));
        },

        // ===================================================================
        // AÇÕES DE NAVEGAÇÃO
        // ===================================================================
        setCurrentPage: (page) => {
          set((state) => ({
            navigation: {
              ...state.navigation,
              currentPage: page,
              breadcrumb: page.split('/').filter(Boolean).map(p => 
                p.charAt(0).toUpperCase() + p.slice(1)
              )
            }
          }));
          
          get().addToRecentPages(page);
        },

        toggleSidebar: () => {
          set((state) => ({
            navigation: {
              ...state.navigation,
              sidebarOpen: !state.navigation.sidebarOpen
            }
          }));
        },

        toggleSidebarCollapse: () => {
          set((state) => ({
            navigation: {
              ...state.navigation,
              sidebarCollapsed: !state.navigation.sidebarCollapsed
            }
          }));
        },

        setSelectedCategory: (category) => {
          set((state) => ({
            navigation: {
              ...state.navigation,
              selectedCategory: category
            }
          }));
        },

        setSearchQuery: (query) => {
          set((state) => ({
            navigation: {
              ...state.navigation,
              searchQuery: query
            }
          }));
        },

        addToRecentPages: (page) => {
          set((state) => {
            const recentPages = state.navigation.recentPages.filter(p => p !== page);
            recentPages.unshift(page);
            
            return {
              navigation: {
                ...state.navigation,
                recentPages: recentPages.slice(0, 10) // Manter apenas os 10 mais recentes
              }
            };
          });
        },

        // ===================================================================
        // AÇÕES DE USUÁRIO
        // ===================================================================
        setUser: (user) => {
          set({ user });
        },

        updateUserPreferences: (preferences) => {
          set((state) => ({
            user: state.user ? {
              ...state.user,
              preferences: { ...state.user.preferences, ...preferences }
            } : null
          }));
        },

        logout: () => {
          set({
            user: null,
            navigation: {
              currentPage: '/login',
              breadcrumb: ['Login'],
              sidebarOpen: false,
              sidebarCollapsed: false,
              selectedCategory: 'auth',
              searchQuery: '',
              recentPages: []
            }
          });
        },

        // ===================================================================
        // AÇÕES DE NOTIFICAÇÕES
        // ===================================================================
        addNotification: (notification) => {
          const id = Math.random().toString(36).substr(2, 9);
          const newNotification = {
            ...notification,
            id,
            timestamp: new Date(),
            read: false
          };

          set((state) => ({
            notifications: {
              notifications: [newNotification, ...state.notifications.notifications],
              unreadCount: state.notifications.unreadCount + 1
            }
          }));
        },

        markNotificationAsRead: (id) => {
          set((state) => ({
            notifications: {
              notifications: state.notifications.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: Math.max(0, state.notifications.unreadCount - 1)
            }
          }));
        },

        clearAllNotifications: () => {
          set({
            notifications: {
              notifications: [],
              unreadCount: 0
            }
          });
        },

        // ===================================================================
        // AÇÕES DE API
        // ===================================================================
        checkServicesHealth: async () => {
          const { apiGateway } = get();
          const healthStatus = await apiGateway.checkAllServicesHealth();
          
          set({
            servicesHealth: healthStatus
          });
        },

        makeAPIRequest: async <T = any>(serviceName: string, endpoint: string, config?: any): Promise<T> => {
          const { apiGateway } = get();
          return apiGateway.makeRequest<T>(serviceName, endpoint, config);
        }
      }),
      {
        name: 'rsv-360-ecosystem-store',
        partialize: (state) => ({
          user: state.user,
          navigation: {
            ...state.navigation,
            sidebarOpen: state.navigation.sidebarOpen,
            sidebarCollapsed: state.navigation.sidebarCollapsed,
            recentPages: state.navigation.recentPages
          }
        })
      }
    ),
    {
      name: 'RSV 360 Ecosystem Store'
    }
  )
);

// ===================================================================
// HOOKS ESPECIALIZADOS
// ===================================================================

/**
 * Hook para navegação
 */
export const useNavigation = () => {
  const navigation = useEcosystemStore(state => state.navigation);
  const setCurrentPage = useEcosystemStore(state => state.setCurrentPage);
  const toggleSidebar = useEcosystemStore(state => state.toggleSidebar);
  const toggleSidebarCollapse = useEcosystemStore(state => state.toggleSidebarCollapse);
  const setSelectedCategory = useEcosystemStore(state => state.setSelectedCategory);
  const setSearchQuery = useEcosystemStore(state => state.setSearchQuery);

  return {
    navigation,
    setCurrentPage,
    toggleSidebar,
    toggleSidebarCollapse,
    setSelectedCategory,
    setSearchQuery
  };
};

/**
 * Hook para métricas do sistema
 */
export const useSystemMetrics = () => {
  const metrics = useEcosystemStore(state => state.metrics);
  const refreshMetrics = useEcosystemStore(state => state.refreshMetrics);
  const servicesHealth = useEcosystemStore(state => state.servicesHealth);
  const checkServicesHealth = useEcosystemStore(state => state.checkServicesHealth);

  return {
    metrics,
    refreshMetrics,
    servicesHealth,
    checkServicesHealth
  };
};

/**
 * Hook para notificações
 */
export const useNotifications = () => {
  const notifications = useEcosystemStore(state => state.notifications);
  const addNotification = useEcosystemStore(state => state.addNotification);
  const markNotificationAsRead = useEcosystemStore(state => state.markNotificationAsRead);
  const clearAllNotifications = useEcosystemStore(state => state.clearAllNotifications);

  return {
    notifications,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications
  };
};

/**
 * Hook para API requests
 */
export const useAPI = () => {
  const makeAPIRequest = useEcosystemStore(state => state.makeAPIRequest);
  const servicesHealth = useEcosystemStore(state => state.servicesHealth);

  return {
    makeAPIRequest,
    servicesHealth
  };
};
