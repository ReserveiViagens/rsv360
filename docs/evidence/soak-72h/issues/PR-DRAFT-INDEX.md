# PR drafts — índice pós-soak (não abrir antes do GO #256)

**Uso:** copiar título/corpo ao criar PR no GitHub após G4 GO.  
**Branch sugerida:** `fix/post-soak-<issue>-<tema>`

| Issue | Branch sugerida | Título PR draft |
|-------|-----------------|-----------------|
| #250 | `fix/post-soak-250-docker-network` | fix(docker): unificar rede compose rsv360 (remove network connect manual) |
| #251 | `fix/post-soak-251-postgres-5432` | fix(infra): resolver postgres duplo na porta 5432 |
| #252 | `fix/post-soak-252-healthcheck` | fix(docker): healthcheck /healthcheck.sh em guest/admin/turismo |
| #255 | `fix/post-soak-255-auth-api` | fix(auth): JWT admin API + login 401/503 (remove demo token) |
| #253 | `chore/post-soak-253-lint` | chore(lint): reduzir warnings site-publico e admin |
| #254 | `docs/post-soak-254-observability` | docs(obs): queries 5xx, alertas e runbook prometheus |

## Template de corpo (copiar em cada PR)

```markdown
## Issue
Closes #<N>

## Mudanças
- ...

## Evidência obrigatória
- [ ] (copiar tabela da issue #N)

## Test plan
- [ ] API P0 8/8
- [ ] G1 / preflight (se aplicável)
- [ ] Sem regressão soak monitorados

## Rollback
- (copiar da issue)
```

## Docs-only PRs (permitidos durante soak)

- Este índice, playbook, risk matrix, rollback runbook → branch `ops/soak-72h-g4-final` / PR #249.
