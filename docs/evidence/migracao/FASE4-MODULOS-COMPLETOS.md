# Fase 4 — 7 módulos completos (backend + frontend)

**Data:** 2026-06-23  
**Branch:** `feat/migracao-sistema-a-para-b`  
**Migration:** `0009_fase4_extensoes.sql` (5 tabelas novas)

---

## Migration 0009 — tabelas novas

| Tabela | Uso |
|--------|-----|
| `contas_pagar` | Financeiro — contas a pagar |
| `fornecedores` | Logística |
| `reservas_logistica` | Logística — reservas de serviço |
| `vouchers` | Logística — vouchers |
| `fnrh_registros` | Passageiros — FNRH |

Schema: `backend/src/db/schema/fase1-ext.ts`

---

## Backend — endpoints por módulo

### Orçamentos
- CRUD + `POST /:id/itens` + `PUT/DELETE /:id/itens/:itemId`
- `POST /:id/converter-proposta` — recálculo automático de totais

### Propostas
- CRUD + templates (GET/PUT/DELETE) + chat + HITL + `POST /:id/responder`

### Passageiros
- CRUD + `POST /:id/documentos` + `DELETE /:id/documentos/:index`
- `POST /:id/fnrh` + `PUT /fnrh/:fnrhId`

### Financeiro
- `GET /` e `/dashboard` — resumo
- `GET /fluxo-caixa` — entradas/saídas/saldo
- CRUD transações + contas receber/pagar

### Campanhas
- CRUD campanhas + cupons + `GET /metricas` + `POST /cupons/validar`

### Logística
- `GET /` — summary
- transportes, embarques, fornecedores, reservas, vouchers (CRUD parcial)

### Relatórios
- `GET /dashboard` — KPIs agregados
- `GET /export/csv?tipo=` · `GET /export/pdf?tipo=`
- CRUD views + snapshots

---

## Frontend turismo (:3005)

| Rota | Módulo |
|------|--------|
| `/modulos` | Hub Fase 4 |
| `/orcamentos`, `/orcamentos/nova`, `/orcamentos/[id]` | Orçamentos |
| `/propostas/*` | Propostas (Fase 3 + templates) |
| `/passageiros`, `/passageiros/nova`, `/passageiros/[id]` | Passageiros + FNRH |
| `/financeiro` | Dashboard + fluxo + transações |
| `/campanhas` | Campanhas + cupons + métricas |
| `/logistica` | Fornecedores + vouchers |
| `/relatorios` | Dashboard + export CSV/PDF |

API client: `apps/turismo/src/lib/fase1-api.ts`  
Hooks: `apps/turismo/src/hooks/useFase1Modules.ts`

---

## Frontend admin (:3004)

- 7 páginas listagem/dashboard (`pages/{modulo}/index.tsx`)
- Admin API corrigida para financeiro/logística/relatórios (`/dashboard` ou `/`)

---

## Comandos

```powershell
# Aplicar migration 0009
docker exec rsv360-backend npm run migrate
# ou psql direto no container

# Subir stack
cd backend; node server.js
cd apps/turismo; npm run dev   # :3005/modulos
cd apps/admin; npm run dev     # :3004/orcamentos
```

---

## Pendências pós-Fase 4

- [ ] Smoke Fase 3 — `FASE3-SMOKE-RESULT.md`
- [ ] Fase 1.6 — `npm run migrate:db-json` quando tiver `db.json`
- [x] Fase 5 — testes E2E + deploy (`FASE5-TESTES-DEPLOY.md`)
