# D2 — 2FA / password reset defer (turismo)

**Data:** 2026-06-22  
**Status:** Cliente tratado; backend v1 pendente spec segurança

## Decisão

Sem endpoints `/api/v1/auth/2fa/*` nem forgot/reset no backend, o turismo **não chama** mais `/api/auth/*` (404).

## Implementação cliente

| Arquivo | Comportamento |
|---------|---------------|
| `apps/turismo/src/lib/auth-legacy-deferred.ts` | Mensagens e `rejectDeferredAuth()` |
| `apps/turismo/src/services/authService.ts` | 2FA/forgot/reset → erro explícito |
| `apps/turismo/src/components/auth/AuthPage.tsx` | "Esqueceu senha" → mensagem defer |

## Próximo (quando houver spec)

1. Backend v1 2FA + password reset
2. Wire turismo (mesmo padrão register D2.3)
3. Remover `auth-legacy-deferred.ts`
