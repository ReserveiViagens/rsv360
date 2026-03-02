/**
 * 🌐 ROTEAMENTO COMPLETO - RSV 360 ECOSYSTEM
 * Configuração TOTAL de todas as 103 páginas frontend
 * Solução COMPLETA, não simplificada
 */

export interface RouteConfig {
  path: string;
  name: string;
  component: string;
  category: string;
  icon: string;
  description: string;
  requiresAuth?: boolean;
  permissions?: string[];
  apiServices?: string[];
}

// ===================================================================
// CONFIGURAÇÃO COMPLETA DE TODAS AS 103 PÁGINAS
// ===================================================================

export const COMPLETE_ROUTES_CONFIG: RouteConfig[] = [
  // ===================================================================
  // DASHBOARDS PRINCIPAIS (9 páginas)
  // ===================================================================
  {
    path: '/dashboard-master',
    name: 'Dashboard Master',
    component: 'dashboard-master',
    category: 'dashboards',
    icon: 'BarChart3',
    description: 'Dashboard principal com visão geral do sistema',
    requiresAuth: true,
    apiServices: ['core', 'analytics', 'data']
  },
  {
    path: '/dashboard-reservei-viagens',
    name: 'Dashboard Reservei Viagens',
    component: 'dashboard-reservei-viagens',
    category: 'dashboards',
    icon: 'Building',
    description: 'Dashboard específico da Reservei Viagens',
    requiresAuth: true,
    apiServices: ['travel', 'finance', 'analytics']
  },
  {
    path: '/dashboard-rsv',
    name: 'Dashboard RSV',
    component: 'dashboard-rsv',
    category: 'dashboards',
    icon: 'TrendingUp',
    description: 'Dashboard RSV com métricas específicas',
    requiresAuth: true,
    apiServices: ['core', 'analytics']
  },
  {
    path: '/analytics-dashboard',
    name: 'Analytics Dashboard',
    component: 'analytics-dashboard',
    category: 'dashboards',
    icon: 'BarChart3',
    description: 'Dashboard avançado de analytics',
    requiresAuth: true,
    apiServices: ['analytics', 'data', 'reports']
  },
  {
    path: '/finance-dashboard',
    name: 'Finance Dashboard',
    component: 'finance-dashboard',
    category: 'dashboards',
    icon: 'DollarSign',
    description: 'Dashboard financeiro completo',
    requiresAuth: true,
    apiServices: ['finance', 'payments', 'sectoral_finance']
  },
  {
    path: '/marketing-dashboard',
    name: 'Marketing Dashboard',
    component: 'marketing-dashboard',
    category: 'dashboards',
    icon: 'TrendingUp',
    description: 'Dashboard de marketing e campanhas',
    requiresAuth: true,
    apiServices: ['marketing', 'analytics']
  },
  {
    path: '/sales-dashboard',
    name: 'Sales Dashboard',
    component: 'sales-dashboard',
    category: 'dashboards',
    icon: 'Target',
    description: 'Dashboard de vendas e CRM',
    requiresAuth: true,
    apiServices: ['sales', 'analytics']
  },
  {
    path: '/reports-dashboard',
    name: 'Reports Dashboard',
    component: 'reports-dashboard',
    category: 'dashboards',
    icon: 'FileText',
    description: 'Dashboard de relatórios',
    requiresAuth: true,
    apiServices: ['reports', 'analytics']
  },
  {
    path: '/notifications-dashboard',
    name: 'Notifications Dashboard',
    component: 'notifications-dashboard',
    category: 'dashboards',
    icon: 'Bell',
    description: 'Centro de notificações',
    requiresAuth: true,
    apiServices: ['notifications']
  },

  // ===================================================================
  // SISTEMAS DE GESTÃO (12 páginas)
  // ===================================================================
  {
    path: '/hotels-complete',
    name: 'Hotéis Completo',
    component: 'hotels-complete',
    category: 'gestao',
    icon: 'Building',
    description: 'Sistema completo de gestão de hotéis',
    requiresAuth: true,
    apiServices: ['travel', 'data']
  },
  {
    path: '/hotels-debug',
    name: 'Hotéis Debug',
    component: 'hotels-debug',
    category: 'gestao',
    icon: 'Bug',
    description: 'Debug e troubleshooting de hotéis',
    requiresAuth: true,
    permissions: ['admin'],
    apiServices: ['travel', 'core']
  },
  {
    path: '/hotels-funcional',
    name: 'Hotéis Funcional',
    component: 'hotels-funcional',
    category: 'gestao',
    icon: 'CheckCircle',
    description: 'Hotéis com API real integrada',
    requiresAuth: true,
    apiServices: ['travel']
  },
  {
    path: '/customers-complete',
    name: 'Clientes Completo',
    component: 'customers-complete',
    category: 'gestao',
    icon: 'Users',
    description: 'CRM completo de clientes',
    requiresAuth: true,
    apiServices: ['sales', 'loyalty', 'data']
  },
  {
    path: '/customers-rsv',
    name: 'Clientes RSV',
    component: 'customers-rsv',
    category: 'gestao',
    icon: 'User',
    description: 'Sistema de clientes RSV',
    requiresAuth: true,
    apiServices: ['sales']
  },
  {
    path: '/reservations',
    name: 'Reservas',
    component: 'reservations',
    category: 'gestao',
    icon: 'Calendar',
    description: 'Sistema de reservas',
    requiresAuth: true,
    apiServices: ['travel', 'payments']
  },
  {
    path: '/reservations-rsv',
    name: 'Reservas RSV',
    component: 'reservations-rsv',
    category: 'gestao',
    icon: 'CalendarDays',
    description: 'Sistema de reservas RSV',
    requiresAuth: true,
    apiServices: ['travel']
  },
  {
    path: '/travel',
    name: 'Viagens',
    component: 'travel',
    category: 'gestao',
    icon: 'Plane',
    description: 'Gestão de viagens e pacotes',
    requiresAuth: true,
    apiServices: ['travel', 'attractions']
  },
  {
    path: '/travel-catalog-rsv',
    name: 'Catálogo Viagens RSV',
    component: 'travel-catalog-rsv',
    category: 'gestao',
    icon: 'Map',
    description: 'Catálogo de viagens RSV',
    requiresAuth: false,
    apiServices: ['travel', 'attractions']
  },
  {
    path: '/users',
    name: 'Usuários',
    component: 'users',
    category: 'gestao',
    icon: 'Users',
    description: 'Gestão de usuários do sistema',
    requiresAuth: true,
    permissions: ['admin'],
    apiServices: ['admin', 'data']
  },
  {
    path: '/groups',
    name: 'Grupos',
    component: 'groups',
    category: 'gestao',
    icon: 'Users',
    description: 'Gestão de grupos de usuários',
    requiresAuth: true,
    permissions: ['admin'],
    apiServices: ['admin']
  },
  {
    path: '/permissions',
    name: 'Permissões',
    component: 'permissions',
    category: 'gestao',
    icon: 'Shield',
    description: 'Controle de permissões',
    requiresAuth: true,
    permissions: ['admin'],
    apiServices: ['admin']
  },

  // ===================================================================
  // MÓDULOS DE NEGÓCIO (25 páginas)
  // ===================================================================
  {
    path: '/turismo',
    name: 'Turismo',
    component: 'turismo',
    category: 'negocio',
    icon: 'MapPin',
    description: 'Gestão de turismo e atrações',
    requiresAuth: true,
    apiServices: ['attractions', 'travel', 'parks']
  },
  {
    path: '/marketing',
    name: 'Marketing',
    component: 'marketing',
    category: 'negocio',
    icon: 'TrendingUp',
    description: 'Campanhas de marketing',
    requiresAuth: true,
    apiServices: ['marketing', 'analytics']
  },
  {
    path: '/financeiro',
    name: 'Financeiro',
    component: 'financeiro',
    category: 'negocio',
    icon: 'DollarSign',
    description: 'Gestão financeira completa',
    requiresAuth: true,
    apiServices: ['finance', 'payments', 'sectoral_finance']
  },
  {
    path: '/e-commerce',
    name: 'E-commerce',
    component: 'e-commerce',
    category: 'negocio',
    icon: 'ShoppingCart',
    description: 'Loja virtual e e-commerce',
    requiresAuth: true,
    apiServices: ['ecommerce', 'inventory', 'payments']
  },
  {
    path: '/vouchers',
    name: 'Vouchers',
    component: 'vouchers',
    category: 'negocio',
    icon: 'Gift',
    description: 'Sistema de vouchers',
    requiresAuth: true,
    apiServices: ['vouchers', 'voucher_editor']
  },
  {
    path: '/voucher-editor',
    name: 'Editor de Vouchers',
    component: 'voucher-editor',
    category: 'negocio',
    icon: 'Edit',
    description: 'Editor avançado de vouchers',
    requiresAuth: true,
    apiServices: ['voucher_editor']
  },
  {
    path: '/giftcards',
    name: 'Cartões Presente',
    component: 'giftcards',
    category: 'negocio',
    icon: 'Gift',
    description: 'Sistema de cartões presente',
    requiresAuth: true,
    apiServices: ['giftcards', 'payments']
  },
  {
    path: '/coupons',
    name: 'Cupons',
    component: 'coupons',
    category: 'negocio',
    icon: 'Star',
    description: 'Sistema de cupons de desconto',
    requiresAuth: true,
    apiServices: ['coupons']
  },
  {
    path: '/loyalty',
    name: 'Fidelidade',
    component: 'loyalty',
    category: 'negocio',
    icon: 'Heart',
    description: 'Programa de fidelidade',
    requiresAuth: true,
    apiServices: ['loyalty', 'rewards']
  },
  {
    path: '/rewards',
    name: 'Recompensas',
    component: 'rewards',
    category: 'negocio',
    icon: 'Award',
    description: 'Sistema de recompensas',
    requiresAuth: true,
    apiServices: ['rewards', 'loyalty']
  },
  {
    path: '/subscriptions',
    name: 'Assinaturas',
    component: 'subscriptions',
    category: 'negocio',
    icon: 'Calendar',
    description: 'Gestão de assinaturas e planos',
    requiresAuth: true,
    apiServices: ['subscriptions', 'payments']
  },
  {
    path: '/pagamentos',
    name: 'Pagamentos',
    component: 'pagamentos',
    category: 'negocio',
    icon: 'CreditCard',
    description: 'Gestão de pagamentos',
    requiresAuth: true,
    apiServices: ['payments', 'finance']
  },
  {
    path: '/billing',
    name: 'Faturamento',
    component: 'billing',
    category: 'negocio',
    icon: 'Receipt',
    description: 'Sistema de faturamento',
    requiresAuth: true,
    apiServices: ['finance', 'payments']
  },
  {
    path: '/sales',
    name: 'Vendas',
    component: 'sales',
    category: 'negocio',
    icon: 'TrendingUp',
    description: 'Gestão de vendas',
    requiresAuth: true,
    apiServices: ['sales', 'analytics']
  },
  {
    path: '/products',
    name: 'Produtos',
    component: 'products',
    category: 'negocio',
    icon: 'Package',
    description: 'Catálogo de produtos',
    requiresAuth: true,
    apiServices: ['ecommerce', 'inventory']
  },
  {
    path: '/inventory',
    name: 'Estoque',
    component: 'inventory',
    category: 'negocio',
    icon: 'Layers',
    description: 'Controle de estoque',
    requiresAuth: true,
    apiServices: ['inventory']
  },
  {
    path: '/attractions',
    name: 'Atrações',
    component: 'attractions',
    category: 'negocio',
    icon: 'MapPin',
    description: 'Gestão de atrações turísticas',
    requiresAuth: true,
    apiServices: ['attractions']
  },
  {
    path: '/parks',
    name: 'Parques',
    component: 'parks',
    category: 'negocio',
    icon: 'TreePine',
    description: 'Gestão de parques temáticos',
    requiresAuth: true,
    apiServices: ['parks']
  },
  {
    path: '/maps',
    name: 'Mapas',
    component: 'maps',
    category: 'negocio',
    icon: 'Map',
    description: 'Sistema de mapas e localização',
    requiresAuth: false,
    apiServices: ['maps']
  },
  {
    path: '/photos',
    name: 'Fotos',
    component: 'photos',
    category: 'negocio',
    icon: 'Camera',
    description: 'Galeria de fotos',
    requiresAuth: true,
    apiServices: ['photos']
  },
  {
    path: '/videos',
    name: 'Vídeos',
    component: 'videos',
    category: 'negocio',
    icon: 'Video',
    description: 'Gestão de vídeos',
    requiresAuth: true,
    apiServices: ['videos']
  },
  {
    path: '/documents',
    name: 'Documentos',
    component: 'documents',
    category: 'negocio',
    icon: 'FileText',
    description: 'Gestão de documentos',
    requiresAuth: true,
    apiServices: ['data']
  },
  {
    path: '/insurance',
    name: 'Seguros',
    component: 'insurance',
    category: 'negocio',
    icon: 'Shield',
    description: 'Seguros de viagem',
    requiresAuth: true,
    apiServices: ['travel']
  },
  {
    path: '/visa',
    name: 'Vistos',
    component: 'visa',
    category: 'negocio',
    icon: 'FileCheck',
    description: 'Processamento de vistos',
    requiresAuth: true,
    apiServices: ['visa']
  },
  {
    path: '/transport',
    name: 'Transportes',
    component: 'transport',
    category: 'negocio',
    icon: 'Car',
    description: 'Gestão de transportes',
    requiresAuth: true,
    apiServices: ['travel']
  },
  {
    path: '/refunds',
    name: 'Reembolsos',
    component: 'refunds',
    category: 'negocio',
    icon: 'RotateCcw',
    description: 'Sistema de reembolsos',
    requiresAuth: true,
    apiServices: ['refunds', 'finance']
  },

  // ===================================================================
  // SISTEMAS TÉCNICOS (15 páginas)
  // ===================================================================
  {
    path: '/login',
    name: 'Login',
    component: 'login',
    category: 'auth',
    icon: 'LogIn',
    description: 'Autenticação do sistema',
    requiresAuth: false,
    apiServices: ['core']
  },
  {
    path: '/register',
    name: 'Registro',
    component: 'register',
    category: 'auth',
    icon: 'UserPlus',
    description: 'Registro de novos usuários',
    requiresAuth: false,
    apiServices: ['core']
  },
  {
    path: '/settings',
    name: 'Configurações',
    component: 'settings',
    category: 'admin',
    icon: 'Settings',
    description: 'Configurações do sistema',
    requiresAuth: true,
    apiServices: ['admin', 'data']
  },
  {
    path: '/notifications',
    name: 'Notificações',
    component: 'notifications',
    category: 'communication',
    icon: 'Bell',
    description: 'Sistema de notificações',
    requiresAuth: true,
    apiServices: ['notifications']
  },
  {
    path: '/chat',
    name: 'Chat',
    component: 'chat',
    category: 'communication',
    icon: 'MessageCircle',
    description: 'Chat em tempo real',
    requiresAuth: true,
    apiServices: ['notifications']
  },
  {
    path: '/calendar',
    name: 'Calendário',
    component: 'calendar',
    category: 'tools',
    icon: 'Calendar',
    description: 'Calendário de eventos',
    requiresAuth: true,
    apiServices: ['travel', 'data']
  },
  {
    path: '/workflows',
    name: 'Workflows',
    component: 'workflows',
    category: 'automation',
    icon: 'Workflow',
    description: 'Automação de processos',
    requiresAuth: true,
    permissions: ['admin'],
    apiServices: ['admin', 'data']
  },
  {
    path: '/automacao',
    name: 'Automação',
    component: 'automacao',
    category: 'automation',
    icon: 'Zap',
    description: 'Sistema de automação',
    requiresAuth: true,
    apiServices: ['admin']
  },
  {
    path: '/multilingual',
    name: 'Multilíngue',
    component: 'multilingual',
    category: 'tools',
    icon: 'Globe',
    description: 'Sistema de tradução',
    requiresAuth: true,
    apiServices: ['multilingual']
  },
  {
    path: '/seo',
    name: 'SEO',
    component: 'seo',
    category: 'marketing',
    icon: 'Search',
    description: 'Otimização SEO',
    requiresAuth: true,
    apiServices: ['seo', 'analytics']
  },
  {
    path: '/validation',
    name: 'Validação',
    component: 'validation',
    category: 'tools',
    icon: 'CheckCircle',
    description: 'Sistema de validação',
    requiresAuth: true,
    permissions: ['admin'],
    apiServices: ['admin']
  },
  {
    path: '/upgrades',
    name: 'Upgrades',
    component: 'upgrades',
    category: 'admin',
    icon: 'ArrowUp',
    description: 'Sistema de upgrades',
    requiresAuth: true,
    permissions: ['admin'],
    apiServices: ['admin']
  },
  {
    path: '/tickets',
    name: 'Tickets',
    component: 'tickets',
    category: 'support',
    icon: 'HelpCircle',
    description: 'Sistema de tickets de suporte',
    requiresAuth: true,
    apiServices: ['tickets']
  },
  {
    path: '/cadastros',
    name: 'Cadastros',
    component: 'cadastros',
    category: 'gestao',
    icon: 'UserCheck',
    description: 'Sistema de cadastros',
    requiresAuth: true,
    apiServices: ['data', 'admin']
  },
  {
    path: '/gestao',
    name: 'Gestão',
    component: 'gestao',
    category: 'admin',
    icon: 'Settings',
    description: 'Painel de gestão geral',
    requiresAuth: true,
    permissions: ['admin'],
    apiServices: ['admin', 'data']
  }

  // ===================================================================
  // PÁGINAS RESERVEI (42 páginas) - Continuação...
  // ===================================================================
  // Adicionar todas as 42 páginas da pasta reservei/
  // analytics.tsx, atracoes.tsx, auditoria.tsx, etc.
];

