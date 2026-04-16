/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  CalendarRange,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Sparkles,
  UserCircle2,
  BedDouble,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { initials } from '@/lib/format';
import { Button } from './ui/button';
import { Card } from './ui/card';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/reservations', label: 'Reservas', icon: CalendarRange },
  { href: '/checkin', label: 'Check-in', icon: BedDouble },
  { href: '/services', label: 'Serviços', icon: Sparkles },
  { href: '/messages', label: 'Mensagens', icon: MessageSquare },
  { href: '/profile', label: 'Perfil', icon: UserCircle2 },
];

export function GuestLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { guest, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  const guestName = useMemo(() => {
    return guest?.name || [guest?.firstName, guest?.lastName].filter(Boolean).join(' ') || 'Hóspede RSV360';
  }, [guest]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
          <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
            <Menu className="h-4 w-4" />
          </Button>

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-900 text-white shadow-soft">
              <span className="text-sm font-bold">RV</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Reservei Viagens</p>
              <p className="text-xs text-slate-500">Portal do Hóspede RSV360</p>
            </div>
          </Link>

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">Bem-vindo</p>
              <p className="text-sm font-semibold text-slate-900">{guestName}</p>
            </div>
            <Button variant="outline" onClick={() => void logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        <div className={cn('border-t border-slate-100 bg-white px-4 py-3 lg:hidden', mobileOpen ? 'block' : 'hidden')}>
          <nav className="grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                    active ? 'bg-brand-900 text-white' : 'text-slate-700 hover:bg-slate-100',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <Button variant="outline" className="mt-2 justify-start" onClick={() => void logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="sticky top-24 hidden h-fit w-72 shrink-0 lg:block">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white">
                  <span className="text-sm font-bold">{initials(guestName)}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{guestName}</p>
                  <p className="truncate text-xs text-slate-500">{guest?.email || 'portal@reserveiviagens.com.br'}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1 p-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium',
                      active ? 'bg-brand-900 text-white shadow-soft' : 'text-slate-700 hover:bg-slate-100',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </Card>
        </aside>

        <main className="min-w-0 flex-1 pb-6">{children}</main>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-slate-500 lg:px-6">
          © 2024-2026 Reservei Viagens LTDA • Desenvolvido por Douglas P. Figueiredo
        </div>
      </footer>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-20 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
    </div>
  );
}
