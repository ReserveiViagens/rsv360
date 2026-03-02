# Correção: CMS não carrega dados na inicialização

## Problema Identificado

O CMS em `/admin/cms` não carregava os dados porque:
1. **PostgreSQL não estava rodando** na porta 5432 quando o sistema iniciava
2. **Filtro status=active** no backend excluía itens inactive/draft - admin precisa ver todos
3. **Tabela website_content vazia** - dados não haviam sido migrados
4. **Porta inconsistente** - site-publico .env usava 5433, backend usa 5432

## Solução Implementada (Atualização Jan 2026)

### 1. Backend - getDataCollection (admin-website.js)
- **Removido filtro** `.where("status", "active")` - admin CMS precisa ver todos os itens (active, inactive, draft)
- Antes: retornava apenas itens ativos
- Agora: retorna todos os itens para gerenciamento completo

### 2. População de Dados
- **Script**: `node scripts/migrate-website-data.js` (na pasta backend)
- Popula: hotéis, promoções, atrações, configurações
- Execute após garantir que PostgreSQL está rodando na porta 5432

### 3. Site Público - Configuração
- **`.env`**: DB_PORT=5432 (alinhado com backend)
- **CMS page.tsx**: Corrigido `activeAttractions` para usar `a.status === 'active'` (Attraction não tem is_active)

### 4. Script de Verificação e Inicialização do PostgreSQL

**Arquivo:** `scripts/verificar-iniciar-postgresql.ps1`

Este script:
- Verifica se a porta 5433 está ativa
- Verifica o status do serviço PostgreSQL (`postgresql-x64-18`)
- Inicia o serviço automaticamente se necessário (requer privilégios de administrador)
- Testa a conexão com o banco de dados
- Retorna `true` se tudo estiver OK, `false` caso contrário

### 2. Script de Verificação dos Dados do CMS

**Arquivo:** `scripts/verificar-dados-cms.js`

Este script:
- Conecta ao banco de dados PostgreSQL (porta 5433)
- Verifica se existem dados em `website_settings` (configurações)
- Verifica se existem dados em `website_content` (hotéis, promoções, atrações, ingressos)
- Verifica se existem dados em `properties` (propriedades)
- Exibe um resumo detalhado dos dados encontrados

### 3. Integração no Script de Inicialização

**Arquivo:** `Iniciar Sistema Completo.ps1`

O script foi atualizado para:
1. **Verificar e iniciar PostgreSQL** antes de iniciar os serviços
2. **Verificar dados do CMS** após iniciar o PostgreSQL
3. **Exibir avisos** se o PostgreSQL não estiver acessível ou se faltarem dados

## Como Usar

### Execução Manual

```powershell
# Verificar e iniciar PostgreSQL
.\scripts\verificar-iniciar-postgresql.ps1

# Verificar dados do CMS
node scripts\verificar-dados-cms.js
```

### Execução Automática

O script `Iniciar Sistema Completo.ps1` agora executa automaticamente:
1. Verificação e inicialização do PostgreSQL
2. Verificação dos dados do CMS
3. Inicialização dos microserviços
4. Inicialização do Dashboard Turismo
5. Inicialização do Site Público

## Dados Esperados

Após executar `node scripts/migrate-website-data.js` no backend:

- **website_settings**: 4 configurações
  - `contact_info`
  - `seo_global`
  - `site_info`
  - `social_media`

- **website_content**: 64 registros ativos
  - `hotels`: 41 registros (Spazzio DiRoma, Piazza DiRoma, Thermas Imperador, Mabu, Rio Quente Resorts, etc.)
  - `promotions`: 11 registros (Verão, PROMOFÉRIAS, Melhor Idade, Black Friday, etc.)
  - `attractions`: 7 registros (Parque das Águas, Hot Park, Parque Ecológico, etc.)
  - `tickets`: 5 registros (Hot Park 1/2 dias, Parque das Águas, Sky Park, Combo Termal)

- **website_header**: tabela criada com header padrão (imagem Reservei Viagens)

- **Leilões, Flash Deals, OTA, Google Hotel Ads**: usam APIs `/api/v1/*` do backend. Crie dados via formulários do CMS ou configure os microserviços.

## Verificação

Após iniciar o sistema, verifique:

1. **PostgreSQL está rodando:**
   ```powershell
   Get-Service -Name "postgresql-x64-18"
   ```

2. **Porta 5433 está ativa:**
   ```powershell
   Get-NetTCPConnection -LocalPort 5433
   ```

3. **API do CMS retorna dados:**
   ```powershell
   curl http://localhost:3000/api/admin/website/content/hotels -H "Authorization: Bearer admin-token-123"
   ```

4. **CMS carrega dados:**
   - Acesse: http://localhost:3000/admin/cms
   - Faça login com senha: `admin-token-123`
   - Verifique se os dados aparecem corretamente

## Notas Importantes

1. **Privilégios de Administrador**: O script de inicialização do PostgreSQL requer privilégios de administrador para iniciar o serviço automaticamente.

2. **Aguardar Inicialização**: Após iniciar o PostgreSQL, o script aguarda 10 segundos para garantir que o serviço esteja totalmente inicializado.

3. **Migração de Dados**: Se os dados não estiverem presentes, execute o script de migração:
   ```powershell
   node scripts\migrar-registros-customizados.js
   ```

## Status

✅ **Correção Implementada**
- Script de verificação do PostgreSQL criado
- Script de verificação dos dados do CMS criado
- Integração no script de inicialização completa
- Testes realizados com sucesso

## Data da Correção

12 de Janeiro de 2026
