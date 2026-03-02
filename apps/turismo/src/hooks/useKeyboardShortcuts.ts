import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSidebar } from './useSidebar';
import { useTheme } from './useTheme';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'ui' | 'theme' | 'search';
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { toggleTheme, setColorScheme } = useTheme();

  const shortcuts: KeyboardShortcut[] = [
    // Navegação
    {
      key: 'h',
      ctrlKey: true,
      action: () => router.push('/'),
      description: 'Ir para Home',
      category: 'navigation'
    },
    {
      key: 'd',
      ctrlKey: true,
      action: () => router.push('/dashboard'),
      description: 'Ir para Dashboard',
      category: 'navigation'
    },
    {
      key: 't',
      ctrlKey: true,
      action: () => router.push('/travel'),
      description: 'Ir para Viagens',
      category: 'navigation'
    },
    {
      key: 'c',
      ctrlKey: true,
      action: () => router.push('/customers'),
      description: 'Ir para Clientes',
      category: 'navigation'
    },
    {
      key: 'p',
      ctrlKey: true,
      action: () => router.push('/payments'),
      description: 'Ir para Pagamentos',
      category: 'navigation'
    },
    {
      key: 'm',
      ctrlKey: true,
      action: () => router.push('/marketing'),
      description: 'Ir para Marketing',
      category: 'navigation'
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => router.push('/reports'),
      description: 'Ir para Relatórios',
      category: 'navigation'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => router.push('/settings'),
      description: 'Ir para Configurações',
      category: 'navigation'
    },

    // UI Controls
    {
      key: 'b',
      ctrlKey: true,
      action: toggleSidebar,
      description: 'Alternar Sidebar',
      category: 'ui'
    },
    {
      key: 'Escape',
      action: () => {
        // Fechar modais, dropdowns, etc.
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      },
      description: 'Fechar Modal/Dropdown',
      category: 'ui'
    },

    // Search
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focar na Busca',
      category: 'search'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Buscar (Ctrl+K)',
      category: 'search'
    },

    // Theme Controls
    {
      key: 't',
      altKey: true,
      action: toggleTheme,
      description: 'Alternar Tema',
      category: 'theme'
    },
    {
      key: '1',
      altKey: true,
      action: () => setColorScheme('blue'),
      description: 'Tema Azul',
      category: 'theme'
    },
    {
      key: '2',
      altKey: true,
      action: () => setColorScheme('green'),
      description: 'Tema Verde',
      category: 'theme'
    },
    {
      key: '3',
      altKey: true,
      action: () => setColorScheme('purple'),
      description: 'Tema Roxo',
      category: 'theme'
    },
    {
      key: '4',
      altKey: true,
      action: () => setColorScheme('orange'),
      description: 'Tema Laranja',
      category: 'theme'
    },

    // Quick Actions
    {
      key: 'n',
      ctrlKey: true,
      action: () => router.push('/travel?action=new'),
      description: 'Nova Reserva',
      category: 'navigation'
    },
    {
      key: '?',
      action: () => {
        // Mostrar help modal
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
          helpModal.style.display = 'block';
        }
      },
      description: 'Mostrar Ajuda',
      category: 'ui'
    }
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorar se estiver digitando em input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      return shortcut.key === event.key &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.metaKey === event.metaKey;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
      
      // Feedback visual
      showShortcutFeedback(matchingShortcut.description);
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
    showHelp: () => {
      const helpModal = document.getElementById('help-modal');
      if (helpModal) {
        helpModal.style.display = 'block';
      }
    }
  };
}

function showShortcutFeedback(description: string) {
  // Criar toast de feedback
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
  toast.textContent = `✓ ${description}`;
  
  document.body.appendChild(toast);
  
  // Remover após 2 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
}
