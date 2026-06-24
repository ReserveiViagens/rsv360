'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  getPrimarySiteNavItem,
  LAB_NAV_GROUPS,
  type LabNavItem,
} from './lab-nav-config';
import { PRIMARY_SITE_URL } from '@/lib/app-mode';

function isActive(pathname: string, href: string): boolean {
  if (href === '/lab') {
    return pathname === '/lab';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: LabNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = !item.external && isActive(pathname, item.href);
  const Icon = item.icon;
  const className = cn(
    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
    active
      ? 'bg-white/15 text-white'
      : 'text-violet-100 hover:bg-white/10 hover:text-white',
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
      {item.label}
    </Link>
  );
}

export function LabNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const primaryItem = getPrimarySiteNavItem(PRIMARY_SITE_URL);

  return (
    <nav className="flex flex-1 flex-col gap-6 px-3 py-4">
      {LAB_NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-violet-300/90">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} pathname={pathname} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-violet-300/90">
          Externo
        </p>
        <NavLink item={primaryItem} pathname={pathname} onNavigate={onNavigate} />
      </div>
    </nav>
  );
}
