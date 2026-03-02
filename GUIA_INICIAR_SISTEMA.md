# 🚀 Guia: Iniciar Sistema Completo RSV360 (Workspaces)

**Data:** 2025-01-05

---

## 📋 Visão Geral

O script `Iniciar Sistema Completo (Workspaces).ps1` é uma ferramenta completa para iniciar todos os serviços do sistema RSV360 usando NPM Workspaces, aproveitando dependências compartilhadas e versões consistentes.

---

## 🚀 Como Usar

### Uso Básico

```powershell
.\Iniciar Sistema Completo (Workspaces).ps1
```

Inicia todos os serviços automaticamente:
- 32 Microserviços (portas 6000-6031)
- Dashboard Turismo (porta 3005)
- Site Público (porta 3000)

---

### Ver Ajuda

```powershell
.\Iniciar Sistema Completo (Workspaces).ps1 -Ajuda
```

Exibe informações de uso e vantagens do sistema de workspaces.

---

## ⚙️ O que o Script Faz

### 1. Inicia Microserviços (Independentes)

**32 Microserviços nas portas 6000-6031:**

- `core-api` (6000)
- `user-management` (6001)
- `hotel-management` (6002)
- `travel-api` (6003)
- `booking-engine` (6004)
- `finance-api` (6005)
- `tickets-api` (6006)
- `payments-gateway` (6007)
- `ecommerce-api` (6008)
- `attractions-api` (6009)
- `vouchers-api` (6010)
- `voucher-editor` (6011)
- `giftcards-api` (6012)
- `coupons-api` (6013)
- `parks-api` (6014)
- `maps-api` (6015)
- `visa-processing` (6016)
- `marketing-api` (6017)
- `subscriptions` (6018)
- `seo-api` (6019)
- `multilingual` (6020)
- `videos-api` (6021)
- `photos-api` (6022)
- `admin-panel` (6023)
- `analytics-api` (6024)
- `reports-api` (6025)
- `data-management` (6026)
- `notifications` (6027)
- `reviews-api` (6028)
- `rewards-api` (6029)
- `loyalty-api` (6030)
- `sales-api` (6031)

**Características:**
- Cada microserviço é iniciado em uma janela PowerShell minimizada
- Executa `npm start` no diretório do microserviço
- Aguarda 300ms entre cada inicialização
- Conta quantos foram iniciados com sucesso

---

### 2. Inicia Dashboard Turismo (NPM Workspace)

**Workspace:** `apps/turismo`
**Porta:** 3005

**Comando usado:**
```powershell
npm run dev --workspace=apps/turismo
```

**Características:**
- Usa dependências compartilhadas do root
- Versões consistentes via `overrides` no `package.json`
- Inicia em uma janela PowerShell normal (não minimizada)
- Mostra logs em tempo real

---

### 3. Inicia Site Público (NPM Workspace)

**Workspace:** `apps/site-publico`
**Porta:** 3000

**Comando usado:**
```powershell
npm run dev --workspace=apps/site-publico
```

**Características:**
- Usa dependências compartilhadas do root
- Versões consistentes via `overrides` no `package.json`
- Inicia em uma janela PowerShell normal (não minimizada)
- Mostra logs em tempo real

---

## 📊 Saída do Script

### Durante a Execução

```
========================================
INICIANDO SISTEMA COMPLETO RSV360
(Usando NPM Workspaces)
========================================

1. Iniciando Microserviços (32 serviços - Independentes)...
  [OK] 32 microserviços iniciados

2. Iniciando Dashboard Turismo (porta 3005)...
   [INFO] Usando workspace: apps/turismo
  [OK] Dashboard Turismo iniciado

3. Iniciando Site Público (porta 3000)...
   [INFO] Usando workspace: apps/site-publico
  [OK] Site Público iniciado

========================================
[OK] SISTEMA COMPLETO INICIADO!
========================================

URLs de acesso:
  Dashboard Turismo: http://localhost:3005/dashboard
  Site Público: http://localhost:3000
  Microserviços: http://localhost:6000/health até http://localhost:6031/health

[INFO] Aguarde alguns minutos para a compilação do Next.js.
[INFO] Workspaces usando dependências compartilhadas do root.
Verifique as janelas do PowerShell para ver os logs.
```

---

## ✅ Vantagens do Sistema de Workspaces

### 1. Dependências Compartilhadas
- Dependências instaladas no root são compartilhadas
- Reduz espaço em disco
- Instalação mais rápida

### 2. Versões Consistentes
- `overrides` no `package.json` garante versões consistentes
- Evita conflitos de versão
- React 19.2.3 garantido em todos os workspaces

### 3. Comandos Mais Eficientes
- Comando único: `npm run dev --workspace=apps/turismo`
- Não precisa navegar até o diretório
- Execução a partir do root

### 4. Gerenciamento Centralizado
- Scripts no `package.json` do root
- Fácil manutenção
- Padronização de comandos

---

## 🔍 Verificações

### Verificar se os Serviços Iniciaram

Após executar o script, você pode verificar:

