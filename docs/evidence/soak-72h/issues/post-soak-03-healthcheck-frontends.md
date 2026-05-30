## Status
**RASCUNHO pós-soak** — não executar durante soak 72h.

## Trilha paralela
- **Ref:** [TRILHA-PARALELA-POS-SOAK.md — C3 / B1](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/ops/soak-72h-g4-final/docs/evidence/soak-72h/TRILHA-PARALELA-POS-SOAK.md)
- **Tema:** healthcheck

## Prioridade
**P2**

## Impacto
- `rsv360-guest`, `rsv360-admin`, `rsv360-turismo` reportados **unhealthy** (não bloqueiam soak atual).
- Melhora confiabilidade do perfil Docker completo e CI health gates.

## Contexto
- Backend/site-publico/postgres: **healthy** (soak).
- PR #242/#245: `${APP_PORT}` não expande no HEALTHCHECK → `/healthcheck.sh` no build.

## Critérios de aceite
- [ ] Revisar Dockerfile/HEALTHCHECK dos 3 frontends (Trilha B1 — leitura).
- [ ] `docker inspect` → **healthy** após `compose up --build` controlado.
- [ ] Sem regressão em `:3000` smoke e G2 lint baseline.
- [ ] Evidência em `docs/evidence/g4-kickoff/` ou ops.

## Bloqueio
Sem `docker compose up --build` nos containers monitorados até fim do soak.

## Relacionadas
- PR #245, #242
