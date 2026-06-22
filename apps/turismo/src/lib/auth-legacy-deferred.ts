/** Fluxos legados sem backend v1 — defer até spec de segurança (D2). */

export const AUTH_DEFERRED_MESSAGES = {
  twoFactor:
    'Autenticação em dois fatores indisponível no momento. Entre em contato com o suporte.',
  passwordReset:
    'Recuperação de senha indisponível no momento. Entre em contato com o suporte.',
} as const;

export type AuthDeferredFeature = keyof typeof AUTH_DEFERRED_MESSAGES;

export function rejectDeferredAuth(feature: AuthDeferredFeature): never {
  throw new Error(AUTH_DEFERRED_MESSAGES[feature]);
}
