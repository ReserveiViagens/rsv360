# 🧪 Guia de Teste - Problema Webpack

**Data:** 07/12/2025  
**Status:** ⏳ **AGUARDANDO TESTE MANUAL**

---

## 📋 Instruções de Teste

### 1. Verificar Servidor
```powershell
# Verificar se o servidor está rodando na porta 3000
netstat -ano | findstr ":3000"
```

### 2. Testar Página `/viagens-grupo`

1. **Abrir navegador:** `http://localhost:3000/viagens-grupo`
2. **Abrir DevTools:** `F12` ou `Ctrl+Shift+I`
3. **Verificar Console:**
   - Procurar por erros vermelhos
   - Especificamente: `TypeError: Cannot read properties of undefined (reading 'call')`
   - Verificar se a página carrega completamente

4. **Testar Funcionalidades:**
   - Clicar nas tabs (Wishlists, Divisão de Pagamento, Convites, Chat)
   - Verificar se os componentes carregam
   - Verificar se há erros ao interagir

### 3. Testar Página `/fidelidade`

1. **Abrir navegador:** `http://localhost:3000/fidelidade`
2. **Abrir DevTools:** `F12` ou `Ctrl+Shift+I`
3. **Verificar Console:**
   - Procurar por erros vermelhos
   - Verificar se a página carrega completamente

4. **Testar Funcionalidades:**
   - Navegar pelas tabs
   - Verificar se os dados carregam
   - Testar resgate de recompensas

---

## 🔄 Se o Erro Persistir

### Opção 1: Testar Importação Direta

1. **Fazer backup da versão atual:**
   ```powershell
   cd "D:\servidor RSV\Hotel-com-melhor-preco-main\app\viagens-grupo"
   Rename-Item page.tsx page-dynamic.tsx.backup
   Rename-Item page-direct-import.tsx.backup page.tsx
   ```

2. **Reiniciar servidor:**
   ```powershell
   # Parar servidor atual
   Get-Process -Name node | Stop-Process -Force
   
   # Limpar cache
   Remove-Item -Recurse -Force .next
   
   # Iniciar servidor
   npm run dev
   ```

3. **Testar novamente** no navegador

### Opção 2: Verificar Compatibilidade Next.js

1. **Verificar versão instalada:**
   ```powershell
   npm list next
   ```

2. **Atualizar package.json:**
   - Se Next.js 15.2.4 estiver instalado, atualizar `package.json` para `"next": "^15.2.4"`
   - OU fazer downgrade para Next.js 14.x

3. **Reinstalar dependências:**
   ```powershell
   npm install
   ```

---

## 📊 Resultados Esperados

### ✅ Sucesso
- Página carrega sem erros no console
- Componentes renderizam corretamente
- Interações funcionam normalmente

### ❌ Erro Persiste
- Erro `Cannot read properties of undefined (reading 'call')` ainda aparece
- Página não carrega completamente
- Componentes não renderizam

---

## 📝 Checklist de Teste

- [ ] Servidor rodando na porta 3000
- [ ] Página `/viagens-grupo` acessível
- [ ] Console sem erros webpack
- [ ] Componentes carregam corretamente
- [ ] Tabs funcionam
- [ ] Página `/fidelidade` acessível
- [ ] Console sem erros webpack
- [ ] Funcionalidades funcionam

---

## 🔍 Informações para Debug

Se o erro persistir, coletar:

1. **Erro completo do console:**
   - Stack trace completo
   - Linha exata do erro
   - Arquivo onde ocorre

2. **Network tab:**
   - Verificar se chunks são carregados
   - Verificar se há 404 ou 500
   - Verificar tamanho dos bundles

3. **Sources tab:**
   - Verificar se o código está correto
   - Verificar se dynamic imports estão funcionando

---

**Última atualização:** 07/12/2025

