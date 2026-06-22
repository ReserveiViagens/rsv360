# Lint #237 — turismo integracoes-automacao + pagamentos + integracoes-servicos

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-integracoes-pagamentos`

## Cluster selecionado

Ranking pós-#406 (excl. voucher-editor + validation): **3704** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/pages/integracoes-automacao.tsx` | 34 |
| `src/pages/pagamentos.tsx` | 34 |
| `src/pages/integracoes-servicos.tsx` | 33 |
| **Total cluster** | **101** |

## Baseline → after

| Métrica | Pós-#406 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **3704** | **3603** (**−101**) |
| 3 arquivos alvo | 101 | **0** (**−101**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `integracoes-automacao.tsx` | 34 | 0 |
| `pagamentos.tsx` | 34 | 0 |
| `integracoes-servicos.tsx` | 33 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −56 (49→33 automacao, 37→20 pagamentos, 54→31 servicos) |
| integracoes-automacao: UI morta, state morto, `unknown`, id estável em template | residual pages |
| pagamentos: modais/export mortos, `MOCK_PAYMENTS` hoist, `PAYMENT_PERIODS` | residual pages |
| integracoes-servicos: UI/state/função mortos, `unknown`, cast de category | residual pages |

## Scripts adicionados

- `scripts/fix-integracoes-pagamentos-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |
| `eslint-warnings-rank.cjs` | **3603** global |

## Próximo cluster sugerido

1. `src/components/integrations/APIGateway.tsx` — 33
2. `src/components/integrations/WebhookManager.tsx` — 33
3. `src/components/projects/ProjectCollaboration.tsx` — 33

## Veredito

**GO condicional** — cluster integracoes-automacao/pagamentos/integracoes-servicos saneado; débito global ~3603 warnings.
