# Fase 5 — API leilões `:3002` — resultado

**Data:** 2026-06-25 (atualizado pós 5.2 + 5.3)  
**Base:** `main` @ PR #34 merged + Crm PR #11 merged

---

## 5.1 — API backend ✅

| Artefato | Status |
|----------|--------|
| `backend/drizzle/0012_auctions_bids.sql` | ✅ |
| `backend/src/api/v1/auctions/*` | ✅ |
| `backend/scripts/seed-auctions.js` | ✅ |
| Integration test (mock DB) | ✅ 3 testes |

**Merge:** rsv360 PR #34 (`21752eaa`)

---

## 5.2 — Proxy S1 → :3002 ✅

| Artefato | Status |
|----------|--------|
| `GET /api/leiloes` → `:3002/api/v1/auctions/active` | ✅ |
| `leiloes.tsx` consome API + fallback mock | ✅ |
| `.env.example` `RSV360_BACKEND_URL`, `USE_RSV360_AUCTIONS` | ✅ |

**Merge:** Crm-RSV-360 PR #11 (`65c500e`)

---

## 5.3 — Smoke automatizado ✅

| Artefato | Status |
|----------|--------|
| `tests/e2e/auctions-smoke.js` | ✅ |
| `npm run smoke:auctions` | ✅ |

### O que valida

1. `GET /health` no backend `:3002`
2. `GET /api/v1/auctions/active` — array com ≥1 leilão ativo
3. `GET /api/v1/auctions/:id` — detalhe
4. `POST /api/v1/auth/login` — JWT do usuário seed
5. `POST /api/v1/auctions/:id/bids` — lance autenticado + `current_price` atualizado
6. (Opcional) `GET :5000/api/leiloes` — proxy S1 se Crm estiver rodando

### Comandos

```powershell
cd rsv360
docker compose up -d postgres backend
docker compose exec backend npm run migrate
npm run seed:auctions

npm run smoke:auctions
```

Env opcionais: `RSV_AUCTIONS_BACKEND_URL`, `RSV_SMOKE_PRIMARY_SITE_URL`, `SEED_TEST_USER_EMAIL`, `SEED_TEST_USER_PASSWORD`.

---

## Pendente (5.4)

- [ ] E2E Playwright: login S1 → `/leiloes` → dar lance → validar no `:3002`
- [ ] WebSocket live bids (opcional)

---

## Referências

- `FASE5-AUCTIONS-PLAN.md`
- `docs/AUDITORIA-MODULO-LEILOES.md`
