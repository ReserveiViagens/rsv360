# 📦 ESTRUTURA DO PROJETO - NPM WORKSPACES (MONOREPO)

**Data:** 2026-01-02  
**Tipo:** ✅ **NPM Workspaces (Monorepo)**  
**Status:** Configurado e Funcionando

---

## 🎯 RESUMO EXECUTIVO

### **Tipo de Projeto:**
- ✅ **NPM Workspaces** (Monorepo)
- ❌ **NÃO** é npm puro (projeto único)
- ❌ **NÃO** usa pnpm (apesar de ter `pnpm-workspace.yaml`, não está sendo usado)
- ❌ **NÃO** usa yarn

### **Estrutura:**
```
RSV360 Versao Oficial/
├── package.json (ROOT - configura workspaces)
├── package-lock.json (NPM lock file)
├── node_modules/ (dependências compartilhadas)
│
├── apps/ (Workspaces de aplicações)
│   ├── site-publico/ (porta 3000)
│   ├── turismo/ (porta 3005)
│   ├── guest/
│   ├── admin/
│   └── atendimento-ia/
│
├── backend/ (Workspace do backend)
│   └── microservices/ (32 microserviços)
│
└── packages/ (Workspaces de pacotes compartilhados)
    ├── shared/
    └── ui/
```

---

## 📋 CONFIGURAÇÃO DO ROOT (package.json)

