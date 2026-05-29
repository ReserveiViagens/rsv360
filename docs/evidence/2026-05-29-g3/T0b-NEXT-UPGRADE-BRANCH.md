# T0b — Upgrade Next/eslint (site-publico) — branch isolada

**Objetivo:** zerar os **4 high** restantes (`next`, `eslint-config-next`, `@next/eslint-plugin-next`, `glob`).

**Não fazer em `main` direto** — gate G2-integrado deve permanecer verde na branch antes do merge.

## Branch sugerida

```bash
cd "$S2_ROOT"
git checkout -b security/t0b-next15-site-publico
```

## Opções de versão

| Opção | next | eslint-config-next | Notas |
|-------|------|-------------------|--------|
| **A (recomendada)** | `15.5.16` ou último 15.5.x | `15.5.x` | Alinha com `apps/admin` / `guest` (Next 15); React 18 compatível |
| B | `16.2.x` | `16.2.x` | Major maior; validar React 19 e breaking |

## Checklist da branch — executado 29/05/2026

```text
[x] Atualizar package.json (next, eslint-config-next ^15.5.16)
[x] npm install --legacy-peer-deps
[x] npm run lint && npm run build
[ ] Reexecutar run-g2-wsl.sh (step site-publico) — recomendado
[x] npm audit → 0 high em site-publico (15.5.18)
[x] run-g3-security-wsl.sh — FAIL=0
[ ] PR + merge após ROLLBACK-READINESS
```

## Critérios de merge

- G2 site-publico: PASS
- site-publico audit: **0 high** (ou aceite documentado com compensating controls aprovado)
- Sem regressão smoke `:3000`

## Rollback da branch

Reverter merge ou `git revert`; Docker tag anterior conforme `ROLLBACK-READINESS.md`.
