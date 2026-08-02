# PR-10a — logout-all preserving current session

**Branch:** `security/pr-10a-logout-all-session-fixation`  
**Base:** `main @ fbfdbe10`  
**Remote:** `reserveiviagens-tech/rsv360`

## Fase 0

| Item | Achado |
| --- | --- |
| Storage | `refresh_tokens` (DB) — `token_family`, `revoked_at` |
| Session fixation | `createRefreshToken` → `generateTokenFamily()` a cada emissão; login já usa — **zero patch** em `login.service.js` |
| `POST /logout` | Continua revogar **todas** as families (OUT) |
| Gap | Revogar **outras** families; preservar a do caller |

## Diff

| Arquivo | Papel |
| --- | --- |
| `refresh-token.service.js` | `assertActiveRefreshOwnership` + `revokeOtherUserTokens` |
| `logout.service.js` | `logoutAllOtherSessions` |
| `routes.js` | `POST /logout-all` ordem 401→429→400→503→200 |
| `AppShell.tsx` | Botão + confirm (não limpa tokens locais) |
| `auth-v1-logout.integration.test.ts` | Perímetro + posse + refresh keep/revoked |
| `docs/evidence/pr-10a/README.md` | esta evidence |

## Ajustes vinculantes (auditoria)

1. **Posse:** refresh JWT válido + `userId` match + linha ativa não expirada — senão 400 sem UPDATE  
2. **Testes centrais:** keep family refreshável; family revogada → `verifyAndRotate` null  
3. **Mensagem 200:** `Todas as outras sessões foram encerradas`  
4. **Commit:** sem claim de regeneração de session ID  
5. **Ordem:** 401 Bearer → 429 rate limit → 400 ownership → 503 DB → 200  

## Como validar

```bash
# Sessão A (manter) e B (outra family) no mesmo user
POST /api/v1/auth/logout-all
Authorization: Bearer <access_A>
{ "refresh_token": "<refresh_A>" }

# Esperado: 200, sessionsRevoked >= 1, mensagem "outras sessões"
POST /api/v1/auth/refresh { "refresh_token": "<refresh_A>" }  # 200
POST /api/v1/auth/refresh { "refresh_token": "<refresh_B>" }  # 401/falha
```

## OUT

- 10b step-up · 10c DPoP · 04b HttpOnly · alterar `/logout`
