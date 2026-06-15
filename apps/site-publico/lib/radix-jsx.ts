import {
  createElement,
  type ComponentType,
  type FC,
  type ForwardRefExoticComponent,
  type ReactElement,
  type RefAttributes,
} from 'react';

/** Preserva tipo Radix para React 19 JSX (uso no export, não no corpo). */
export function asRadix<T>(component: T): T {
  return component as unknown as T;
}

/** Cast de export shadcn forwardRef com props explícitas do pacote Radix. */
export function radixUiExport<P, T extends HTMLElement>(
  component: FC<P & RefAttributes<T>>
): FC<P & RefAttributes<T>> {
  return asRadix(component);
}

/**
 * Root Radix consumido como JSX em páginas (React 19 TS2786).
 * createElement preserva props; não usar dentro de forwardRef.
 */
export function radixRoot(Component: any): any {
  const Root = (props: any) => createElement(Component, props);
  const named = Component as { displayName?: string };
  if (typeof named.displayName === 'string') {
    Root.displayName = named.displayName;
  }
  return Root;
}

/** createElement para primitivos Radix/leaflet (evita TS2786 interno). */
export function radixCreate(Component: any, props: any): ReactElement {
  return createElement(Component, props);
}
