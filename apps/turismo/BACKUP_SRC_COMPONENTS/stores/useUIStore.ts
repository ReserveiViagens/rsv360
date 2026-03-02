import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Modals
  activeModals: string[];
  
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Search
  searchQuery: string;
  searchFilters: Record<string, any>;
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  
  // Sort
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface UIActions {
  // Sidebar
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  
  // Modals
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  
  // Loading
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  clearLoadingState: (key: string) => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: Record<string, any>) => void;
  clearSearch: () => void;
  
  // Pagination
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (perPage: number) => void;
  
  // Sort
  setSort: (by: string, order: 'asc' | 'desc') => void;
  toggleSort: (by: string) => void;
  
  // Reset
  resetUI: () => void;
}

export type UIStore = UIState & UIActions;

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: 'system',
  notifications: [],
  unreadCount: 0,
  activeModals: [],
  globalLoading: false,
  loadingStates: {},
  searchQuery: '',
  searchFilters: {},
  currentPage: 1,
  itemsPerPage: 10,
  sortBy: '',
  sortOrder: 'asc'
};

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Sidebar
      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      // Theme
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        
        // Aplica o tema
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // Notifications
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false
        };
        
        set(state => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }));
      },

      removeNotification: (id: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: state.unreadCount - (notification?.read ? 0 : 1)
          };
        });
      },

      markNotificationAsRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }));
      },

      markAllNotificationsAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        }));
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      // Modals
      openModal: (modalId: string) => {
        set(state => ({
          activeModals: [...state.activeModals, modalId]
        }));
      },

      closeModal: (modalId: string) => {
        set(state => ({
          activeModals: state.activeModals.filter(id => id !== modalId)
        }));
      },

      closeAllModals: () => {
        set({ activeModals: [] });
      },

      // Loading
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },

      setLoadingState: (key: string, loading: boolean) => {
        set(state => ({
          loadingStates: { ...state.loadingStates, [key]: loading }
        }));
      },

      clearLoadingState: (key: string) => {
        set(state => {
          const { [key]: removed, ...rest } = state.loadingStates;
          return { loadingStates: rest };
        });
      },

      // Search
      setSearchQuery: (query: string) => {
        set({ searchQuery: query, currentPage: 1 });
      },

      setSearchFilters: (filters: Record<string, any>) => {
        set({ searchFilters: filters, currentPage: 1 });
      },

      clearSearch: () => {
        set({ searchQuery: '', searchFilters: {}, currentPage: 1 });
      },

      // Pagination
      setCurrentPage: (page: number) => {
        set({ currentPage: page });
      },

      setItemsPerPage: (perPage: number) => {
        set({ itemsPerPage: perPage, currentPage: 1 });
      },

      // Sort
      setSort: (by: string, order: 'asc' | 'desc') => {
        set({ sortBy: by, sortOrder: order });
      },

      toggleSort: (by: string) => {
        const { sortBy, sortOrder } = get();
        if (sortBy === by) {
          set({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
        } else {
          set({ sortBy: by, sortOrder: 'asc' });
        }
      },

      // Reset
      resetUI: () => {
        set(initialState);
      }
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        itemsPerPage: state.itemsPerPage
      })
    }
  )
);
