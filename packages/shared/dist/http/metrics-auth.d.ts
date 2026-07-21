type EnvLike = Record<string, string | undefined>;
export declare function getMetricsToken(env?: EnvLike): string | undefined;
/**
 * Returns true only when Authorization: Bearer <METRICS_TOKEN> matches.
 * No token configured → always false (fail-closed).
 */
export declare function isMetricsBearerAuthorized(authorizationHeader: string | null | undefined, env?: EnvLike): boolean;
export {};
