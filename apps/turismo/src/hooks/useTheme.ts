import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange';

interface ThemeConfig {
  theme: Theme;
  colorScheme: ColorScheme;
}

const STORAGE_KEY = 'rsv-theme-config';

// Cores personalizadas da Reservei Viagens
export const RESERVEI_COLORS = {
  blue: {
    primary: '#2563EB',      // Azul água termal
    secondary: '#1D4ED8',   // Azul mais escuro
    accent: '#3B82F6',      // Azul claro
    light: '#DBEAFE',       // Azul muito claro
    dark: '#1E3A8A'         // Azul escuro
  },
  green: {
    primary: '#10B981',      // Verde natureza
    secondary: '#059669',   // Verde mais escuro
    accent: '#34D399',      // Verde claro
    light: '#D1FAE5',       // Verde muito claro
    dark: '#047857'         // Verde escuro
  },
  purple: {
    primary: '#8B5CF6',      // Roxo elegante
    secondary: '#7C3AED',   // Roxo mais escuro
    accent: '#A78BFA',      // Roxo claro
    light: '#EDE9FE',       // Roxo muito claro
    dark: '#6D28D9'         // Roxo escuro
  },
  orange: {
    primary: '#F59E0B',      // Dourado sol
    secondary: '#D97706',   // Laranja mais escuro
    accent: '#FBBF24',      // Laranja claro
    light: '#FEF3C7',       // Laranja muito claro
    dark: '#B45309'         // Laranja escuro
  }
};

export function useTheme() {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    theme: 'light',
    colorScheme: 'blue'
  });

  // Carregar configuração do localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setThemeConfig(parsedConfig);
      }
    } catch (error) {
      console.warn('Erro ao carregar configuração do tema:', error);
    }
  }, []);

  // Aplicar tema ao documento
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar tema (light/dark)
    if (themeConfig.theme === 'dark') {
      root.classList.add('dark');
    } else if (themeConfig.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto - seguir preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Aplicar esquema de cores
    const colors = RESERVEI_COLORS[themeConfig.colorScheme];
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-light', colors.light);
    root.style.setProperty('--color-dark', colors.dark);

    // Salvar configuração
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(themeConfig));
    } catch (error) {
      console.warn('Erro ao salvar configuração do tema:', error);
    }
  }, [themeConfig]);

  const setTheme = (theme: Theme) => {
    setThemeConfig(prev => ({ ...prev, theme }));
  };

  const setColorScheme = (colorScheme: ColorScheme) => {
    setThemeConfig(prev => ({ ...prev, colorScheme }));
  };

  const toggleTheme = () => {
    setThemeConfig(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  return {
    ...themeConfig,
    setTheme,
    setColorScheme,
    toggleTheme,
    colors: RESERVEI_COLORS[themeConfig.colorScheme]
  };
}
