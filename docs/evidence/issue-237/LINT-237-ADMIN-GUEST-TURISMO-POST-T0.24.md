# Lint #237 — admin/guest/turismo pós-T0.24

**Data:** 2026-06-02  
**Branch:** `chore/lint-237-admin-guest-turismo`  
**Base:** `main` pós T0.24 eslint hoist + T0.23c

## Contexto

Após T0.24 (`eslint@^9.39.0` na raiz), site-publico já havia zerado erros (#369). Esta rodada cobre **admin**, **guest** e **turismo**.

## Gates (`eslint . --quiet`)

| App | Erros | Exit code | Warnings (lint completo) |
|-----|-------|-----------|--------------------------|
| admin | **0** | **0** | 8 |
| guest | **0** | **0** | 8 |
| turismo | **0** | **0** | 8277 (legado) |

Artefatos: [logs/LINT-237-admin-guest-turismo-post-t024.tsv](./logs/LINT-237-admin-guest-turismo-post-t024.tsv)

## Veredito

**Lint #237 admin/guest = GO** — exit 0, zero erros; warnings não bloqueantes.

**Turismo = GO condicional (exit 0)** — volume alto de warnings legados (~8k); redução incremental futura (não bloqueia CI com `--quiet`).

**Próximo:** redução warnings turismo por módulo; alinhar regras react-hooks em guest/admin.
