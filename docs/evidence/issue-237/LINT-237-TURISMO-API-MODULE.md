# Lint #237 — turismo módulo `src/services/api` (incremental)

**Data:** 2026-06-02  
**Branch:** `chore/t1.3-tenant-routing` *(mesma PR)*

## Escopo

Refatoração `unwrapApiData` em `excursoesApi.ts` / `viagensGrupoApi.ts` — remove casts TS2352 e padroniza desembrulho `{ data: T }`.

## Gates

| Gate | Resultado |
|------|-----------|
| `eslint src/services/api --quiet` | **exit 0** |
| TS2352 em excursoes/viagensGrupo | **0** |

## Veredito

**Lint turismo api = GO** — primeiro módulo incremental; warnings globais (~8k) permanecem fora de escopo.

**Próximo:** módulo `src/components/notifications` ou `pages/cotacoes`.
