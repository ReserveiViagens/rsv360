# Guia rápido dos workspaces guest & admin

## Objetivo
Oferecer experiências dedicadas para hóspedes e administradores dentro do monorepo RSV360, com rotas próprias, integrações e validação dos fluxos do `npm run dev`.

## Status atual
- `apps/guest`: Next.js básico (porta 3001) com placeholder em `/`.
- `apps/admin`: Next.js básico (porta 3002) com placeholder em `/`.
- Backlog documentado em `docs/guest-admin-plan.md`, `docs/guest-admin-issues.md` e `docs/guest-admin-wireframes.md`.

## Como contribuir
1. Consulte `docs/guest-admin-plan.md` para entender etapas, critérios e sequência de ações.  
2. Escolha uma issue do `docs/guest-admin-issues.md` (ou crie no board).  
3. Atualize wireframes (`docs/guest-admin-wireframes.md`) se adicionar novas telas.  
4. Implemente componente/layout/API e escreva testes (Jest/Playwright).  
5. Execute `npm run dev` e `npm run test` após cada alteração crítica.  

## Ports e execução
- Guest: `npm run dev --workspace=apps/guest` (Next 14, porta 3001)  
- Admin: `npm run dev --workspace=apps/admin` (Next 14, porta 3002)  
- Stack completo: `npm run dev` (backend 5000, site 3000, turismo 3005 + novos frontends)

## APIs recomendadas
- `/api/bookings`, `/api/users/me`, `/api/notifications` → guest  
- `/api/admin/tasks`, `/api/admin/logs`, `/api/health` → admin  

## Testes sugeridos
- Unitários: `ReservationCard`, `ApprovalModal`, `NotificationsList`.  
- E2E: login hóspede, cancelamento, aprovação, painel de logs.  

## Monitoramento
- Atualize o board (Kanban/Trello) com referências aos tickets `guest-admin-issues`.
- Adicione notas de testes em cada pull request (ex.: “Testado com npm run dev + npm run test”).

## Uso de templates de issue
- Use o template “Guest/Admin Workspace Task” para qualquer implementação ligada a esses workspaces; o checklist interno garante alinhamento com o plano.  
- Para mudanças relacionadas à auditoria de dependências (Next, Nodemailer, jsPDF, esbuild), use o template específico criado em `.github/ISSUE_TEMPLATE/audit-dependencies.md`.  

## Próximos passos
1. Completar wireframes e endpoints (item 2 do plano).  
2. Criar layout base (item 3) e componentes compartilhados (item 4).  
3. Planejar testes Playwright e checklist de QA (itens 10-14).
