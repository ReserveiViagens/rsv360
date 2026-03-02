import { useState, useEffect, useCallback } from 'react';

interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  focusVisible: boolean;
  screenReader: boolean;
}

export function useAccessibility() {
  const [config, setConfig] = useState<AccessibilityConfig>({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    focusVisible: true,
    screenReader: false
  });

  const [announcements, setAnnouncements] = useState<string[]>([]);

  // Detectar preferências do sistema
  useEffect(() => {
    // Reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // High contrast
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Screen reader detection
    const hasScreenReader = window.speechSynthesis !== undefined;

    setConfig(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
      screenReader: hasScreenReader
    }));

    // Aplicar preferências
    applyAccessibilityConfig({
      ...config,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
      screenReader: hasScreenReader
    });
  }, []);

  // Aplicar configurações de acessibilidade
  const applyAccessibilityConfig = useCallback((newConfig: AccessibilityConfig) => {
    const root = document.documentElement;
    
    // Reduced motion
    if (newConfig.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--animation-iteration-count', '1');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--animation-iteration-count');
    }

    // High contrast
    if (newConfig.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[newConfig.fontSize]);

    // Focus visible
    if (newConfig.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }, []);

  // Atualizar configuração
  const updateConfig = useCallback((updates: Partial<AccessibilityConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    applyAccessibilityConfig(newConfig);
    
    // Salvar no localStorage
    localStorage.setItem('accessibility-config', JSON.stringify(newConfig));
  }, [config, applyAccessibilityConfig]);

  // Carregar configuração salva
  useEffect(() => {
    const savedConfig = localStorage.getItem('accessibility-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        applyAccessibilityConfig(parsedConfig);
      } catch (error) {
        console.warn('Erro ao carregar configuração de acessibilidade:', error);
      }
    }
  }, [applyAccessibilityConfig]);

  // Anunciar para screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = {
      id: Date.now().toString(),
      message,
      priority,
      timestamp: new Date()
    };

    setAnnouncements(prev => [...prev.slice(-4), announcement.message]);

    // Criar elemento para screen reader
    const announcementEl = document.createElement('div');
    announcementEl.setAttribute('aria-live', priority);
    announcementEl.setAttribute('aria-atomic', 'true');
    announcementEl.className = 'sr-only';
    announcementEl.textContent = message;

    document.body.appendChild(announcementEl);

    // Remover após 5 segundos
    setTimeout(() => {
      document.body.removeChild(announcementEl);
    }, 5000);
  }, []);

  // Focus management
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Skip to content
  const skipToContent = useCallback(() => {
    focusElement('main, [role="main"]');
    announce('Pulou para o conteúdo principal');
  }, [focusElement, announce]);

  // Skip to navigation
  const skipToNavigation = useCallback(() => {
    focusElement('nav, [role="navigation"]');
    announce('Pulou para a navegação');
  }, [focusElement, announce]);

  // Toggle reduced motion
  const toggleReducedMotion = useCallback(() => {
    updateConfig({ reducedMotion: !config.reducedMotion });
    announce(`Movimento ${config.reducedMotion ? 'habilitado' : 'reduzido'}`);
  }, [config.reducedMotion, updateConfig, announce]);

  // Toggle high contrast
  const toggleHighContrast = useCallback(() => {
    updateConfig({ highContrast: !config.highContrast });
    announce(`Alto contraste ${config.highContrast ? 'desabilitado' : 'habilitado'}`);
  }, [config.highContrast, updateConfig, announce]);

  // Change font size
  const changeFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    updateConfig({ fontSize: size });
    announce(`Tamanho da fonte alterado para ${size}`);
  }, [updateConfig, announce]);

  // Toggle focus visible
  const toggleFocusVisible = useCallback(() => {
    updateConfig({ focusVisible: !config.focusVisible });
    announce(`Indicador de foco ${config.focusVisible ? 'desabilitado' : 'habilitado'}`);
  }, [config.focusVisible, updateConfig, announce]);

  // Keyboard navigation helpers
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Alt + 0 - Skip to content
    if (event.altKey && event.key === '0') {
      event.preventDefault();
      skipToContent();
    }

    // Alt + 1 - Skip to navigation
    if (event.altKey && event.key === '1') {
      event.preventDefault();
      skipToNavigation();
    }

    // Alt + M - Toggle reduced motion
    if (event.altKey && event.key === 'm') {
      event.preventDefault();
      toggleReducedMotion();
    }

    // Alt + C - Toggle high contrast
    if (event.altKey && event.key === 'c') {
      event.preventDefault();
      toggleHighContrast();
    }

    // Alt + F - Toggle focus visible
    if (event.altKey && event.key === 'f') {
      event.preventDefault();
      toggleFocusVisible();
    }
  }, [skipToContent, skipToNavigation, toggleReducedMotion, toggleHighContrast, toggleFocusVisible]);

  // Adicionar event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    config,
    announcements,
    updateConfig,
    announce,
    focusElement,
    skipToContent,
    skipToNavigation,
    toggleReducedMotion,
    toggleHighContrast,
    changeFontSize,
    toggleFocusVisible
  };
}
