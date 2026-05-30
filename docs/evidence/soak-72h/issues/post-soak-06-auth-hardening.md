## Status
**RASCUNHO pós-soak** — não executar durante soak 72h.

## Trilha paralela
- **Ref:** [TRILHA-PARALELA-POS-SOAK.md — B2](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/blob/ops/soak-72h/TRILHA-PARALELA-POS-SOAK.md#trilha-b--revisão-de-código-leitura)
- **Tema:** hardening auth

## Prioridade
**P1**

## Impacto
- API P0: login inválido deve retornar **401** (não 500); admin pages com token demo.
- Reduz risco antes de multi-tenant / PLANO-MESTRE (HS-8: G0–G4 verdes).

## Contexto
- Rodada 2 API P0: **8/8 OK**; histórico A3/A6 500 documentado em logs antigos.
- `CORRECAO_MIDDLEWARE_AUTH_DEMO.md`, AuthContext — revisão Trilha B2.

## Critérios de aceite
- [ ] `POST /api/auth/login` credencial inválida → **401** estável (sem 500).
- [ ] `GET /api/admin/website/pages` sem JWT válido → **401** (remover ou isolar token demo em prod).
- [ ] Matriz `API-CONTRACT-MATRIX.md` atualizada.
- [ ] API P0 re-smoke **8/8** após mudanças.
- [ ] Sem alterar `.env` de soak até fim da janela.

## Bloqueio
**Hard stop Sprint 0:** sem mudança auth em produção de teste até G4 completo GO.

## Relacionadas
- label `area/auth`, `security`
- Issue #195 (secrets) — coordenar separadamente