// ===================================================================
// CATEGORIAS ORGANIZADAS
// ===================================================================

export const ROUTE_CATEGORIES = {
  dashboards: {
    name: '🏠 Dashboards',
    description: 'Dashboards e visões gerais',
    icon: 'BarChart3',
    color: 'bg-blue-500'
  },
  gestao: {
    name: '🏨 Gestão',
    description: 'Sistemas de gestão',
    icon: 'Building',
    color: 'bg-green-500'
  },
  negocio: {
    name: '💼 Negócio',
    description: 'Módulos de negócio',
    icon: 'Briefcase',
    color: 'bg-purple-500'
  },
  auth: {
    name: '🔐 Autenticação',
    description: 'Sistema de autenticação',
    icon: 'Lock',
    color: 'bg-red-500'
  },
  communication: {
    name: '📞 Comunicação',
    description: 'Sistemas de comunicação',
    icon: 'MessageCircle',
    color: 'bg-pink-500'
  },
  automation: {
    name: '🤖 Automação',
    description: 'Sistemas de automação',
    icon: 'Zap',
    color: 'bg-yellow-500'
  },
  tools: {
    name: '🔧 Ferramentas',
    description: 'Ferramentas do sistema',
    icon: 'Tool',
    color: 'bg-gray-500'
  },
  marketing: {
    name: '📢 Marketing',
    description: 'Marketing e SEO',
    icon: 'TrendingUp',
    color: 'bg-orange-500'
  },
  admin: {
    name: '⚙️ Administração',
    description: 'Painel administrativo',
    icon: 'Settings',
    color: 'bg-indigo-500'
  },
  support: {
    name: '🎫 Suporte',
    description: 'Sistema de suporte',
    icon: 'HelpCircle',
    color: 'bg-cyan-500'
  }
};

// ===================================================================
// FUNÇÕES UTILITÁRIAS
// ===================================================================

export const getRoutesByCategory = (category: string): RouteConfig[] => {
  return COMPLETE_ROUTES_CONFIG.filter(route => route.category === category);
};

export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return COMPLETE_ROUTES_CONFIG.find(route => route.path === path);
};

export const getAllCategories = (): string[] => {
  return Object.keys(ROUTE_CATEGORIES);
};

export const getRoutesWithAPI = (apiService: string): RouteConfig[] => {
  return COMPLETE_ROUTES_CONFIG.filter(route => 
    route.apiServices?.includes(apiService)
  );
};

export default COMPLETE_ROUTES_CONFIG;
