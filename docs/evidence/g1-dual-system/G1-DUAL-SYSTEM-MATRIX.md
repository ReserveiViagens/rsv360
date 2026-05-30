# G1 — Matriz dual-system + infra

**Perfil S2:** Docker Compose `rsv360` — backend `:3002`, site `:3000`, Postgres `:5432`, Redis `:6379`  
**Perfil S1:** CRM legado `npm run dev` — `http://127.0.0.1:5000`  
**S1_ROOT padrão:** `C:\Users\RSV 360\Documents\GitHub\Crm-RSV-360` (WSL: `/mnt/c/Users/RSV 360/Documents/GitHub/Crm-RSV-360`)

**Script:** `run-g1-dual-system.sh`  
**Logs:** `logs/G1-SUMMARY.tsv`, `logs/G1-*.log`

## Legenda

| Status | Significado |
|--------|-------------|
| **OK** | Critério atendido |
| **SKIP** | S1 offline ou path ausente (não penaliza S2 isolado) |
| **GAP** | Desvio documentado (ex.: redes Docker divergentes) |
| **FAIL** | S2 canônico ou infra obrigatória quebrada |

## Critérios

| ID | Sistema | Check | Obrigatório p/ GO |
|----|---------|-------|-------------------|
| G1-S2-01 | S2 | `GET :3002/health` → 200 | Sim |
| G1-S2-02 | S2 | `GET :3002/health/security` → 200 | Sim |
| G1-S2-03 | S2 | `GET :3000/` → 200 | Sim |
| G1-S1-01..03 | S1 | `:5000` root, `/health`, `/api/status` | Sim (dual-system completo) |
| G1-INFRA-01 | Infra | Postgres container `healthy` | Sim |
| G1-INFRA-02 | Infra | `site-publico` container `healthy` | Sim |
| G1-INFRA-03 | Infra | `site-publico` + `postgres` mesma rede Docker | Sim |
| G1-INFRA-04 | Infra | Redis `Up` (estado documentado) | Sim |

## Veredito — rodada 1 (2026-05-30)

| Bloco | Resultado |
|-------|-----------|
| S2 smoke | **3/3 OK** |
| S1 smoke | **3/3 SKIP** (CRM não escutando em `:5000`) |
| Infra | **3 OK**, **1 GAP** (rede Docker) |
| **G1 S2 canônico** | **GO** |
| **G1 dual-system (S1+S2)** | **NOGO** |
| **Recomendação** | **GO condicional** até S1 + rede unificada |

### Runbook S1 (quando SKIP)

```bash
cd "/mnt/c/Users/RSV 360/Documents/GitHub/Crm-RSV-360"
npm run dev
# esperado: listen :5000
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5000/health
```

### Runbook rede unificada S2

```bash
cd s2-pr232-validate
docker compose -p rsv360 up -d --build backend site-publico
docker network inspect rsv360_default --format '{{range .Containers}}{{.Name}} {{end}}'
```
