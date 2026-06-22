# F-024/F-025 — Lockfile hygiene

**Data:** 2026-06-22  
**Branch:** `chore/f024-f025-lockfile-hygiene`

## Problema

`package-lock.json` estava listado em `.gitignore`, impedindo convergência local/CI quando locks divergiam de `package.json`.

## Ação

- Removida entrada `package-lock.json` do `.gitignore` (locks root + `backend/` permanecem versionados).
- Locks regenerados com `npm install` (root) e sync backend.

## Validação

```bash
bash .github/scripts/check-lockfiles.sh . backend
```

Esperado: `[OK] root lockfile dry-run passed` e `[OK] backend lockfile dry-run passed`.
