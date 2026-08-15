# PR-16d-telemetry — CSP aggregate pipeline (pré-enforce)

**GO:** `GO 16d-telemetry @ main 8d1332089d564c16f08dd402c685dfdada0a2119`  
**Branch:** `security/pr-16d-telemetry`  
**Base:** pós-12b · **OUT:** trocar Report-Only → enforce (isso é **GO 16d**)

## Problema (Fase 0)

Collectors 16c só faziam `console.info` JSON — sem counts por app/diretiva, sem artefato agregável para decidir enforce.

## Escopo

| Item | Entrega |
|------|---------|
| `packages/shared/security-headers.cjs` | Contadores in-process + campo `app` no log; JSONL opcional via `CSP_TELEMETRY_FILE` |
| `scripts/csp-telemetry-aggregate.cjs` | Agrega 1+ JSONL → snapshot `{ byApp, byDirective, rows }` |
| Env | `CSP_TELEMETRY_APP` (label por app) · `CSP_TELEMETRY_FILE` (path gravável) |
| Header | Continua **Report-Only only** — zero `Content-Security-Policy` enforce |

## Uso (owner / staging local — sem VPS)

```bash
# Em cada Next app (compose/.env):
CSP_TELEMETRY_APP=site-publico   # admin | guest | turismo
CSP_TELEMETRY_FILE=./var/csp-telemetry.jsonl

# Após janela de coleta:
node scripts/csp-telemetry-aggregate.cjs ./var/csp-telemetry.jsonl
# Colar saída sanitizada em docs/evidence/pr-16d-telemetry/samples/ (sem PII)
```

## Validação

```bash
cd backend && npx jest src/__tests__/unit/next-security-headers.test.ts --forceExit
# + script smoke com fixture
```

## Pré-requisito para GO 16d (enforce)

Owner anexa ≥ N dias de aggregate (ou export) em `docs/evidence/pr-16d-telemetry/samples/` → só então `GO 16d @ main <tip>`.

## Risco

- Blast: shared collector + script; handlers `/api/csp-report` inalterados.
- JSONL em FS efêmero (serverless) não persiste — usar volume/path estável ou log drain.
- Contadores in-memory são por processo (multi-réplica = somar JSONL).

## Rollback

Revert squash · desligar `CSP_TELEMETRY_FILE`.
