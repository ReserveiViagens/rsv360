# PR-10c-pré-b — Refresh cookie admin + turismo (Path `/api/v1/auth`)

**Branch:** `security/pr-10c-pre-b-refresh-admin-turismo`  
**Baseline:** `09352853` (10c-pré-a)

## Decisão vinculante

Opção **B** — cookie direto no backend Path=`/api/v1/auth` + clients admin/turismo + CSRF Express (`assertCookieMutationOrigin`).

## Pendência de deploy (não bloqueia esta fatia)

Em produção multi-subdomínio (`admin.*` → `api.*`), antes do cut-over de `AUTH_REFRESH_COOKIE_REQUIRED=true`:

- `Domain=` compartilhado **ou**
- `SameSite=None; Secure`

Lab localhost (ports) permanece OK com `SameSite=Lax`.

## Notas

- Strip de `refresh_token` no JSON **somente** quando `Origin` presente (browser). BFF site-publico (server fetch sem Origin) continua recebendo refresh no body para mintar Path=`/api/auth`.
- `logout-all` **não** limpa o cookie do caller (preserva a família da sessão atual); `/logout` limpa.
- Flag `AUTH_REFRESH_COOKIE_REQUIRED` permanece default OFF.