```json
{
  "name": "rsv360-modular-monolith",
  "workspaces": [
    "apps/*",
    "packages/*",
    "backend"
  ],
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "overrides": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

### **Workspaces Configurados:**
1. **`apps/*`** - Todas as aplicações frontend
2. **`packages/*`** - Pacotes compartilhados
3. **`backend`** - Backend principal

---

## 🔧 COMANDOS NPM WORKSPACES

### **1. Executar comando em workspace específico:**

```powershell
# Sintaxe geral
npm run <comando> --workspace=<nome-do-workspace>

# Exemplos:
npm run dev --workspace=apps/site-publico
npm run dev --workspace=apps/turismo
npm run build --workspace=backend
```

### **2. Executar comando em todos os workspaces:**

```powershell
# Executar em todos os workspaces que têm o script
npm run <comando> --workspaces --if-present

# Exemplos:
npm run build --workspaces --if-present
npm run lint --workspaces --if-present
npm run test --workspaces --if-present
```

### **3. Instalar dependências:**

```powershell
# Instalar dependências do root e todos os workspaces
npm install

# Instalar dependência em workspace específico
npm install <pacote> --workspace=apps/site-publico

# Instalar dependência no root (compartilhada)
npm install <pacote> -w
```

---

## 📝 SCRIPTS DISPONÍVEIS NO ROOT

### **Scripts de Desenvolvimento:**
```powershell
# Iniciar tudo (backend + apps)
npm run dev

# Iniciar apenas backend
npm run dev:backend

# Iniciar apenas apps frontend
npm run dev:apps

# Iniciar workspace específico
npm run dev:turismo      # apps/turismo
npm run dev:site          # apps/site-publico
npm run dev:guest         # apps/guest
npm run dev:admin         # apps/admin
npm run dev:atendimento   # apps/atendimento-ia

# Iniciar microserviços (via PowerShell)
npm run dev:microservices
```

### **Scripts de Build:**
```powershell
# Build de todos os workspaces
npm run build

# Build de workspace específico
npm run build:turismo
npm run build:site
npm run build:backend
```

### **Scripts de Migração:**
```powershell
# Executar migrações do backend
npm run migrate
npm run migrate:new
npm run migrate:rollback
npm run seed
```

---

## 🎯 COMO OS SCRIPTS ATUAIS FUNCIONAM

### **Script: `Iniciar Sistema Completo.ps1`**

**Problema Atual:**
- ❌ Usa `npm start` e `npm run dev` diretamente nos diretórios
- ❌ **NÃO** usa workspaces do npm
- ❌ Cada workspace é tratado como projeto independente

**Como funciona atualmente:**
```powershell
# Microserviços (cada um é independente)
cd 'backend\microservices\core-api'
npm start

# Dashboard Turismo
cd 'apps\turismo'
npm run dev

# Site Público
cd 'apps\site-publico'
npm run dev
```

**Como DEVERIA funcionar (usando workspaces):**
```powershell
# Do root, usando workspaces
npm run dev --workspace=apps/turismo
npm run dev --workspace=apps/site-publico

# Microserviços continuam independentes (não são workspaces)
cd 'backend\microservices\core-api'
npm start
```

---

## ✅ AJUSTES RECOMENDADOS NOS SCRIPTS

### **1. Ajustar `Iniciar Sistema Completo.ps1`:**

**ANTES (atual):**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath\apps\turismo'; npm run dev"
```

**DEPOIS (usando workspaces):**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$RootPath'; npm run dev --workspace=apps/turismo"
```

### **2. Vantagens de usar workspaces:**

✅ **Dependências compartilhadas** são instaladas uma vez no root  
✅ **Versões consistentes** via overrides no root  
✅ **Comandos mais simples** do root  
✅ **Melhor gerenciamento** de dependências

### **3. Microserviços:**

⚠️ **Os microserviços NÃO são workspaces** - cada um é independente  
✅ **Mantém-se como está** - `cd` para o diretório e `npm start`

---

## 🔍 VERIFICAÇÕES

### **1. Verificar workspaces configurados:**
```powershell
npm ls --workspaces --depth=0
```

### **2. Verificar dependências compartilhadas:**
```powershell
npm ls react react-dom
```

### **3. Verificar estrutura:**
```powershell
# Ver workspaces
npm query "workspaces" --json

# Ver scripts disponíveis
npm run --workspaces --if-present
```

---

## 📊 COMPARAÇÃO: NPM PURO vs NPM WORKSPACES

| Aspecto | NPM Puro | NPM Workspaces (Atual) |
|---------|----------|------------------------|
| **Estrutura** | Projeto único | Múltiplos projetos |
| **Dependências** | Instaladas localmente | Compartilhadas no root |
| **Comandos** | `npm run dev` | `npm run dev --workspace=apps/...` |
| **Lock file** | `package-lock.json` único | `package-lock.json` único (root) |
| **node_modules** | Local | Root + locais (se necessário) |

---

## 🚀 COMANDOS CORRETOS PARA USAR

### **Do Root (Recomendado):**
```powershell
# Iniciar Dashboard Turismo
npm run dev --workspace=apps/turismo

# Iniciar Site Público
npm run dev --workspace=apps/site-publico

# Iniciar Backend
npm run dev --workspace=backend

# Build de tudo
npm run build
```

### **Dentro do Workspace (Funciona, mas não recomendado):**
```powershell
cd apps/turismo
npm run dev  # Funciona, mas perde benefícios do workspace
```

### **Microserviços (Independentes):**
```powershell
cd backend/microservices/core-api
npm start  # Cada microserviço é independente
```

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

1. **Microserviços NÃO são workspaces:**
   - Cada microserviço em `backend/microservices/` é um projeto independente
   - Cada um tem seu próprio `package.json` e `node_modules`
   - Não são gerenciados pelo sistema de workspaces

2. **pnpm-workspace.yaml existe mas não é usado:**
   - O arquivo existe, mas o projeto usa NPM
   - Pode ser removido ou usado se migrar para pnpm no futuro

3. **Overrides no root:**
   - Força React 18.3.1 em todos os workspaces
   - Garante versões consistentes

---

## 📝 RECOMENDAÇÕES

### **1. Atualizar Scripts PowerShell:**
- Usar `npm run dev --workspace=...` em vez de `cd` + `npm run dev`
- Manter microserviços como estão (independentes)

### **2. Documentação:**
- Manter este documento atualizado
- Documentar novos workspaces adicionados

### **3. Migração Futura (Opcional):**
- Considerar migrar para pnpm (mais rápido e eficiente)
- O arquivo `pnpm-workspace.yaml` já existe

---

## ✅ CONCLUSÃO

**O projeto está usando:**
- ✅ **NPM Workspaces** (Monorepo)
- ✅ Estrutura configurada corretamente
- ✅ Overrides para versões consistentes

**Os scripts PowerShell atuais:**
- ⚠️ Funcionam, mas não aproveitam workspaces
- ✅ Podem ser melhorados para usar `--workspace=`

**Recomendação:**
- Manter estrutura atual (funciona bem)
- Opcionalmente atualizar scripts para usar workspaces explicitamente

---

**Última Atualização:** 2026-01-02  
**Status:** ✅ NPM Workspaces configurado e funcionando

