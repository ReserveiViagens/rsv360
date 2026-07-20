/**
 * Ambient types for opossum circuit breaker.
 * Types only the surface used by server/modules/fornecedores-hub/breaker.ts.
 */
declare module 'opossum' {
  export interface CircuitBreakerOptions {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    volumeThreshold?: number;
  }

  export default class CircuitBreaker<
    TArgs extends unknown[] = unknown[],
    TReturn = unknown,
  > {
    constructor(
      action: (...args: TArgs) => Promise<TReturn>,
      options?: CircuitBreakerOptions,
    );
    fallback(fn: (...args: TArgs) => TReturn | Promise<TReturn>): void;
    on(event: string, listener: (...args: unknown[]) => void): void;
    fire(...args: TArgs): Promise<TReturn>;
  }
}
