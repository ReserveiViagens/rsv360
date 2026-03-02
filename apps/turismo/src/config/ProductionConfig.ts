import { z } from 'zod';

// Schema de validação para configurações de produção
export const ProductionConfigSchema = z.object({
  // Configurações do Servidor
  server: z.object({
    host: z.string().url(),
    port: z.number().min(1).max(65535),
    environment: z.enum(['development', 'staging', 'production']),
    ssl: z.boolean(),
    cors: z.object({
      origin: z.array(z.string()),
      credentials: z.boolean(),
    }),
  }),

  // Configurações do Banco de Dados
  database: z.object({
    type: z.enum(['postgresql', 'mysql']),
    host: z.string(),
    port: z.number(),
    name: z.string(),
    username: z.string(),
    password: z.string(),
    ssl: z.boolean(),
    pool: z.object({
      min: z.number().min(1),
      max: z.number().min(1),
      acquireTimeoutMillis: z.number(),
      createTimeoutMillis: z.number(),
      destroyTimeoutMillis: z.number(),
      idleTimeoutMillis: z.number(),
      reapIntervalMillis: z.number(),
      createRetryIntervalMillis: z.number(),
    }),
  }),

  // Configurações de Cache (Redis)
  cache: z.object({
    host: z.string(),
    port: z.number(),
    password: z.string().optional(),
    db: z.number().min(0).max(15),
    ttl: z.number().min(1),
    maxMemory: z.string(),
    maxMemoryPolicy: z.enum(['allkeys-lru', 'volatile-lru', 'allkeys-random', 'volatile-random', 'volatile-ttl']),
  }),

  // Configurações de Upload e Storage
  storage: z.object({
    type: z.enum(['local', 's3', 'cloudinary']),
    local: z.object({
      path: z.string(),
      maxSize: z.number(),
      allowedTypes: z.array(z.string()),
    }).optional(),
    s3: z.object({
      bucket: z.string(),
      region: z.string(),
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
    }).optional(),
    cloudinary: z.object({
      cloudName: z.string(),
      apiKey: z.string(),
      apiSecret: z.string(),
    }).optional(),
  }),

  // Configurações de Email
  email: z.object({
    provider: z.enum(['smtp', 'sendgrid', 'mailgun', 'ses']),
    from: z.string().email(),
    smtp: z.object({
      host: z.string(),
      port: z.number(),
      secure: z.boolean(),
      auth: z.object({
        user: z.string(),
        pass: z.string(),
      }),
    }).optional(),
    sendgrid: z.object({
      apiKey: z.string(),
    }).optional(),
    mailgun: z.object({
      apiKey: z.string(),
      domain: z.string(),
    }).optional(),
    ses: z.object({
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
      region: z.string(),
    }).optional(),
  }),

  // Configurações de Pagamento
  payments: z.object({
    stripe: z.object({
      publishableKey: z.string(),
      secretKey: z.string(),
      webhookSecret: z.string(),
    }).optional(),
    pagseguro: z.object({
      email: z.string().email(),
      token: z.string(),
      appId: z.string(),
      appKey: z.string(),
    }).optional(),
    mercadopago: z.object({
      accessToken: z.string(),
      publicKey: z.string(),
    }).optional(),
  }),

  // Configurações de Segurança
  security: z.object({
    jwt: z.object({
      secret: z.string().min(32),
      expiresIn: z.string(),
      refreshExpiresIn: z.string(),
    }),
    bcrypt: z.object({
      rounds: z.number().min(10).max(14),
    }),
    rateLimit: z.object({
      windowMs: z.number(),
      max: z.number(),
      message: z.string(),
    }),
    helmet: z.object({
      contentSecurityPolicy: z.boolean(),
      hsts: z.boolean(),
      noSniff: z.boolean(),
      frameguard: z.boolean(),
    }),
  }),

  // Configurações de Logs
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']),
    format: z.enum(['json', 'simple']),
    transports: z.array(z.enum(['console', 'file', 'cloudwatch'])),
    file: z.object({
      filename: z.string(),
      maxSize: z.string(),
      maxFiles: z.number(),
    }).optional(),
    cloudwatch: z.object({
      logGroupName: z.string(),
      logStreamName: z.string(),
      awsRegion: z.string(),
      awsAccessKeyId: z.string(),
      awsSecretAccessKey: z.string(),
    }).optional(),
  }),

  // Configurações de Monitoramento
  monitoring: z.object({
    enabled: z.boolean(),
    metrics: z.object({
      collectDefault: z.boolean(),
      prefix: z.string(),
    }),
    health: z.object({
      path: z.string(),
      timeout: z.number(),
    }),
    uptime: z.object({
      enabled: z.boolean(),
      interval: z.number(),
    }),
  }),

  // Configurações de Performance
  performance: z.object({
    compression: z.boolean(),
    gzip: z.object({
      level: z.number().min(1).max(9),
      threshold: z.number(),
    }),
    cacheControl: z.object({
      static: z.string(),
      api: z.string(),
    }),
    clustering: z.object({
      enabled: z.boolean(),
      workers: z.number(),
    }),
  }),
});

