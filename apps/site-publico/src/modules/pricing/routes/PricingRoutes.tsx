import React from 'react';

// Componentes serão importados sob demanda
const PricingDashboard = React.lazy(() => import('../pages/PricingDashboard'));
const PricingRules = React.lazy(() => import('../pages/PricingRules'));
const PriceCalendar = React.lazy(() => import('../pages/PriceCalendar'));
const SeasonsManager = React.lazy(() => import('../pages/SeasonsManager'));
const CompetitorsView = React.lazy(() => import('../pages/CompetitorsView'));
const RateComparison = React.lazy(() => import('../pages/RateComparison'));
const PricingAlerts = React.lazy(() => import('../pages/PricingAlerts'));

// Definição das rotas do módulo Pricing
export interface PricingRoute {
  path: string;
  component: React.ComponentType;
  title: string;
  description: string;
  icon?: string;
  requiresAuth?: boolean;
  roles?: string[];
}

export const pricingRoutes: PricingRoute[] = [
  {
    path: '/pricing/dashboard',
    component: PricingDashboard,
    title: 'Dashboard de Preços',
    description: 'Visão geral das métricas de pricing e performance',
    icon: 'BarChart3',
    requiresAuth: true,
    roles: ['admin', 'manager', 'pricing_manager']
  },
  {
    path: '/pricing/rules',
    component: PricingRules,
    title: 'Regras de Preço',
    description: 'Gerenciamento de regras de precificação dinâmica',
    icon: 'Settings',
    requiresAuth: true,
    roles: ['admin', 'pricing_manager']
  },
  {
    path: '/pricing/calendar',
    component: PriceCalendar,
    title: 'Calendário de Preços',
    description: 'Visualização e edição de preços por data',
    icon: 'Calendar',
    requiresAuth: true,
    roles: ['admin', 'manager', 'pricing_manager']
  },
  {
    path: '/pricing/seasons',
    component: SeasonsManager,
    title: 'Gerenciador de Temporadas',
    description: 'Configuração de períodos sazonais e multiplicadores',
    icon: 'Sun',
    requiresAuth: true,
    roles: ['admin', 'pricing_manager']
  },
  {
    path: '/pricing/competitors',
    component: CompetitorsView,
    title: 'Concorrentes',
    description: 'Monitoramento de preços dos concorrentes',
    icon: 'Users',
    requiresAuth: true,
    roles: ['admin', 'manager', 'pricing_manager']
  },
  {
    path: '/pricing/comparison',
    component: RateComparison,
    title: 'Comparação de Tarifas',
    description: 'Análise comparativa de preços e paridade',
    icon: 'TrendingUp',
    requiresAuth: true,
    roles: ['admin', 'manager', 'pricing_manager']
  },
  {
    path: '/pricing/alerts',
    component: PricingAlerts,
    title: 'Alertas de Preço',
    description: 'Gerenciamento de alertas e notificações de pricing',
    icon: 'AlertTriangle',
    requiresAuth: true,
    roles: ['admin', 'manager', 'pricing_manager']
  }
];

// Rota padrão (dashboard)
export const defaultPricingRoute = pricingRoutes[0];

// Função utilitária para encontrar rota por path
export const findPricingRoute = (path: string): PricingRoute | undefined => {
  return pricingRoutes.find(route => route.path === path);
};

// Função para verificar se usuário tem acesso à rota
export const hasRouteAccess = (route: PricingRoute, userRoles: string[] = []): boolean => {
  if (!route.requiresAuth) return true;
  if (!route.roles || route.roles.length === 0) return true;
  return route.roles.some(role => userRoles.includes(role));
};

// Exportações para uso em roteadores
export { PricingDashboard, PricingRules, PriceCalendar, SeasonsManager, CompetitorsView, RateComparison, PricingAlerts };