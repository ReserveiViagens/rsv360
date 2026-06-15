import {
  createElement,
  type ComponentProps,
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
export function radixRoot<P>(Component: ComponentType<P>): (props: P) => ReactElement {
  const Root = (props: P) => createElement(Component, props);
  if ('displayName' in Component && typeof Component.displayName === 'string') {
    Root.displayName = Component.displayName;
  }
  return Root;
}

/** react-leaflet / primitivos em módulos dedicados (ex.: leaflet-ui). */
export function radixCreate<P>(Component: ComponentType<P>, props: P) {
  return createElement(Component, props);
}
