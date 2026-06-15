import type { ComponentType } from 'react';

/** Radix ForwardRef + React 19 JSX (T0.20a site-publico). */
export function asRadixComponent<T extends ComponentType<any>>(component: T): T {
  return component as unknown as T;
}
