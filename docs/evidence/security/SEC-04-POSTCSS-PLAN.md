# SEC-04 — Plano HITL: postcss via override (sem bump Next)

**Data:** 2026-06-13  
**Branch:** `chore/security-sec-04-postcss`  
**Base:** `main` @ `74a01aa18`  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**Handoff:** [SECURITY-TRAIL-STATUS.md](./SECURITY-TRAIL-STATUS.md)

## Contexto

Após SEC-01–SEC-03, restam **9** alertas Dependabot open. O alerta **#83** (`postcss` &lt; 8.5.10, CVE-2026-41305) aponta para `package-lock.json`.

Raiz: Next **16.2.7** declara `postcss@8.4.31` como dependência nested — 4 cópias vulneráveis (guest, admin, turismo, site-publico).

## Objetivo

Forçar **postcss@8.5.15** (já usado nos apps como devDep `^8.5.15`) via `overrides`, **sem** alterar versão do Next.

## Escopo permitido

- `package.json` (overrides)
- `package-lock.json`
- `docs/evidence/security/SEC-04-*`
- `docs/evidence/security/logs/sec-04-*`

## Fora de escopo

- Bump/downgrade **Next**
- drizzle-kit, mercadopago, exceljs, nodemailer, esbuild, uuid
- Código de app, Dockerfile, workflows
- `npm audit fix --force`

## Estratégia

```json
"overrides": {
  "postcss": "8.5.15",
  "next": { "postcss": "8.5.15" }
}
```

Procedimento:

1. Adicionar overrides
2. `npx -y npm@10.9.7 install --ignore-scripts`
3. Confirmar dedupe: **1** instância `postcss@8.5.15`
4. Gates: npm audit, type-check guest/admin, API P0 8/8

## Hard stops

- Next version muda no lock
- npm sugere `next@9.x` (rejeitar)
- type-check guest/admin quebra
- API P0 ≠ 8/8

## Alertas esperados a fechar

| ID | Pacote | Severidade |
|----|--------|------------|
| **#83** | postcss | medium |

## Próximo após merge

PR carimbo `SEC-04-POST-MERGE.md` → **SEC-05** esbuild.
