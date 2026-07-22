# PR-H2.3 — next 16.2.11 + smoke cleanup (evidence)

## Vinculantes

| # | Item | Status |
|---|------|--------|
| ① | Patch real de `next` (16.2.7 → **16.2.11**) — nunca `audit fix --force` / next@9.x | OK |
| ② | Cleanup do smoke H2.2 (`taskkill` tree + `process.exit` confiável) + reuso como regressão | OK |
| ③ | Gate high/crit: next/sharp ABSENT (overrides sharp 0.35.3 + postcss 8.5.15) | OK |

## Commands

```bash
npm run build --workspace apps/site-publico
node scripts/smoke-h22-next-image.mjs   # expect SUMMARY + exit 0
cd backend && npx tsc --noEmit
cd backend && npx jest --coverage=false --testPathIgnorePatterns=integration
```

## Smoke (vinculante)

Reusar `scripts/smoke-h22-next-image.mjs` — exit code agora é prova confiável (dívida H2.2 paga).
