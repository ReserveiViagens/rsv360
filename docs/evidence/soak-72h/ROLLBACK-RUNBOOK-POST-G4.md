# Runbook rollback — pós-promoção G4 (rascunho)

**Status:** RASCUNHO — **não executar** durante soak.  
**Uso:** após merge PR #249 e mudanças #250–#255.

## 1. Rollback documentação / git

```powershell
git revert <merge-commit-pr-249>   # se apenas docs/evidência
git push origin main               # conforme política do time
```

## 2. Rollback containers (imagem anterior)

```powershell
# Frontends rebuild (#252)
docker compose -p rsv360 up -d --no-deps --force-recreate admin guest turismo
# Documentar tag/imagem anterior no PR antes do rebuild
```

## 3. Rollback rede manual (se #250 falhar)

```powershell
docker network connect rsv360-phase1_default rsv360-site-publico
```

## 4. Rollback Postgres

- Restaurar volume `rsv360_pgdata` de backup (`pg_dump` Trilha 0: `rollback-pre-trilha0.dump` local).
- **Não** apagar volume sem backup validado.

## 5. Rollback auth (#255)

- Revert PR auth; re-smoke API P0.
- Verificar `ADMIN_JWT_SECRET` e cookies admin.

## 6. Critério para acionar rollback

| Sintoma | Ação |
|---------|------|
| API P0 < 8/8 após change | Revert PR causador |
| G1 < 10/10 | Revert infra PR (#250/#251) |
| Perda dados PG | Stop + restore dump + abortar soak se necessário |

## 7. Comunicação

1. Registrar em issue GitHub (label `incident`).
2. Atualizar `SOAK-72H-STATUS.md` se soak reiniciado.
3. Notificar revisor para novo GO/NOGO G4.
