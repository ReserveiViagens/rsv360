# H6c — body-parser 2.3.0 (GHSA-v422-hmwv-36x6)

**Base:** `main @ d73f0e04` (pós-H6b)  
**Branch:** `h6c-body-parser`

## Diff

| Item | Antes | Depois |
|------|-------|--------|
| Resolvido | `body-parser@2.2.2` (transitivo de `express@5.2.1` no backend) | `body-parser@2.3.0` |
| Mecanismo | — | root `overrides.body-parser`: **`2.3.0`** |
| Lock | 2.2.2 | **2.3.0** |

```text
npm ls body-parser
└── express@5.2.1
    └── body-parser@2.3.0
```

## Validação local

| Check | Resultado |
|-------|-----------|
| `cd backend && npx tsc --noEmit` | **0** |
| jest backend (excl. integration) | **563** PASS |
| `npm run build --workspace=apps/site-publico` | **PASS** |
| Docker Fase 5 backend → `rsv360/backend:fase5-h6c` | **PASS** |
| Docker Fase 5 site-publico → `rsv360/site-publico:fase5-h6c` | **PASS** |
| `audit-gate.py` | **[OK]** · body-parser **ABSENT** · ALLOWED 3 |

## Escopo

Só pin `body-parser` via override + lockfile.
