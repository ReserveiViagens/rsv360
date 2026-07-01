'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { WifiOff } from 'lucide-react';
import { precacheRoteiroWallet, readLastUpdated, registerRoteiroServiceWorker } from '@/lib/roteiro-offline/register-sw';
import { PRECACHE_STORAGE_KEY } from '@/lib/roteiro-offline/policies';

interface RoteiroPwaContextValue {
  offline: boolean;
  lastUpdated: string | null;
  precacheReady: boolean;
  savingOffline: boolean;
  saveForOffline: () => Promise<void>;
}

const RoteiroPwaContext = createContext<RoteiroPwaContextValue>({
  offline: false,
  lastUpdated: null,
  precacheReady: false,
  savingOffline: false,
  saveForOffline: async () => {},
});

export function useRoteiroPwa() {
  return useContext(RoteiroPwaContext);
}

interface RoteiroPwaProviderProps {
  token: string;
  status: string;
  checkOut?: string;
  children: ReactNode;
}

function isWalletUnlocked(status: string): boolean {
  return status === 'accepted' || status === 'paid';
}

export function RoteiroPwaProvider({ token, status, checkOut, children }: RoteiroPwaProviderProps) {
  const [offline, setOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [precacheReady, setPrecacheReady] = useState(false);
  const [savingOffline, setSavingOffline] = useState(false);

  useEffect(() => {
    void registerRoteiroServiceWorker();
  }, []);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  useEffect(() => {
    setLastUpdated(readLastUpdated(token));
    setPrecacheReady(Boolean(localStorage.getItem(PRECACHE_STORAGE_KEY(token))));
  }, [token]);

  const saveForOffline = useCallback(async () => {
    if (!isWalletUnlocked(status)) return;
    setSavingOffline(true);
    try {
      const ok = await precacheRoteiroWallet(token, checkOut ?? null);
      if (ok) {
        setPrecacheReady(true);
        setLastUpdated(readLastUpdated(token));
      }
    } finally {
      setSavingOffline(false);
    }
  }, [token, status, checkOut]);

  useEffect(() => {
    if (!isWalletUnlocked(status) || !navigator.onLine) return;
    if (localStorage.getItem(PRECACHE_STORAGE_KEY(token))) return;
    void saveForOffline();
  }, [token, status, saveForOffline]);

  return (
    <RoteiroPwaContext.Provider
      value={{ offline, lastUpdated, precacheReady, savingOffline, saveForOffline }}
    >
      {offline ? (
        <div
          className="fixed left-0 right-0 top-14 z-50 border-b border-sky-500/30 bg-sky-950/95 px-4 py-2.5 text-center text-sm text-sky-100 sm:top-16"
          role="status"
        >
          <span className="inline-flex items-center gap-2">
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
            Você está offline — mostrando sua carteira salva
          </span>
        </div>
      ) : null}
      {children}
    </RoteiroPwaContext.Provider>
  );
}

export function RoteiroOfflineMeta({ className = '' }: { className?: string }) {
  const { offline, lastUpdated, precacheReady, savingOffline, saveForOffline } = useRoteiroPwa();

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 text-xs text-white/50 ${className}`}>
      {precacheReady ? (
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300">
          Carteira salva para offline
        </span>
      ) : null}
      {lastUpdated ? (
        <span>
          Última atualização: {new Date(lastUpdated).toLocaleString('pt-BR')}
        </span>
      ) : null}
      {!offline && !precacheReady ? (
        <button
          type="button"
          onClick={() => void saveForOffline()}
          disabled={savingOffline}
          className="rounded-full border border-white/20 px-2 py-0.5 text-white/70 hover:bg-white/10 disabled:opacity-50"
        >
          {savingOffline ? 'Salvando…' : 'Salvar para acesso offline'}
        </button>
      ) : null}
    </div>
  );
}
