# Evidência G1 — dual-system

Gate **G1** na Sprint 0: infra S2 canônica + coexistência documentada com **S1** (`:5000`).

## Executar

```bash
# WSL — clone S2
cd /mnt/c/Users/RSV\ 360/Documents/s2-pr232-validate
export SYSTEM1_ROOT="/mnt/c/Users/RSV 360/Documents/GitHub/Crm-RSV-360"
export RSV360_DOCKER_PROJECT=rsv360
bash docs/evidence/g1-dual-system/run-g1-dual-system.sh
```

```powershell
# Windows (após subir S1: cd Crm-RSV-360; npm run dev)
cd "C:\Users\RSV 360\Documents\s2-pr232-validate"
wsl bash docs/evidence/g1-dual-system/run-g1-dual-system.sh
```

## Artefatos

| Arquivo | Uso |
|---------|-----|
| `G1-DUAL-SYSTEM-MATRIX.md` | Critérios e veredito |
| `G1-DUAL-SYSTEM-REPORT.md` | Resumo da rodada |
| `logs/G1-SUMMARY.tsv` | Resultado por check |

## Relação com outros gates

- **G4-API P0:** matriz em `docs/evidence/g4-kickoff/` (A8 = S1 SKIP)
- **G2:** qualidade build/lint — `docs/evidence/2026-05-28/` (repo integração)
- **Snapshot:** `docs/SPRINT-0-EVIDENCIA-OPERACIONAL.md` §11.5
