# 🚀 NAVEGAR PARA O PROJETO E EXECUTAR COMANDOS

**Problema:** Você está em `C:\WINDOWS\System32`  
**Solução:** Navegar para o diretório do projeto

---

## 📍 NAVEGAR PARA O PROJETO

### No PowerShell:

```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
```

**OU se estiver em outro terminal:**

```cmd
cd /d "D:\servidor RSV\Hotel-com-melhor-preco-main"
```

---

## ✅ VERIFICAR SE ESTÁ NO LUGAR CERTO

```powershell
# Verificar diretório atual
pwd

# Deve mostrar:
# D:\servidor RSV\Hotel-com-melhor-preco-main

# Verificar se package.json existe
Test-Path package.json
# Deve retornar: True
```

---

## 🚀 EXECUTAR COMANDOS

Após navegar para o projeto:

```powershell
# 1. Validar variáveis de ambiente
npm run validate:env

# 2. Executar setup completo
npm run setup
```

---

## 📝 COMANDOS COMPLETOS (COPIE E COLE)

```powershell
# Navegar para o projeto
cd "D:\servidor RSV\Hotel-com-melhor-preco-main"

# Verificar se está no lugar certo
pwd

# Executar validação
npm run validate:env

# Executar setup
npm run setup
```

---

## 🎯 ATALHO RÁPIDO

Crie um atalho no PowerShell:

```powershell
# Adicionar ao perfil do PowerShell (opcional)
function go-rsv {
    cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
}

# Depois, basta digitar:
go-rsv
```

---

**Última atualização:** 2025-12-13

