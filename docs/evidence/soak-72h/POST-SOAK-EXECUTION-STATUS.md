# Status — execução pós-GO (G4 completo)

**Atualizado:** 2026-06-04 (trilha playbook concluída)

## Gates

| Gate | Status |
|------|--------|
| G0–G3 | **DONE** |

## Trilha

| Passo | Status | Referência |
|-------|--------|------------|
| #256 GATE | **DONE** | PR #249 merged |
| PR #261 (#250 rede) | **MERGED** | `rsv360_internal` |
| #251 Postgres | **MERGED** | PR #262 |
| #252 healthcheck | **DONE** local | admin/guest/turismo **healthy** |
| #255 auth | **MERGED** | PR #263 |
| #254 observabilidade | **MERGED** | PR #264 |
| #253 lint inventário | **MERGED** | PR #265 |

## Validação local (pós-merge)

```powershell
docker compose -p rsv360 up -d          # sem network connect
docker network inspect rsv360_internal
docker inspect --format "{{.State.Health.Status}}" rsv360-turismo  # healthy
.\docs\evidence\g4-kickoff\run-api-p0-round1.ps1
```

## #251 nota operacional

Parar PG Windows em `:5432` requer **PowerShell como Administrador**:

```powershell
.\scripts\ensure-postgres-canonical-dev.ps1 -Apply -StopWindowsService
```

Canonico Docker: `rsv360-postgres`. Windows PG: porta **5433** (`POSTGRESQL_CONFIGURADO.md`).
