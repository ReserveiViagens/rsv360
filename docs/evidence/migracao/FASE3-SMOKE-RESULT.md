# Fase 3 — Smoke manual (resultado)

**Data:** _preencher_  
**Ambiente:** local Docker / staging  
**Branch:** `feat/migracao-sistema-a-para-b`  
**Executor:** _nome_

## Pré-requisitos

```powershell
docker compose -p rsv360 up -d postgres redis backend site-publico turismo admin guest
docker exec rsv360-backend npm run migrate
```

| Serviço | URL |
|---------|-----|
| site-publico | http://localhost:3000 |
| backend | http://localhost:3002 |
| admin | http://localhost:3004 |
| turismo | http://localhost:3005 |
| guest | http://localhost:3006 |

---

## Checklist rotas (Fase 3)

### site-publico (:3000)

| # | Rota | OK? | Notas |
|---|------|-----|-------|
| 1 | `/proposta/[id]` — proposta pública | [ ] | |
| 2 | Aceitar / Recusar proposta | [ ] | |
| 3 | Chat + WebSocket consultor | [ ] | |
| 4 | BFF `/api/propostas/*` | [ ] | |
| 5 | BFF `/api/orcamentos/*` | [ ] | |

### turismo (:3005)

| # | Rota | OK? | Notas |
|---|------|-----|-------|
| 6 | `/propostas` — listagem | [ ] | |
| 7 | `/propostas/nova` | [ ] | |
| 8 | `/propostas/[id]` — editor | [ ] | |
| 9 | `/propostas/[id]/atendimento` — HITL | [ ] | |
| 10 | `/orcamentos` + detalhe + converter | [ ] | |

### admin (:3004)

| # | Rota | OK? | Notas |
|---|------|-----|-------|
| 11 | `/orcamentos` | [ ] | |
| 12 | `/propostas` | [ ] | |
| 13 | `/passageiros` | [ ] | |
| 14 | `/financeiro` | [ ] | |
| 15 | `/campanhas` | [ ] | |
| 16 | `/logistica` | [ ] | |
| 17 | `/relatorios` | [ ] | |

### guest (:3006)

| # | Rota | OK? | Notas |
|---|------|-----|-------|
| 18 | `/minhas-propostas` | [ ] | |

### Backend / API

| # | Endpoint | OK? | Notas |
|---|----------|-----|-------|
| 19 | `GET /health` | [ ] | |
| 20 | `GET /api/v1/propostas/health` | [ ] | |
| 21 | WebSocket `ws://localhost:3002/propostas` | [ ] | join + chat + HITL |

---

## Resultado

- [ ] **PASS** — todos os itens críticos OK
- [ ] **FAIL** — bloqueadores: _listar_

### Bloqueadores encontrados

_(descrever aqui)_

---

## Evidências

- Screenshots: _opcional_
- IDs de proposta/orçamento usados nos testes: _
