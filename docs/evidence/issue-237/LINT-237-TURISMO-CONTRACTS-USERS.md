# Lint #237 — turismo contracts×2 + pages/users

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-contracts-users`

## Cluster selecionado

Ranking pós-#404 (excl. voucher-editor + validation): **3936** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `pages/contracts.tsx` | 39 |
| `src/pages/contracts.tsx` | 39 |
| `pages/users.tsx` | 39 |
| **Total cluster** | **117** |

## Baseline → after

| Métrica | Pós-#404 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **3936** | **3819** (**−117**) |
| 3 arquivos alvo | 117 | **0** (**−117**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `pages/contracts.tsx` | 39 | 0 |
| `src/pages/contracts.tsx` | 39 | 0 |
| `pages/users.tsx` | 39 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −100 (contracts×2: 45→10, users: 38→8) |
| contracts×2: state só-setter, `priorityColors`/handlers mortos prefixados | residual pages |
| users: `loadData` reordenado, params tipado, `api` restaurado pós-trim, entidades HTML | residual pages |

## Scripts adicionados

- `scripts/fix-contracts-users-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

1. `src/components/integrations/ServiceDiscovery.tsx` — 39
2. `src/components/training/OnboardingWizard.tsx` — 39
3. `src/components/integrations/MicroservicesManager.tsx` — 37

## Veredito

**GO condicional** — cluster contracts/users saneado; débito global ~3819 warnings.
