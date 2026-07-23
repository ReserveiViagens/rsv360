# H6b — dompurify 3.4.12 (GHSA-c2j3-45gr-mqc4)

**Base:** `main @ ec375456` (pós-H6a)  
**Branch:** `h6b-dompurify`

## Diff

| Item | Antes | Depois |
|------|-------|--------|
| Resolvido | `dompurify@3.4.11` (transitivo opcional de `jspdf@4.2.1` em `apps/turismo` + `apps/site-publico`) | `dompurify@3.4.12` |
| Mecanismo | — | root `package.json` **`overrides.dompurify`: `3.4.12`** (dep não é direta em nenhum manifest) |
| Lock | `node_modules/dompurify` 3.4.11 | **3.4.12** |

```text
npm ls dompurify
└── jspdf@4.2.1
    └── dompurify@3.4.12
```

## Validação local

| Check | Resultado |
|-------|-----------|
| `cd backend && npx tsc --noEmit` | **0** |
| jest backend (excl. integration) | **563** PASS (delta 0) |
| `npm run build --workspace=apps/site-publico` | **PASS** |
| Docker Fase 5 backend → `rsv360/backend:fase5-h6b` | **PASS** |
| Docker Fase 5 site-publico → `rsv360/site-publico:fase5-h6b` | **PASS** |
| `audit-gate.py` | **[OK]** · dompurify **ABSENT** · ALLOWED 3 (sem regressão) |

## Escopo

Só pin `dompurify` via override + lockfile. Sem nodemailer / body-parser / eslint.
