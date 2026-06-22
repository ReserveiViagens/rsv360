# ESLint site-publico — Spike #57

**Issue:** #57 | **Status:** blocked/deferred (eslint-plugin-react + ESLint 10)

## Estado

- Flat config em `apps/site-publico/eslint.config.mjs` já existe
- Turismo na `main`: baseline 0
- Meta site-publico: zerar **errors** (escopo #237 original)

## Próximo passo

1. Pin ESLint 9 até ecossistema react estável, **ou**
2. Atualizar plugins compatíveis com ESLint 10 e rodar `npm run lint --workspace=apps/site-publico`
3. Documentar delta errors vs warnings antes de PR

## Defer

- PR #346 (ESLint 10 admin) — após #229 + build monorepo verdes
