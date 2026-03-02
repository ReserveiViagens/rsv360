/**
 * ✅ SERVIÇO DE LOGGING (SENTRY/LOGROCKET)
 * 
 * Integração com serviços de logging e monitoramento:
 * - Sentry para error tracking
 * - LogRocket para session replay
 * - Fallback para console logging
 */

interface LogLevel {
  error: 'error';
  warn: 'warn';
  info: 'info';
  debug: 'debug';
}

interface LogContext {
  userId?: number;
  userEmail?: string;
  requestId?: string;
  url?: string;
  method?: string;
  [key: string]: any;
}

class LoggingService {
  private sentryEnabled: boolean = false;
  private logRocketEnabled: boolean = false;
  private sentryDsn: string | null = null;
  private logRocketAppId: string | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Inicializar serviços de logging
   */
  private async initialize() {
    try {
      // Verificar se Sentry está configurado
      if (typeof window !== 'undefined') {
        // Client-side
        this.sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || null;
        this.logRocketAppId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || null;
      } else {
        // Server-side
        this.sentryDsn = process.env.SENTRY_DSN || null;
        this.logRocketAppId = process.env.LOGROCKET_APP_ID || null;
      }

      if (this.sentryDsn) {
        await this.initializeSentry();
      }

      if (this.logRocketAppId && typeof window !== 'undefined') {
        await this.initializeLogRocket();
      }
    } catch (error) {
      console.warn('Erro ao inicializar serviços de logging:', error);
    }
  }

  /**
   * Inicializar Sentry
   */
  private async initializeSentry() {
    try {
      if (typeof window !== 'undefined') {
        // Client-side Sentry
        const Sentry = await import('@sentry/nextjs');
        Sentry.init({
          dsn: this.sentryDsn!,
          environment: process.env.NODE_ENV || 'development',
          tracesSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        });
        this.sentryEnabled = true;
      } else {
        // Server-side Sentry
        const Sentry = await import('@sentry/nextjs');
        Sentry.init({
          dsn: this.sentryDsn!,
          environment: process.env.NODE_ENV || 'development',
          tracesSampleRate: 1.0,
        });
        this.sentryEnabled = true;
      }
    } catch (error) {
      console.warn('Sentry não disponível:', error);
    }
  }

  /**
   * Inicializar LogRocket
   */
  private async initializeLogRocket() {
    try {
      if (typeof window !== 'undefined' && this.logRocketAppId) {
        const LogRocket = await import('logrocket');
        LogRocket.init(this.logRocketAppId);
        this.logRocketEnabled = true;
      }
    } catch (error) {
      console.warn('LogRocket não disponível:', error);
    }
  }

  /**
   * Log de erro
   */
  async error(message: string, error?: Error | unknown, context?: LogContext) {
    const logData = {
      level: 'error' as const,
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      context,
      timestamp: new Date().toISOString(),
    };

    // Console (sempre)
    console.error('❌ ERROR:', logData);

    // Sentry
    if (this.sentryEnabled) {
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.captureException(error instanceof Error ? error : new Error(message), {
          tags: context,
          extra: { message, ...context },
        });
      } catch (err) {
        // Ignorar erros de importação
      }
    }

    // LogRocket
    if (this.logRocketEnabled && typeof window !== 'undefined') {
      try {
        const LogRocket = await import('logrocket');
        LogRocket.captureException(error instanceof Error ? error : new Error(message));
      } catch (err) {
        // Ignorar erros de importação
      }
    }

    // Salvar no banco (opcional)
    await this.saveLogToDatabase(logData);
  }

  /**
   * Log de aviso
   */
  async warn(message: string, context?: LogContext) {
    const logData = {
      level: 'warn' as const,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    console.warn('⚠️ WARN:', logData);

    if (this.sentryEnabled) {
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.captureMessage(message, {
          level: 'warning',
          tags: context,
        });
      } catch (err) {
        // Ignorar
      }
    }

    await this.saveLogToDatabase(logData);
  }

  /**
   * Log de informação
   */
  async info(message: string, context?: LogContext) {
    const logData = {
      level: 'info' as const,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    console.info('ℹ️ INFO:', logData);

    await this.saveLogToDatabase(logData);
  }

  /**
   * Log de debug
   */
  async debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'production') {
      return; // Não logar debug em produção
    }

    const logData = {
      level: 'debug' as const,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    console.debug('🔍 DEBUG:', logData);
  }

  /**
   * Identificar usuário (para Sentry/LogRocket)
   */
  async identifyUser(userId: number, email?: string, metadata?: Record<string, any>) {
    if (this.sentryEnabled) {
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.setUser({
          id: userId.toString(),
          email,
          ...metadata,
        });
      } catch (err) {
        // Ignorar
      }
    }

    if (this.logRocketEnabled && typeof window !== 'undefined') {
      try {
        const LogRocket = await import('logrocket');
        LogRocket.identify(userId.toString(), {
          email,
          ...metadata,
        });
      } catch (err) {
        // Ignorar
      }
    }
  }

  /**
   * Salvar log no banco de dados
   */
  private async saveLogToDatabase(logData: any) {
    try {
      // Apenas salvar erros e warnings em produção
      if (process.env.NODE_ENV === 'production' && logData.level !== 'error' && logData.level !== 'warn') {
        return;
      }

      const { queryDatabase } = await import('./db');
      
      await queryDatabase(
        `INSERT INTO application_logs 
         (level, message, error_data, context_data, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [
          logData.level,
          logData.message,
          logData.error ? JSON.stringify(logData.error) : null,
          logData.context ? JSON.stringify(logData.context) : null,
        ]
      );
    } catch (error) {
      // Não logar erros de logging para evitar loops
      console.error('Erro ao salvar log no banco:', error);
    }
  }

  /**
   * Capturar performance
   */
  async capturePerformance(name: string, duration: number, context?: LogContext) {
    if (this.sentryEnabled) {
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `${name}: ${duration}ms`,
          level: 'info',
          data: context,
        });
      } catch (err) {
        // Ignorar
      }
    }

    if (duration > 1000) {
      // Logar operações lentas
      await this.warn(`Operação lenta: ${name} levou ${duration}ms`, context);
    }
  }
}

// Singleton
export const loggingService = new LoggingService();

// Exportar funções de conveniência
export const logError = (message: string, error?: Error | unknown, context?: LogContext) =>
  loggingService.error(message, error, context);

export const logWarn = (message: string, context?: LogContext) =>
  loggingService.warn(message, context);

export const logInfo = (message: string, context?: LogContext) =>
  loggingService.info(message, context);

export const logDebug = (message: string, context?: LogContext) =>
  loggingService.debug(message, context);

export const identifyUser = (userId: number, email?: string, metadata?: Record<string, any>) =>
  loggingService.identifyUser(userId, email, metadata);

export const capturePerformance = (name: string, duration: number, context?: LogContext) =>
  loggingService.capturePerformance(name, duration, context);

