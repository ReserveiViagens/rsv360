// Configurações de ambiente para o sistema RSV Onboarding
export const ENV_CONFIG = {
  // Configurações da API
  API: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3'),
    retryDelay: 1000,
  },

  // Configurações de Autenticação
  AUTH: {
    jwtExpiry: process.env.NEXT_PUBLIC_JWT_EXPIRY || '15m',
    refreshTokenExpiry: process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY || '7d',
    twoFactorEnabled: process.env.NEXT_PUBLIC_2FA_ENABLED === 'true',
    sessionTimeout: 15 * 60 * 1000, // 15 minutos
  },

  // Configurações de Segurança
  SECURITY: {
    passwordMinLength: parseInt(process.env.NEXT_PUBLIC_PASSWORD_MIN_LENGTH || '8'),
    passwordRequireSpecialChars: process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL_CHARS === 'true',
    passwordRequireNumbers: process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_NUMBERS === 'true',
    passwordRequireUppercase: process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE === 'true',
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
  },

  // Configurações de Upload
  UPLOAD: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB
    allowedFileTypes: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
    maxFilesPerRequest: 10,
  },

  // Configurações de Notificações
  NOTIFICATIONS: {
    pushEnabled: process.env.NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED === 'true',
    emailEnabled: process.env.NEXT_PUBLIC_EMAIL_NOTIFICATIONS_ENABLED === 'true',
    smsEnabled: process.env.NEXT_PUBLIC_SMS_NOTIFICATIONS_ENABLED === 'true',
    defaultEmail: 'noreply@rsv.com',
  },

  // Configurações de Analytics
  ANALYTICS: {
    enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
    id: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
    trackPageViews: true,
    trackUserActions: true,
  },

  // Configurações de PWA
  PWA: {
    enabled: process.env.NEXT_PUBLIC_PWA_ENABLED === 'true',
    name: process.env.NEXT_PUBLIC_PWA_NAME || 'RSV Onboarding',
    shortName: process.env.NEXT_PUBLIC_PWA_SHORT_NAME || 'RSV',
    description: process.env.NEXT_PUBLIC_PWA_DESCRIPTION || 'Sistema de Onboarding RSV',
    themeColor: '#2563eb',
    backgroundColor: '#ffffff',
  },

  // Configurações de Desenvolvimento
  DEVELOPMENT: {
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
    mockApiEnabled: process.env.NEXT_PUBLIC_MOCK_API_ENABLED === 'true',
    showDevTools: process.env.NODE_ENV === 'development',
  },

  // Configurações de Performance
  PERFORMANCE: {
    cacheTTL: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300'), // 5 minutos
    debounceDelay: parseInt(process.env.NEXT_PUBLIC_DEBOUNCE_DELAY || '300'),
    throttleDelay: parseInt(process.env.NEXT_PUBLIC_THROTTLE_DELAY || '1000'),
    lazyLoadThreshold: 0.1,
    imageOptimization: true,
  },

  // Configurações de Paginação
  PAGINATION: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // Configurações de Cache
  CACHE: {
    userProfile: 5 * 60 * 1000, // 5 minutos
    userPermissions: 10 * 60 * 1000, // 10 minutos
    systemConfig: 30 * 60 * 1000, // 30 minutos
    staticData: 24 * 60 * 60 * 1000, // 24 horas
  },

  // Configurações de Validação
  VALIDATION: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phoneRegex: /^[\+]?[1-9][\d]{0,15}$/,
    passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    usernameRegex: /^[a-zA-Z0-9_-]{3,20}$/,
  },

  // Configurações de Formatação
  FORMATTING: {
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',
    currency: 'BRL',
    locale: 'pt-BR',
  },

  // Configurações de Limites
  LIMITS: {
    maxUsersPerCompany: 1000,
    maxSessionsPerUser: 10,
    maxFailedLogins: 5,
    maxPasswordHistory: 5,
    maxFileUploadsPerDay: 100,
    maxApiRequestsPerMinute: 1000,
  },

  // Configurações de Auditoria
  AUDIT: {
    enabled: true,
    logLevel: 'info',
    retentionDays: 90,
    sensitiveFields: ['password', 'token', 'secret'],
    excludePaths: ['/health', '/metrics'],
  },

  // Configurações de Monitoramento
  MONITORING: {
    enabled: true,
    healthCheckInterval: 30 * 1000, // 30 segundos
    performanceMetrics: true,
    errorTracking: true,
    userAnalytics: true,
  },
};

// Configurações específicas por ambiente
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...ENV_CONFIG,
        API: {
          ...ENV_CONFIG.API,
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.rsv.com/api',
          timeout: 60000, // 60 segundos em produção
        },
        DEVELOPMENT: {
          ...ENV_CONFIG.DEVELOPMENT,
          debugMode: false,
          logLevel: 'error',
          mockApiEnabled: false,
          showDevTools: false,
        },
        CACHE: {
          ...ENV_CONFIG.CACHE,
          userProfile: 15 * 60 * 1000, // 15 minutos em produção
          userPermissions: 30 * 60 * 1000, // 30 minutos em produção
        },
      };

    case 'staging':
      return {
        ...ENV_CONFIG,
        API: {
          ...ENV_CONFIG.API,
          baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.rsv.com/api',
        },
        DEVELOPMENT: {
          ...ENV_CONFIG.DEVELOPMENT,
          debugMode: true,
          logLevel: 'warn',
          mockApiEnabled: false,
        },
      };

    case 'test':
      return {
        ...ENV_CONFIG,
        API: {
          ...ENV_CONFIG.API,
          baseURL: 'http://localhost:3001/api',
          timeout: 5000, // 5 segundos para testes
        },
        DEVELOPMENT: {
          ...ENV_CONFIG.DEVELOPMENT,
          debugMode: true,
          logLevel: 'debug',
          mockApiEnabled: true,
        },
        CACHE: {
          ...ENV_CONFIG.CACHE,
          userProfile: 0, // Sem cache em testes
          userPermissions: 0,
        },
      };

    default: // development
      return {
        ...ENV_CONFIG,
        API: {
          ...ENV_CONFIG.API,
          baseURL: 'http://localhost:3001/api',
        },
        DEVELOPMENT: {
          ...ENV_CONFIG.DEVELOPMENT,
          debugMode: true,
          logLevel: 'debug',
          mockApiEnabled: true,
          showDevTools: true,
        },
      };
  }
};

// Configuração atual do ambiente
export const currentConfig = getEnvironmentConfig();

// Funções utilitárias
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isStaging = () => process.env.NODE_ENV === 'staging';
export const isTest = () => process.env.NODE_ENV === 'test';

export const getApiUrl = (endpoint: string) => `${currentConfig.API.baseURL}${endpoint}`;
export const getCacheKey = (key: string, prefix?: string) => `${prefix || 'rsv'}:${key}`;

export default currentConfig;
