# 🚀 COMANDOS RÁPIDOS - RSV360 Modular Monolith

**Diretório Correto:** `D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial`

---

## 📍 NAVEGAR PARA O DIRETÓRIO CORRETO

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
```

---

## 🚀 INICIAR SERVIDORES

### **Todos os Serviços:**
```powershell
npm run dev
```

### **Serviços Individuais:**

**Dashboard de Turismo (porta 3005):**
```powershell
npm run dev:turismo
```

**Backend API (porta 5000):**
```powershell
npm run dev:backend
```

**Site Público (porta 3000):**
```powershell
npm run dev:site
```

### **Microserviços (32 serviços - portas 6000-6031):**

**Iniciar todos os microserviços:**
```powershell
npm run dev:microservices
# ou
.\INICIAR_MICROSERVICES.ps1
```

**Verificar status dos microserviços:**
```powershell
.\VERIFICAR_MICROSERVICES.ps1
```

---

## 📋 OUTROS COMANDOS ÚTEIS

### **Build:**
```powershell
npm run build
npm run build:turismo
```

### **Banco de Dados:**
```powershell
npm run migrate
.\scripts\EXECUTAR_MIGRATIONS_SQL.ps1
```

### **Scripts PowerShell:**
```powershell
.\INICIAR_SERVIDORES.ps1
.\INICIAR_MICROSERVICES.ps1
.\VERIFICAR_MICROSERVICES.ps1
.\scripts\CONFIGURAR_BANCO_DADOS.ps1
```

---

## 🌐 URLs DE ACESSO

### **Servidores Principais:**
- **Dashboard:** http://localhost:3005/dashboard
- **Módulos:** http://localhost:3005/dashboard/modulos-turismo
- **Backend API:** http://localhost:5000
- **Site Público:** http://localhost:3000/

### **Microserviços (Health Checks):**
- **Core API:** http://localhost:6000/health
- **User Management:** http://localhost:6001/health
- **Hotel Management:** http://localhost:6002/health
- **Booking Engine:** http://localhost:6004/health
- **Payments Gateway:** http://localhost:6007/health
- **Analytics API:** http://localhost:6024/health
- **Todos os microserviços:** http://localhost:6000/health até http://localhost:6031/health

---

## ⚠️ IMPORTANTE

Certifique-se de estar no diretório correto:
- ✅ **CORRETO:** `RSV360 Versao Oficial`
- ❌ **ERRADO:** `rsv360-servidor-oficial` (servidor antigo)

---

**Última Atualização:** 2025-12-31

