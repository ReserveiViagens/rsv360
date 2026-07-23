# H7c — js-yaml 3.15.0 / 4.3.0 (última fatia H7)

**Base:** `main @ 1dd900c1` (pós-H7a)  
**Branch:** `fix/h7c-js-yaml`  
**Advisories:** [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m) (high) · [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68) (moderate)

## PASSO 0 (entrada tip 1dd900c1)

| Check | Resultado |
|-------|-----------|
| audit-gate BLOCK | **1** (`js-yaml` only) |
| H7b (`concurrently`) | **quitada** (ABSENT) |

## Diff

| Item | Antes | Depois |
|------|-------|--------|
| Root override `js-yaml` | — | **`3.15.0`** (linha 3.x) |
| Override `@eslint/eslintrc.js-yaml` | `4.2.0` | **`4.3.0`** |
| Allowlist | 3 | **3 inalterada** |

```text
npm ls js-yaml
├── @istanbuljs/load-nyc-config → js-yaml@3.15.0
├── @eslint/eslintrc → js-yaml@4.3.0 overridden
└── artillery → js-yaml@3.15.0
```

## Audit antes → depois

| Pacote | Antes | Depois |
|--------|-------|--------|
| `js-yaml` | BLOCK high | **ABSENT** |
| allowlist 3 | engine.io-client · ws · xlsx | **inalterada** |
| BLOCK | 1 | **0** |

## Validação local

| Check | Resultado |
|-------|-----------|
| `cd backend && npx tsc --noEmit` | **0** |
| jest backend (excl. integration) | **575** PASS (zero net-new) |
| `npm run build --workspace=apps/site-publico` | **PASS** |
| Docker Fase 5 backend → `rsv360/backend:fase5-h7c` | **PASS** |
| Docker Fase 5 site-publico → `rsv360/site-publico:fase5-h7c` | **PASS** (`APP_DIR=apps/site-publico`) |
| `audit-gate.py` | **[OK]** · BLOCK **0** · allowlist **3** · `js-yaml` ABSENT |

## Escopo

Só overrides `js-yaml` + lockfile + evidence. Zero runtime.
