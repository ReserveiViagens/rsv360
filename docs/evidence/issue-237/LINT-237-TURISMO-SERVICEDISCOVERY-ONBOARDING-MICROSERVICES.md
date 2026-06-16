# Lint #237 — turismo ServiceDiscovery + OnboardingWizard + MicroservicesManager

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-servicediscovery-onboarding-microservices`

## Cluster selecionado

Ranking pós-#405 (excl. voucher-editor + validation): **3819** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/components/integrations/ServiceDiscovery.tsx` | 39 |
| `src/components/training/OnboardingWizard.tsx` | 39 |
| `src/components/integrations/MicroservicesManager.tsx` | 37 |
| **Total cluster** | **115** |

## Baseline → after

| Métrica | Pós-#405 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **3819** | **3704** (**−115**) |
| 3 arquivos alvo | 115 | **0** (**−115**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `ServiceDiscovery.tsx` | 39 | 0 |
| `OnboardingWizard.tsx` | 39 | 0 |
| `MicroservicesManager.tsx` | 37 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −79 (29→29 SD, 54→23 OW, 52→27 MM) |
| ServiceDiscovery: UI/recharts mortos, interfaces/state mortos, `unknown` | residual integrations |
| MicroservicesManager: UI/recharts mortos, interfaces/state mortos, `Database` morto | residual integrations |
| OnboardingWizard: `Textarea`/state morto, `Edit` restaurado, `unknown`, `formatDateTime` morto | residual training |

## Scripts adicionados

- `scripts/fix-servicediscovery-onboarding-microservices-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

1. `src/pages/integracoes-automacao.tsx` — 34
2. `src/pages/pagamentos.tsx` — 34
3. `src/pages/integracoes-servicos.tsx` — 33

## Veredito

**GO condicional** — cluster ServiceDiscovery/OnboardingWizard/MicroservicesManager saneado; débito global ~3704 warnings.
