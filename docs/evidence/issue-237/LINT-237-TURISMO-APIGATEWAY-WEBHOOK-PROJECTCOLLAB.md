# Lint #237 — turismo APIGateway + WebhookManager + ProjectCollaboration

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-apigateway-webhook-projectcollab`

## Cluster selecionado

Ranking pós-#407 (excl. voucher-editor + validation): **3603** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/components/integrations/APIGateway.tsx` | 33 |
| `src/components/integrations/WebhookManager.tsx` | 33 |
| `src/components/projects/ProjectCollaboration.tsx` | 33 |
| **Total cluster** | **99** |

## Baseline → after

| Métrica | Pós-#407 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **3603** | **3504** (**−99**) |
| 3 arquivos alvo | 99 | **0** (**−99**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `APIGateway.tsx` | 33 | 0 |
| `WebhookManager.tsx` | 33 | 0 |
| `ProjectCollaboration.tsx` | 33 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −43 (51→31 APIGateway, 51→28 WebhookManager) |
| APIGateway: UI/recharts mortos, interfaces/state mortos, `Pie` restaurado | residual integrations |
| WebhookManager: recharts/UI mortos, interfaces/state/função mortos, `unknown` | residual integrations |
| ProjectCollaboration: Lucide/UI mortos, `ImageIcon`, `Download`, tipos Select | residual projects |

## Scripts adicionados

- `scripts/fix-apigateway-webhook-projectcollab-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |
| `eslint-warnings-rank.cjs` | **3504** global |

## Próximo cluster sugerido

1. `pages/hotels.tsx` — 32
2. `src/pages/hotels.tsx` — 32
3. `src/pages/users.tsx` — 32

## Veredito

**GO condicional** — cluster APIGateway/WebhookManager/ProjectCollaboration saneado; débito global ~3504 warnings.
