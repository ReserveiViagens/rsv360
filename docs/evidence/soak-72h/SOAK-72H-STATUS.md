# Soak 72h — status vivo

**Ultima atualizacao:** 2026-06-10T23:30:32-03:00  
**Estado:** **EM EXECUÇÃO — janela pós-Next 16 (#278+#279+#283)**

| Campo | Valor |
|-------|--------|
| start_at (kickoff) | **2026-06-08T22:00:00-03:00** |
| end_at (kickoff + 72h) | **2026-06-11T22:00:00-03:00** |
| Branch / base | `main` @ `b2772b52`+ |
| Baseline | **OK** (`000`) |
| Amostras | **10 linhas TSV** — 000–007 OK; 008 FAIL+recovery OK; 009–012 pendentes |
| Task coleta 6h | **OK** — `run-soak-sample.ps1` nativo (009–012) |
| Task fechamento | **OK** — `RSV360-Soak-72h-Close` @ 2026-06-11 22:02 -03 |
| Veredito soak | _pendente fim janela_ |

## Incidente host networking (10/06 22:00)

- Amostra **008** @ 22:00: **FAIL** — Docker healthy, HTTP host `empty reply`.
- Restart Docker ~18:45; port forwarding host quebrado até ~23:30.
- **Correção:** `docker compose -p rsv360 restart` + recovery 008 (`recovery-host-net`) **OK**.
- **Próximo slot:** 009 @ **2026-06-11 04:00** -03.

## Incidente scheduler (09/06 — encerrado)

- 001/002 falharam via WSL; corrigido para script Windows; recovery OK.

## Comandos operacionais

```powershell
cd "C:\Users\RSV 360\Documents\s2-pr232-validate"
$env:RSV360_DOCKER_PROJECT = "rsv360"
.\docs\evidence\soak-72h\run-soak-sample.ps1 -SampleId "009" -Force
.\docs\evidence\soak-72h\run-soak-close-scheduled.ps1
```
