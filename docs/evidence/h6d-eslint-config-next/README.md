# H6d — eslint-config-next 16.2.11 (alinhamento pós-H2.3)

**Base:** `main @ b779362b` (pós-H6c)  
**Branch:** `h6d-eslint-config-next`  
**CVE:** nenhuma — higiene de consistência (`next` já em 16.2.11)

## Inventário (4 workspaces)

| Workspace | Antes | Depois |
|-----------|-------|--------|
| `apps/site-publico` | 16.2.7 | **16.2.11** |
| `apps/turismo` | 16.2.7 | **16.2.11** |
| `apps/admin` | 16.2.7 | **16.2.11** |
| `apps/guest` | 16.2.7 | **16.2.11** |

Grep pós-bump: **0** ocorrências de `eslint-config-next` @ 16.2.7 em manifests/lock.

## Validação

| Check | Resultado |
|-------|-----------|
| tsc backend | **0** |
| jest backend | **563** |
| build site-publico | **PASS** |
| Docker Fase 5 backend | **PASS** |
| Docker Fase 5 site-publico | **PASS** |
| audit-gate | **[OK]** · BLOCK vazio · allowlist **3** |
| Lint site-publico | 0 errors / 3225 warnings (exit 0; NODE_PATH→nested next) |
| Lint admin | 0 errors / 13 warnings |
| Lint guest | 0 errors / 8 warnings |
| Lint turismo CI gate (`eslint-warnings-rank.cjs`) | **Total warnings: 0** |
| Lint turismo `npm run lint` | host: plugin `react-hooks` resolve fail (layout monorepo) — CI gate acima é o check funcional |

## Escopo

Só manifests + lock. Sem mudança de código / regras ESLint custom. Sem tocar em `next`.
