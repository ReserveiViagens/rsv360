/**
 * PR-10c-a1 — DPoP helpers (RFC 9449 / RFC 7638).
 * Browser-safe: WebCrypto ECDSA P-256 non-extractable + IndexedDB + DPoP proof.
 * Node callers may use computeJwkThumbprint (async) or backend dpop.service sync helpers.
 * No client wiring in this slice.
 */

const DPOP_DB_NAME = 'rsv360-dpop';
const DPOP_STORE = 'keys';
const DPOP_KEY_ID = 'default';

export type EcPublicJwk = {
  kty: 'EC';
  crv: 'P-256';
  x: string;
  y: string;
};

export function base64UrlEncode(input: Uint8Array | ArrayBuffer): string {
  const bytes = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const b64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecodeToUint8Array(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  if (typeof atob === 'function') {
    const binary = atob(normalized + pad);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(normalized + pad, 'base64'));
}

/** RFC 7638 — JWK thumbprint (SHA-256), base64url. */
export async function computeJwkThumbprint(jwk: EcPublicJwk): Promise<string> {
  const ordered = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
  const data = new TextEncoder().encode(JSON.stringify(ordered));
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(digest);
  }
  const nodeCrypto = await import('crypto');
  return base64UrlEncode(nodeCrypto.createHash('sha256').update(Buffer.from(data)).digest());
}

export async function accessTokenHashWeb(accessToken: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(accessToken));
  return base64UrlEncode(digest);
}

export function stripQueryAndFragment(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return (url.split('#')[0] || url).split('?')[0] || url;
  }
}

function openDpopDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DPOP_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DPOP_STORE)) {
        db.createObjectStore(DPOP_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('indexedDB open failed'));
  });
}

/** Browser-only: ECDSA P-256, private key non-extractable, IndexedDB. */
export async function getOrCreateDpopKeyPair(): Promise<CryptoKeyPair> {
  if (typeof indexedDB === 'undefined' || !crypto?.subtle) {
    throw new Error('WebCrypto/IndexedDB unavailable');
  }

  const db = await openDpopDb();
  const existing = await new Promise<CryptoKeyPair | undefined>((resolve, reject) => {
    const tx = db.transaction(DPOP_STORE, 'readonly');
    const getReq = tx.objectStore(DPOP_STORE).get(DPOP_KEY_ID);
    getReq.onsuccess = () => resolve(getReq.result as CryptoKeyPair | undefined);
    getReq.onerror = () => reject(getReq.error);
  });
  if (existing?.privateKey && existing?.publicKey) {
    return existing;
  }

  const pair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign', 'verify'],
  );

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DPOP_STORE, 'readwrite');
    tx.objectStore(DPOP_STORE).put(pair, DPOP_KEY_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return pair;
}

export async function exportDpopPublicJwk(publicKey: CryptoKey): Promise<EcPublicJwk> {
  const jwk = (await crypto.subtle.exportKey('jwk', publicKey)) as JsonWebKey;
  if (jwk.kty !== 'EC' || jwk.crv !== 'P-256' || !jwk.x || !jwk.y) {
    throw new Error('Invalid DPoP public JWK');
  }
  return { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y };
}

export type CreateDpopProofInput = {
  method: string;
  url: string;
  accessToken?: string;
};

/** Browser-only: compact DPoP JWT for the `DPoP` request header. */
export async function createDpopProof(input: CreateDpopProofInput): Promise<string> {
  const pair = await getOrCreateDpopKeyPair();
  const jwk = await exportDpopPublicJwk(pair.publicKey);
  const header = { typ: 'dpop+jwt', alg: 'ES256', jwk };
  const payload: Record<string, string | number> = {
    jti: crypto.randomUUID(),
    htm: input.method.toUpperCase(),
    htu: stripQueryAndFragment(input.url),
    iat: Math.floor(Date.now() / 1000),
  };
  if (input.accessToken) {
    payload.ath = await accessTokenHashWeb(input.accessToken);
  }

  const encHeader = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const encPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${encHeader}.${encPayload}`;
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    pair.privateKey,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${base64UrlEncode(signature)}`;
}
