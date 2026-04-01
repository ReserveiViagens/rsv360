# Plano de evolução dos workspaces `guest` e `admin`

## 1. Requisitos & design
- [ ] Listar rotas-chave (`/`, `/reservas`, `/notificacoes`, `/admin/dashboard`, `/admin/reservas`, `/admin/relatorios`), dados consumidos (reservas, perfil, notificações, tarefas administrativas) e ações esperadas (cancelar/reservar, aprovar/rejeitar, gerar relatórios).
- [ ] Mapear níveis de acesso (hóspede autenticado vs. admin com permissões ampliadas).
- [ ] Documentar as decisões no documento atual e em `docs/guest-admin-reqs.md`.

## 2. Wireframes & endpoints
- [ ] Criar wireframes textuais para dashboards, listas filtráveis, cards de resumo e integrações com pagamentos/CRM.
- [ ] Mapear endpoints necessários (`/api/bookings`, `/api/users/me`, `/api/admin/tasks`, `/api/notifications`, `/api/health`).

## 3. Layout real
- [ ] Substituir placeholders por layout com barra superior (logo/usuário), menu lateral e cards/resumos.
- [ ] Usar componentes reutilizáveis (cards métricas, tabelas, botões) compartilhados entre `guest` e `admin`.

## 4. CSS global & UI compartilhada
- [ ] Criar `styles/globals.css` em cada workspace e mover estilos comuns para `packages/ui` ou `packages/shared`.
- [ ] Adicionar componentes UI compartilhados (`components/ui/Inputs`, `components/ui/Modals`, `components/ui/Badges`).

## 5. Responsividade
- [ ] Implementar breakpoints mobile ↔ desktop (Tailwind ou CSS customizado) e verificar dashboards em tablets/phones.

## 6. Integração com APIs
- [ ] Conectar dashboards aos principais endpoints (`/api/bookings`, `/api/users/me`, `/api/admin/tasks`, `/api/notifications`).
- [ ] Criar fetchers reutilizáveis (`useFetch`, `useBookings`, `useAdminTasks`) que automaticamente anexem o JWT vigente.

## 7. Estados de loading/erro
- [ ] Exibir skeletons/spinners durante fetch, mensagens claras em erros e botões de retry.

## 8. Funcionalidades para auditoria
- [ ] Catalogar funcionalidades: reservas, cancelamentos, histórico, contatos, KPI dashboards, aprovações, filtros, formulários, logs.  
- [ ] Validar cada item com critérios de aceitação antes de marcar como concluído.

### Guest
- [ ] Implementar listagem/filtragem de reservas com detalhes e ações (cancelamento com regras de negócio, histórico, contatos direto).

### Admin
- [ ] Criar painel com aprovar/reprovar reservas, filtros por status, formulários de atualização e logs de auditoria (filtros por período e usuário).
- [ ] Integrar notificações internas para rastrear ações críticas.

## 9. Acessibilidade
- [ ] Garantir labels vinculados, foco visível, contraste adequado e `aria-live` em modais/alertas.

## 10. Qualidade e testes
- [ ] Escrever testes unitários (Jest + Testing Library) para componentes essenciais (`ReservationCard`, `ApprovalModal`, `NotificationsList`).
- [ ] Criar scripts Playwright para fluxos principais (login hóspede, cancelamento, aprovações).

## 11. Documentação
- [ ] Atualizar README dos workspaces (ou incluir novo doc) com instruções de `npm run dev --workspace=apps/guest` (porta 3001) e `apps/admin` (porta 3002), variáveis de ambiente e dependências específicas.

## 12. Integração no pipeline
- [ ] Após cada etapa, rodar `npm run dev` para garantir backend + quatro frontends sobem sem conflitos.
- [ ] Incluir `npm run test` (ou `npm run lint`) no fluxo pós-atualização de dependências e após features críticas.

## 13. Automação de testes
- [ ] Garantir que `npm run test` seja parte obrigatória antes de merges, principalmente após alterações motivadas pelo `npm audit`.

## 14. Monitoramento do progresso
- [ ] Registrar o status em issues/kanban (ex.: “Layout guest”, “APIs admin”, “Teste Playwright”) para manter visibilidade.

## Próximos passos imediatos sugeridos
1. Preencher rapidamente os wireframes textuais no doc acima e listar os endpoints faltantes para cada fluxo.  
2. Criar o layout base (barra superior/menu lateral/cards) e os componentes UI compartilhados antes de integrar dados reais.  
3. Planejar os testes (unitários e Playwright) em paralelo à substituição dos placeholders para não atrasar a validação.
