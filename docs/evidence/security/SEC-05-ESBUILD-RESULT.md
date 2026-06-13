# SEC-05 — Resultado: esbuild override 0.28.1

**Data:** 2026-06-13  
**Branch:** `chore/security-sec-05-esbuild`  
**Base:** `main` @ `a0df20203`

## Alterações

| Arquivo | Alteração |
|---------|-----------|
| `package.json` | override `"esbuild": "0.28.1"` |
| `package-lock.json` | dedupe + pacotes `@esbuild/*` 0.28.1 (platform) |
| `backend/package-lock.json` | 3 entradas esbuild → **0.28.1** |

**Inalterado:** `drizzle-kit@^0.31.10`, `tsx@^4.22.4`, Next, mercadopago, código app.

## Antes / depois (esbuild)

| Lock | Antes | Depois |
|------|-------|--------|
| root | 0.25.12 + 0.27.7 tsx + 0.28.0 backend | **0.28.1** hoisted |
| backend | 0.25.12 + 0.27.7 + 0.18.20 esbuild-kit | **0.28.1** (3 entradas) |

## npm audit

| Escopo | Antes (preflight) | Depois |
|--------|-------------------|--------|
| root | 11 (3 high) | **6 moderate**, 0 high |
| backend workspace | 7 (3 high) | **2 moderate** (uuid, mercadopago) |
| esbuild no audit | sim | **não** |

Logs: [logs/sec-05-npm-audit-root.json](./logs/sec-05-npm-audit-root.json), [logs/sec-05-npm-audit-backend.json](./logs/sec-05-npm-audit-backend.json)

## Gates

| Gate | Resultado |
|------|-----------|
| API P0 | **8/8 OK** — [logs/sec-05-api-p0-summary.tsv](./logs/sec-05-api-p0-summary.tsv) |
| backend `npm test` | **17/22 pass** (2 suites integração falham — baseline env, não esbuild) |
| drizzle-kit / tsx versões | **inalteradas** |

## Alertas esperados a fechar

#32, #35, #137, #138, #139, #140 (esbuild)

## Veredito

**SEC-05 = GO condicional** — esbuild unificado 0.28.1; high eliminados no audit local.

---

*Atualizar [SECURITY-TRAIL-STATUS.md](./SECURITY-TRAIL-STATUS.md) pós-merge.*
