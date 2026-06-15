# Lint #237 — turismo full `--quiet` (pós #378)

**Data:** 2026-06-02  
**Base:** `main` @ `7382b6b78`

## Escopo

`npx eslint . --quiet` em `apps/turismo`

| Gate | Baseline T0.24 | Pós #378 |
|------|----------------|----------|
| exit code | 0 (455 erros*) | **0** |
| erros | 455 | **0** |
| warnings (sem `--quiet`) | ~8277 | **8272** |

\*Baseline incluía erros em volume legado; T0.23a–f + lint incremental eliminaram todos os **erros** ESLint.

Módulos scoped já documentados: `notifications`, `src/services/api`, `pages/cotacoes`, `bookings`, `analytics`, `dashboard`, `accommodations`, `reports`, `shared`, `lib`, `src/services`.

Artefato: [logs/T0.23g-lint-turismo-full-quiet.log](./logs/T0.23g-lint-turismo-full-quiet.log)

## Veredito

**GO** — turismo sem erros ESLint (`--quiet` exit 0); warnings cosméticos (~8k) fora de escopo #237 erros.
