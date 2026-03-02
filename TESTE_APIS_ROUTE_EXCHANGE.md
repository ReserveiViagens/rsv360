# 🧪 Teste das APIs do Route Exchange

**Data:** 2026-01-05  
**Status:** ⚠️ **Backend precisa ser iniciado**

---

## 📋 **PREPARAÇÃO**

### 1. ✅ **Verificar Backend**

O backend precisa estar rodando na porta 5000:

```powershell
# Verificar se está rodando
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

# Se não estiver, iniciar:
cd backend
npm run dev
```

### 2. ✅ **Script de Teste Criado**

Arquivo criado: `backend/scripts/test-route-exchange-apis.js`

---

## 🚀 **COMO EXECUTAR OS TESTES**

### Opção 1: Via Script Automático

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial\backend"
node scripts/test-route-exchange-apis.js
```

### Opção 2: Via Postman/Insomnia

Use os seguintes endpoints:

#### **1. Health Check**
```
GET http://localhost:5000/health
```

#### **2. Login**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@rsv360.com",
  "password": "admin123"
}
```

#### **3. Order Book**
```
GET http://localhost:5000/api/v1/route-exchange/markets/{market_id}/orderbook
Authorization: Bearer {token}
```

#### **4. Spread**
```
GET http://localhost:5000/api/v1/route-exchange/markets/{market_id}/spread
Authorization: Bearer {token}
```

#### **5. Listar Bids**
```
GET http://localhost:5000/api/v1/route-exchange/bids/my
Authorization: Bearer {token}
```

#### **6. Listar Asks**
```
GET http://localhost:5000/api/v1/route-exchange/asks/my
Authorization: Bearer {token}
```

#### **7. Criar Bid**
```
POST http://localhost:5000/api/v1/route-exchange/bids
Authorization: Bearer {token}
Content-Type: application/json

{
  "market_id": "{market_id}",
  "bid_type": "market",
  "bid_price": 9000.00,
  "quantity": 2,
  "travel_dates": {
    "check_in": "2026-08-01",
    "check_out": "2026-08-07",
    "flexible": false
  },
  "requirements": {
    "hotel_stars": 4,
    "breakfast": true
  }
}
```

---

## 📊 **ENDPOINTS DISPONÍVEIS**

### Order Book
- `GET /api/v1/route-exchange/markets/:marketId/orderbook` - Order book completo
- `GET /api/v1/route-exchange/markets/:marketId/spread` - Spread do mercado

### Bids (Ordens de Compra)
- `POST /api/v1/route-exchange/bids` - Criar bid
- `GET /api/v1/route-exchange/bids/my` - Meus bids
- `DELETE /api/v1/route-exchange/bids/:bidId` - Cancelar bid

### Asks (Ordens de Venda)
- `POST /api/v1/route-exchange/asks` - Criar ask
- `GET /api/v1/route-exchange/asks/my` - Minhas asks
- `DELETE /api/v1/route-exchange/asks/:askId` - Cancelar ask

### Matches (Negócios Fechados)
- `GET /api/v1/route-exchange/matches` - Listar matches
- `GET /api/v1/route-exchange/matches/:matchId` - Detalhes do match
- `POST /api/v1/route-exchange/matches/:matchId/confirm` - Confirmar match

### Verification (Proof of Transparency)
- `GET /api/v1/route-exchange/verify/:entityType/:entityId` - Verificar entidade

---

## 🔍 **OBTER MARKET_ID**

Para testar, você precisa do ID de um mercado. Execute no pgAdmin 4:

```sql
SELECT id, destination_code, destination_name 
FROM route_exchange_markets 
WHERE destination_code = 'PAR';
```

Use o `id` retornado nos endpoints.

---

## ✅ **CHECKLIST DE TESTES**

- [ ] Backend rodando na porta 5000
- [ ] Health check funcionando
- [ ] Login realizado com sucesso
- [ ] Token obtido
- [ ] Order Book retornando dados
- [ ] Spread calculado corretamente
- [ ] Bids listados
- [ ] Asks listados
- [ ] Criar bid funcionando
- [ ] Criar ask funcionando
- [ ] Matches listados

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Iniciar Backend:**
   ```powershell
   cd backend
   npm run dev
   ```

2. **Executar Testes:**
   ```powershell
   node scripts/test-route-exchange-apis.js
   ```

3. **Verificar Resultados:**
   - Todos os endpoints devem retornar 200 OK
   - Dados devem estar corretos
   - Matching engine deve funcionar

---

**Status:** ⚠️ **Aguardando Backend ser iniciado**

**Próximo Passo:** Iniciar o backend e executar os testes
