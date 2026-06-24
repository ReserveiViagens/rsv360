import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  GitCompare,
  LineChart,
  Scale,
  Settings,
  Sparkles,
  Sun,
} from 'lucide-react';

export type PricingModule = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: 'Pronto' | 'MVP' | 'Rascunho';
  statusClass: string;
};

export const PRICING_MODULES: PricingModule[] = [
  {
    title: 'Dashboard',
    description: 'Visão geral, calendário embutido e métricas de pricing.',
    href: '/pricing/dashboard',
    icon: BarChart3,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Smart Pricing',
    description: 'Sugestões dinâmicas e simulação de tarifas.',
    href: '/pricing/smart',
    icon: Sparkles,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Calendário',
    description: 'Grade de preços por propriedade e período.',
    href: '/pricing/calendar',
    icon: Calendar,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Regras',
    description: 'Regras automáticas de ajuste de tarifa.',
    href: '/pricing/rules',
    icon: Settings,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Concorrentes',
    description: 'Monitoramento de tarifas da concorrência.',
    href: '/pricing/competitors',
    icon: LineChart,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Comparação',
    description: 'Comparativo entre propriedades e mercado.',
    href: '/pricing/comparison',
    icon: GitCompare,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Temporadas',
    description: 'Sazonalidade e períodos de alta demanda.',
    href: '/pricing/seasons',
    icon: Sun,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Alertas',
    description: 'Notificações de variação de preço e ocupação.',
    href: '/pricing/alerts',
    icon: AlertTriangle,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
];
