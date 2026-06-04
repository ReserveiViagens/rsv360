## Status
**READY-TO-IMPLEMENT** (GATE **P0**) — executar no fechamento do soak (`>= 2026-06-02T09:03:09-03:00`).

## Trilha e evidência
- [TRILHA-PARALELA-POS-SOAK.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md)
- [SOAK-72H-CLOSE-CHECKLIST.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/SOAK-72H-CLOSE-CHECKLIST.md)
- [CHECKLIST-SOAK-SAFE.md (main)](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/CHECKLIST-SOAK-SAFE.md)

## Prioridade | Impacto
**P0 (gate)** | Desbloqueia **G4 completo**, merge PR #249 e execução de #250–#255.

## Objetivo
Consolidar evidência Sprint 0: Trilha 0 GO + G1 GO + soak 72h + API P0 final → promoção **G4 completo = GO** → PLANO-MESTRE fase seguinte.

## Dependência de ordem

| Papel | Detalhe |
|-------|---------|
| **Esta issue é a primeira** | Nenhuma de #250–#255 antes do veredito GO aqui |
| **Bloqueada por** | Janela soak até `2026-06-02T09:03:09-03:00` + pacote completo |
| **Desbloqueia** | Sequência #250 → #251 (paralelo) → #252 → #255 → #253/#254 |

## Execução (fechamento)

1. `run-soak-close-scheduled.ps1` ou manual após `end_at`
2. Validar C1–C16 ([close checklist](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/main/docs/evidence/soak-72h/SOAK-72H-CLOSE-CHECKLIST.md))
3. Revisor emite GO/NOGO G4 completo
4. Se GO: merge PR #249; atualizar `SPRINT-0-EVIDENCIA-OPERACIONAL.md` §14; desativar Soak Safe

## Critérios de aceite (positivo)

- [ ] `SOAK-SAMPLES.tsv`: baseline **000** + periódicas **001–012** OK
- [ ] `SOAK-72H-REPORT.md`: sem violação C1–C16
- [ ] `API-P0-SUMMARY.tsv`: **8/8 OK**
- [ ] Veredito documentado: **G4 completo = GO**
- [ ] Issues #250–#255 permanecem `post-soak-draft` até disparo explícito pós-GO

## Critérios negativos (não pode)

- [ ] Promover G4 com amostras < 13 ou FAIL não justificado
- [ ] Merge PR #249 antes do GO do revisor
- [ ] Iniciar #250–#255 com G4 ainda NOGO

## Evidência obrigatória (pacote revisor + PR #249)

| Artefato | Path |
|----------|------|
| Amostras soak | `docs/evidence/soak-72h/logs/SOAK-SAMPLES.tsv` |
| Relatório soak | `docs/evidence/soak-72h/SOAK-72H-REPORT.md` |
| API P0 final | `docs/evidence/g4-kickoff/logs/API-P0-SUMMARY.tsv` |
| Logs A1–A7p | Somente se FAIL |
| Snapshot Sprint 0 | `docs/SPRINT-0-EVIDENCIA-OPERACIONAL.md` §14 atualizado |

## Relacionadas
#249 PR soak · #250–#255 backlog pós-GO
