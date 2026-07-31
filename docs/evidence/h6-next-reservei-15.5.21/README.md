# H6 — next 15.5.21 in apps/turismo/pages/reservei

**Base:** `main @ 7331a0ff` (pós-F5)  
**Branch:** `deps/next-reservei-15.5.21`  
**Substitui:** Dependabot PR #169 (fechado — entry removida do dependabot.yml; rebase impossível)

## Diff

| Item | Antes | Depois |
|------|-------|--------|
| `apps/turismo/pages/reservei` `next` | **15.5.18** | **15.5.21** |
| Lockfile monorepo | — | **inalterado** (diretório sem `package-lock.json` versionado; igual ao #169) |

## Advisories (HIGH) — audit isolado do pacote

| GHSA | Antes (15.5.18) | Depois (15.5.21) |
|------|-----------------|------------------|
| GHSA-m99w-x7hq-7vfj (DoS Server Actions) | HIT | ABSENT |
| GHSA-89xv-2m56-2m9x (SSRF Server Actions) | HIT | ABSENT |
| GHSA-p9j2-gv94-2wf4 (SSRF rewrites) | HIT | ABSENT |
| GHSA-6gpp-xcg3-4w24 (middleware bypass) | não reportado pelo `npm audit` nesta árvore mínima | ABSENT |

## Validação

| Check | Resultado |
|-------|-----------|
| `bash .github/scripts/check-lockfiles.sh` | **OK** root + backend |
| `cd backend && npx tsc --noEmit` | **0** |
| Build app tocado (`next` **15.5.21**) | **PASS** (smoke com `pages/index` efêmero — o diretório não tem `pages/`/`app/` versionado; estrutura pré-existente) |
| Docker Fase 5 | **N/A** — monorepo lockfile não tocado |
| Escopo | 1 arquivo (`package.json`) — zero outras mudanças |

## Referência

Fecha o gap do #169: bump manual padrão H6.
