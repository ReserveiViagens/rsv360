# ✅ GUIA: VERIFICAR TABELAS NO pgAdmin

**Data:** 2025-01-30  
**Método:** Passo a Passo Detalhado

---

## ⚠️ ERRO COMUM

**Erro:** `ERROR: erro de sintaxe em ou próximo a "scripts"`

**Causa:** Tentou executar o caminho do arquivo como SQL.

**Solução:** Você precisa **COPIAR O CONTEÚDO** do arquivo SQL, não o caminho!

---

## 🚀 MÉTODO CORRETO - PASSO A PASSO

### Passo 1: Abrir pgAdmin
1. Abra o **pgAdmin 4**
2. Conecte-se ao servidor **"localhost"** ou **"PostgreSQL 18"**
3. Expanda: **Databases** → **onboarding_rsv_db**

### Passo 2: Abrir Query Tool
1. Clique com botão direito em **onboarding_rsv_db**
2. Selecione **Query Tool**
3. Uma nova janela abrirá

### Passo 3: Abrir o Arquivo SQL
1. No Query Tool, clique em **File** → **Open** (ou pressione `Ctrl+O`)
2. Navegue até: `D:\servidor RSV\Hotel-com-melhor-preco-main\scripts\`
3. Selecione: `verificar-tabelas-criadas.sql`
4. Clique em **Open**

**OU**

### Passo 3 Alternativo: Copiar e Colar
1. Abra o arquivo `scripts/verificar-tabelas-criadas.sql` em um editor de texto
2. Selecione TODO o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)
4. Cole no Query Tool do pgAdmin (Ctrl+V)

### Passo 4: Executar a Query
1. Clique no botão **Execute** (ou pressione `F5`)
2. Aguarde o resultado

### Passo 5: Verificar Resultados
- Você verá uma tabela com todas as tabelas criadas
- Deve mostrar 16-17 tabelas com status "✅ CRIADA"

---

## 📋 QUERY SQL DIRETA (Copie e Cole)

Se preferir, copie e cole esta query diretamente no Query Tool:

```sql
-- Verificar todas as tabelas criadas
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'credentials',
            'application_logs',
            'notification_queue',
            'saved_searches',
            'two_factor_auth',
            'two_factor_backup_codes',
            'audit_logs',
            'lgpd_consents',
            'lgpd_data_requests',
            'rate_limit_attempts',
            'trip_plans',
            'trip_members',
            'trip_tasks',
            'trip_itinerary',
            'trip_expenses',
            'trip_expense_splits',
            'group_chat_polls'
        ) THEN '✅ CRIADA'
        ELSE '⚠️ NÃO ESPERADA'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'credentials',
    'application_logs',
    'notification_queue',
    'saved_searches',
    'two_factor_auth',
    'two_factor_backup_codes',
    'audit_logs',
    'lgpd_consents',
    'lgpd_data_requests',
    'rate_limit_attempts',
    'trip_plans',
    'trip_members',
    'trip_tasks',
    'trip_itinerary',
    'trip_expenses',
    'trip_expense_splits',
    'group_chat_polls'
)
ORDER BY table_name;
```

---

## 🔍 VERIFICAÇÃO RÁPIDA (Query Simples)

Para uma verificação mais rápida, use esta query:

```sql
-- Contar tabelas criadas
SELECT 
    COUNT(*) as total_tabelas,
    CASE 
        WHEN COUNT(*) >= 16 THEN '✅ TODAS AS TABELAS CRIADAS'
        WHEN COUNT(*) >= 10 THEN '⚠️ ALGUMAS TABELAS FALTANDO'
        ELSE '❌ MUITAS TABELAS FALTANDO'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'credentials',
    'application_logs',
    'notification_queue',
    'saved_searches',
    'two_factor_auth',
    'two_factor_backup_codes',
    'audit_logs',
    'lgpd_consents',
    'lgpd_data_requests',
    'rate_limit_attempts',
    'trip_plans',
    'trip_members',
    'trip_tasks',
    'trip_itinerary',
    'trip_expenses',
    'trip_expense_splits',
    'group_chat_polls'
);
```

---

## ✅ RESULTADO ESPERADO

### Query 1 (Lista de Tabelas):
```
table_name              | status
------------------------|------------
application_logs        | ✅ CRIADA
audit_logs              | ✅ CRIADA
credentials             | ✅ CRIADA
...
```

### Query 2 (Contagem):
```
total_tabelas | status
--------------|--------------------------
16            | ✅ TODAS AS TABELAS CRIADAS
```

---

## 🎯 PRÓXIMOS PASSOS

Após verificar que as tabelas foram criadas:

1. ✅ Execute os testes: `npm test`
2. ✅ Inicie o servidor: `npm run dev`
3. ✅ Teste as funcionalidades

---

**Documento criado:** 2025-01-30  
**Status:** ✅ Guia Corrigido

