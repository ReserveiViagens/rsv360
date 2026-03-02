# 🚀 GUIA RÁPIDO DE TESTES - RSV 360°

Este guia fornece instruções rápidas para testar as funcionalidades principais do sistema.

---

## 📋 PRÉ-REQUISITOS

1. **Servidor rodando:**
   ```bash
   npm run dev
   ```

2. **Banco de dados configurado:**
   ```bash
   node scripts/testar-funcionalidades.js
   ```

---

## 🧪 TESTES RÁPIDOS

### 1. Verificar URLs

Execute o script de verificação:

```bash
node scripts/verificar-urls-teste.js
```

Este script verifica se todas as URLs estão respondendo corretamente.

---

### 2. Testar Calendário

**URL:** http://localhost:3000/properties/1/calendar

**O que testar:**
- ✅ Calendário carrega corretamente
- ✅ Preços dinâmicos são exibidos
- ✅ Eventos são destacados
- ✅ Datas bloqueadas não são selecionáveis
- ✅ Seleção de check-in e check-out funciona

**Dados de teste:**
- Propriedade ID: 1
- Preço base: R$ 300,00
- Localização: Caldas Novas, GO

---

### 3. Testar Check-in Online

**URL:** http://localhost:3000/checkin?booking_id=1

**O que testar:**
- ✅ Página carrega com dados da reserva
- ✅ Formulário de check-in é exibido
- ✅ Upload de documentos funciona
- ✅ Assinatura de contrato funciona
- ✅ Instruções são exibidas após conclusão

**Dados de teste:**
- Reserva ID: 1
- Código: RSV-20251126-624
- Cliente: Reservei Viagens

---

### 4. Testar Página de Hotéis

**URL:** http://localhost:3000/hoteis

**O que testar:**
- ✅ Lista de hotéis é exibida
- ✅ Filtros funcionam
- ✅ Busca funciona
- ✅ Mapa interativo funciona (se Google Maps configurado)
- ✅ Galeria de fotos funciona
- ✅ Links para detalhes funcionam

---

### 5. Testar API de Propriedades

**URL:** http://localhost:3000/api/properties

**O que testar:**
- ✅ Retorna lista de propriedades
- ✅ Filtros por query params funcionam
- ✅ Resposta em JSON

**Exemplos:**
```bash
# Listar todas
curl http://localhost:3000/api/properties

# Filtrar por ID
curl http://localhost:3000/api/properties?id=1

# Filtrar por cidade
curl http://localhost:3000/api/properties?city=Caldas%20Novas
```

---

### 6. Testar API de Eventos

**URL:** http://localhost:3000/api/events?start_date=2025-12-01&end_date=2025-12-31

**O que testar:**
- ✅ Retorna eventos no período
- ✅ Multiplicadores de preço são calculados

---

### 7. Testar API de Preços

**URL:** http://localhost:3000/api/properties/1/pricing?check_in=2025-12-01&check_out=2025-12-05

**O que testar:**
- ✅ Preço dinâmico é calculado
- ✅ Breakdown de preços é retornado
- ✅ Multiplicadores são aplicados corretamente

---

## 🔍 VERIFICAÇÕES MANUAIS

### Console do Navegador

1. Abra DevTools (F12)
2. Vá para a aba "Console"
3. Verifique se há erros

**Erros comuns:**
- `Module not found`: Verifique se todas as dependências estão instaladas
- `Network error`: Verifique se o servidor está rodando
- `CORS error`: Verifique configuração do servidor

### Network Tab

1. Abra DevTools (F12)
2. Vá para a aba "Network"
3. Recarregue a página
4. Verifique requisições:
   - ✅ Status 200 para recursos principais
   - ✅ Sem erros 404 ou 500
   - ✅ Tempo de resposta razoável

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot GET /properties/1/calendar"

**Causa:** Rota não encontrada

**Solução:**
1. Verifique se o arquivo `app/properties/[id]/calendar/page.tsx` existe
2. Reinicie o servidor: `npm run dev`

### Erro: "relação 'properties' não existe"

**Causa:** Tabela não criada no banco

**Solução:**
```bash
node scripts/executar-todas-implementacoes.js
```

### Erro: "Module not found: Can't resolve 'fs'"

**Causa:** Módulo Node.js sendo usado no cliente

**Solução:**
1. Verifique `next.config.mjs`
2. Certifique-se de que webpack fallbacks estão configurados

### Página em branco

**Causa:** Erro JavaScript no cliente

**Solução:**
1. Abra DevTools → Console
2. Verifique erros
3. Verifique Network tab para requisições falhadas

---

## ✅ CHECKLIST DE TESTES

- [ ] Servidor iniciado sem erros
- [ ] Banco de dados conectado
- [ ] Calendário carrega e funciona
- [ ] Check-in carrega e funciona
- [ ] Página de hotéis carrega e funciona
- [ ] APIs retornam dados corretos
- [ ] Sem erros no console
- [ ] Sem erros no Network tab
- [ ] Imagens carregam corretamente
- [ ] Formulários funcionam
- [ ] Navegação funciona

---

## 📞 PRÓXIMOS PASSOS

Após testar todas as funcionalidades:

1. **Configure integrações:**
   - Siga `GUIA_CONFIGURACAO_ENV_COMPLETO.md`
   - Configure SMTP, Mercado Pago, OAuth

2. **Teste integrações:**
   ```bash
   node scripts/testar-email.js
   node scripts/testar-mercadopago.js
   node scripts/testar-oauth.js
   ```

3. **Consulte documentação:**
   - `DOCUMENTACAO_COMPLETA.md` para referência completa
   - `ANALISE_COMPLETA_SISTEMA.md` para status do sistema

---

**Boa sorte com os testes!** 🚀

