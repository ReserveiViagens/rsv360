# Soak 72h — status vivo

**Ultima atualizacao:** 2026-06-11T22:02:01-03:00  
**Estado:** **ENCERRADO — janela pos-Next 16 (#278+#279+#283)**

| Campo | Valor |
|-------|--------|
| start_at (kickoff) | **2026-06-08T22:00:00-03:00** |
| end_at (kickoff + 72h) | **2026-06-11T22:00:00-03:00** |
| Branch / base | `main` @ `617b39fd`+ |
| Amostras | **15 linhas TSV** — 000–012 + `final`; 14 OK / 1 FAIL (008 slot) |
| API P0 (fechamento) | **8/8 OK** @ 2026-06-11 22:02 |
| Task fechamento | **OK** — `RSV360-Soak-72h-Close` @ 22:02 |
| Veredito soak | **GO condicional** — ver `SOAK-72H-REPORT.md` |

## Incidentes documentados (mitigados)

| Data | Evento | Resolucao |
|------|--------|-----------|
| 09/06 | WSL 001/002 exit -1 | recovery + script Windows |
| 10/06 | 008 FAIL host empty-reply | recovery 23:30 |
| 11/06 | Windows Update reboot | 009 OK antes; 010–012 OK depois |

## Artefatos de fechamento

- `logs/SOAK-SAMPLES.tsv` (inclui `final`)
- `SOAK-72H-REPORT.md`
- `docs/evidence/g4-kickoff/logs/API-P0-SUMMARY.tsv` (8/8 @ close)
