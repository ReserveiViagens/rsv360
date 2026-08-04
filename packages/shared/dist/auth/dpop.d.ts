/**
 * PR-10c-a1/a2 — DPoP helpers (RFC 9449 / RFC 7638).
 * Browser-safe: WebCrypto ECDSA P-256 non-extractable + IndexedDB + DPoP proof.
 * Node callers may use computeJwkThumbprint (async) or backend dpop.service sync helpers.
 */
export type EcPublicJwk = {
    kty: 'EC';
    crv: 'P-256';
    x: string;
    y: string;
};
export declare function base64UrlEncode(input: Uint8Array | ArrayBuffer): string;
export declare function base64UrlDecodeToUint8Array(input: string): Uint8Array;
/** RFC 7638 — JWK thumbprint (SHA-256), base64url. */
export declare function computeJwkThumbprint(jwk: EcPublicJwk): Promise<string>;
export declare function accessTokenHashWeb(accessToken: string): Promise<string>;
export declare function stripQueryAndFragment(url: string): string;
/** Browser-only: ECDSA P-256, private key non-extractable, IndexedDB. */
export declare function getOrCreateDpopKeyPair(): Promise<CryptoKeyPair>;
export declare function exportDpopPublicJwk(publicKey: CryptoKey): Promise<EcPublicJwk>;
export type CreateDpopProofInput = {
    method: string;
    url: string;
    accessToken?: string;
};
/** Browser-only: compact DPoP JWT for the `DPoP` request header. */
export declare function createDpopProof(input: CreateDpopProofInput): Promise<string>;
/**
 * Absolute URL for DPoP `htu` (RFC 9449).
 * Site-publico BFF `/api/auth/*` maps to upstream `/api/v1/auth/*` so proof matches the AS.
 */
export declare function resolveDpopHtu(requestUrl: string, options?: {
    baseUrl?: string;
    upstreamAuthBase?: string;
}): string;
/** Best-effort browser DPoP — never blocks the request (flag OFF migration). */
export declare function tryCreateDpopProof(input: CreateDpopProofInput): Promise<string | null>;
