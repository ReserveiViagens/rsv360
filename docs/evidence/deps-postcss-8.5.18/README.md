# deps/postcss-8.5.18 — fatia manual (substitui Dependabot #170)

**Base:** `main @ 3fccc9bf` (pós-#181)  
**Branch:** `deps/postcss-8.5.18`  
**Substitui:** Dependabot PR #170 (NÃO-GO — bump só nos apps não sobe o postcss root)

## Mecanismo escolhido (PASSO 0)

| Opção | Resultado |
|-------|-----------|
| Bump `@tailwindcss/postcss` | **4.3.1 → 4.3.3** (patch). `4.3.3` declara `postcss: ^8.5.16` (permite ≥8.5.18). `4.3.1` pinava **exato** `8.5.15`. |
| Root `overrides` | **Necessário e permanente** (padrão brace-expansion H2.1): `postcss` e `next.postcss` **8.5.15 → 8.5.18**. Sem isso o override antigo mantinha o root em 8.5.15 mesmo com bumps nos apps (#170). |

Apps (admin · guest · site-publico · turismo): `postcss ^8.5.15 → ^8.5.18` + `@tailwindcss/postcss ^4.3.1 → ^4.3.3`.

## Diff

| Item | Antes | Depois |
|------|-------|--------|
| `package.json` overrides `postcss` / `next.postcss` | 8.5.15 | **8.5.18** |
| 4× apps `postcss` | ^8.5.15 | **^8.5.18** |
| 4× apps `@tailwindcss/postcss` | ^4.3.1 | **^4.3.3** |
| Lock `node_modules/postcss` | 8.5.15 | **8.5.18** |
| Lock `@tailwindcss/postcss` (+ oxide/node) | 4.3.1 | **4.3.3** |
| Lock churn | — | **~+175/−142** (sem +100 `@img/sharp-*` do #170) |

Detalhe: `docs/evidence/deps-postcss-8.5.18/lock-diff-summary.json`.

### Churn sharp (#170 vs esta fatia)

Regen npm integral no #170 materializava ~100 paths `apps/*/node_modules/@img/sharp-*` (muitos em **0.34.5**, conflitando com override root `sharp@0.35.3`). Aqui: prune desses paths aninhados + install dirigido; lock fica alinhado ao hoisting do main.

## NPM Audit (`npm audit --omit=dev` — igual ao CI)

| | Main / #170 | Esta fatia |
|--|-------------|------------|
| `postcss` no relatório / BLOCK | **HIT** (root 8.5.15; range `<=8.5.17`) | **ABSENT** |
| BLOCK CI main pós-#181 | **15** (incl. postcss) | — |
| BLOCK #170 rebaseado | **16** (incl. postcss) | — |
| BLOCK local após fatia | — | **10** (sem postcss; lista em `audit-gate-after-omitdev.txt`) |

### Drift 15→16 no #170

O Dependabot regenerei o lock com `apps/*/node_modules/next/node_modules/postcss@8.4.31` (paths que **não existiam** no main — o override root mantinha só `node_modules/postcss`). Isso:

1. Mantinha `postcss` no BLOCK (nós vulneráveis sob next), e  
2. Expunha **+1** advisory unallowlisted no gate face ao baseline de 15.

Não misturar patch dessa 16ª advisory nesta fatia — escopo = fechar postcss root.

## Validação

| Check | Resultado |
|-------|-----------|
| Root `postcss` | **8.5.18** |
| `bash .github/scripts/check-lockfiles.sh` | **OK** root + backend |
| `cd backend && npx tsc --noEmit` | **0** |
| Docker prod backend | **PASS** (`rsv360/backend:deps-postcss-8.5.18`) |
| Docker prod site-publico | ver parecer / CI Fase 5 |
| Escopo | overrides + 4 apps + lock + evidence |

## Relacionado

Fecha o gap do #170 (fechado sem merge — NÃO-GO ratificado).
