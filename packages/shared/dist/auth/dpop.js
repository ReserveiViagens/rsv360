"use strict";
/**
 * PR-10c-a1/a2 — DPoP helpers (RFC 9449 / RFC 7638).
 * Browser-safe: WebCrypto ECDSA P-256 non-extractable + IndexedDB + DPoP proof.
 * Node callers may use computeJwkThumbprint (async) or backend dpop.service sync helpers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64UrlEncode = base64UrlEncode;
exports.base64UrlDecodeToUint8Array = base64UrlDecodeToUint8Array;
exports.computeJwkThumbprint = computeJwkThumbprint;
exports.accessTokenHashWeb = accessTokenHashWeb;
exports.stripQueryAndFragment = stripQueryAndFragment;
exports.getOrCreateDpopKeyPair = getOrCreateDpopKeyPair;
exports.exportDpopPublicJwk = exportDpopPublicJwk;
exports.createDpopProof = createDpopProof;
exports.resolveDpopHtu = resolveDpopHtu;
exports.tryCreateDpopProof = tryCreateDpopProof;
const DPOP_DB_NAME = 'rsv360-dpop';
const DPOP_STORE = 'keys';
const DPOP_KEY_ID = 'default';
function base64UrlEncode(input) {
    const bytes = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    const b64 = typeof btoa === 'function'
        ? btoa(binary)
        : Buffer.from(bytes).toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64UrlDecodeToUint8Array(input) {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    if (typeof atob === 'function') {
        const binary = atob(normalized + pad);
        const out = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1)
            out[i] = binary.charCodeAt(i);
        return out;
    }
    return new Uint8Array(Buffer.from(normalized + pad, 'base64'));
}
/** RFC 7638 — JWK thumbprint (SHA-256), base64url. */
async function computeJwkThumbprint(jwk) {
    const ordered = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
    const data = new TextEncoder().encode(JSON.stringify(ordered));
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const digest = await crypto.subtle.digest('SHA-256', data);
        return base64UrlEncode(digest);
    }
    const nodeCrypto = await import('crypto');
    return base64UrlEncode(nodeCrypto.createHash('sha256').update(Buffer.from(data)).digest());
}
async function accessTokenHashWeb(accessToken) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(accessToken));
    return base64UrlEncode(digest);
}
function stripQueryAndFragment(url) {
    try {
        const u = new URL(url);
        return `${u.origin}${u.pathname}`;
    }
    catch {
        return (url.split('#')[0] || url).split('?')[0] || url;
    }
}
function openDpopDb() {
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
async function getOrCreateDpopKeyPair() {
    if (typeof indexedDB === 'undefined' || !crypto?.subtle) {
        throw new Error('WebCrypto/IndexedDB unavailable');
    }
    const db = await openDpopDb();
    const existing = await new Promise((resolve, reject) => {
        const tx = db.transaction(DPOP_STORE, 'readonly');
        const getReq = tx.objectStore(DPOP_STORE).get(DPOP_KEY_ID);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => reject(getReq.error);
    });
    if (existing?.privateKey && existing?.publicKey) {
        return existing;
    }
    const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
    await new Promise((resolve, reject) => {
        const tx = db.transaction(DPOP_STORE, 'readwrite');
        tx.objectStore(DPOP_STORE).put(pair, DPOP_KEY_ID);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    return pair;
}
async function exportDpopPublicJwk(publicKey) {
    const jwk = (await crypto.subtle.exportKey('jwk', publicKey));
    if (jwk.kty !== 'EC' || jwk.crv !== 'P-256' || !jwk.x || !jwk.y) {
        throw new Error('Invalid DPoP public JWK');
    }
    return { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y };
}
/** Browser-only: compact DPoP JWT for the `DPoP` request header. */
async function createDpopProof(input) {
    const pair = await getOrCreateDpopKeyPair();
    const jwk = await exportDpopPublicJwk(pair.publicKey);
    const header = { typ: 'dpop+jwt', alg: 'ES256', jwk };
    const payload = {
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
    const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, new TextEncoder().encode(signingInput));
    return `${signingInput}.${base64UrlEncode(signature)}`;
}
/**
 * Absolute URL for DPoP `htu` (RFC 9449).
 * Site-publico BFF `/api/auth/*` maps to upstream `/api/v1/auth/*` so proof matches the AS.
 */
function resolveDpopHtu(requestUrl, options) {
    const base = options?.baseUrl ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    let absolute;
    try {
        absolute = new URL(requestUrl, base);
    }
    catch {
        return stripQueryAndFragment(requestUrl);
    }
    const upstreamBase = (options?.upstreamAuthBase || '').replace(/\/$/, '');
    if (upstreamBase && absolute.pathname.startsWith('/api/auth')) {
        const upstreamPath = absolute.pathname.replace(/^\/api\/auth/, '/api/v1/auth');
        return stripQueryAndFragment(`${upstreamBase}${upstreamPath}`);
    }
    return stripQueryAndFragment(absolute.href);
}
/** Best-effort browser DPoP — never blocks the request (flag OFF migration). */
async function tryCreateDpopProof(input) {
    if (typeof window === 'undefined')
        return null;
    try {
        return await createDpopProof(input);
    }
    catch {
        return null;
    }
}