```powershell
# Verificar portas em uso
Get-NetTCPConnection -LocalPort 3000,3005,6000-6031 -ErrorAction SilentlyContinue

# Verificar processos Node.js
Get-Process node -ErrorAction SilentlyContinue | Measure-Object | Select-Object Count
```

**Resultado esperado:**
- Porta 3000: Site Público rodando
- Porta 3005: Dashboard Turismo rodando
- Portas 6000-6031: Microserviços rodando
- ~34 processos Node.js (32 microserviços + 2 apps)

---

### Verificar Logs

**Microserviços:**
- Janelas PowerShell minimizadas
- Cada uma mostra logs do microserviço correspondente

**Dashboard Turismo:**
- Janela PowerShell normal
- Mostra logs do Next.js
- Procure por: "Ready on http://localhost:3005"

**Site Público:**
- Janela PowerShell normal
- Mostra logs do Next.js
- Procure por: "Ready on http://localhost:3000"

---

## ⚠️ Avisos Importantes

### 1. Tempo de Compilação

- **Next.js:** Pode levar 30-60 segundos para compilar na primeira vez
- **Microserviços:** Geralmente iniciam em 5-10 segundos
- **Aguarde** até ver "Ready" nos logs antes de acessar

### 2. Portas em Uso

- Se uma porta já estiver em uso, o serviço não iniciará
- Use `.\Parar Sistema Completo.ps1` antes de iniciar novamente
- Ou use `.\scripts\liberar-portas.ps1` para liberar portas específicas

### 3. Dependências

- Certifique-se de que `npm install` foi executado no root
- Workspaces dependem de dependências instaladas no root
- Se houver erros, execute: `npm install` no root

### 4. Janelas do PowerShell

- **Microserviços:** Janelas minimizadas (32 janelas)
- **Apps:** Janelas normais (2 janelas)
- **Total:** 34 janelas PowerShell abertas

---

## 🐛 Solução de Problemas

### Problema: Microserviço não inicia

**Solução:**
```powershell
# Verificar se o diretório existe
Test-Path "backend\microservices\[nome-do-microserviço]"

# Verificar se tem package.json
Test-Path "backend\microservices\[nome-do-microserviço]\package.json"

# Verificar se tem script "start"
Get-Content "backend\microservices\[nome-do-microserviço]\package.json" | Select-String "start"
```

### Problema: Workspace não inicia

**Solução:**
```powershell
# Verificar se o workspace existe
Test-Path "apps\turismo"
Test-Path "apps\site-publico"

# Verificar package.json do root
Get-Content "package.json" | Select-String "workspaces"

# Reinstalar dependências
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
npm install
```

### Problema: Porta já em uso

**Solução:**
```powershell
# Parar sistema completo
.\Parar Sistema Completo.ps1 -Forcar

# Ou liberar porta específica
.\scripts\liberar-portas.ps1
```

### Problema: Erro de dependências

**Solução:**
```powershell
# Limpar e reinstalar
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
```

---

## 📝 Exemplos de Uso

### Exemplo 1: Iniciar Sistema Completo

```powershell
PS> .\Iniciar Sistema Completo (Workspaces).ps1

[Script inicia todos os serviços]
```

### Exemplo 2: Ver Ajuda

```powershell
PS> .\Iniciar Sistema Completo (Workspaces).ps1 -Ajuda

[Exibe informações de uso]
```

---

## 🔗 Scripts Relacionados

- **`Parar Sistema Completo.ps1`** - Para todos os serviços
- **`Reiniciar Sistema Completo.ps1`** - Reinicia todos os serviços
- **`scripts/liberar-portas.ps1`** - Libera portas específicas

---

## 📌 Notas Técnicas

### Estrutura de Workspaces

```
RSV360 Versao Oficial/
├── package.json (root - define workspaces)
│   └── workspaces: ["apps/*", "packages/*", "backend"]
├── apps/
│   ├── turismo/ (workspace)
│   └── site-publico/ (workspace)
└── backend/
    └── microservices/ (não são workspaces)
```

### Comandos NPM Workspace

```powershell
# Executar comando em workspace específico
npm run dev --workspace=apps/turismo

# Executar comando em todos os workspaces
npm run dev --workspaces

# Executar comando apenas em workspaces que têm o script
npm run dev --workspaces --if-present
```

### Portas Utilizadas

- **3000:** Site Público
- **3005:** Dashboard Turismo
- **6000-6031:** Microserviços (32 portas)

---

## ✅ Checklist de Uso

- [ ] Verificar se as portas estão livres
- [ ] Executar `npm install` no root (se necessário)
- [ ] Executar o script
- [ ] Aguardar compilação do Next.js (30-60 segundos)
- [ ] Verificar logs nas janelas PowerShell
- [ ] Acessar URLs para confirmar funcionamento

---

## 🎯 URLs de Acesso

Após iniciar, acesse:

- **Dashboard Turismo:** http://localhost:3005/dashboard
- **Site Público:** http://localhost:3000
- **Microserviços Health:** 
  - http://localhost:6000/health
  - http://localhost:6001/health
  - ... até http://localhost:6031/health

---

**Última atualização:** 2025-01-05

