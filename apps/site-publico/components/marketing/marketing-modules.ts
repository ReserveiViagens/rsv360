import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  FlaskConical,
  Filter,
  Megaphone,
  MessageCircle,
  Radio,
} from 'lucide-react';

export type MarketingModule = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status: 'Pronto' | 'MVP' | 'Rascunho';
  statusClass: string;
};

export const MARKETING_MODULES: MarketingModule[] = [
  {
    title: 'Campanhas',
    description: 'Criar, editar e acompanhar campanhas multicanal.',
    href: '/marketing/campaigns',
    icon: Megaphone,
    status: 'Pronto',
    statusClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    title: 'Analytics',
    description: 'Métricas de receita e performance — hub em /analytics.',
    href: '/marketing/analytics',
    icon: BarChart3,
    status: 'Pronto',
    statusClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    title: 'A/B Tests',
    description: 'Rascunhar experimentos de conversão e conteúdo.',
    href: '/marketing/ab-tests',
    icon: FlaskConical,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Funis',
    description: 'Visualizar etapas do funil de reserva e retenção.',
    href: '/marketing/funnels',
    icon: Filter,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Broadcasts',
    description: 'Disparos em massa (e-mail, push, WhatsApp).',
    href: '/marketing/broadcasts',
    icon: Radio,
    status: 'MVP',
    statusClass: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'WhatsApp',
    description: 'Inbox e integração Evolution — operação no S1 (:5000).',
    href: '/marketing/whatsapp',
    icon: MessageCircle,
    status: 'Rascunho',
    statusClass: 'bg-slate-100 text-slate-700',
  },
];
