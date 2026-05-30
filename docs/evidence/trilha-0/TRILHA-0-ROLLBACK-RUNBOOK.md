# Trilha 0 — Rollback runbook (S2)

Estende `docs/evidence/2026-05-29-g3/logs/ROLLBACK-READINESS.md`.

## Identificação de baseline

| Item | Valor atual (preencher na execução) |
|------|-------------------------------------|
| Commit `main` | `git rev-parse main` |
| Imagem site-publico | `rsv360-site-publico:latest` |
| Imagem backend | `rsv360-backend:latest` |
| Dump de referência | `logs/rollback-pre-trilha0.dump` |

## Backup (antes de mudança arriscada)

```bash
docker exec rsv360-postgres pg_dump -U rsv360 -d rsv360 --no-owner -Fc \
  > docs/evidence/trilha-0/logs/rollback-pre-trilha0.dump
```

## Procedimento rollback (S2)

1. `docker compose -p rsv360 down` (não remover volume `rsv360_pgdata` sem decisão explícita)
2. Restaurar dump em DB vazio ou DB de rollback:
   ```bash
   docker exec -i rsv360-postgres pg_restore -U rsv360 -d rsv360 --clean --if-exists \
     < docs/evidence/trilha-0/logs/rollback-pre-trilha0.dump
   ```
3. Checkout commit/tag anterior ou rebuild imagens:
   ```bash
   git checkout <TAG_OU_COMMIT>
   docker compose -p rsv360 build backend site-publico
   docker compose -p rsv360 up -d
   ```
4. Smoke mínimo:
   - `curl -f http://127.0.0.1:3002/health`
   - `curl -f http://127.0.0.1:3000/`

## S1 (CRM legado)

Rollback S1 é independente (repo `Crm-RSV-360`). Registrar commit S1 e procedimento `npm run build` + `npm run start` se aplicável.

## Critério GO (T1)

- [ ] Dump criado com sucesso (tamanho > 0)
- [ ] Restore testado em DB isolada **ou** drill documentado como PASS (reuso G3)
- [ ] Smoke pós-restore 200 em `:3002` e `:3000`
