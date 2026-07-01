import {
  buildRoteiroPrecacheUrls,
  LAST_UPDATED_STORAGE_KEY,
  PRECACHE_STORAGE_KEY,
  ROTEIRO_SW_PATH,
  ROTEIRO_SW_SCOPE,
} from './policies';

export async function registerRoteiroServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(ROTEIRO_SW_PATH, { scope: ROTEIRO_SW_SCOPE });
  } catch {
    return null;
  }
}

export async function precacheRoteiroWallet(token: string, checkOut?: string | null): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.onLine) return false;
  if (localStorage.getItem(PRECACHE_STORAGE_KEY(token))) return true;

  const registration = await registerRoteiroServiceWorker();
  if (!registration) return false;

  const urls = buildRoteiroPrecacheUrls(token, checkOut);
  const sw = registration.active ?? registration.waiting ?? registration.installing;
  if (sw) {
    sw.postMessage({ type: 'PRECACHE_ROTEIRO', urls });
  }

  try {
    await Promise.all(
      urls.map(async (url) => {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`precache failed ${url}`);
      }),
    );
    localStorage.setItem(PRECACHE_STORAGE_KEY(token), new Date().toISOString());
    localStorage.setItem(LAST_UPDATED_STORAGE_KEY(token), new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}

export function readLastUpdated(token: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_UPDATED_STORAGE_KEY(token));
}