export type ProductionConfig = z.infer<typeof ProductionConfigSchema>;

// Configuração padrão para VPS ICP MAX
export const defaultProductionConfig: ProductionConfig = {
  server: {
    host: process.env.SERVER_HOST || 'https://api.reserveiviagensrsv.com.br',
    port: parseInt(process.env.SERVER_PORT || '3000'),
    environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'production',
    ssl: true,
    cors: {
      origin: [
        'https://reserveiviagensrsv.com.br',
        'https://app.reserveiviagensrsv.com.br',
        'https://admin.reserveiviagensrsv.com.br',
        'https://cdn.reserveiviagensrsv.com.br'
      ],
      credentials: true,
    },
  },

  database: {
    type: (process.env.DB_TYPE as 'postgresql' | 'mysql') || 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'rsv_production',
    username: process.env.DB_USERNAME || 'rsv_user',
    password: process.env.DB_PASSWORD || '',
    ssl: true,
    pool: {
      min: 2,
      max: 10, // Otimizado para 24GB RAM
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
    },
  },

  cache: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    ttl: 3600, // 1 hora
    maxMemory: '2gb', // 2GB para Redis (8% da RAM total)
    maxMemoryPolicy: 'allkeys-lru',
  },

  storage: {
    type: (process.env.STORAGE_TYPE as 'local' | 's3' | 'cloudinary') || 'local',
    local: {
      path: process.env.STORAGE_LOCAL_PATH || '/var/www/rsv/storage',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    },
  },

  email: {
    provider: (process.env.EMAIL_PROVIDER as 'smtp' | 'sendgrid' | 'mailgun' | 'ses') || 'smtp',
    from: process.env.EMAIL_FROM || 'noreply@reserveiviagensrsv.com.br',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.reserveiviagensrsv.com.br',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
  },

  payments: {
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    pagseguro: {
      email: process.env.PAGSEGURO_EMAIL || '',
      token: process.env.PAGSEGURO_TOKEN || '',
      appId: process.env.PAGSEGURO_APP_ID || '',
      appKey: process.env.PAGSEGURO_APP_KEY || '',
    },
    mercadopago: {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
    },
  },

  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'rsv-super-secret-key-production-2025',
      expiresIn: '15m',
      refreshExpiresIn: '7d',
    },
    bcrypt: {
      rounds: 12,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // 100 requests por IP
      message: 'Muitas requisições deste IP, tente novamente mais tarde.',
    },
    helmet: {
      contentSecurityPolicy: true,
      hsts: true,
      noSniff: true,
      frameguard: true,
    },
  },

  logging: {
    level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
    format: 'json',
    transports: ['console', 'file'],
    file: {
      filename: '/var/log/rsv/app.log',
      maxSize: '20m',
      maxFiles: 14, // 2 semanas
    },
  },

  monitoring: {
    enabled: true,
    metrics: {
      collectDefault: true,
      prefix: 'rsv_',
    },
    health: {
      path: '/health',
      timeout: 5000,
    },
    uptime: {
      enabled: true,
      interval: 60000, // 1 minuto
    },
  },

  performance: {
    compression: true,
    gzip: {
      level: 6,
      threshold: 1024,
    },
    cacheControl: {
      static: 'public, max-age=31536000', // 1 ano
      api: 'public, max-age=300', // 5 minutos
    },
    clustering: {
      enabled: true,
      workers: 4, // 4 workers para 8 vCores
    },
  },
};

