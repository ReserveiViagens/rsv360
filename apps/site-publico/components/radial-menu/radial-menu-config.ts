/**
 * Configuração do Menu Radial RSV 360° Plataforma Completa
 * Reutiliza dados do AuctionDashboard e dashboard-reservei-viagens
 * Grupo A = esquerda (padrão: perfil Proprietário), Grupo B = direita (padrão: perfil Operador)
 */

import type { RadialModule, CoreConfig, RadialMenuConfig } from './radial-menu-types';

/** Labels dos dois grupos para UI (modal Customizar grupos, botões alterar atual) */
export const GROUP_A_LABEL = 'Proprietário';
export const GROUP_B_LABEL = 'Operador';

export const coreConfig: CoreConfig = {
  id: 'core',
  label: 'RSV 360°',
  dataSource: 'reservas',
  metrics: [
    { label: 'Reservas', value: '-' },
    { label: 'Ocupação', value: '-' },
    { label: 'Receita', value: '-' },
  ],
};

export const radialModules: RadialModule[] = [
  {
    id: 'proprietario',
    label: 'Proprietário',
    icon: 'Home',
    color: 'bg-[#0066CC]',
    roles: ['proprietario', 'admin'],
    submenus: [
      { label: 'Proprietário', href: '/dashboard/proprietario' },
      { label: 'Controles', href: '/dashboard/slider' },
      { label: 'Hotéis', href: '/dashboard/hotels' },
      { label: 'Documentos', href: '/dashboard/documents' },
      { label: 'Rotas', href: '/dashboard/routes' },
      { label: 'Apartamentos', href: '/dashboard/flats' },
    ],
  },
  {
    id: 'turismo',
    label: 'Turismo',
    icon: 'Plane',
    color: 'bg-blue-600',
    roles: ['operador', 'admin'],
    submenus: [
      { label: 'Viagens', href: '/reservei/viagens' },
      { label: 'Atrações', href: '/reservei/atracoes' },
      { label: 'Parques', href: '/reservei/parques' },
      { label: 'Ingressos', href: '/reservei/ingressos' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: 'DollarSign',
    color: 'bg-emerald-600',
    roles: ['proprietario', 'operador', 'admin'],
    submenus: [
      { label: 'Financeiro', href: '/dashboard/financeiro' },
      { label: 'Finanças', href: '/reservei/financas' },
      { label: 'Relatórios', href: '/reservei/relatorios-financeiros' },
      { label: 'Pagamentos', href: '/reservei/pagamentos' },
      { label: 'Reembolsos', href: '/reservei/reembolsos' },
    ],
  },
  {
    id: 'tributacao',
    label: 'Tributação',
    icon: 'Calculator',
    color: 'bg-amber-600',
    roles: ['proprietario', 'admin'],
    submenus: [
      { label: 'Tributação', href: '/dashboard/tributacao' },
      { label: 'Deduções', href: '/dashboard/deducoes' },
      { label: 'Incentivos', href: '/dashboard/incentivos' },
      { label: 'Simulador', href: '/dashboard/simulador' },
      { label: 'Config. de Divisão', href: '/dashboard/split-config' },
    ],
  },
  {
    id: 'contabil',
    label: 'Contábil',
    icon: 'FileSpreadsheet',
    color: 'bg-slate-600',
    roles: ['proprietario', 'admin'],
    submenus: [
      { label: 'Exportação Contábil', href: '/dashboard/contabil' },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    icon: 'ShoppingCart',
    color: 'bg-green-600',
    roles: ['operador', 'admin'],
    submenus: [
      { label: 'Vendas', href: '/reservei/vendas' },
      { label: 'Produtos', href: '/reservei/produtos' },
      { label: 'Estoque', href: '/reservei/estoque' },
      { label: 'Loja', href: '/reservei/loja' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'Megaphone',
    color: 'bg-purple-600',
    roles: ['operador', 'admin'],
    submenus: [
      { label: 'Campanhas', href: '/reservei/campanhas' },
      { label: 'Analytics', href: '/reservei/analytics' },
      { label: 'SEO', href: '/reservei/seo' },
      { label: 'Recomendações', href: '/reservei/recomendacoes' },
    ],
  },
  {
    id: 'gestao',
    label: 'Gestão',
    icon: 'Users',
    color: 'bg-gray-600',
    roles: ['admin'],
    submenus: [
      { label: 'Cadastros', href: '/reservei/gestao-cadastros' },
      { label: 'Usuários', href: '/reservei/usuarios' },
      { label: 'Permissões', href: '/reservei/permissoes' },
      { label: 'Configurações', href: '/reservei/configuracoes' },
    ],
  },
  {
    id: 'conteudo',
    label: 'Conteúdo',
    icon: 'Image',
    color: 'bg-pink-600',
    roles: ['operador', 'admin'],
    submenus: [
      { label: 'Fotos', href: '/reservei/fotos' },
      { label: 'Vídeos', href: '/reservei/videos' },
      { label: 'Avaliações', href: '/reservei/avaliacoes' },
      { label: 'Multilíngue', href: '/reservei/multilingue' },
    ],
  },
  {
    id: 'automacao',
    label: 'Automação',
    icon: 'Bot',
    color: 'bg-cyan-600',
    roles: ['operador', 'admin'],
    submenus: [
      { label: 'Chatbots', href: '/reservei/chatbots' },
      { label: 'Notificações', href: '/reservei/notificacoes' },
      { label: 'Automação', href: '/reservei/automacao' },
      { label: 'Workflows', href: '/reservei/workflows' },
    ],
  },
];

export const defaultRadialMenuConfig: RadialMenuConfig = {
  core: coreConfig,
  modules: radialModules,
  rotation: {
    enabled: true,
    anglePerModule: 360 / radialModules.length,
    initialAngle: 0,
  },
  groups: {
    groupA: { label: GROUP_A_LABEL },
    groupB: { label: GROUP_B_LABEL },
  },
};
