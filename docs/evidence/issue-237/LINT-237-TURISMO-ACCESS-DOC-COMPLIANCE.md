# Lint #237 — turismo AccessControlManager + DocumentationPage + ComplianceManager

**Data:** 2026-06-02  
**Branch:** `chore/lint-turismo-access-doc-compliance`

## Cluster selecionado

Ranking pós-#403 (excl. voucher-editor + validation): **4057** warnings globais.

| Arquivo | Warnings |
|---------|----------|
| `src/components/security/AccessControlManager.tsx` | 41 |
| `src/pages/DocumentationPage.tsx` | 40 |
| `src/components/security/ComplianceManager.tsx` | 40 |
| **Total cluster** | **121** |

## Baseline → after

| Métrica | Pós-#403 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings globais (excl. voucher/validation) | **4057** | **3936** (**−121**) |
| 3 arquivos alvo | 121 | **0** (**−121**) |

## Arquivos

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `AccessControlManager.tsx` | 41 | 0 |
| `DocumentationPage.tsx` | 40 | 0 |
| `ComplianceManager.tsx` | 40 | 0 |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide | −62 (AccessControl 60→27, Compliance 53→24) |
| AccessControlManager: `Textarea`/recharts mortos, interfaces/state/funções mortas | residual security |
| ComplianceManager: `Textarea`/recharts mortos, interfaces/state/funções mortas | residual security |
| DocumentationPage: imports mortos, params prefixados, `unknown`, entidades HTML | residual src/pages |

## Scripts adicionados

- `scripts/fix-access-doc-compliance-residual.cjs`

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** |
| `npx eslint` (3 arquivos alvo) | **0 warnings** |

## Próximo cluster sugerido

1. `pages/contracts.tsx` + `src/pages/contracts.tsx` — ~39 cada
2. `pages/users.tsx` — 39
3. *(revalidar ranking após merge)*

## Veredito

**GO condicional** — cluster AccessControl/Documentation/Compliance saneado; débito global ~3936 warnings.
