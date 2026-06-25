# Fase 5 — API leilões `:3002` — resultado parcial (5.1)

**Data:** 2026-06-25  
**Branch:** `feat/fase5-auctions-api`

---

## Entrega 5.1 — concluída

| Artefato | Status |
|----------|--------|
| `backend/drizzle/0012_auctions_bids.sql` | ✅ |
| `backend/drizzle/meta/0012_snapshot.json` | ✅ |
| `backend/src/api/v1/auctions/service.js` | ✅ |
| `backend/src/api/v1/auctions/routes.js` | ✅ |
| `backend/app.js` — registro router | ✅ |
| `backend/scripts/seed-auctions.js` | ✅ |
| `backend/src/__tests__/integration/auctions-v1.integration.test.ts` | ✅ 3 testes |

### Endpoints

| Método | Rota | Auth |
|--------|------|------|
| GET | `/api/v1/auctions` | público (paginado) |
| GET | `/api/v1/auctions/active` | público |
| GET | `/api/v1/auctions/map-data` | público |
| GET | `/api/v1/auctions/:id` | público |
| GET | `/api/v1/auctions/:id/bids` | público |
| POST | `/api/v1/auctions/:id/bids` | Bearer JWT |
| POST | `/api/v1/auctions` | Bearer JWT |

---

## Smoke local (2026-06-25)

```powershell
docker compose exec backend npm run migrate
docker compose exec backend node scripts/seed-auctions.js
curl http://127.0.0.1:3002/api/v1/auctions/active
# → 2 leilões active (Caldas Novas demo)
```

---

## Pendente (5.2–5.4)

- [ ] Smoke npm `smoke:auctions`
- [ ] Integration test com DB real (bid flow)
- [ ] S1 proxy `GET /api/leiloes` (Crm-RSV-360)
- [ ] WebSocket live bids (opcional)

---

## Referências

- `FASE5-AUCTIONS-PLAN.md`
- `docs/AUDITORIA-MODULO-LEILOES.md`
