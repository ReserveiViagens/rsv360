# Route Smoke (Playwright)

Smoke test de rotas (UI) rodando contra a stack Docker do RSV360.

## Pré-requisitos

1) Subir a stack:

```bash
docker compose up -d --build
```

2) Node no host (>= 18).

3) Instalar Playwright (uma vez):

```bash
npm i -D playwright
npx playwright install --with-deps chromium
```

## Rodar

```bash
node tests/e2e/route-smoke.js
```

### Modo marketing-lab (`:3000`)

Com `RSV360_APP_MODE=marketing-lab` (default no Docker local), rotas B2C do `site-publico` que redirecionam para o S1 (`:5000`) são **SKIP** com motivo `marketing-lab-b2c-external` — o CI não sobe o S1.

Smoke dedicado do lab:

```bash
npm run smoke:marketing-lab
```

Valida redirects `/` → `/lab`, `/hoteis` → `:5000`, LabShell em `/analytics` e hub `/marketing`.

Forçar skip no route-smoke sem depender do container:

```bash
RSV_SMOKE_MARKETING_LAB=true npm run test:e2e:routes
```

Artefatos em:

- `tests/e2e/artifacts/route-smoke_<timestamp>/report.json`
- `tests/e2e/artifacts/route-smoke_<timestamp>/report.md`

## Variáveis de ambiente

URLs (defaults):

- `RSV_SMOKE_SITE_PUBLICO_URL` (default: `http://localhost:3000`)
- `RSV_SMOKE_ADMIN_URL` (default: `http://localhost:3004`)
- `RSV_SMOKE_TURISMO_URL` (default: `http://localhost:3005`)
- `RSV_SMOKE_GUEST_URL` (default: `http://localhost:3006`)

Controle:

- `RSV_SMOKE_APPS` (default: `site-publico,admin,turismo,guest`)
- `RSV_SMOKE_HEADLESS` (default: `true`)
- `RSV_SMOKE_TIMEOUT_MS` (default: `60000`)
- `RSV_SMOKE_CONCURRENCY` (default: `4`)
- `RSV_SMOKE_MAX_FAILURES` (default: `50`)

Rotas dinâmicas:

- `[id]` → `RSV_SMOKE_ID`
- `[slug]` → `RSV_SMOKE_SLUG`
- `[...slug]` → `RSV_SMOKE_CATCHALL`

Sem seed/env, rotas dinâmicas ficam como **SKIP explícito** (não falham o job; contam em `Skipped`).

Allowlist de console:

- `RSV_SMOKE_CONSOLE_IGNORE`
  - Separador: `|`
  - Cada item é regex
  - Default: `chrome-extension://|ERR_BLOCKED_BY_CLIENT`

## Observação sobre autenticação

Rotas autenticadas podem redirecionar para `/login`. O teste marca isso como `redirectedToLogin=true` e conta como OK.

