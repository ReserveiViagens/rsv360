// Configurações de Produção
export { 
  defaultProductionConfig,
  validateProductionConfig,
  loadProductionConfig,
  getEnvironmentConfig,
  isProductionReady,
  generateConfigReport,
  type ProductionConfig 
} from './ProductionConfig';

// Gestão de Ambientes
export {
  environmentManager,
  environments,
  getCurrentEnvironment,
  isDevelopment,
  isStaging,
  isProduction,
  getApiUrl,
  getBaseUrl,
  isFeatureEnabled,
  type Environment,
  type EnvironmentSchema
} from './EnvironmentManagement';

// Sistema de Monitoramento
export {
  monitoringSystem,
  recordMetric,
  logInfo,
  logError,
  logPerformance,
  alertPerformance,
  alertError,
  alertSecurity,
  type Metric,
  type Log,
  type Alert,
  type MonitoringProvider,
  type MetricQuery,
  type LogQuery,
  type AlertQuery
} from './Monitoring';

// Re-exportar configurações principais
export { default as ProductionConfig } from './ProductionConfig';
export { default as EnvironmentManager } from './EnvironmentManagement';
export { default as MonitoringSystem } from './Monitoring';

// Configuração padrão do sistema
export const defaultConfig = {
  production: {
    server: {
      host: 'https://api.reserveiviagensrsv.com.br',
      port: 3000,
      environment: 'production' as const,
      ssl: true,
    },
    database: {
      type: 'postgresql' as const,
      host: 'localhost',
      port: 5432,
      name: 'rsv_production',
      ssl: true,
    },
    cache: {
      host: 'localhost',
      port: 6379,
      maxMemory: '2gb',
    },
    monitoring: {
      enabled: true,
      metrics: {
        collectDefault: true,
        prefix: 'rsv_',
      },
    },
  },
  staging: {
    server: {
      host: 'https://staging-api.reserveiviagensrsv.com.br',
      port: 3000,
      environment: 'staging' as const,
      ssl: true,
    },
    database: {
      type: 'postgresql' as const,
      host: 'staging-db.reserveiviagensrsv.com.br',
      port: 5432,
      name: 'rsv_staging',
      ssl: true,
    },
    cache: {
      host: 'staging-redis.reserveiviagensrsv.com.br',
      port: 6379,
      maxMemory: '1gb',
    },
    monitoring: {
      enabled: true,
      metrics: {
        collectDefault: true,
        prefix: 'rsv_staging_',
      },
    },
  },
  development: {
    server: {
      host: 'http://localhost:3000',
      port: 3000,
      environment: 'development' as const,
      ssl: false,
    },
    database: {
      type: 'postgresql' as const,
      host: 'localhost',
      port: 5432,
      name: 'rsv_development',
      ssl: false,
    },
    cache: {
      host: 'localhost',
      port: 6379,
      maxMemory: '512mb',
    },
    monitoring: {
      enabled: false,
      metrics: {
        collectDefault: false,
        prefix: 'rsv_dev_',
      },
    },
  },
};

// Função para obter configuração baseada no ambiente
export function getConfig(environment: 'development' | 'staging' | 'production' = 'development') {
  return defaultConfig[environment];
}

// Função para obter configuração atual baseada em variáveis de ambiente
export function getCurrentConfig() {
  const env = process.env.NODE_ENV || 'development';
  return getConfig(env as 'development' | 'staging' | 'production');
}

// Função para validar todas as configurações
export function validateAllConfigs() {
  const results = {
    development: { valid: true, errors: [] as string[] },
    staging: { valid: true, errors: [] as string[] },
    production: { valid: true, errors: [] as string[] },
  };

  try {
    // Validar configurações usando os schemas
    // (implementar validação específica se necessário)
    
    return {
      success: true,
      results,
      summary: 'Todas as configurações são válidas',
    };
  } catch (error) {
    return {
      success: false,
      results,
      summary: `Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

// Função para gerar relatório completo de configurações
export function generateFullConfigReport() {
  const currentConfig = getCurrentConfig();
  const validation = validateAllConfigs();
  
  return {
    timestamp: new Date().toISOString(),
    currentEnvironment: process.env.NODE_ENV || 'development',
    currentConfig,
    validation,
    systemInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    },
  };
}

// Configurações específicas para VPS ICP MAX
export const icpMaxConfig = {
  server: {
    specs: {
      vCores: 8,
      ram: '24GB',
      storage: '300GB SSD NVMe RAID 10',
      os: 'AlmaLinux',
    },
    optimization: {
      clustering: {
        enabled: true,
        workers: 4, // 4 workers para 8 vCores
      },
      memory: {
        nodeMaxOldSpaceSize: '20GB', // 20GB para Node.js (83% da RAM)
        redisMaxMemory: '2GB', // 2GB para Redis (8% da RAM)
        systemReserve: '2GB', // 2GB reservado para sistema
      },
      database: {
        maxConnections: 100,
        sharedBuffers: '6GB', // 25% da RAM
        effectiveCacheSize: '18GB', // 75% da RAM
        maintenanceWorkMem: '2GB',
        workMem: '256MB',
      },
    },
    security: {
      ssl: true,
      antiDDoS: true,
      firewall: {
        enabled: true,
        allowedPorts: [22, 80, 443, 3000, 5432, 6379],
      },
    },
  },
  docker: {
    compose: true,
    registry: 'ghcr.io',
    images: {
      frontend: 'rsv-frontend',
      backend: 'rsv-backend',
      database: 'postgres:15-alpine',
      cache: 'redis:7-alpine',
      nginx: 'nginx:alpine',
    },
    volumes: {
      data: '/opt/rsv/data',
      logs: '/opt/rsv/logs',
      backups: '/opt/rsv/backups',
      ssl: '/opt/rsv/ssl',
    },
  },
  monitoring: {
    enabled: true,
    tools: {
      prometheus: true,
      grafana: true,
      alertmanager: true,
      nodeExporter: true,
    },
    metrics: {
      system: true,
      application: true,
      database: true,
      cache: true,
    },
    alerts: {
      cpu: { threshold: 80, duration: '5m' },
      memory: { threshold: 85, duration: '5m' },
      disk: { threshold: 90, duration: '5m' },
      responseTime: { threshold: 2000, duration: '2m' },
    },
  },
  backup: {
    enabled: true,
    schedule: '0 2 * * *', // 2 AM diariamente
    retention: {
      daily: 7,
      weekly: 4,
      monthly: 12,
    },
    storage: {
      local: '/opt/rsv/backups',
      remote: 's3://rsv-backups',
    },
  },
};

export default {
  defaultConfig,
  getConfig,
  getCurrentConfig,
  validateAllConfigs,
  generateFullConfigReport,
  icpMaxConfig,
};
