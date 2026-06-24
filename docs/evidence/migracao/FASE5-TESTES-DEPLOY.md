# Fase 5 — Testes + Deploy

**Data:** 2026-06-23  
**Branch:** `feat/migracao-sistema-a-para-b`

---

## 1. Testes Jest/Supertest (backend)

| Arquivo | Cobertura |
|---------|-----------|
| `fase1-modules-health.integration.test.ts` | Health 7 módulos + 401 sem token |
| `fase1-modules-crud.integration.test.ts` | CRUD serial: orçamento→proposta, passageiro/FNRH, financeiro, campanhas, logística, relatórios |
| `propostas-websocket.integration.test.ts` | Socket.IO `/propostas` — join, chat, HITL takeover |

Helpers: `backend/src/test/fase1-test-helpers.ts`, `fase1-db-setup.ts`  
Índice: `backend/server/tests/README.md`

```powershell
cd backend
$env:DATABASE_URL="postgresql://rsv360:rsv360_dev_2024@localhost:5432/rsv_360_ecosystem"
npm run migrate
npm test -- --testPathPattern="fase1-modules|propostas-websocket"
```

---

## 2. Playwright E2E (frontends)

| Spec | App | Fluxo |
|------|-----|-------|
| `proposta-publica.spec.ts` | site-publico :3000 | `/proposta/[id]` — visualizar, chat, aceitar |
| `proposta-editor.spec.ts` | turismo :3005 | Editor — editar título |
| `proposta-hitl.spec.ts` | turismo :3005 | Atendimento — assumir chat, enviar mensagem |

Config: `tests/e2e/playwright.fase5.config.ts`  
Helpers: `tests/e2e/fase5/helpers.ts`

```powershell
npm run test:e2e:fase5
# ou suite completa Fase 5:
npm run test:fase5
```

Env E2E:
- `RSV_FASE5_BACKEND_URL` (default `http://localhost:3002`)
- `RSV_FASE5_SITE_URL` (default `http://localhost:3000`)
- `RSV_FASE5_TURISMO_URL` (default `http://localhost:3005`)
- `SEED_TEST_USER_EMAIL` / `SEED_TEST_USER_PASSWORD`

---

## 3. Migração de dados (Sistema A → B)

Script: `scripts/migrate-db-json.ts`  
Exemplo: `data/db.json.example`

```powershell
# Copiar db.json real do Sistema A legado
cp data/db.json.example data/db.json   # ou copiar de Crm-RSV-360
$env:DATABASE_URL="postgresql://..."
npm run migrate:db-json
```

Exit 0 se `data/db.json` ausente (idempotente).

---

## 4. Docker build produção

| Arquivo | Descrição |
|---------|-----------|
| `docker-compose.prod.yml` | Stack prod: postgres, redis, backend, 4 frontends |
| `docker/backend/Dockerfile` | Multi-stage backend (tsx) |
| `docker/frontend/Dockerfile` | Multi-stage Next.js por app |
| `scripts/docker-build-prod.ps1` | Build local |

```powershell
cp .env.production.example .env
npm run validate:auth-env
npm run docker:build:prod
npm run docker:up:prod
docker compose -f docker-compose.prod.yml exec backend npm run migrate
```

Imagens GHCR (CD): `backend`, `site-publico`, `turismo`, `admin`, `guest`

---

## 5. CI/CD

| Workflow | Função |
|----------|--------|
| `.github/workflows/fase5-tests.yml` | Jest módulos + WS, migrate dry-run, Docker build, Playwright Fase 5, validate env |
| `.github/workflows/ci.yml` | Migrate antes dos testes backend |
| `.github/workflows/cd-production.yml` | Tag `v*` → build 5 imagens GHCR + deploy SSH |

### Secrets GitHub (produção)

| Secret | Uso |
|--------|-----|
| `PRODUCTION_HOST` | Servidor SSH |
| `PRODUCTION_USER` | Usuário SSH |
| `PRODUCTION_SSH_KEY` | Chave privada |
| `PRODUCTION_PATH` | Diretório do projeto no servidor |
| `PRODUCTION_PORT` | Porta SSH (opcional) |
| `SLACK_WEBHOOK_URL` | Notificações (opcional) |
| `SEED_TEST_USER_PASSWORD` | E2E CI |

### Vars GitHub

| Var | Uso |
|-----|-----|
| `NEXT_PUBLIC_API_URL` | Build frontends produção |
| `NEXT_PUBLIC_BACKEND_URL` | Build frontends produção |
| `PRODUCTION_URL` | URL ambiente GitHub Deployments |
| `SEED_TEST_USER_EMAIL` | E2E CI |

---

## Checklist Notion — Fase 5

- [x] Jest/Supertest — 7 módulos + auth + WebSocket HITL
- [x] Playwright E2E — proposta pública, editor, atendimento HITL
- [x] migrate-db-json — script + `data/db.json.example`
- [x] Docker prod — `docker-compose.prod.yml` + build multi-stage
- [x] CI/CD — `fase5-tests.yml` + `cd-production` 5 imagens

---

## Pendências pós-Fase 5

- [ ] Smoke manual Fase 3 — `FASE3-SMOKE-RESULT.md`
- [ ] Executar `migrate:db-json` com `db.json` real (Fase 1.6)
- [ ] Configurar secrets/vars produção no GitHub
- [ ] Primeiro deploy tag `v*` em servidor com `.env` produção
