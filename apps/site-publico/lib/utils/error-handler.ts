/**
 * Utilitários para tratamento de erros
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export class AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;

  constructor(message: string, code?: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Trata erros de API e retorna mensagem amigável
 */
export function handleApiError(error: any): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error.response) {
    // Erro de resposta HTTP
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return data?.message || 'Dados inválidos. Verifique os campos e tente novamente.';
      case 401:
        return 'Você precisa fazer login para continuar.';
      case 403:
        return 'Você não tem permissão para realizar esta ação.';
      case 404:
        return 'Recurso não encontrado.';
      case 409:
        return data?.message || 'Conflito. Este recurso já existe.';
      case 422:
        return data?.message || 'Dados inválidos. Verifique os campos.';
      case 429:
        return 'Muitas tentativas. Aguarde um momento e tente novamente.';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      case 503:
        return 'Serviço temporariamente indisponível. Tente novamente mais tarde.';
      default:
        return data?.message || `Erro ${status}. Tente novamente.`;
    }
  }

  if (error.request) {
    // Erro de rede
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  // Erro genérico
  return error.message || 'Ocorreu um erro inesperado. Tente novamente.';
}

/**
 * Loga erro no console (desenvolvimento) ou serviço de monitoramento (produção)
 */
export function logError(error: any, context?: string) {
  const errorInfo = {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erro:', errorInfo);
  } else {
    // Em produção, enviar para serviço de monitoramento (Sentry, LogRocket, etc.)
    // Exemplo: Sentry.captureException(error, { extra: errorInfo });
    console.error('Erro:', errorInfo);
  }
}

/**
 * Valida se um erro é recuperável
 */
export function isRecoverableError(error: any): boolean {
  if (error instanceof AppError) {
    return error.statusCode ? error.statusCode < 500 : true;
  }

  if (error.response) {
    return error.response.status < 500;
  }

  // Erros de rede são geralmente recuperáveis
  return error.request !== undefined;
}

