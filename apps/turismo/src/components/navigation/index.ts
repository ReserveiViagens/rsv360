// Componentes de Navegação
export { Breadcrumbs } from './Breadcrumbs';
export { ErrorBoundary } from './ErrorBoundary';
export { NotFoundPage } from './NotFoundPage';
export { NavigationGuard } from './NavigationGuard';
export { NavigationMenu } from './NavigationMenu';
export { PageTransition, AutoPageTransition, usePageTransition } from './PageTransition';

// Configuração de Rotas
export { default as ROUTES, RouteUtils, PERMISSIONS } from './RouteConfig';

// Tipos
export type { BreadcrumbsProps, BreadcrumbItem } from './Breadcrumbs';
export type { ErrorBoundaryProps } from './ErrorBoundary';
export type { NotFoundPageProps } from './NotFoundPage';
export type { NavigationGuardProps, RouteConfig, Permission } from './NavigationGuard';
export type { NavigationMenuProps } from './NavigationMenu';
export type { PageTransitionProps } from './PageTransition';
export type { 
  RouteMetadata, 
  BreadcrumbConfig, 
  ExtendedRouteConfig 
} from './RouteConfig';
