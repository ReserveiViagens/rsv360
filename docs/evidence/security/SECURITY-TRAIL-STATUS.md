# Security Trail — Status e handoff (Cursor + Codex)

**Última atualização:** 2026-06-02  
**Worktree:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**`main`:** `b0996112c` (T0.19 Lucide #338)

> **Leia este arquivo primeiro** ao retomar.

## Montanha A — G2/G3 pós-security

| Item | Status |
|------|--------|
| Revalidação formal | **GO condicional** — [G2G3-POST-SECURITY-REVALIDATION.md](../g2g3-post-security/G2G3-POST-SECURITY-REVALIDATION.md) |
| G3 (API P0 + audit + Dependabot) | **GO** |
| G2 operacional | **GO** |
| G2 estrito lint | **NOGO condicional** (#237 + eslint hoist local) |

## Montanha D — Express 5 backend verify

| Item | Status |
|------|--------|
| Verificação ADR E4 | **GO condicional** — [E5-EXPRESS5-BACKEND-VERIFY.md](../trilha-0/E5-EXPRESS5-BACKEND-VERIFY.md) (#328) |
| Express lock + Docker | **5.2.1** |
| API P0 | **8/8 OK** |

## Montanha C — Tailwind 4

| Item | Status |
|------|--------|
| T0.15 impl + carimbo guest | **GO** (#330 + #331) |
| T0.16 impl + carimbo TW4 admin | **GO** (#332 + #333) |

## Montanha `.next/types` site-publico

| Item | Status |
|------|--------|
| T0.17 preflight | **GO** (#334) |
| T0.18 impl handlers | **GO** (#335) |
| T0.18 carimbo | **GO** (#336) |
| T0.19 preflight + impl Lucide | **GO** (#338 @ `b0996112c`) |
| T0.19 carimbo | **PR pendente** |

**Próximo HITL:** T0.19b radix **ou** T0.20 residual → TW4 site-publico **depois**.

## Linha do tempo Security — CONCLUÍDA

| Etapa | PR impl | PR carimbo | Status |
|-------|---------|------------|--------|
| Inventário | — | #314 | GO |
| SEC-01 shell-quote + joi | #315 | #316 | GO |
| SEC-02 nodemailer root | #317 | #318 | GO |
| SEC-03 nodemailer site-publico | #319 | #320 | GO |
| SEC-04 postcss | #321 | #322 | GO |
| SEC-05 esbuild | #323 | #324 | GO |
| **SEC-06 uuid** | #325 | #326 | GO |

**Closeout formal:** [SECURITY-TRAIL-CLOSEOUT.md](./SECURITY-TRAIL-CLOSEOUT.md)

## Próxima HITL (fora security deps)

1. Merge carimbo T0.19  
2. HITL T0.19b radix ou T0.20 residual  
3. TW4 site-publico/turismo — **depois** saneamento `.next/types`

Ver opções A–D em [SECURITY-TRAIL-CLOSEOUT.md §8](./SECURITY-TRAIL-CLOSEOUT.md#8-próxima-decisão-hitl).

## Artefatos

- [SECURITY-TRAIL-CLOSEOUT.md](./SECURITY-TRAIL-CLOSEOUT.md) — **fechamento trilha**
- [DEPENDABOT-INVENTORY.md](./DEPENDABOT-INVENTORY.md)
- [SEC-06-POST-MERGE.md](./SEC-06-POST-MERGE.md)
- [SEC-06-UUID-RESULT.md](./SEC-06-UUID-RESULT.md)
- [SEC-05-POST-MERGE.md](./SEC-05-POST-MERGE.md)
