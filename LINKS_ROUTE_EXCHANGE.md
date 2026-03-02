# 🔗 Links de Acesso - The Global Route Exchange

**Data:** 2026-01-05  
**Status:** ✅ **Backend Funcionando | Frontend Pendente**

---

## 🌐 **URLs DE ACESSO**

### **Base URLs**

| Serviço | URL | Status |
|---------|-----|--------|
| **Dashboard Turismo** | http://localhost:3005 | ✅ Rodando |
| **Backend API** | http://localhost:5000 | ✅ Rodando |
| **Health Check** | http://localhost:5000/health | ✅ Funcionando |

---

## 📡 **APIs DO ROUTE EXCHANGE (Backend)**

### **Base URL da API:**
```
http://localhost:5000/api/v1/route-exchange
```

### **Endpoints Disponíveis:**

#### **1. Order Book**
- **GET** `/api/v1/route-exchange/markets/:marketId/orderbook`
  - Obter Order Book completo de um mercado
  - **Exemplo:** `http://localhost:5000/api/v1/route-exchange/markets/271e4cc8-f397-4694-bef7-574a4396877e/orderbook`

#### **2. Spread**
- **GET** `/api/v1/route-exchange/markets/:marketId/spread`
  - Calcular spread de um mercado
  - **Exemplo:** `http://localhost:5000/api/v1/route-exchange/markets/271e4cc8-f397-4694-bef7-574a4396877e/spread`

#### **3. Bids (Ordens de Compra)**
- **GET** `/api/v1/route-exchange/bids/my`
  - Listar bids do usuário autenticado
- **POST** `/api/v1/route-exchange/bids`
  - Criar novo bid
- **DELETE** `/api/v1/route-exchange/bids/:bidId`
  - Cancelar bid

#### **4. Asks (Ordens de Venda)**
- **GET** `/api/v1/route-exchange/asks/my`
  - Listar asks do fornecedor autenticado
- **POST** `/api/v1/route-exchange/asks`
  - Criar novo ask
- **DELETE** `/api/v1/route-exchange/asks/:askId`
  - Cancelar ask

#### **5. Matches (Negócios Fechados)**
- **GET** `/api/v1/route-exchange/matches`
  - Listar matches do usuário
- **GET** `/api/v1/route-exchange/matches/:matchId`
  - Obter match específico
- **POST** `/api/v1/route-exchange/matches/:matchId/confirm`
  - Confirmar match

#### **6. Verificação (Proof of Transparency)**
- **GET** `/api/v1/route-exchange/verify/:entityType/:entityId`
  - Verificar integridade de uma entidade
  - **Exemplo:** `http://localhost:5000/api/v1/route-exchange/verify/bid/15babc75-2bf1-4cd2-8bca-30c016657d45`

---

## 🖥️ **FRONTEND (Pendente)**

### ⚠️ **Status:**
As páginas frontend do Route Exchange **ainda não foram criadas**.

### 📋 **Rotas Sugeridas (a criar):**

```
/dashboard/route-exchange
├── /dashboard/route-exchange/orderbook          (Order Book)
├── /dashboard/route-exchange/bids               (Meus Bids)
├── /dashboard/route-exchange/asks               (Meus Asks)
├── /dashboard/route-exchange/matches            (Matches)
├── /dashboard/route-exchange/rfps               (RFQs)
└── /dashboard/route-exchange/analytics          (Analytics/Candlesticks)
```

---

## 🔐 **AUTENTICAÇÃO**

### **Login:**
- **URL:** http://localhost:3005/login
- **Credenciais de Teste:**
  - Email: `teste-route-exchange@rsv360.com`
  - Senha: `Teste123!`

### **Como Obter Token:**

```bash
# Via curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-route-exchange@rsv360.com",
    "password": "Teste123!"
  }'
```

### **Usar Token nas Requisições:**

```bash
# Adicionar header Authorization
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🧪 **TESTAR APIs**

### **Script de Teste Automatizado:**

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial\backend"
node scripts/test-route-exchange-apis.js
```

**Resultado:** ✅ 8/9 testes passando (88,9%)

---

## 📊 **DADOS DE EXEMPLO**

### **Mercados Disponíveis:**

| ID | Destino | Código | Status |
|----|---------|--------|--------|
| `271e4cc8-f397-4694-bef7-574a4396877e` | Paris | PAR | ✅ Ativo |
| `...` | Outros 7 mercados | ... | ✅ Ativos |

### **Bids de Exemplo:**
- **Preço:** R$ 8.500,00
- **Quantidade:** 2 pessoas
- **Status:** Active

### **Asks de Exemplo:**
- **Preço:** R$ 8.000,00
- **Quantidade:** 2 pessoas
- **Status:** Active

---

## 🚀 **COMO ACESSAR AGORA**

### **1. Via API (Postman/Insomnia/curl):**

1. **Fazer login:**
   ```bash
   POST http://localhost:5000/api/auth/login
   Body: {
     "email": "teste-route-exchange@rsv360.com",
     "password": "Teste123!"
   }
   ```

2. **Copiar o token da resposta**

3. **Usar o token nas requisições:**
   ```bash
   GET http://localhost:5000/api/v1/route-exchange/markets/{marketId}/orderbook
   Headers: {
     "Authorization": "Bearer SEU_TOKEN"
   }
   ```

### **2. Via Script de Teste:**

```powershell
cd backend
node scripts/test-route-exchange-apis.js
```

### **3. Via Frontend (quando implementado):**

```
http://localhost:3005/dashboard/route-exchange
```

---

## 📋 **CHECKLIST**

### ✅ **Backend:**
- [x] APIs implementadas
- [x] Order Book funcionando
- [x] Bids funcionando
- [x] Asks funcionando
- [x] Spread calculando
- [x] Autenticação funcionando
- [x] Dados de exemplo criados

### ⏳ **Frontend:**
- [ ] Páginas criadas
- [ ] Componente OrderBook
- [ ] Componente CandlestickChart
- [ ] Integração com APIs
- [ ] WebSocket para tempo real

---

## 🔗 **LINKS RÁPIDOS**

### **Backend:**
- **Health Check:** http://localhost:5000/health
- **API Base:** http://localhost:5000/api/v1/route-exchange
- **Login:** http://localhost:5000/api/auth/login

### **Frontend:**
- **Dashboard:** http://localhost:3005/dashboard
- **Login:** http://localhost:3005/login

---

## 📝 **PRÓXIMOS PASSOS**

1. **Criar páginas frontend** para o Route Exchange
2. **Implementar componente OrderBook** com visualização de bids/asks
3. **Criar gráficos Candlestick** para histórico de preços
4. **Implementar WebSocket** para atualizações em tempo real
5. **Criar interface RFQ** para Request for Proposal

---

**Última Atualização:** 2026-01-05  
**Status:** ✅ Backend Operacional | ⏳ Frontend Pendente
