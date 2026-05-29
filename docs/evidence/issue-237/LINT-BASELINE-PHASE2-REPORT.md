# Issue #237 — Fase 2 admin (2026-05-29)

## Branch
`codex/issue-237-lint-baseline-admin`

## Pré-requisito (baseline bloqueado)
Em `main`, `apps/admin` **não tinha** `.eslintrc.json` nem `eslint-config-next`; `npm run lint` falhava no prompt interativo do Next (sem inventário por regra).

## Setup ESLint (lote 0)
- `.eslintrc.json` alinhado ao `site-publico` (core-web-vitals + typescript, warnings para unused-vars)
- `devDependencies`: `eslint`, `eslint-config-next@^15.5.18`, `cross-env`
- `lint`: `cross-env CI=1 next lint` (não-interativo)

## Inventário inicial (pós-setup)
| Regra | Erros |
|-------|------:|
| @typescript-eslint/no-empty-object-type | 3 |
| **Total** | **3** |

Artefatos: `lint-inventory-admin.tsv`, `lint-inventory-admin-summary.txt`

## Lotes aplicados
1. **no-empty-object-type** — `InputProps`, `SelectProps`, `TextareaProps`: `interface` vazio → `type` alias (`components/ui/*.tsx`)
2. Demais regras do backlog Fase 1 (prefer-const, no-unescaped-entities, hooks, jsx-no-undef): **N/A** (0 ocorrências)

## Resultado final Fase 2
```bash
cd apps/admin && npm run lint
# exit 0 — 0 errors (warnings permanecem: unused-vars, no-img-element)
```

## Relação G2
O FAIL histórico `s2_apps_admin_lint` era por **ESLint não configurado**, não por dezenas de erros de código. Fase 2 corrige a causa raiz.

## Próximo
- Merge PR Fase 2 após review
- Opcional: merge/rebase com PR #238 (site-publico) se ainda aberta
