// 🎨 DESIGN TOKENS - RESERVEI VIAGENS CALDAS NOVAS
// Sistema de design unificado para identidade visual turística

export const designTokens = {
  // 🌊 CORES PRINCIPAIS - INSPIRADAS EM CALDAS NOVAS
  colors: {
    // Cores primárias - Águas termais
    primary: {
      50: '#EFF6FF',   // Azul claro
      100: '#DBEAFE',  // Azul água cristalina
      200: '#BFDBFE',  // Azul piscina
      300: '#93C5FD',  // Azul termal
      400: '#60A5FA',  // Azul profundo
      500: '#2563EB',  // Azul principal (águas termais)
      600: '#1D4ED8',  // Azul escuro
      700: '#1E40AF',  // Azul noturno
      800: '#1E3A8A',  // Azul marinho
      900: '#172554',  // Azul profundo
    },
    
    // Cores secundárias - Natureza do cerrado
    secondary: {
      50: '#ECFDF5',   // Verde claro
      100: '#D1FAE5',  // Verde folha
      200: '#A7F3D0',  // Verde vegetação
      300: '#6EE7B7',  // Verde natureza
      400: '#34D399',  // Verde cerrado
      500: '#10B981',  // Verde principal (vegetação)
      600: '#059669',  // Verde escuro
      700: '#047857',  // Verde floresta
      800: '#065F46',  // Verde profundo
      900: '#064E3B',  // Verde escuro
    },
    
    // Cores de destaque - Pôr do sol
    accent: {
      50: '#FFFBEB',   // Dourado claro
      100: '#FEF3C7',  // Dourado sol
      200: '#FDE68A',  // Dourado amanhecer
      300: '#FCD34D',  // Dourado meio-dia
      400: '#FBBF24',  // Dourado tarde
      500: '#F59E0B',  // Dourado principal (pôr do sol)
      600: '#D97706',  // Dourado escuro
      700: '#B45309',  // Dourado profundo
      800: '#92400E',  // Dourado terra
      900: '#78350F',  // Dourado cerrado
    },
    
    // Cores de alerta e status
    danger: {
      500: '#EF4444',  // Vermelho alerta
      600: '#DC2626',  // Vermelho erro
    },
    
    warning: {
      500: '#F59E0B',  // Amarelo aviso
      600: '#D97706',  // Amarelo atenção
    },
    
    success: {
      500: '#10B981',  // Verde sucesso
      600: '#059669',  // Verde confirmação
    },
    
    // Cores neutras
    neutral: {
      50: '#F9FAFB',   // Branco puro
      100: '#F3F4F6',  // Cinza muito claro
      200: '#E5E7EB',  // Cinza claro
      300: '#D1D5DB',  // Cinza médio claro
      400: '#9CA3AF',  // Cinza médio
      500: '#6B7280',  // Cinza padrão
      600: '#4B5563',  // Cinza médio escuro
      700: '#374151',  // Cinza escuro
      800: '#1F2937',  // Cinza muito escuro
      900: '#111827',  // Cinza profundo
    }
  },
  
  // 📏 ESPAÇAMENTOS - SISTEMA 8PT GRID
  spacing: {
    xs: '4px',      // 0.25rem
    sm: '8px',      // 0.5rem
    md: '16px',     // 1rem
    lg: '24px',     // 1.5rem
    xl: '32px',     // 2rem
    '2xl': '48px',  // 3rem
    '3xl': '64px',  // 4rem
    '4xl': '96px',  // 6rem
    '5xl': '128px', // 8rem
  },
  
  // 🔤 TIPOGRAFIA - HIERARQUIA CLARA
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    
    fontSize: {
      xs: '12px',      // 0.75rem
      sm: '14px',      // 0.875rem
      base: '16px',    // 1rem
      lg: '18px',      // 1.125rem
      xl: '20px',      // 1.25rem
      '2xl': '24px',   // 1.5rem
      '3xl': '30px',   // 1.875rem
      '4xl': '36px',   // 2.25rem
      '5xl': '48px',   // 3rem
      '6xl': '60px',   // 3.75rem
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },
  
  // 🎭 SOMBRAS - PROFUNDIDADE E HIERARQUIA
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  
  // 🔄 ANIMAÇÕES - FLUIDEZ E RESPONSIVIDADE
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },
  
  // 📱 BREAKPOINTS - DESIGN RESPONSIVO
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 🔲 BORDER RADIUS - MODERNIDADE
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  }
};

// 🎨 FUNÇÕES UTILITÁRIAS PARA CORES
export const getColor = (colorPath: string) => {
  const path = colorPath.split('.');
  let current: any = designTokens.colors;
  
  for (const key of path) {
    if (current[key] !== undefined) {
      current = current[key];
    } else {
      console.warn(`Color not found: ${colorPath}`);
      return designTokens.colors.primary[500];
    }
  }
  
  return current;
};

// 🌟 EXPORTAR TOKENS COMO CSS VARIABLES
export const cssVariables = Object.entries(designTokens.colors).reduce((acc, [colorName, colorShades]) => {
  if (typeof colorShades === 'object') {
    Object.entries(colorShades).forEach(([shade, value]) => {
      acc[`--color-${colorName}-${shade}`] = value;
    });
  }
  return acc;
}, {} as Record<string, string>);

export default designTokens;
