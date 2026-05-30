# Trilha 0 — estabilidade, rollback e observabilidade

**Objetivo:** fechar pré-requisitos de **G4 completo** antes do **soak 72h**.

**Ordem acordada (Sprint 0 / G4):**

1. ~~G4-API P0~~ → **GO** (#243)
2. ~~Healthcheck Docker~~ → **#242 + #245**
3. ~~Evidência G1 rodada 1~~ → **#246** (GO condicional)
4. **G1 dual-system = GO** (S1 up + rede unificada + re-smoke) — operador
5. **Trilha 0** (este pacote) — branch `chore/trilha-0-*`
6. **Soak 72h** — após Trilha 0 **GO**

## Artefatos

| Arquivo | Uso |
|---------|-----|
| `TRILHA-0-CHECKLIST.md` | Checklist executável |
| `TRILHA-0-STABILITY-CRITERIA.md` | Critérios de estabilidade |
| `TRILHA-0-ROLLBACK-RUNBOOK.md` | Rollback S2 (+ referência S1) |
| `TRILHA-0-OBSERVABILITY.md` | Prometheus/Grafana/logs mínimos |
| `TRILHA-0-GATES-SNAPSHOT.md` | Snapshot gates G0–G4 |
| `run-trilha0-preflight.sh` | Preflight automatizado |
| `run-trilha0-preflight.ps1` | Preflight Windows |
| `SOAK-72H-PLAN.md` | Plano formal soak (pós Trilha 0) |

## Executar preflight

```bash
cd /mnt/c/Users/RSV\ 360/Documents/s2-pr232-validate
export RSV360_DOCKER_PROJECT=rsv360
export COMPOSE_PROJECT_NAME=rsv360
bash docs/evidence/trilha-0/run-trilha0-preflight.sh
```

```powershell
cd "C:\Users\RSV 360\Documents\s2-pr232-validate"
$env:RSV360_DOCKER_PROJECT = "rsv360"
.\docs\evidence\trilha-0\run-trilha0-preflight.ps1
```

## Veredito Trilha 0

Preencher em `TRILHA-0-CHECKLIST.md` após preflight + revisão manual.

| Resultado | Significado |
|-----------|-------------|
| **GO** | Pode iniciar soak 72h |
| **NOGO** | Corrigir itens FAIL/GAP antes do soak |
