# 🚀 EXECUTAR PRÓXIMOS PASSOS - GUIA PRÁTICO

**Data:** 2025-01-30  
**Status:** Guia Prático de Execução

---

## ✅ PASSO 1: VERIFICAR TABELAS (CONCLUÍDO)

Você já verificou as tabelas no pgAdmin. ✅

---

## 🧪 PASSO 2: EXECUTAR TESTES

### Opção A: Todos os Testes
```powershell
npm test
```

### Opção B: Testes Específicos
```powershell
# Testes de serviços avançados
npm test tests/integration/enhanced-services.test.ts

# Testes de API
npm test tests/integration/api.test.ts

# Testes de serviços
npm test tests/integration/services.test.ts
```

### Opção C: Com Cobertura
```powershell
npm test -- --coverage
```

### Opção D: Modo Watch (Reexecuta ao salvar)
```powershell
npm test -- --watch
```

### Interpretar Resultados

#### ✅ Sucesso
```
PASS  tests/integration/enhanced-services.test.ts
  Enhanced Services Integration Tests
    ✓ should vote on wishlist item
    ✓ should get vote result
    ...

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

#### ⚠️ Se Alguns Testes Falharem
- Verifique se as tabelas SQL foram criadas
- Verifique variáveis de ambiente no `.env`
- Verifique conexão com banco de dados

---

## 🖥️ PASSO 3: INICIAR SERVIDOR

### Terminal 1: Servidor de Desenvolvimento
```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
npm run dev
```

Aguarde até ver:
```
✓ Ready in Xs
○ Local: http://localhost:3000
```

### Verificar se Está Funcionando
Abra no navegador: `http://localhost:3000`

---

## 🧪 PASSO 4: TESTAR FUNCIONALIDADES

### 4.1. Teste Automatizado de APIs

**Terminal 2** (com servidor rodando):
```powershell
.\scripts\testar-funcionalidades.ps1
```

### 4.2. Teste Manual no Navegador

#### Funcionalidades Básicas
1. **Login:**
   - URL: `http://localhost:3000/login`
   - Teste: Fazer login com credenciais válidas

2. **Dashboard:**
   - URL: `http://localhost:3000/admin/dashboard`
   - Teste: Verificar se métricas são exibidas

#### Funcionalidades Avançadas

3. **Wishlists com Votação:**
   - URL: `http://localhost:3000/wishlists`
   - Teste:
     - Criar wishlist
     - Adicionar itens
     - Votar (Aprovar/Rejeitar/Indeciso)
     - Ver ranking

4. **Split Payment:**
   - URL: `http://localhost:3000/bookings/[id]/split-payment`
   - Teste:
     - Criar split payment
     - Adicionar participantes
     - Processar pagamento

5. **Chat em Grupo:**
   - URL: `http://localhost:3000/group-chat/[id]`
   - Teste:
     - Ativar "UI Avançada"
     - Enviar mensagens
     - Adicionar reações
     - Buscar mensagens

6. **Planejamento de Viagem:**
   - URL: `http://localhost:3000/trips`
   - Teste:
     - Criar plano de viagem
     - Adicionar tarefas
     - Adicionar despesas
     - Ver resumo financeiro

7. **Analytics Avançado:**
   - URL: `http://localhost:3000/admin/analytics/advanced`
   - Teste:
     - Selecionar propriedade
     - Ver Revenue Forecast
     - Ver Demand Heatmap
     - Ver Competitor Benchmark

8. **Credenciais:**
   - URL: `http://localhost:3000/admin/credenciais`
   - Teste:
     - Configurar credenciais
     - Testar conexões
     - Verificar salvamento

### 4.3. Teste de APIs com curl (Opcional)

**Terminal 2** (com servidor rodando):

```powershell
# Health Check
curl http://localhost:3000/api/health

# Analytics Forecast
curl "http://localhost:3000/api/analytics/forecast?propertyId=1&startDate=2025-07-01&endDate=2025-07-31"

# Analytics Heatmap
curl "http://localhost:3000/api/analytics/heatmap?propertyId=1&startDate=2025-07-01&endDate=2025-07-31"
```

---

## 📊 CHECKLIST DE EXECUÇÃO

### Passo 2: Testes
- [ ] Testes executados
- [ ] Todos os testes passaram (ou maioria)
- [ ] Cobertura verificada (se aplicável)

### Passo 3: Servidor
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Servidor acessível em `http://localhost:3000`
- [ ] Sem erros no console

### Passo 4: Funcionalidades
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Wishlists com votação funciona
- [ ] Split payment funciona
- [ ] Chat em grupo funciona
- [ ] Planejamento de viagem funciona
- [ ] Analytics funciona
- [ ] APIs retornam dados

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Testes Falhando

**Erro: "relation does not exist"**
- **Solução:** Execute os scripts SQL primeiro

**Erro: "Cannot find module"**
- **Solução:** `npm install`

**Erro: "Database connection failed"**
- **Solução:** Verifique `.env` e conexão PostgreSQL

### Servidor Não Inicia

**Erro: "Port 3000 already in use"**
- **Solução:** Feche outros processos na porta 3000 ou use outra porta:
```powershell
$env:PORT=3001
npm run dev
```

**Erro: "Module not found"**
- **Solução:** `npm install`

### APIs Retornam Erro 500

1. Verifique logs no console do servidor
2. Verifique se tabelas existem
3. Verifique logs no banco:
```sql
SELECT * FROM application_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🎯 ORDEM RECOMENDADA

1. ✅ **Verificar tabelas** (JÁ FEITO)
2. ⏳ **Executar testes:** `npm test`
3. ⏳ **Iniciar servidor:** `npm run dev`
4. ⏳ **Testar funcionalidades:** Use URLs acima

---

**Documento criado:** 2025-01-30  
**Status:** ✅ Pronto para Execução

