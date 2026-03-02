# Rotas Implementadas RSV360

Este documento consolida o status das rotas priorizadas para operacao e testes recorrentes.

## Rotas criticas (Eixo 1)

- Publicas: `/`, `/buscar`, `/hoteis`, `/hoteis/busca/completa`, `/cotacao`
- Protegidas: `/perfil`, `/minhas-reservas`

## Rotas admin e dashboards (Eixo 2)

- Admin: `/admin/login`, `/admin/cms`, `/admin/tickets`, `/admin/verification`
- Dashboards: `/dashboard`, `/dashboard/hotels`, `/dashboard-rsv`, `/pricing/dashboard`

## Rotas complementares priorizadas

- Grupo A: `/fidelidade`, `/loyalty`, `/loyalty/rewards`, `/quality`, `/quality/dashboard`, `/quality/leaderboard`, `/marketplace`
- Grupo B: `/mensagens`, `/group-chats`, `/notificacoes`, `/contato`
- Grupo C: `/insurance`, `/insurance/policies`, `/verification`, `/verification/property`
- Grupo D: `/analytics`, `/analytics/revenue-forecast`, `/crm`

## Criterio de classificacao

- **Implementada**: possui `page.tsx` e renderiza uma tela utilizavel.
- **Placeholder**: possui `page.tsx` com conteudo basico/temporario.
- **Ausente**: nao possui `page.tsx`.

Para a matriz detalhada (rota x arquivo x status x protecao x prioridade), consultar `docs/MAPEAMENTO_ROTAS_RSV360.md`.
