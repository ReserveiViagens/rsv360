# Inventário Postgres :5432 (#251)

**Data:** 2026-06-04  
**Artefato bruto:** [postgres-inventory.txt](./postgres-inventory.txt)

## Resumo

| Listener | PID | Provável origem |
|----------|-----|-----------------|
| `0.0.0.0:5432` | **5040** | Serviço Windows (PostgreSQL host / stack legado) |
| `[::]:5432` | **13404** | Docker (`rsv360-postgres` publica `5432→5432`) |

**Container canônico (S2 / soak / API):** `rsv360-postgres` — volume `rsv360_postgres_data`, healthy.

**Host alternativo documentado:** PostgreSQL 18 em **:5433** — ver `POSTGRESQL_CONFIGURADO.md` (evitar conflito com Docker).

## Instância canônica recomendada

1. **Desenvolvimento stack Docker (`docker compose -p rsv360`):** usar **`rsv360-postgres`** em `:5432` (ou parar PG Windows e manter só o container).
2. **Ferramentas locais / pgAdmin legado:** `:5433` no serviço Windows, **não** misturar dumps com o volume Docker sem backup.

## Ações pendentes (#251 PR)

- [ ] Parar ou desabilitar listener Windows em `:5432` (PID 5040) **ou** remapear Docker para `:5433` com doc única
- [ ] `pg_dump` contra `rsv360-postgres` + smoke A3 (API P0)
- [ ] Atualizar `SPRINT-0-EVIDENCIA-OPERACIONAL.md` §9

## Rollback

Reativar serviço Windows PG na porta documentada; `docker compose -p rsv360 up -d postgres` preserva volume.
