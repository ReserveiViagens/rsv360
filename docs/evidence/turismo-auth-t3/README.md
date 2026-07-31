# turismo/auth-t3 — Limpeza compose legado + ECOSYSTEM mortos + dedupe residual

**Base:** `main @ e0e1118d` (pós-T2 / #185)  
**Branch:** `turismo/auth-t3`  
**Escopo:** remoções + cosmético `port:5000`→`3002` em arquivos **kept**; zero código funcional novo.

## Decisões (resumo)

| Arquivo | Status | Decisão |
|---------|--------|---------|
| `docker-compose.yml` (apps/turismo) | dead | **delete** |
| `RSV-360-ECOSYSTEM-README.md` | dead | **delete** |
| `RSV-360-ECOSYSTEM-ARCHITECTURE.md` | dead | **delete** |
| `IMPLEMENTACAO-RESPONSIVE-SIDEBAR-COMPLETA.md` | dead | **delete** |
| `services/api-gateway-complete.ts` | dead | **delete** |
| `stores/ecosystem-store.ts` | dead (orphan) | **delete** |
| `pages/rsv-360-ecosystem.tsx` | **vivo** (nav links) | **keep** + `port:3002` |
| `components/ResponsiveSidebar.tsx` | vivo (usado pela page) | **keep** + `port:3002` |
| `services/api-corrigido.ts` | **vivo** (`hotels-funcional`) | **keep** |
| `context/` | already absent (T1) | N/A |
| Compose raiz | vivo | **untouched** |

Detalhe completo: `inventory.json`.

## Por que a page ecosystem NÃO foi deletada

Links vivos em `turismo.tsx`, `dashboard.tsx`, `src/pages/dashboard.tsx`, `dashboard-reservei-viagens.tsx` → vinculante ③b / ⑧: deletar a page sem remover links **quebra navegação**. Remover os links seria alteração de UX em superfície viva (fora de escopo).

## Continuidade T2 (`port:5000`)

- `grep-before.json`: **4** hits  
- `grep-after.json`: **0**  
- Resolvido por delete de `api-gateway-complete.ts` + cosmético nos 2 kept.

## Fora de escopo

- `pages/reservei/RSV-360-ECOSYSTEM/`  
- backend / site-publico / 04b / compose raiz / `src/context/`

## Validação

- `npm run build --workspace=apps/turismo` PASS  
- lockfile intocado → Docker Fase 5 N/A  
- backend intocado
