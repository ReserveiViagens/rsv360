const ALLOWED_DOMAINS = new Set([
  'reserveiviagens.com.br',
  'www.reserveiviagens.com.br',
  'reserveiviagens.com',
  'www.reserveiviagens.com',
  'rsv360.com.br',
  'www.rsv360.com.br',
  'rsv360.com',
  'www.rsv360.com',
  'localhost',
  '127.0.0.1',
]);

function ensureBanner() {
  if (typeof document === 'undefined' || document.getElementById('rsv360-clone-banner')) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'rsv360-clone-banner';
  banner.style.position = 'fixed';
  banner.style.inset = '0 0 auto 0';
  banner.style.zIndex = '99999';
  banner.style.background = '#b91c1c';
  banner.style.color = '#fff';
  banner.style.font = '600 14px/1.5 system-ui, sans-serif';
  banner.style.padding = '12px 16px';
  banner.style.textAlign = 'center';
  banner.textContent = 'Ambiente não autorizado — RSV360 protegido contra clonagem.';
  document.body.appendChild(banner);
}

async function notifyCloneAlert() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    await fetch('/api/clone-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cloneDomain: window.location.hostname,
        cloneUrl: window.location.href,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // noop
  }
}

export function initBrandWatermark() {
  if (typeof window === 'undefined') {
    return false;
  }

  console.log('[RSV360] Reservei Viagens • Douglas P. Figueiredo');

  const allowed = ALLOWED_DOMAINS.has(window.location.hostname);
  if (!allowed) {
    console.warn('[RSV360] Domínio não autorizado:', window.location.hostname);
    ensureBanner();
    void notifyCloneAlert();
  }

  document.body.dataset.brand = 'rsv360';
  return allowed;
}
