import { useState, useEffect } from 'react';

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
}

const STORAGE_KEY = 'rsv-sidebar-state';

export function useSidebar() {
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    isOpen: false,
    isCollapsed: false
  });

  // Carregar estado do localStorage na inicialização
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setSidebarState(parsedState);
      }
    } catch (error) {
      console.warn('Erro ao carregar estado do sidebar:', error);
    }
  }, []);

  // Salvar estado no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sidebarState));
    } catch (error) {
      console.warn('Erro ao salvar estado do sidebar:', error);
    }
  }, [sidebarState]);

  const toggleSidebar = () => {
    setSidebarState(prev => ({
      ...prev,
      isCollapsed: !prev.isCollapsed
    }));
  };

  const toggleMobileSidebar = () => {
    setSidebarState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  };

  const closeMobileSidebar = () => {
    setSidebarState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  return {
    ...sidebarState,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar
  };
}
