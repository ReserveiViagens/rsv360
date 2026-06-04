# Status — execução pós-GO (G4 completo)

**Atualizado:** 2026-06-04  
**Playbook:** [POST-SOAK-EXECUTION-PLAYBOOK.md](./POST-SOAK-EXECUTION-PLAYBOOK.md)

## Gates

| Gate | Status | Notas |
|------|--------|-------|
| G0 C1–C16 | **DONE** | SOAK 13/13, API P0 8/8 |
| G1 PR #249 merge | **DONE** | `12ff9545` |
| G2 §14 SPRINT-0 | **DONE** | G4 completo GO |
| G3 Soak Safe off | **DONE** | `soak-safe-g4.mdc` `alwaysApply: false` |

## Trilha (#256 → #250 → #251 → #252 → #255)

| Passo | Issue/PR | Status | Evidência |
|-------|----------|--------|-----------|
| 1 | #256 GATE | **DONE** | GO + PR #249 merged |
| 2 | PR #250 rede | **IN_PROGRESS** | Branch `fix/post-soak-250-docker-network`, `docker-compose.yml` |
| 3 | #251 Postgres | **IN_PROGRESS** | `issues/POSTGRES-5432-INVENTORY.md` |
| 4 | #252 healthcheck | **IN_PROGRESS** | Rebuild local admin/guest/turismo |
| 5 | #255 auth | **PENDING** | 3 PRs — ver `PR-DRAFT-255-COPY-PASTE.md` |
| 6 | #253 / #254 | **PENDING** | Paralelo após #255 |

## Comandos #252 (pós-merge #250 ou local)

```powershell
cd <repo-root>
docker compose -p rsv360 build admin guest turismo
docker compose -p rsv360 up -d --no-deps admin guest turismo
docker inspect --format "{{.Name}} {{.State.Health.Status}}" rsv360-admin rsv360-guest rsv360-turismo
```

## Próximo dono

1. Revisar/merge PR #250  
2. Validar rede `rsv360_internal` (`docker network inspect rsv360_internal`)  
3. Fechar #251 com inventário + instância canônica documentada  
4. Evidência healthy #252 no PR ou comentário na issue  
5. Abrir sequência #255 (lib → admin → login)
