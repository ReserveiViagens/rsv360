import { RouteConfig, Permission } from './NavigationGuard';

export interface RouteMetadata {
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  isAdmin?: boolean;
  order?: number;
}

export interface BreadcrumbConfig {
  label: string;
  href?: string;
  icon?: string;
  isActive?: boolean;
}

export interface ExtendedRouteConfig extends RouteConfig {
  metadata: RouteMetadata;
  breadcrumbs?: BreadcrumbConfig[];
  children?: ExtendedRouteConfig[];
  parent?: string;
}

// Definição das permissões do sistema
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD: {
    VIEW: { resource: 'dashboard', action: 'view' },
    EXPORT: { resource: 'dashboard', action: 'export' }
  },
  
  // Reservas
  BOOKINGS: {
    VIEW: { resource: 'bookings', action: 'view' },
    CREATE: { resource: 'bookings', action: 'create' },
    EDIT: { resource: 'bookings', action: 'edit' },
    DELETE: { resource: 'bookings', action: 'delete' },
    APPROVE: { resource: 'bookings', action: 'approve' }
  },
  
  // Clientes
  CUSTOMERS: {
    VIEW: { resource: 'customers', action: 'view' },
    CREATE: { resource: 'customers', action: 'create' },
    EDIT: { resource: 'customers', action: 'edit' },
    DELETE: { resource: 'customers', action: 'delete' },
    EXPORT: { resource: 'customers', action: 'export' }
  },
  
  // Relatórios
  REPORTS: {
    VIEW: { resource: 'reports', action: 'view' },
    CREATE: { resource: 'reports', action: 'create' },
    EXPORT: { resource: 'reports', action: 'export' },
    SCHEDULE: { resource: 'reports', action: 'schedule' }
  },
  
  // Pagamentos
  PAYMENTS: {
    VIEW: { resource: 'payments', action: 'view' },
    PROCESS: { resource: 'payments', action: 'process' },
    REFUND: { resource: 'payments', action: 'refund' },
    EXPORT: { resource: 'payments', action: 'export' }
  },
  
  // Marketing
  MARKETING: {
    VIEW: { resource: 'marketing', action: 'view' },
    CREATE_CAMPAIGN: { resource: 'marketing', action: 'create_campaign' },
    SEND_EMAIL: { resource: 'marketing', action: 'send_email' },
    EXPORT_LEADS: { resource: 'marketing', action: 'export_leads' }
  },
  
  // Configurações
  SETTINGS: {
    VIEW: { resource: 'settings', action: 'view' },
    EDIT: { resource: 'settings', action: 'edit' },
    ADMIN: { resource: 'settings', action: 'admin' }
  }
} as const;