// Função para validar configuração
export function validateProductionConfig(config: unknown): ProductionConfig {
  try {
    return ProductionConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erro na validação da configuração de produção:', error.errors);
      throw new Error(`Configuração inválida: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Função para carregar configuração do ambiente
export function loadProductionConfig(): ProductionConfig {
  const config = {
    ...defaultProductionConfig,
    // Sobrescrever com variáveis de ambiente quando disponíveis
    server: {
      ...defaultProductionConfig.server,
      host: process.env.SERVER_HOST || defaultProductionConfig.server.host,
      port: parseInt(process.env.SERVER_PORT || defaultProductionConfig.server.port.toString()),
    },
    database: {
      ...defaultProductionConfig.database,
      host: process.env.DB_HOST || defaultProductionConfig.database.host,
      port: parseInt(process.env.DB_PORT || defaultProductionConfig.database.port.toString()),
      name: process.env.DB_NAME || defaultProductionConfig.database.name,
      username: process.env.DB_USERNAME || defaultProductionConfig.database.username,
      password: process.env.DB_PASSWORD || defaultProductionConfig.database.password,
    },
    // ... outras sobrescritas conforme necessário
  };

  return validateProductionConfig(config);
}

// Função para obter configuração específica por ambiente
export function getEnvironmentConfig(environment: 'development' | 'staging' | 'production'): Partial<ProductionConfig> {
  const baseConfig = loadProductionConfig();
  
  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        server: { ...baseConfig.server, environment: 'development' },
        logging: { ...baseConfig.logging, level: 'debug' },
        monitoring: { ...baseConfig.monitoring, enabled: false },
        performance: { ...baseConfig.performance, clustering: { ...baseConfig.performance.clustering, enabled: false } },
      };
    
    case 'staging':
      return {
        ...baseConfig,
        server: { ...baseConfig.server, environment: 'staging' },
        logging: { ...baseConfig.logging, level: 'info' },
        monitoring: { ...baseConfig.monitoring, enabled: true },
        performance: { ...baseConfig.performance, clustering: { ...baseConfig.performance.clustering, enabled: true, workers: 2 } },
      };
    
    case 'production':
      return baseConfig;
    
    default:
      return baseConfig;
  }
}

// Função para verificar se a configuração está pronta para produção
export function isProductionReady(config: ProductionConfig): boolean {
  const requiredFields = [
    config.database.password,
    config.security.jwt.secret,
    config.email.from,
  ];

  const hasRequiredFields = requiredFields.every(field => field && field.length > 0);
  const hasValidSSL = config.server.ssl;
  const hasValidCORS = config.server.cors.origin.length > 0;
  const hasValidDatabase = config.database.host && config.database.name;

  return hasRequiredFields && hasValidSSL && hasValidCORS && hasValidDatabase;
}

// Função para gerar relatório de configuração
export function generateConfigReport(config: ProductionConfig): string {
  const report = {
    server: {
      environment: config.server.environment,
      ssl: config.server.ssl ? '✅ Habilitado' : '❌ Desabilitado',
      cors: config.server.cors.origin.length > 0 ? '✅ Configurado' : '❌ Não configurado',
    },
    database: {
      type: config.database.type,
      host: config.database.host,
      ssl: config.database.ssl ? '✅ Habilitado' : '❌ Desabilitado',
      pool: `${config.database.pool.min}-${config.database.pool.max} conexões`,
    },
    security: {
      jwt: config.security.jwt.secret.length > 32 ? '✅ Seguro' : '❌ Inseguro',
      bcrypt: `${config.security.bcrypt.rounds} rounds`,
      rateLimit: `${config.security.rateLimit.max} req/${config.security.rateLimit.windowMs / 60000}min`,
    },
    performance: {
      compression: config.performance.compression ? '✅ Habilitado' : '❌ Desabilitado',
      clustering: config.performance.clustering.enabled ? `${config.performance.clustering.workers} workers` : '❌ Desabilitado',
    },
    monitoring: {
      enabled: config.monitoring.enabled ? '✅ Habilitado' : '❌ Desabilitado',
      health: config.monitoring.health.path,
    },
  };

  return JSON.stringify(report, null, 2);
}

export default {
  defaultProductionConfig,
  validateProductionConfig,
  loadProductionConfig,
  getEnvironmentConfig,
  isProductionReady,
  generateConfigReport,
};
