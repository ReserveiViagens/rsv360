# Soak 72h — relatorio final

**Gerado:** 2026-06-04 10:16:08  
**Janela operacional:** `2026-06-01T10:12:40-03:00` -> `2026-06-04T10:12:40-03:00` (America/Sao_Paulo, kickoff + 72h)  
**Veredito soak:** **GO**  
**Veredito G4 completo (proposta ops):** **GO** (API P0 8/8; aguarda assinatura revisor)

## Amostras

| Metrica | Valor | Esperado |
|---------|--------|----------|
| Total linhas obrigatorias | 13 | >= 13 (000 + 001-012) |
| Linha opcional `final` | 1 | opcional |
| Baseline 000 | sim | sim |
| Periodicas 001-012 | 12 | 12 |
| OK / FAIL (obrigatorias) | 13 / 0 | 100% OK |
| HTTP 200 (obrigatorias) | 13 / 13 | |
| S4 periodicas :3002 | 12 / 12 | 12 |
| S5 periodicas :3000 | 12 / 12 | 12 |
| Postgres healthy (obrigatorias) | 13 / 13 | 13 |

## Criterios S1-S7

| ID | Status | Nota |
|----|--------|------|
| S1 backend >=95% | PASS | 100% amostras OK |
| S2 site >=95% | PASS | proxy amostra OK |
| S3 postgres 100% | PASS | 13/13 healthy |
| S4 :3002 12/12 periodicas | PASS | |
| S5 :3000 12/12 periodicas | PASS | |
| S6 restarts 0 | PASS | 0 em backend/site/postgres (TSV) |
| S7 API P0 fim | PASS | 8/8 OK — `g4-kickoff/logs/API-P0-SUMMARY.tsv` |

## Observacoes

- Coleta automatica via Task Scheduler (samples 001-012) + `run-soak-sample-wsl.ps1`
- Nenhuma excecao nas amostras obrigatorias
- `run-soak-final.ps1`: corrigido encoding em strings S4/S5 antes do fechamento

## Fechamento G4

1. Revisor valida C1-C16 em `SOAK-72H-CLOSE-CHECKLIST.md`
2. Se GO: merge PR #249; atualizar Sprint 0; desativar Soak Safe
3. Sequencia pos-GO: #256 -> #250 -> #251 -> #252 -> #255 -> #253/#254
