# 📚 GUIA RÁPIDO - SCRIPTS DE MICROSERVIÇOS

**Data:** 2026-01-02  
**Status:** ✅ Scripts Completos e Funcionais

---

## 🎯 SCRIPTS DISPONÍVEIS

### 1. **INSTALAR_DEPENDENCIAS_MICROSERVICES.ps1**
Instala as dependências de todos os 32 microserviços.

**Uso:**
```powershell
.\INSTALAR_DEPENDENCIAS_MICROSERVICES.ps1
```

**O que faz:**
- Navega para cada microserviço em `backend/microservices/`
- Executa `npm install` em cada um
- Mostra estatísticas de instalação (sucessos/falhas)

---

### 2. **INICIAR_MICROSERVICES.ps1**
Inicia todos os 32 microserviços em janelas separadas do PowerShell.

**Uso:**
```powershell
# Iniciar todos os microserviços
.\INICIAR_MICROSERVICES.ps1
```

**O que faz:**
- Inicia cada microserviço em uma janela separada (minimizada)
- Usa as portas 6000-6031
- Mostra estatísticas de inicialização

**Observação:** Os microserviços são iniciados em janelas minimizadas. Você pode restaurá-las para ver os logs.

---

### 3. **VERIFICAR_MICROSERVICES.ps1**
Verifica o status de todos os microserviços através de health checks.

**Uso:**
```powershell
# Verificação básica
.\VERIFICAR_MICROSERVICES.ps1

# Verificação detalhada (mostra PIDs e listas)
.\VERIFICAR_MICROSERVICES.ps1 -Detalhado
```

**O que faz:**
- Verifica cada microserviço através do endpoint `/health`
- Verifica se as portas estão em uso
- Mostra estatísticas (online/offline)
- Com `-Detalhado`: mostra PIDs dos processos e listas de serviços online/offline

---

### 4. **PARAR_MICROSERVICES.ps1**
Para microserviços (todos, individual ou por porta).

**Uso:**
```powershell
# Parar todos os microserviços
.\PARAR_MICROSERVICES.ps1

# Parar um microserviço específico
.\PARAR_MICROSERVICES.ps1 -Microservico "core-api"

# Parar por porta
.\PARAR_MICROSERVICES.ps1 -Porta 6000
```

**O que faz:**
- Encontra processos usando as portas dos microserviços
- Para os processos forçadamente
- Mostra estatísticas (parados/não encontrados)

---

## 🔄 FLUXO DE TRABALHO RECOMENDADO

### **Primeira Vez (Instalação):**
```powershell
# 1. Instalar dependências
.\INSTALAR_DEPENDENCIAS_MICROSERVICES.ps1

# 2. Iniciar microserviços
.\INICIAR_MICROSERVICES.ps1

# 3. Aguardar alguns segundos e verificar
Start-Sleep -Seconds 5
.\VERIFICAR_MICROSERVICES.ps1 -Detalhado
```

### **Uso Diário:**
```powershell
# Iniciar
.\INICIAR_MICROSERVICES.ps1

# Verificar status
.\VERIFICAR_MICROSERVICES.ps1

# Parar quando necessário
.\PARAR_MICROSERVICES.ps1
```

---

## 📊 PORTAS DOS MICROSERVIÇOS

| Microserviço | Porta | Health Check |
|--------------|-------|--------------|
| core-api | 6000 | http://localhost:6000/health |
| user-management | 6001 | http://localhost:6001/health |
| hotel-management | 6002 | http://localhost:6002/health |
| travel-api | 6003 | http://localhost:6003/health |
| booking-engine | 6004 | http://localhost:6004/health |
| finance-api | 6005 | http://localhost:6005/health |
| tickets-api | 6006 | http://localhost:6006/health |
| payments-gateway | 6007 | http://localhost:6007/health |
| ecommerce-api | 6008 | http://localhost:6008/health |
| attractions-api | 6009 | http://localhost:6009/health |
| vouchers-api | 6010 | http://localhost:6010/health |
| voucher-editor | 6011 | http://localhost:6011/health |
| giftcards-api | 6012 | http://localhost:6012/health |
| coupons-api | 6013 | http://localhost:6013/health |
| parks-api | 6014 | http://localhost:6014/health |
| maps-api | 6015 | http://localhost:6015/health |
| visa-processing | 6016 | http://localhost:6016/health |
| marketing-api | 6017 | http://localhost:6017/health |
| subscriptions | 6018 | http://localhost:6018/health |
| seo-api | 6019 | http://localhost:6019/health |
| multilingual | 6020 | http://localhost:6020/health |
| videos-api | 6021 | http://localhost:6021/health |
| photos-api | 6022 | http://localhost:6022/health |
| admin-panel | 6023 | http://localhost:6023/health |
| analytics-api | 6024 | http://localhost:6024/health |
| reports-api | 6025 | http://localhost:6025/health |
| data-management | 6026 | http://localhost:6026/health |
| notifications | 6027 | http://localhost:6027/health |
| reviews-api | 6028 | http://localhost:6028/health |
| rewards-api | 6029 | http://localhost:6029/health |
| loyalty-api | 6030 | http://localhost:6030/health |
| sales-api | 6031 | http://localhost:6031/health |

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

1. **Recursos do Sistema:** Iniciar todos os 32 microserviços simultaneamente pode consumir muitos recursos. Considere iniciar apenas os necessários para desenvolvimento.

2. **Tempo de Inicialização:** Alguns microserviços podem precisar de alguns segundos para iniciar completamente. Aguarde alguns segundos antes de verificar o status.

3. **Janelas Minimizadas:** Os microserviços são iniciados em janelas minimizadas. Você pode restaurá-las para ver os logs e erros.

4. **Portas em Uso:** Se uma porta estiver em uso, o script de verificação mostrará isso. Use o script de parar para liberar as portas.

5. **Dependências:** Certifique-se de que as dependências estão instaladas antes de iniciar os microserviços.

---

## 🔍 TROUBLESHOOTING

### **Microserviço não inicia:**
1. Verifique se as dependências estão instaladas
2. Verifique se a porta está livre
3. Verifique os logs na janela do PowerShell do microserviço

### **Health check não responde:**
1. Aguarde alguns segundos (pode estar ainda inicializando)
2. Verifique se a porta está em uso: `Get-NetTCPConnection -LocalPort 6000`
3. Verifique os logs do microserviço

### **Porta já em uso:**
1. Use `.\PARAR_MICROSERVICES.ps1` para parar todos
2. Ou pare o processo específico: `.\PARAR_MICROSERVICES.ps1 -Porta 6000`

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `STATUS_MICROSERVICES.md` - Documentação completa dos microserviços
- `ONDE_PARAMOS.md` - Resumo do status atual do projeto
- `COMANDOS_RAPIDOS.md` - Comandos rápidos do sistema

---

**Última Atualização:** 2026-01-02

