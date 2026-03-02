/**
 * ✅ TRATAMENTO DE ERROS CENTRALIZADO
 * 
 * Sistema robusto de tratamento de erros com:
 * - Logging estruturado
 * - Categorização de erros
 * - Mensagens amigáveis
 * - Stack traces em desenvolvimento
 */

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  FILE_UPLOAD = 'FILE_UPLOAD',
  PAYMENT = 'PAYMENT',
  RATE_LIMIT = 'RATE_LIMIT',
  INTERNAL = 'INTERNAL',
}

export interface AppError extends Error {
  category: ErrorCategory;
  statusCode: number;
  userMessage: string;
  details?: any;
  timestamp: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.INTERNAL,
    statusCode: number = 500,
    userMessage?: string,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.category = category;
    this.statusCode = statusCode;
    this.userMessage = userMessage || this.getDefaultUserMessage(category);
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Manter stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  private getDefaultUserMessage(category: ErrorCategory): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.VALIDATION]: 'Os dados fornecidos são inválidos. Por favor, verifique e tente novamente.',
      [ErrorCategory.AUTHENTICATION]: 'Você precisa estar autenticado para realizar esta ação.',
      [ErrorCategory.AUTHORIZATION]: 'Você não tem permissão para realizar esta ação.',
      [ErrorCategory.NOT_FOUND]: 'O recurso solicitado não foi encontrado.',
      [ErrorCategory.DATABASE]: 'Erro ao processar dados. Por favor, tente novamente mais tarde.',
      [ErrorCategory.EXTERNAL_API]: 'Erro ao comunicar com serviço externo. Por favor, tente novamente.',
      [ErrorCategory.FILE_UPLOAD]: 'Erro ao fazer upload do arquivo. Verifique o tamanho e formato.',
      [ErrorCategory.PAYMENT]: 'Erro ao processar pagamento. Por favor, verifique os dados e tente novamente.',
      [ErrorCategory.RATE_LIMIT]: 'Muitas tentativas. Por favor, aguarde um momento e tente novamente.',
      [ErrorCategory.INTERNAL]: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
    };
    return messages[category] || messages[ErrorCategory.INTERNAL];
  }
}

/**
 * Criar erro de validação
 */
export function createValidationError(message: string, details?: any): AppError {
  return new AppError(message, ErrorCategory.VALIDATION, 400, undefined, details);
}

/**
 * Criar erro de autenticação
 */
export function createAuthError(message: string = 'Não autenticado'): AppError {
  return new AppError(message, ErrorCategory.AUTHENTICATION, 401);
}

/**
 * Criar erro de autorização
 */
export function createAuthorizationError(message: string = 'Acesso negado'): AppError {
  return new AppError(message, ErrorCategory.AUTHORIZATION, 403);
}

/**
 * Criar erro de não encontrado
 */
export function createNotFoundError(resource: string = 'Recurso'): AppError {
  return new AppError(`${resource} não encontrado`, ErrorCategory.NOT_FOUND, 404);
}

/**
 * Criar erro de banco de dados
 */
export function createDatabaseError(message: string, details?: any): AppError {
  return new AppError(message, ErrorCategory.DATABASE, 500, undefined, details);
}

/**
 * Criar erro de rate limit
 */
export function createRateLimitError(retryAfter?: number): AppError {
  const message = retryAfter
    ? `Muitas tentativas. Tente novamente em ${retryAfter} segundos.`
    : 'Muitas tentativas. Por favor, aguarde um momento.';
  return new AppError('Rate limit exceeded', ErrorCategory.RATE_LIMIT, 429, message, { retryAfter });
}

/**
 * Tratar erro e retornar resposta formatada
 */
export function handleError(error: unknown): {
  success: false;
  error: string;
  userMessage: string;
  category: ErrorCategory;
  statusCode: number;
  details?: any;
} {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      userMessage: error.userMessage,
      category: error.category,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    // Log erro não tratado
    console.error('Erro não tratado:', error);
    return {
      success: false,
      error: error.message,
      userMessage: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
      category: ErrorCategory.INTERNAL,
      statusCode: 500,
    };
  }

  // Erro desconhecido
  console.error('Erro desconhecido:', error);
  return {
    success: false,
    error: 'Erro desconhecido',
    userMessage: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
    category: ErrorCategory.INTERNAL,
    statusCode: 500,
  };
}

/**
 * Log de erro estruturado
 */
export async function logError(error: AppError, context?: any) {
  const logData = {
    timestamp: error.timestamp,
    category: error.category,
    message: error.message,
    userMessage: error.userMessage,
    statusCode: error.statusCode,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    context,
    details: error.details,
  };

  if (error.statusCode >= 500) {
    console.error('❌ ERRO INTERNO:', logData);
  } else {
    console.warn('⚠️ ERRO CLIENTE:', logData);
  }

  // ✅ IMPLEMENTAÇÃO REAL: Enviar para serviço de logging
  try {
    const { logError: logToService } = await import('./logging-service');
    await logToService(error.message || 'Erro desconhecido', error, {
      userId: context?.userId,
      userEmail: context?.userEmail,
      requestId: context?.requestId,
      url: context?.url,
      method: context?.method,
      ...context,
    });
  } catch (loggingError) {
    // Ignorar erros de logging para evitar loops
  }
}

