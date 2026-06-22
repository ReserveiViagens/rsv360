# Lint #237 — turismo IntegrationHub + ProjectTimeline + atracoes

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-integration-project-atracoes`  
**Cluster:** **#1** do plano `lint-237-clusters.json`

## Cluster selecionado

Ranking pós-#412 (excl. voucher-editor + validation): **3141** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/components/integrations/IntegrationHub.tsx` | 29 |
| `src/components/projects/ProjectTimeline.tsx` | 29 |
| `pages/cotacoes/atracoes.tsx` | 28 |
| **Total cluster** | **86** |

## Baseline → after

| Métrica | Pós-#412 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **3141** | **3055** (**−86**) |
| 3 arquivos alvo | 86 | **0** (**−86**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `IntegrationHub.tsx` | 29 | 0 |
| `ProjectTimeline.tsx` | 29 | 0 |
| `atracoes.tsx` | 28 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide (3 arquivos) | −53 |
| IntegrationHub: remover `Progress`/`LineChart`/`Line`, `MarketplaceStats`, state morto, `Record<string, unknown>` | residual |
| ProjectTimeline: restaurar imports `@/components/ui`, `Plus`, prefixar args mortos, `string` nos Select | residual |
| atracoes: espelhar `passeios` (hooks, `unknown`, `ImageIcon`, fragment img) | residual |

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |
| `eslint-warnings-rank.cjs` | **3055** global |

## Próximo cluster sugerido (#2)

1. `pages/dashboard-master.tsx` — 28
2. `pages/hotels-funcional.tsx` — 28
3. `src/components/financial/FinancialAnalytics.tsx` — 28

## Veredito

**GO condicional** — cluster #1 saneado; débito global ~3055 warnings; **119** clusters restantes no plano Codex.
