'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, Shield, X } from 'lucide-react';
import Link from 'next/link';
import { LabNav } from './LabNav';
import { PrimarySiteBanner } from './PrimarySiteBanner';

const LAB_TITLE =
  process.env.NEXT_PUBLIC_LAB_TITLE ?? 'RSV360 Marketing Lab';

/** Login + MFA enrollment: no admin chrome / no Sair (no full session yet). */
const AUTH_ONLY_PATHS = ['/admin/login', '/admin/mfa-enroll', '/login'];

function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

async function adminLogout() {
  try {
    await fetch('/api/admin/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Cookie clear is best-effort; always leave the session UI.
  }
  window.location.href = '/admin/login';
}

export function LabShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (isAuthOnlyPath(pathname)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PrimarySiteBanner />
        {children}
      </div>
    );
  }

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    void adminLogout();
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-violet-900 to-violet-950 shadow-xl transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-violet-300">
              :3000
            </p>
            <p className="text-sm font-semibold text-white">{LAB_TITLE}</p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-violet-200 hover:bg-white/10 lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <LabNav onNavigate={() => setMobileOpen(false)} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <PrimarySiteBanner />
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Abrir menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-medium text-slate-600">{LAB_TITLE}</h1>
          </div>
          <div className="flex items-center gap-3">
            <PrimarySiteBanner compact />
            <Link
              href="/admin/security"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              aria-label="Segurança da conta"
              title="Segurança"
            >
              <Shield className="h-4 w-4" aria-hidden />
              Segurança
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              aria-label="Sair do painel admin"
              title="Sair"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {loggingOut ? 'Saindo…' : 'Sair'}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
