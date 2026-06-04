# RCA — API P0 A3 retornava 500

**Data:** 2026-06-04

## Sintoma

`POST /api/auth/login` com credencial invalida (smoke) → **500** em vez de **401**.

## Causa raiz (dupla)

1. **Senha TCP desalinhada** — volume Postgres inicializado com senha diferente de `POSTGRES_PASSWORD` no `.env` atual → erro `28P01 password authentication failed for user "rsv360"`.
2. **Database inexistente** — `.env` com `DB_NAME=rsv360`, mas volume legado so tem `rsv_360_ecosystem`.

O `catch` do login tratava `28P01` como erro generico → **500** (corrigido para **503** via `pg-infra-error.ts`).

## Correcao

| Camada | Acao |
|--------|------|
| Codigo | `isPostgresInfrastructureError`, `ensureAuthTables`, login 503 em infra |
| Ops | `scripts/sync-postgres-docker-dev.ps1` + `.env` com `POSTGRES_DB=rsv_360_ecosystem` |

## Validacao

```powershell
.\scripts\sync-postgres-docker-dev.ps1
# Atualizar .env POSTGRES_DB / DB_NAME conforme script
docker compose -p rsv360 up -d --force-recreate site-publico
.\docs\evidence\g4-kickoff\run-api-p0-round1.ps1
```

Esperado A3: **401** (ou 429 rate-limit).
