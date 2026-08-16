# turismo-ls-prep — stop writing refresh to localStorage (pré-04b)

**GO:** `GO turismo-ls-prep` (tip GO citava `8d133208`; executado em **`d61ec4d6`** pós-#243)  
**Branch:** `security/pr-turismo-ls-prep`  
**OUT:** `AUTH_REFRESH_COOKIE_REQUIRED=true` (04b) · 10c-infra-c Domain · VPS

## Problema

AuthContext (T1/pré-b) já usava `credentials: 'include'` e limpava `refresh_token` no login, mas **`tokenManager` / `authService` ainda gravavam refresh no LS** e o login axios exigia `refresh_token` no JSON (quebra quando o backend stripa o body no browser).

## Escopo

| Arquivo | Mudança |
|---------|---------|
| `apiClient.ts` | `withCredentials: true`; `setTokens` **nunca** persiste refresh; `setAccessToken` / `clearRefreshTokens` |
| `authService.ts` | Login/2FA com access-only; refresh cookie-first; logout sem body se sem legado |
| `AuthContext.tsx` | Limpa também `authToken` / `refreshToken` camelCase |

## Validação

```bash
node --test apps/turismo/src/services/__tests__/tokenManager-ls-prep.test.cjs
```

## Ainda dívida (não desta fatia)

- `services/api.ts` / `lib/api-client.ts` legados (se ainda roteados) — fora do path AuthContext/authService
- `AUTH_REFRESH_COOKIE_REQUIRED` continua OFF
- Multi-host cookie Domain → 10c-infra-c (VPS)

## Risco

- Blast: turismo auth client only.
- Cross-origin lab: CORS + credentials já exigidos pelo pré-b.
- Sessões com refresh só no LS: um refresh com body legado ainda funciona, depois limpa LS.

## Rollback

Revert squash.
