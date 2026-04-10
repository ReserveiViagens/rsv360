# RSV360 Technical Inventory

## Workspaces
- `apps/site-publico`: Next.js public website (React 18, Next.js 14)
- `apps/turismo`: Next.js admin dashboard (React 19, Next.js 15)
- `backend`: Express API server (Node 18, Express 4, Knex)

## Backend Routes
Located in `backend/src/routes/`:
- admin.js, admin-mock.js, admin-website.js
- analytics.js, auth.js, backup.js
- bookings.js, customers.js, financial.js
- hotels.js, integrations.js, payments.js
- performance.js, projects.js, recommendations.js
- security.js, travel-packages.js, upload.js, uploads.js
- users.js, website-real.js, website.js, workflows.js
- API v1: public.js

## Frontend Pages (site-publico)
Located in `apps/site-publico/app/`:
- / (home), /admin/, /analytics/, /atracoes/, /avaliacoes/, /booking/, /buscar/, /buscar-hosts/, /checkin/, /contato/, /cotacao/, /crm/, /cupons/, /dashboard/, /fidelidade/, /flash-deals/, /group-chats/, /group-travel/, /hoteis/, /ingressos/, /insurance/, /login/, /loyalty/, /mapa-caldas-novas/, /marketplace/, /mensagens/, /minhas-reservas/, /notificacoes/, /onboarding/, /perfil/, /politica-privacidade/, /pricing/, /privacidade/, /promocoes/, /recuperar-senha/, /redefinir-senha/, /reserva-confirmada/, /termos/, /tickets/, /trips/, /ui-demo/, /verification/, /viagens-grupo/, /wishlists/

## Frontend Pages (turismo)
Located in `apps/turismo/app/` (similar structure to site-publico)

## Database Migrations
Located in `backend/src/database/migrations/`:
- 001_create_users_table.js
- 002_create_bookings_table.js
- 003_create_payments_table.js
- 004_create_audit_logs_table.js
- 005_create_customers_table.js
- 006_create_travel_packages_table.js
- 007_create_auctions_tables.js
- 008_create_website_content_schema.js
- 009_create_website_pages_table.js
- 010_auctions_start_price_min_increment.js
- 011_auctions_enterprise_id.js

## Key Dependencies
- React: 18.3.1 (site-publico), 19.2.3 (turismo/root)
- Next.js: 14.0.0 (site-publico), 15.5.2 (turismo)
- TypeScript: 5.0.0 (site-publico), 5.3.0 (turismo), 5.9.3 (backend)
- Express: 4.18.2
- Knex: 3.0.1
- PostgreSQL: Primary database

## Test Coverage
- Backend: Jest with 58 tests (65% coverage target)
- Frontend: Jest + Playwright E2E
- Integration tests in progress