# RSV360 Architecture Context

## Objetivo do Repositório
Sistema modular monolith para Reservei Viagens (RSV360) - plataforma completa de turismo com frontend, backend e CRM integrados.

## Domínios Controlados
- **Turismo**: Reservas, pacotes, hotéis, passeios
- **CRM**: Gestão de clientes, leads, vendas
- **Pagamentos**: Integração Mercado Pago
- **Autenticação**: JWT, OAuth
- **Notificações**: Email, SMS, push
- **Analytics**: Relatórios e dashboards

## Stack Atual
- **Frontend**: Next.js 14, React 18, TypeScript 5.0-5.3
- **Backend**: Node.js 18+, Express 4, Knex, PostgreSQL
- **Autenticação**: JWT, Passport
- **Testes**: Jest, Playwright
- **CI/CD**: GitHub Actions (a implementar)

## Stack Alvo
- **Runtime**: Node.js 22 LTS
- **TypeScript**: 5.8+
- **Frontend**: React 19, Next.js 15, TanStack Query, Zod
- **Backend**: Express 5, Drizzle ORM
- **Banco**: PostgreSQL com migrations Drizzle
- **Validação**: Zod schemas
- **Estado**: Zustand/TanStack Query

## Workspaces
- `apps/site-publico`: Site público Next.js
- `apps/turismo`: Dashboard admin Next.js
- `backend`: API Express
- `packages/*`: Shared libraries (futuro)

## Estratégia de Migração
1. **Fase 1**: Baseline e governança
2. **Fase 2**: Atualização incremental (Node 22, TS 5.8)
3. **Fase 3**: React 19 e Next.js 15
4. **Fase 4**: Drizzle e Express 5
5. **Fase 5**: Otimizações e testes

## Requisitos Não-Funcionais
- Performance: <2s load time
- Segurança: OWASP compliance
- Escalabilidade: Monolith modular
- Manutenibilidade: TypeScript strict
- Testes: 80%+ coverage