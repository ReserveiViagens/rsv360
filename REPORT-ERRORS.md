# ❌ RSV360 — Relatório: Erros Encontrados

> Gerado em: 10/04/2026 21:47
> Ambiente: Windows + PowerShell + npm
> 

## Erros Críticos (bloqueiam uso)

| # | Serviço | Descrição | Detalhes |
| --- | --- | --- | --- |
| 1 | Banco de Dados PostgreSQL | PostgreSQL não está rodando | Nenhum serviço PostgreSQL encontrado. Backend falha health check com 503. |
| 2 | Site Público (porta 3000) | Erro de dependência caniuse-lite | Cannot find module '../lib/statuses' - dados desatualizados do caniuse-lite. |
| 3 | Turismo App (porta 3005) | Erro de dependência caniuse-lite | Mesmo erro do site-publico. |

## Warnings (não bloqueiam, mas precisam de atenção)

| # | Serviço | Descrição | Detalhes |
| --- | --- | --- | --- |
| 1 | Backend API | Health check falha | Retorna 503 devido à falta de conexão com DB. |

## Páginas com Erro

- [ ] http://localhost:3000/ — Erro: Serviço não iniciou devido a caniuse-lite
- [ ] http://localhost:3005/ — Erro: Serviço não iniciou devido a caniuse-lite

## Endpoints com Falha

| Serviço | Rota | Status | Erro |
| --- | --- | --- | --- |
| Backend | GET /health | 503 | Database connection failed |
| Site Público | GET / | N/A | Serviço não iniciou |
| Turismo | GET / | N/A | Serviço não iniciou |

## Erros de Console/Terminal

- Site Público: [Error: Cannot find module '../lib/statuses']
- Turismo: [Error: Cannot find module '../lib/statuses']
- Backend: RSV360 PMS running on port 3001 (mas health check falha)

## Variáveis de Ambiente Faltando

- [ ] DATABASE_URL — PostgreSQL não configurado ou não rodando

## Sugestões de Correção

1. Iniciar PostgreSQL: Instalar e iniciar serviço PostgreSQL, ou usar Docker.
2. Atualizar caniuse-lite: Executar `npx update-browserslist-db@latest` para corrigir dados desatualizados.
3. Verificar conexão DB: Configurar DATABASE_URL corretamente no .env.
4. Testar novamente: Após correções, reiniciar serviços e refazer testes.</content>
<parameter name="filePath">d:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\temp-repo-fresh\REPORT-ERRORS.md