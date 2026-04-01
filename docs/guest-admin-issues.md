# Issues / Tickets sugeridas para guest & admin

| Nº | Título | Descrição | Critérios de aceitação |
|----|--------|-----------|------------------------|
| 1 | Requisitos e roteamento | Definir rotas-chave, dados e ações esperadas para guest e admin. | Documento `docs/guest-admin-reqs.md` completo com rotas, dados e níveis de acesso. |
| 2 | Wireframes textuais | Descrever dashboards, listas filtráveis, cards e integrações. | Arquivo `docs/guest-admin-wireframes.md` com sketches textuais e endpoints mapeados. |
| 3 | Layout base compartilhado | Implementar barra superior, menu lateral e cards reutilizáveis. | Componentes UI reutilizáveis criados e aplicados tanto em `apps/guest` quanto `apps/admin`. |
| 4 | CSS global e packages compartilhados | Adicionar `styles/globals.css` e componentes em `packages/ui`. | Estilos comuns movidos para shared packages; workspaces importam `globals.css`. |
| 5 | Responsividade | Aplicar Tailwind/CSS customizado com breakpoints. | Testar dashboards mobile/tablet e ajustar breakpoints. |
| 6 | Fetchers + JWT | Criar hooks `useFetch`, `useBookings`, `useAdminTasks` com token. | Hooks documentados, tokens sendo anexados e reutilizados nas páginas. |
| 7 | Integrações API Guest | Conectar reservas, cancelamentos, histórico e contatos. | Páginas `pages/reservas`, `pages/history`, `pages/contato` consumindo `/api/bookings`, `/api/users/me`, `/api/notifications`. |
| 8 | Integrações API Admin | Conectar aprovador de reservas, filtros e logs. | Páginas admin usando `/api/admin/tasks`, com filtros, formulários e painel de auditoria. |
| 9 | Estados de loading/erro | Skeletons/spinners, mensagens claras e retry. | Componentes exibem loaders e erro com CTA de retry; testes de falha manual. |
|10 | Testes unitários | Criar testes para `ReservationCard`, `ApprovalModal`, `NotificationsList`. | Jest + RTL coverage ≥ 70% nessas áreas. |
|11 | Testes end-to-end | Criar scripts Playwright para login, cancelamento e aprovação. | Fluxos rodando em ambiente local com `npm run test:e2e` (ou script customizado). |
|12 | README/ports | Documentar portas 3001/3002 e como subir workspaces. | README atualizado com comando `npm run dev --workspace=apps/guest` etc. |
|13 | Integração contínua | Rodar `npm run dev` após cada etapa e `npm run test` pós-dependências. | Processo documentado e log das execuções armazenado no planejamento. |
|14 | Automação de testes | Garantir `npm run test` em merges e audit updates. | Checklist de revisão requerendo testes antes de merge. |
|15 | Monitoramento e acompanhamento | Registrar progresso em issues/kanban. | Pipeline/board atualizado com status dos tickets acima. |
