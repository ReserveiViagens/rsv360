import { z } from 'zod';

// Schema para configurações de ambiente
export const EnvironmentSchema = z.object({
  name: z.enum(['development', 'staging', 'production']),
  description: z.string(),
  domain: z.string().url(),
  apiUrl: z.string().url(),
  database: z.object({
    host: z.string(),
    port: z.number(),
    name: z.string(),
    ssl: z.boolean(),
  }),
  features: z.object({
    debug: z.boolean(),
    analytics: z.boolean(),
    monitoring: z.boolean(),
    caching: z.boolean(),
    compression: z.boolean(),
  }),
  limits: z.object({
    maxUploadSize: z.number(),
    rateLimit: z.number(),
    sessionTimeout: z.number(),
  }),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

// Configurações dos ambientes
export const environments: Record<string, Environment> = {
  development: {
    name: 'development',
    description: 'Ambiente de desenvolvimento local',
    domain: 'http://localhost:3000',
    apiUrl: 'http://localhost:3001',
    database: {
      host: 'localhost',
      port: 5432,
      name: 'rsv_development',
      ssl: false,
    },
    features: {
      debug: true,
      analytics: false,
      monitoring: false,
      caching: false,
      compression: false,
    },
    limits: {
      maxUploadSize: 5 * 1024 * 1024, // 5MB
      rateLimit: 1000,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    },
  },

  staging: {
    name: 'staging',
    description: 'Ambiente de homologação e testes',
    domain: 'https://staging.reserveiviagensrsv.com.br',
    apiUrl: 'https://staging-api.reserveiviagensrsv.com.br',
    database: {
      host: process.env.STAGING_DB_HOST || 'staging-db.reserveiviagensrsv.com.br',
      port: parseInt(process.env.STAGING_DB_PORT || '5432'),
      name: 'rsv_staging',
      ssl: true,
    },
    features: {
      debug: false,
      analytics: true,
      monitoring: true,
      caching: true,
      compression: true,
    },
    limits: {
      maxUploadSize: 10 * 1024 * 1024, // 10MB
      rateLimit: 500,
      sessionTimeout: 12 * 60 * 60 * 1000, // 12 horas
    },
  },

  production: {
    name: 'production',
    description: 'Ambiente de produção - VPS ICP MAX',
    domain: 'https://reserveiviagensrsv.com.br',
    apiUrl: 'https://api.reserveiviagensrsv.com.br',
    database: {
      host: process.env.PRODUCTION_DB_HOST || 'localhost',
      port: parseInt(process.env.PRODUCTION_DB_PORT || '5432'),
      name: 'rsv_production',
      ssl: true,
    },
    features: {
      debug: false,
      analytics: true,
      monitoring: true,
      caching: true,
      compression: true,
    },
    limits: {
      maxUploadSize: 10 * 1024 * 1024, // 10MB
      rateLimit: 100,
      sessionTimeout: 8 * 60 * 60 * 1000, // 8 horas
    },
  },
};

// Classe para gerenciar ambientes
export class EnvironmentManager {
  private currentEnvironment: Environment;
  private environmentConfigs: Record<string, Environment>;

  constructor(environmentName: string = 'development') {
    this.environmentConfigs = environments;
    this.currentEnvironment = this.getEnvironment(environmentName);
  }

  // Obter configuração de um ambiente específico
  getEnvironment(name: string): Environment {
    const env = this.environmentConfigs[name];
    if (!env) {
      throw new Error(`Ambiente '${name}' não encontrado`);
    }
    return env;
  }

  // Obter ambiente atual
  getCurrentEnvironment(): Environment {
    return this.currentEnvironment;
  }

  // Alterar ambiente atual
  setEnvironment(name: string): void {
    this.currentEnvironment = this.getEnvironment(name);
    console.log(`🔄 Ambiente alterado para: ${this.currentEnvironment.name}`);
  }

  // Obter URL base do ambiente atual
  getBaseUrl(): string {
    return this.currentEnvironment.domain;
  }

  // Obter URL da API do ambiente atual
  getApiUrl(): string {
    return this.currentEnvironment.apiUrl;
  }

  // Verificar se está em desenvolvimento
  isDevelopment(): boolean {
    return this.currentEnvironment.name === 'development';
  }

  // Verificar se está em staging
  isStaging(): boolean {
    return this.currentEnvironment.name === 'staging';
  }

  // Verificar se está em produção
  isProduction(): boolean {
    return this.currentEnvironment.name === 'production';
  }

  // Obter configurações de features
  getFeatures() {
    return this.currentEnvironment.features;
  }

  // Obter limites do ambiente
  getLimits() {
    return this.currentEnvironment.limits;
  }

  // Verificar se uma feature está habilitada
  isFeatureEnabled(feature: keyof Environment['features']): boolean {
    return this.currentEnvironment.features[feature];
  }

  // Obter configuração de banco de dados
  getDatabaseConfig() {
    return this.currentEnvironment.database;
  }

  // Validar configuração do ambiente
  validateEnvironment(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      EnvironmentSchema.parse(this.currentEnvironment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      }
    }

    // Validações adicionais específicas
    if (this.isProduction()) {
      if (!this.currentEnvironment.database.ssl) {
        errors.push('SSL deve estar habilitado em produção');
      }
      if (this.currentEnvironment.features.debug) {
        errors.push('Debug não deve estar habilitado em produção');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Gerar relatório do ambiente
  generateEnvironmentReport(): string {
    const env = this.currentEnvironment;
    const validation = this.validateEnvironment();
    
    const report = {
      ambiente: env.name,
      descricao: env.description,
      dominio: env.domain,
      apiUrl: env.apiUrl,
      database: {
        host: env.database.host,
        port: env.database.port,
        name: env.database.name,
        ssl: env.database.ssl ? '✅ Habilitado' : '❌ Desabilitado',
      },
      features: {
        debug: env.features.debug ? '✅ Habilitado' : '❌ Desabilitado',
        analytics: env.features.analytics ? '✅ Habilitado' : '❌ Desabilitado',
        monitoring: env.features.monitoring ? '✅ Habilitado' : '❌ Desabilitado',
        caching: env.features.caching ? '✅ Habilitado' : '❌ Desabilitado',
        compression: env.features.compression ? '✅ Habilitado' : '❌ Desabilitado',
      },
      limites: {
        maxUploadSize: `${(env.limits.maxUploadSize / (1024 * 1024)).toFixed(1)}MB`,
        rateLimit: `${env.limits.rateLimit} req/min`,
        sessionTimeout: `${(env.limits.sessionTimeout / (60 * 60 * 1000)).toFixed(1)}h`,
      },
      validacao: {
        valido: validation.isValid ? '✅ Sim' : '❌ Não',
        erros: validation.errors.length > 0 ? validation.errors : ['Nenhum erro encontrado'],
      },
    };

    return JSON.stringify(report, null, 2);
  }

  // Obter variáveis de ambiente específicas
  getEnvironmentVariables(): Record<string, string> {
    const env = this.currentEnvironment;
    
    return {
      NODE_ENV: env.name,
      REACT_APP_ENVIRONMENT: env.name,
      REACT_APP_API_URL: env.apiUrl,
      REACT_APP_DOMAIN: env.domain,
      REACT_APP_DEBUG: env.features.debug.toString(),
      REACT_APP_ANALYTICS: env.features.analytics.toString(),
      REACT_APP_MONITORING: env.features.monitoring.toString(),
      REACT_APP_CACHING: env.features.caching.toString(),
      REACT_APP_COMPRESSION: env.features.compression.toString(),
      REACT_APP_MAX_UPLOAD_SIZE: env.limits.maxUploadSize.toString(),
      REACT_APP_RATE_LIMIT: env.limits.rateLimit.toString(),
      REACT_APP_SESSION_TIMEOUT: env.limits.sessionTimeout.toString(),
    };
  }

  // Aplicar configurações do ambiente
  applyEnvironmentConfig(): void {
    const envVars = this.getEnvironmentVariables();
    
    // Aplicar variáveis de ambiente
    Object.entries(envVars).forEach(([key, value]) => {
      if (typeof window !== 'undefined') {
        // Frontend - definir no window object
        (window as any)[key] = value;
      } else {
        // Backend - definir no process.env
        process.env[key] = value;
      }
    });

    console.log(`✅ Configurações do ambiente '${this.currentEnvironment.name}' aplicadas`);
  }

  // Verificar compatibilidade entre ambientes
  checkEnvironmentCompatibility(sourceEnv: string, targetEnv: string): {
    compatible: boolean;
    warnings: string[];
    errors: string[];
  } {
    const source = this.getEnvironment(sourceEnv);
    const target = this.getEnvironment(targetEnv);
    
    const warnings: string[] = [];
    const errors: string[] = [];

    // Verificar compatibilidade de features
    Object.entries(source.features).forEach(([feature, enabled]) => {
      if (enabled && !target.features[feature as keyof Environment['features']]) {
        warnings.push(`Feature '${feature}' habilitada em ${sourceEnv} mas não disponível em ${targetEnv}`);
      }
    });

    // Verificar compatibilidade de limites
    if (source.limits.maxUploadSize > target.limits.maxUploadSize) {
      errors.push(`Tamanho máximo de upload em ${sourceEnv} (${source.limits.maxUploadSize}) excede o limite de ${targetEnv} (${target.limits.maxUploadSize})`);
    }

    if (source.limits.rateLimit > target.limits.rateLimit) {
      warnings.push(`Rate limit em ${sourceEnv} (${source.limits.rateLimit}) excede o limite de ${targetEnv} (${target.limits.rateLimit})`);
    }

    // Verificar SSL
    if (source.database.ssl && !target.database.ssl) {
      warnings.push(`SSL habilitado em ${sourceEnv} mas não disponível em ${targetEnv}`);
    }

    return {
      compatible: errors.length === 0,
      warnings,
      errors,
    };
  }

  // Migrar configurações entre ambientes
  migrateEnvironmentConfig(sourceEnv: string, targetEnv: string): {
    success: boolean;
    migrated: string[];
    warnings: string[];
    errors: string[];
  } {
    const compatibility = this.checkEnvironmentCompatibility(sourceEnv, targetEnv);
    
    if (!compatibility.compatible) {
      return {
        success: false,
        migrated: [],
        warnings: compatibility.warnings,
        errors: compatibility.errors,
      };
    }

    const source = this.getEnvironment(sourceEnv);
    const target = this.getEnvironment(targetEnv);
    const migrated: string[] = [];

    // Migrar configurações compatíveis
    Object.entries(source.features).forEach(([feature, enabled]) => {
      if (enabled && target.features[feature as keyof Environment['features']]) {
        migrated.push(`Feature: ${feature}`);
      }
    });

    // Migrar configurações de banco
    if (source.database.ssl === target.database.ssl) {
      migrated.push('Database SSL config');
    }

    return {
      success: true,
      migrated,
      warnings: compatibility.warnings,
      errors: [],
    };
  }
}

// Instância singleton do gerenciador de ambientes
export const environmentManager = new EnvironmentManager(
  process.env.NODE_ENV || 'development'
);

// Funções utilitárias para uso direto
export function getCurrentEnvironment(): Environment {
  return environmentManager.getCurrentEnvironment();
}

export function isDevelopment(): boolean {
  return environmentManager.isDevelopment();
}

export function isStaging(): boolean {
  return environmentManager.isStaging();
}

export function isProduction(): boolean {
  return environmentManager.isProduction();
}

export function getApiUrl(): string {
  return environmentManager.getApiUrl();
}

export function getBaseUrl(): string {
  return environmentManager.getBaseUrl();
}

export function isFeatureEnabled(feature: keyof Environment['features']): boolean {
  return environmentManager.isFeatureEnabled(feature);
}

export default environmentManager;
