# Rollback readiness — G3 (GO formal)

**Data:** 2026-05-29  
**S2_ROOT:** `/mnt/c/Users/RSV 360/Documents/Sistema Reservei Viagens com todos os Servidores`  
**S1_ROOT:** `/mnt/c/Users/RSV 360/Documents/GitHub/Crm-RSV-360`

## Critérios mínimos

- [x] **Imagem/tag Docker anterior identificada**  
  - Stack atual (dev): `rsv360-phase1-site-publico`, `rsv360-phase1-backend`, `rsv360-phase1-admin`, `rsv360-phase1-guest`, `rsv360-phase1-turismo`  
  - Infra: `postgres:16-alpine`, `redis:7-alpine`  
  - Rollback app: rebuild a partir do commit/tag pré-T0b ou imagem anterior no registry

- [x] **Backup PostgreSQL testado** (DB isolada `rsv360_rollback_test`)  
  - Script: `logs/run-rollback-drill.sh`  
  - Artefato: `logs/rollback-test-pre-t0b.dump` (75 496 bytes)  
  - Resultado: `logs/ROLLBACK-DRILL-RESULT.txt` → **RESULT=PASS**  
  - DB: **`rsv360`** / user **`rsv360`**

- [x] **Variáveis `.env` documentadas** (sem valores no repo)  
  - S2: ver `.env.example` — `DATABASE_URL`, `JWT_*`, `SMTP_*`, `REDIS_*`, `NEXT_PUBLIC_*`  
  - S1: `.env` local em `Crm-RSV-360` (não versionado)

- [x] **Procedimento:** parar compose → restaurar dump → subir tag anterior → smoke

## Procedimento (S2)

```bash
S2_ROOT='/mnt/c/Users/RSV 360/Documents/Sistema Reservei Viagens com todos os Servidores'
cd "$S2_ROOT"
docker exec rsv360-postgres pg_dump -U rsv360 -d rsv360 --no-owner -Fc > ./backup-pre-rollback.dump
docker compose -p rsv360 down
# restaurar + rebuild tag anterior + up -d
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3002/health
```

## Aprovação

- **Status rollback:** **PRONTO**  
- Evidência G3: `logs/G3-SUMMARY.tsv` (FAIL=0)
