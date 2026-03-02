/**
 * Utilitário para retry de operações assíncronas
 */

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: any) => void;
  shouldRetry?: (error: any) => boolean;
}

const defaultOptions: Required<Omit<RetryOptions, 'onRetry' | 'shouldRetry'>> = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 'exponential',
};

/**
 * Executa uma função com retry automático
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Verificar se deve tentar novamente
      if (opts.shouldRetry && !opts.shouldRetry(error)) {
        throw error;
      }

      // Se não for a última tentativa, aguardar e tentar novamente
      if (attempt < opts.maxAttempts) {
        const delay = calculateDelay(attempt, opts.delay, opts.backoff);
        
        if (opts.onRetry) {
          opts.onRetry(attempt, error);
        }

        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Calcula o delay baseado no tipo de backoff
 */
function calculateDelay(attempt: number, baseDelay: number, backoff: 'linear' | 'exponential'): number {
  if (backoff === 'linear') {
    return baseDelay * attempt;
  } else {
    return baseDelay * Math.pow(2, attempt - 1);
  }
}

/**
 * Aguarda um período de tempo
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry com jitter (variação aleatória) para evitar thundering herd
 */
export async function retryWithJitter<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  
  return retry(fn, {
    ...opts,
    delay: opts.delay + Math.random() * opts.delay * 0.3, // Jitter de até 30%
  });
}

