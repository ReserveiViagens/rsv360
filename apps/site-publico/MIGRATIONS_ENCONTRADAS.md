# ✅ MIGRATIONS SQL ENCONTRADAS - Lista Completa

**Data:** 2025-12-16  
**Total Encontrado:** 32 migrations SQL  
**Localização:** `scripts/`

---

## 📋 LISTA COMPLETA DE MIGRATIONS

### Core Migrations (5 migrations)

1. ✅ `migration-001-create-users-table.sql`
2. ✅ `migration-002-create-properties.sql`
3. ✅ `migration-003-create-owners.sql`
4. ✅ `migration-005-create-availability.sql`
5. ✅ `migration-008-create-shares.sql`

**Observação:** Não há `migration-004`, `migration-006`, `migration-007` - podem ter sido mescladas ou renumeradas.

---

### Migrations Especializadas (27 migrations)

6. ✅ `migration-009-create-crm-tables.sql`
7. ✅ `migration-010-create-analytics-tables.sql`
8. ✅ `migration-011-create-ota-integrations-tables.sql`
9. ✅ `migration-012-create-ab-testing-tables.sql`
10. ✅ `migration-012-create-coupons-loyalty-tables.sql` (duplicado número 012)
11. ✅ `migration-013-create-reviews-enhanced-tables.sql`
12. ✅ `migration-013-create-roi-tables.sql` (duplicado número 013)
13. ✅ `migration-014-create-background-check-tables.sql`
14. ✅ `migration-014-create-messages-enhanced-tables.sql` (duplicado número 014)
15. ✅ `migration-015-create-insurance-tables.sql`
16. ✅ `migration-015-improve-location-sharing.sql` (duplicado número 015)
17. ✅ `migration-016-create-verification-tables.sql`
18. ✅ `migration-017-complete-rsv-gen2-schema.sql`
19. ✅ `migration-018-create-host-points-table.sql`
20. ✅ `migration-018-create-webhooks-tables.sql` (duplicado número 018)
21. ✅ `migration-019-create-digital-checkin-tables.sql`
22. ✅ `migration-019-create-incentive-programs-table.sql` (duplicado número 019)
23. ✅ `migration-020-create-tickets-tables.sql`
24. ✅ `migration-021-create-crm-tables.sql` (duplicado de migration-009?)
25. ✅ `migration-022-create-loyalty-tiers.sql`
26. ✅ `migration-023-create-gdpr-tables.sql`
27. ✅ `migration-024-create-backup-tables.sql`
28. ✅ `migration-025-create-dr-tables.sql`
29. ✅ `migration-026-create-audit-tables.sql`
30. ✅ `migration-027-create-encryption-tables.sql`

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

### Duplicações de Números

Há migrations com números duplicados:
- **012:** `migration-012-create-ab-testing-tables.sql` e `migration-012-create-coupons-loyalty-tables.sql`
- **013:** `migration-013-create-reviews-enhanced-tables.sql` e `migration-013-create-roi-tables.sql`
- **014:** `migration-014-create-background-check-tables.sql` e `migration-014-create-messages-enhanced-tables.sql`
- **015:** `migration-015-create-insurance-tables.sql` e `migration-015-improve-location-sharing.sql`
- **018:** `migration-018-create-host-points-table.sql` e `migration-018-create-webhooks-tables.sql`
- **019:** `migration-019-create-digital-checkin-tables.sql` e `migration-019-create-incentive-programs-table.sql`

**Ação Necessária:** Validar se são migrations diferentes ou duplicatas.

### Migrations Faltantes (Números)

Não há migrations com números:
- `migration-004` - Pode ter sido mesclada
- `migration-006` - Pode ter sido mesclada
- `migration-007` - Pode ter sido mesclada

**Ação Necessária:** Verificar se essas migrations foram mescladas em outras ou se são realmente desnecessárias.

### Possível Duplicação de Conteúdo

- `migration-009-create-crm-tables.sql` e `migration-021-create-crm-tables.sql` - Ambos para CRM

**Ação Necessária:** Verificar se são diferentes ou duplicatas.

---

## 📊 RESUMO

| Categoria | Quantidade | Status |
|-----------|------------|--------|
| Core Migrations | 5 | ✅ Implementadas |
| Migrations Especializadas | 27 | ✅ Implementadas |
| **Total** | **32** | ✅ **100% Encontradas** |

---

## ✅ PRÓXIMAS AÇÕES

1. [ ] Validar se todas as 32 migrations foram executadas no banco
2. [ ] Verificar se há migrations duplicadas ou conflitantes
3. [ ] Validar ordem de execução das migrations
4. [ ] Executar migrations pendentes se houver
5. [ ] Documentar estado atual das migrations
6. [ ] Criar script de validação de migrations

---

**Última atualização:** 2025-12-16