// Configuração das rotas do sistema
export const ROUTES: ExtendedRouteConfig[] = [
  {
    path: '/',
    metadata: {
      title: 'Dashboard',
      description: 'Visão geral do sistema',
      icon: 'BarChart3',
      category: 'main',
      order: 1
    },
    breadcrumbs: [
      { label: 'Dashboard', href: '/', isActive: true }
    ]
  },
  
  {
    path: '/bookings',
    metadata: {
      title: 'Reservas',
      description: 'Gestão de reservas e agendamentos',
      icon: 'Calendar',
      category: 'operations',
      order: 2
    },
    requiresAuth: true,
    permissions: [PERMISSIONS.BOOKINGS.VIEW],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Reservas', href: '/bookings', isActive: true }
    ],
    children: [
      {
        path: '/bookings/new',
        metadata: {
          title: 'Nova Reserva',
          description: 'Criar nova reserva',
          icon: 'Plus',
          category: 'operations'
        },
        requiresAuth: true,
        permissions: [PERMISSIONS.BOOKINGS.CREATE],
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'Reservas', href: '/bookings' },
          { label: 'Nova Reserva', href: '/bookings/new', isActive: true }
        ]
      },
      {
        path: '/bookings/:id',
        metadata: {
          title: 'Detalhes da Reserva',
          description: 'Visualizar e editar reserva',
          icon: 'FileText',
          category: 'operations'
        },
        requiresAuth: true,
        permissions: [PERMISSIONS.BOOKINGS.VIEW],
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'Reservas', href: '/bookings' },
          { label: 'Detalhes', href: '/bookings/:id', isActive: true }
        ]
      }
    ]
  },
  
  {
    path: '/customers',
    metadata: {
      title: 'Clientes',
      description: 'Gestão de clientes e perfis',
      icon: 'Users',
      category: 'operations',
      order: 3
    },
    requiresAuth: true,
    permissions: [PERMISSIONS.CUSTOMERS.VIEW],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Clientes', href: '/customers', isActive: true }
    ],
    children: [
      {
        path: '/customers/new',
        metadata: {
          title: 'Novo Cliente',
          description: 'Cadastrar novo cliente',
          icon: 'UserPlus',
          category: 'operations'
        },
        requiresAuth: true,
        permissions: [PERMISSIONS.CUSTOMERS.CREATE],
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'Clientes', href: '/customers' },
          { label: 'Novo Cliente', href: '/customers/new', isActive: true }
        ]
      }
    ]
  },
  
  {
    path: '/reports',
    metadata: {
      title: 'Relatórios',
      description: 'Analytics e relatórios do sistema',
      icon: 'BarChart3',
      category: 'analytics',
      order: 4
    },
    requiresAuth: true,
    permissions: [PERMISSIONS.REPORTS.VIEW],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Relatórios', href: '/reports', isActive: true }
    ]
  },
  
  {
    path: '/payments',
    metadata: {
      title: 'Pagamentos',
      description: 'Gestão de pagamentos e transações',
      icon: 'CreditCard',
      category: 'finance',
      order: 5
    },
    requiresAuth: true,
    permissions: [PERMISSIONS.PAYMENTS.VIEW],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Pagamentos', href: '/payments', isActive: true }
    ]
  },
  
  {
    path: '/marketing',
    metadata: {
      title: 'Marketing',
      description: 'Campanhas e automação de marketing',
      icon: 'Megaphone',
      category: 'marketing',
      order: 6
    },
    requiresAuth: true,
    permissions: [PERMISSIONS.MARKETING.VIEW],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Marketing', href: '/marketing', isActive: true }
    ]
  },
  
  {
    path: '/settings',
    metadata: {
      title: 'Configurações',
      description: 'Configurações do sistema e usuário',
      icon: 'Settings',
      category: 'system',
      order: 7
    },
    requiresAuth: true,
    permissions: [PERMISSIONS.SETTINGS.VIEW],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Configurações', href: '/settings', isActive: true }
    ]
  }
];

// Funções utilitárias para roteamento
export const RouteUtils = {
  // Encontrar rota por path
  findRouteByPath: (path: string): ExtendedRouteConfig | undefined => {
    const findRoute = (routes: ExtendedRouteConfig[]): ExtendedRouteConfig | undefined => {
      for (const route of routes) {
        if (route.path === path) return route;
        if (route.children) {
          const childRoute = findRoute(route.children);
          if (childRoute) return childRoute;
        }
      }
      return undefined;
    };
    
    return findRoute(ROUTES);
  },
  
  // Gerar breadcrumbs para uma rota
  generateBreadcrumbs: (path: string): BreadcrumbConfig[] => {
    const route = RouteUtils.findRouteByPath(path);
    return route?.breadcrumbs || [];
  },
  
  // Verificar se usuário tem permissão para rota
  hasPermission: (route: ExtendedRouteConfig, userPermissions: Permission[]): boolean => {
    if (!route.permissions || route.permissions.length === 0) return true;
    
    return route.permissions.every(permission =>
      userPermissions.some(userPerm =>
        userPerm.resource === permission.resource &&
        userPerm.action === permission.action
      )
    );
  },
  
  // Obter rotas por categoria
  getRoutesByCategory: (category: string): ExtendedRouteConfig[] => {
    return ROUTES.filter(route => route.metadata.category === category);
  },
  
  // Obter rotas públicas
  getPublicRoutes: (): ExtendedRouteConfig[] => {
    return ROUTES.filter(route => route.metadata.isPublic);
  },
  
  // Obter rotas que requerem autenticação
  getProtectedRoutes: (): ExtendedRouteConfig[] => {
    return ROUTES.filter(route => route.requiresAuth);
  }
};

export default ROUTES;
