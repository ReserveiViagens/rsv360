# PR-09b — dependency-review + harden compose lab defaults

**Branch:** `security/pr-09b-deps-compose`  
**Base:** `main @ 9afa0fd1` (pós-09a #196)  
**Estado:** PARAR na URL (H0)

## Diff

| Arquivo | Papel |
| --- | --- |
| `.github/workflows/dependency-review.yml` | Action `@v4`, `fail-on-severity: moderate`, `comment-summary-in-pr: never` |
| `docker-compose.yml` | Fail-closed secrets + plaintext flag false + bind localhost DB/Redis |
| `.env.example` | Placeholders `CHANGE_ME_*` para novos env obrigatórios |
| `docs/evidence/pr-09b/README.md` | esta evidence |

## Fase 0 — defaults fracos → patch

| Campo | Antes | Depois | Impacto lab |
| --- | --- | --- | --- |
| `MP_ACCESS_TOKEN` | `test-token` hardcoded | `${MP_ACCESS_TOKEN}` | Owner deve setar no `.env` antes do `compose up` |
| `META_*` / `TIKTOK_*` tokens | `placeholder` / `G-XXXXXXXXXX` | `${VAR:-}` opcional | Sem token fictício |
| `OAUTH_BFF_SECRET` / `SSO_BFF_SECRET` | default `rsv360-docker-dev-oauth-bff` | `${OAUTH_BFF_SECRET}` (SSO herda) | Fail-closed |
| `QR_SECRET` | default `rsv360-dev-qr-secret-local-only` | `${QR_SECRET}` | Fail-closed |
| `TURNSTILE_SECRET_KEY` | CF always-pass default | `${TURNSTILE_SECRET_KEY}` | Fail-closed (site key pública permanece) |
| `FORNECEDORES_ALLOW_PLAINTEXT_API_KEY` | `:-true` | `:-false` | Mais seguro; migração precisa flag explícita |
| Postgres / Redis ports | `0.0.0.0` implícito | `127.0.0.1:…` | Acesso só localhost no host |
| `GF_SECURITY_ADMIN_USER` | `admin` literal | `${GF_SECURITY_ADMIN_USER:-admin}` | Não-sensível |

## Pendência do owner (antes do próximo `compose up`)

Setar no `.env` (não commitado):

- `OAUTH_BFF_SECRET`
- `QR_SECRET`
- `MP_ACCESS_TOKEN`
- `TURNSTILE_SECRET_KEY` (ou chave de teste CF `1x0000…0AA` se quiser always-pass)

Sem esses, o compose interpola vazio / falha serviços que exigem secret.

## OUT

- Rotação de secrets (owner ops ③)
- Full-history gitleaks (09c / report-only)
- Required checks no ruleset
- GATE-PROD-01
- Nested compose turismo (`rsvpassword`) — fora do compose raiz

## Validação

```bash
docker compose -f docker-compose.yml config >/dev/null
# ou: docker-compose config
```
