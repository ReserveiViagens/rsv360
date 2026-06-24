import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Calendar,
  ExternalLink,
  Gauge,
  Home,
  Megaphone,
  Settings,
  Users,
} from 'lucide-react';

export type LabNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
};

export type LabNavGroup = {
  label: string;
  items: LabNavItem[];
};

export const LAB_NAV_GROUPS: LabNavGroup[] = [
  {
    label: 'Laboratório',
    items: [
      { label: 'Overview', href: '/lab', icon: Home },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Campanhas', href: '/crm', icon: Users },
      { label: 'Marketing', href: '/marketing/campaigns', icon: Megaphone },
      { label: 'Precificação', href: '/pricing', icon: Calendar },
      { label: 'Admin', href: '/admin/dashboard', icon: Settings },
    ],
  },
  {
    label: 'Observabilidade',
    items: [
      {
        label: 'Grafana',
        href: 'http://localhost:3007',
        icon: Gauge,
        external: true,
      },
      {
        label: 'Prometheus',
        href: 'http://localhost:9090',
        icon: Gauge,
        external: true,
      },
    ],
  },
];

export function getPrimarySiteNavItem(primarySiteUrl: string): LabNavItem {
  return {
    label: 'Site principal',
    href: primarySiteUrl,
    icon: ExternalLink,
    external: true,
  };
}
