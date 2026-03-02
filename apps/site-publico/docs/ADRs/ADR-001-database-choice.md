# ADR-001: Escolha do Banco de Dados

**Status:** Aceito  
**Data:** 2025-11-22  
**Decisores:** Equipe de Desenvolvimento

## Contexto

O RSV Gen 2 precisa de um banco de dados robusto para gerenciar:
- Reservas e propriedades
- Usuários e autenticação
- Pagamentos e transações
- Integrações com serviços externos
- Dados analíticos para Smart Pricing

Requisitos:
- Suporte a transações ACID
- Queries complexas com JOINs
- Performance para alta concorrência
- Escalabilidade horizontal
- Suporte a JSON para dados flexíveis

## Decisão

**PostgreSQL** foi escolhido como banco de dados principal.

### Justificativa

1. **ACID Compliance:** Garante integridade de dados em transações críticas (reservas, pagamentos)
2. **Queries Complexas:** Suporte robusto a JOINs, subqueries, window functions
3. **JSON Support:** PostgreSQL suporta JSON/JSONB nativamente para dados flexíveis
4. **Maturidade:** Banco de dados maduro e confiável, amplamente usado em produção
5. **Open Source:** Sem custos de licenciamento
6. **Extensibilidade:** Extensões como PostGIS para funcionalidades geográficas
7. **Performance:** Otimizador de queries avançado, índices eficientes

## Consequências

### Positivas

- ✅ Transações ACID garantem consistência de dados
- ✅ Queries complexas são eficientes
- ✅ Suporte nativo a JSON permite flexibilidade
- ✅ Grande comunidade e documentação
- ✅ Ferramentas maduras de backup e replicação
- ✅ Compatível com ORMs populares (Prisma, TypeORM)

### Negativas

- ⚠️ Requer mais conhecimento de SQL do que NoSQL
- ⚠️ Escalabilidade horizontal mais complexa que NoSQL
- ⚠️ Configuração inicial pode ser mais trabalhosa

## Alternativas Consideradas

### MongoDB

**Prós:**
- Schema flexível
- Escalabilidade horizontal fácil
- Boa performance para leitura

**Contras:**
- Sem transações ACID completas (até versão 4.0)
- Queries complexas com JOINs são limitadas
- Menos adequado para dados relacionais

**Por que não:** Dados do RSV são altamente relacionais (reservas → propriedades → usuários). Transações ACID são críticas para reservas e pagamentos.

### MySQL

**Prós:**
- Muito popular e conhecido
- Boa performance
- Ferramentas maduras

**Contras:**
- Suporte a JSON menos robusto que PostgreSQL
- Menos recursos avançados (window functions, CTEs)
- Licenciamento pode ser complexo (Oracle)

**Por que não:** PostgreSQL oferece melhor suporte a JSON e recursos mais avançados sem custos de licenciamento.

### Redis (apenas cache)

**Prós:**
- Performance extremamente alta
- Ideal para cache e sessões

**Contras:**
- Não é banco de dados principal
- Dados em memória (volátil)

**Por que não:** Redis é usado como cache complementar, não como banco principal.

---

## Implementação

- **Versão:** PostgreSQL 14+
- **ORM:** Prisma (TypeScript-first)
- **Migrations:** Prisma Migrate
- **Backup:** pg_dump + replicação streaming
- **Cache:** Redis para dados frequentemente acessados

---

**Status:** ✅ Implementado e em produção

