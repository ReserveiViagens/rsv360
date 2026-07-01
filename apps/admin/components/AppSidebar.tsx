import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Building2,
  Cloud,
  FileText,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

type NavItem = { href: string; label: string; icon: typeof Building2 };

const groups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Visão Geral',
    items: [{ href: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operações',
    items: [
      { href: '/housekeeping', label: 'Governança', icon: Sparkles },
      { href: '/communication', label: 'Comunicação', icon: MessageSquare },
      { href: '/cloud', label: 'Arquivos', icon: Cloud },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { href: '/revenue', label: 'Revenue', icon: TrendingUp },
      { href: '/crm', label: 'CRM & Fidelidade', icon: Users },
      { href: '/orcamentos', label: 'Orçamentos', icon: FileText },
      { href: '/propostas', label: 'Propostas', icon: MessageSquare },
      { href: '/configuracoes/modulo-propostas', label: 'Config. Propostas', icon: Settings },
      { href: '/acomodacoes/import', label: 'Importar inventário', icon: FileText },
      { href: '/campanhas', label: 'Campanhas', icon: Sparkles },
    ],
  },
  {
    label: 'Operações Fase 1',
    items: [
      { href: '/passageiros', label: 'Passageiros', icon: Users },
      { href: '/financeiro', label: 'Financeiro', icon: TrendingUp },
      { href: '/logistica', label: 'Logística', icon: Building2 },
      { href: '/relatorios', label: 'Relatórios', icon: FileText },
    ],
  },
  {
    label: 'Compliance',
    items: [{ href: '/fiscal', label: 'Fiscal & LGPD', icon: FileText }],
  },
  {
    label: 'Configurações',
    items: [{ href: '/properties', label: 'Propriedades', icon: Building2 }],
  },
];

export function AppSidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const router = useRouter();

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">RSV360 Admin</p>
              <p className="text-xs text-slate-500">Fase 4 • módulos avançados</p>
            </div>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = item.href === '/' ? router.pathname === '/' : router.pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                          active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <Link
              href="/properties/consolidated"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Building2 className="h-4 w-4" />
              Consolidado
            </Link>
          </div>
        </div>
      </aside>

      {mobileOpen ? <div className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={onClose} /> : null}
    </>
  );
}
