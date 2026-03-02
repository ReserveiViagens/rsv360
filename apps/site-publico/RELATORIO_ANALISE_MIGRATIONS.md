# 📊 RELATÓRIO DE ANÁLISE DE MIGRATIONS

**Data:** 2025-12-16  
**Status:** ⚠️ **PROBLEMAS ENCONTRADOS**

---

## 📋 RESUMO EXECUTIVO

- **Total de migrations:** 30
- **Tabelas únicas criadas:** 88
- **Conflitos encontrados:** 7

---

## 🔴 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. Migrations com Números Duplicados (6 pares)

#### Número 12 (2 migrations):
- `migration-012-create-ab-testing-tables.sql` - Sistema de A/B Testing
- `migration-012-create-coupons-loyalty-tables.sql` - Cupons e Fidelidade

#### Número 13 (2 migrations):
- `migration-013-create-reviews-enhanced-tables.sql` - Avaliações
- `migration-013-create-roi-tables.sql` - Relatórios de ROI

#### Número 14 (2 migrations):
- `migration-014-create-background-check-tables.sql` - Background Check
- `migration-014-create-messages-enhanced-tables.sql` - Mensagens

#### Número 15 (2 migrations):
- `migration-015-create-insurance-tables.sql` - Seguros
- `migration-015-improve-location-sharing.sql` - Compartilhamento de Localização

#### Número 18 (2 migrations):
- `migration-018-create-host-points-table.sql` - Pontos de Hosts
- `migration-018-create-webhooks-tables.sql` - Webhooks

#### Número 19 (2 migrations):
- `migration-019-create-digital-checkin-tables.sql` - Check-in Digital
- `migration-019-create-incentive-programs-table.sql` - Programas de Incentivo

---

### 2. Tabelas Criadas por Múltiplas Migrations (5 tabelas)

#### ⚠️ Tabela `interactions`:
- `migration-009-create-crm-tables.sql` (Número 9)
- `migration-021-create-crm-tables.sql` (Número 21)

#### ⚠️ Tabela `segments`:
- `migration-009-create-crm-tables.sql` (Número 9)
- `migration-021-create-crm-tables.sql` (Número 21)

#### ⚠️ Tabela `customer_segments`:
- `migration-009-create-crm-tables.sql` (Número 9)
- `migration-021-create-crm-tables.sql` (Número 21)

#### ⚠️ Tabela `campaigns`:
- `migration-009-create-crm-tables.sql` (Número 9)
- `migration-021-create-crm-tables.sql` (Número 21)

#### ⚠️ Tabela `campaign_recipients`:
- `migration-009-create-crm-tables.sql` (Número 9)
- `migration-021-create-crm-tables.sql` (Número 21)

**Problema:** Migration 009 e 021 criam as mesmas tabelas CRM, mas com estruturas possivelmente diferentes.

---

### 3. Lacunas na Numeração

- **Entre 3 e 5:** Faltam migrations 004
- **Entre 5 e 8:** Faltam migrations 006 e 007

---

## 💡 PLANO DE CORREÇÃO

### Fase 1: Renumerar Migrations Duplicadas

**Estratégia:** Renumerar a segunda migration de cada par para números sequenciais disponíveis.

#### Ações:
1. **Número 12 → 28 e 29:**
   - `migration-012-create-ab-testing-tables.sql` → manter 12
   - `migration-012-create-coupons-loyalty-tables.sql` → renumerar para 28

2. **Número 13 → 30 e 31:**
   - `migration-013-create-reviews-enhanced-tables.sql` → manter 13
   - `migration-013-create-roi-tables.sql` → renumerar para 30

3. **Número 14 → 32 e 33:**
   - `migration-014-create-background-check-tables.sql` → manter 14
   - `migration-014-create-messages-enhanced-tables.sql` → renumerar para 32

4. **Número 15 → 34 e 35:**
   - `migration-015-create-insurance-tables.sql` → manter 15
   - `migration-015-improve-location-sharing.sql` → renumerar para 34

5. **Número 18 → 36 e 37:**
   - `migration-018-create-host-points-table.sql` → manter 18
   - `migration-018-create-webhooks-tables.sql` → renumerar para 36

6. **Número 19 → 38 e 39:**
   - `migration-019-create-digital-checkin-tables.sql` → manter 19
   - `migration-019-create-incentive-programs-table.sql` → renumerar para 38

---

### Fase 2: Resolver Conflitos de Tabelas CRM

**Problema:** Migration 009 e 021 criam as mesmas tabelas.

**Estratégia:** 
1. Analisar diferenças entre as duas migrations
2. Consolidar em uma única migration (009)
3. Remover tabelas duplicadas da migration 021
4. Manter apenas tabelas únicas da migration 021

**Ações:**
- [ ] Comparar estruturas das tabelas entre 009 e 021
- [ ] Decidir qual estrutura usar (provavelmente a mais completa)
- [ ] Remover tabelas duplicadas da migration 021
- [ ] Renumerar migration 021 para número sequencial (se necessário)

---

### Fase 3: Preencher Lacunas (Opcional)

**Estratégia:** Criar migrations vazias ou documentar que foram puladas intencionalmente.

**Ações:**
- [ ] Criar `migration-004-skip.sql` (documentando que foi pulada)
- [ ] Criar `migration-006-skip.sql` (documentando que foi pulada)
- [ ] Criar `migration-007-skip.sql` (documentando que foi pulada)

---

## 📋 CHECKLIST DE CORREÇÃO

### Fase 1: Renumeração
- [ ] Renumerar `migration-012-create-coupons-loyalty-tables.sql` → 28
- [ ] Renumerar `migration-013-create-roi-tables.sql` → 30
- [ ] Renumerar `migration-014-create-messages-enhanced-tables.sql` → 32
- [ ] Renumerar `migration-015-improve-location-sharing.sql` → 34
- [ ] Renumerar `migration-018-create-webhooks-tables.sql` → 36
- [ ] Renumerar `migration-019-create-incentive-programs-table.sql` → 38
- [ ] Atualizar referências nos scripts de execução

### Fase 2: Conflitos CRM
- [ ] Comparar migration-009 e migration-021
- [ ] Consolidar tabelas CRM
- [ ] Remover duplicações
- [ ] Validar estrutura final

### Fase 3: Validação
- [ ] Executar `npm run db:analyze` novamente
- [ ] Verificar se conflitos foram resolvidos
- [ ] Documentar mudanças

---

## 🎯 PRÓXIMOS PASSOS

1. **Imediato:** Renumerar migrations duplicadas
2. **Curto Prazo:** Resolver conflitos de tabelas CRM
3. **Médio Prazo:** Validar todas as migrations no banco

---

## 📝 COMANDOS ÚTEIS

```bash
# Analisar migrations
npm run db:analyze

# Verificar status no banco (quando configurado)
npm run db:check

# Comparar migrations
npm run db:compare
```

---

**Última atualização:** 2025-12-16

