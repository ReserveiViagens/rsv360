# PR-12b-ops — Cloudflare edge checklist (PARAR no owner)

**GO:** `GO 12b-ops @ main 9403c2a16b18c8b654027111ab2156576f4b9213`  
**Branch:** `security/pr-12b-ops`  
**Baseline:** pós Fase 0 (#240) · **12a (#241) paralelo** (nginx) — não bloqueia esta fatia docs/ops

## Escopo

- Runbook operacional em `docs/security/PR17-CLOUDFLARE.md` (topologias A/B/C, checklist CF, WAF paths de reserva, `TRUST_PROXY`, verificação pós-deploy).
- Ponteiro em `.env.example` → PR17 (sem secrets / sem CIDRs de produção).
- **Zero** mudança de runtime app · **zero** Terraform · agente **não** executa dashboard Cloudflare.

## OUT

- Ligar proxy laranja / WAF / DNS (humano na conta CF)
- 12c flood evidence em staging
- 12d MadeYouReset / mídia assinada
- Cut-over `AUTH_DPOP_ENABLED` / 04b / 16d / 10c-infra-c

## Veredito

**PARAR no owner:** checklist preenchido + `cf-ray` + `TRUST_PROXY` corretos em produção são **ops H0**, não merge de código.

## Relação com 12a

Topologia **A** (CF → nginx → Node): merge/deploy **12a** no conf nginx **antes** ou junto do cut-over DNS laranja. Esta PR só documenta a ordem.

## Rollback

Revert docs · em produção: DNS cinza / remover regras WAF (owner).
