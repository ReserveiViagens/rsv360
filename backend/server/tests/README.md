# Testes backend — módulos Fase 1

Os testes Jest/Supertest dos 7 módulos ficam em:

- `backend/src/__tests__/integration/fase1-modules-health.integration.test.ts` — health + auth
- `backend/src/__tests__/integration/fase1-modules-crud.integration.test.ts` — CRUD serial (requer `DATABASE_URL`)
- `backend/src/__tests__/integration/propostas-websocket.integration.test.ts` — Socket.IO Chat HITL

Helpers: `backend/src/test/fase1-test-helpers.ts`, `backend/src/test/fase1-db-setup.ts`

```bash
cd backend
DATABASE_URL=postgresql://... npm run migrate
npm test
```
