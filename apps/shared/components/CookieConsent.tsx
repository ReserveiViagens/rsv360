"use client";

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { initGoogleConsentMode, saveConsentMode, type ConsentSnapshot } from '../lib/tracking/consent-mode';

const DEFAULT_CONSENT: ConsentSnapshot = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

function ButtonLike({
  children,
  onClick,
  variant = 'default',
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'ghost';
}) {
  const styles =
    variant === 'default'
      ? 'bg-slate-900 text-white hover:bg-slate-800'
      : variant === 'secondary'
        ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
        : 'bg-transparent text-slate-700 hover:bg-slate-100';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition ${styles}`}
    >
      {children}
    </button>
  );
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentSnapshot>(DEFAULT_CONSENT);

  useEffect(() => {
    initGoogleConsentMode();
    const stored = window.localStorage.getItem('rsv360-cookie-consent');
    if (!stored) {
      setOpen(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as ConsentSnapshot;
      setDraft(parsed);
    } catch {
      setDraft(DEFAULT_CONSENT);
    }
  }, []);

  const summary = useMemo(() => {
    return [
      { label: 'Essenciais', value: 'sempre ativo' },
      { label: 'Analytics', value: draft.analytics ? 'permitido' : 'bloqueado' },
      { label: 'Marketing', value: draft.marketing ? 'permitido' : 'bloqueado' },
      { label: 'Preferências', value: draft.preferences ? 'permitido' : 'bloqueado' },
    ];
  }, [draft]);

  const persist = (next: ConsentSnapshot) => {
    saveConsentMode(next);
    setDraft(next);
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-slate-900">Usamos cookies com respeito à LGPD</p>
          <p className="mt-1 text-sm text-slate-600">
            Ajuste suas preferências de privacidade. Consulte a nossa{' '}
            <Link href="/politica-de-cookies" className="font-semibold text-slate-900 underline">
              Política de Cookies
            </Link>{' '}
            e{' '}
            <Link href="/politica-de-privacidade" className="font-semibold text-slate-900 underline">
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                <p className="text-sm font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ButtonLike
            variant="secondary"
            onClick={() =>
              persist({
                ...DEFAULT_CONSENT,
                necessary: true,
                analytics: false,
                marketing: false,
                preferences: false,
              })
            }
          >
            Rejeitar não necessários
          </ButtonLike>
          <ButtonLike variant="ghost" onClick={() => setOpen(false)}>
            Gerenciar
          </ButtonLike>
          <ButtonLike
            onClick={() =>
              persist({
                necessary: true,
                analytics: true,
                marketing: true,
                preferences: true,
              })
            }
          >
            Aceitar todos
          </ButtonLike>
        </div>
      </div>
    </div>
  );
}
