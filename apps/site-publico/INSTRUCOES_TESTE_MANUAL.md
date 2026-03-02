# 🧪 Instruções de Teste Manual - Problema Webpack

**Data:** 07/12/2025  
**Status:** ⏳ **AGUARDANDO TESTE MANUAL**

---

## 🎯 Objetivo

Verificar se o erro webpack `TypeError: Cannot read properties of undefined (reading 'call')` foi resolvido após aplicar a nova abordagem de dynamic imports.

---

## 📋 Passo a Passo

### 1️⃣ Preparação

1. **Verificar servidor rodando:**
   ```powershell
   netstat -ano | findstr ":3000"
   ```
   - Deve mostrar `LISTENING` na porta 3000

2. **Abrir navegador:**
   - Chrome, Edge ou Firefox
   - Abrir DevTools: `F12` ou `Ctrl+Shift+I`

---

### 2️⃣ Teste: Página `/viagens-grupo`

1. **Acessar:** `http://localhost:3000/viagens-grupo`

2. **Verificar Console (aba Console no DevTools):**
   - ✅ **SUCESSO:** Nenhum erro vermelho
   - ❌ **ERRO:** Verificar se aparece:
     ```
     TypeError: Cannot read properties of undefined (reading 'call')
     at webpack.js:712
     ```

3. **Verificar Página:**
   - ✅ **SUCESSO:** Página carrega completamente
   - ✅ **SUCESSO:** Título "Viagens em Grupo" visível
   - ✅ **SUCESSO:** 4 tabs visíveis (Wishlists, Divisão de Pagamento, Convites, Chat em Grupo)
   - ❌ **ERRO:** Página mostra erro ou tela em branco

4. **Testar Funcionalidades:**
   - Clicar na tab "Wishlists" → Deve mostrar conteúdo
   - Clicar na tab "Divisão de Pagamento" → Deve mostrar conteúdo
   - Clicar na tab "Convites" → Deve mostrar conteúdo
   - Clicar na tab "Chat em Grupo" → Deve mostrar conteúdo

5. **Registrar Resultado:**
   - [ ] ✅ Página carrega sem erros
   - [ ] ❌ Erro webpack presente
   - [ ] ⚠️ Página carrega mas com warnings

---

### 3️⃣ Teste: Página `/fidelidade`

1. **Acessar:** `http://localhost:3000/fidelidade`

2. **Verificar Console:**
   - ✅ **SUCESSO:** Nenhum erro vermelho
   - ❌ **ERRO:** Verificar se aparece o erro webpack

3. **Verificar Página:**
   - ✅ **SUCESSO:** Página carrega completamente
   - ✅ **SUCESSO:** Conteúdo de fidelidade visível
   - ❌ **ERRO:** Página mostra erro ou tela em branco

4. **Testar Funcionalidades:**
   - Navegar pelas tabs
   - Verificar se dados carregam
   - Testar interações

5. **Registrar Resultado:**
   - [ ] ✅ Página carrega sem erros
   - [ ] ❌ Erro webpack presente
   - [ ] ⚠️ Página carrega mas com warnings

---

## 🔄 Se o Erro Persistir

### Opção 1: Testar Importação Direta

1. **Fazer backup:**
   ```powershell
   cd "D:\servidor RSV\Hotel-com-melhor-preco-main\app\viagens-grupo"
   Rename-Item page.tsx page-dynamic.tsx.backup
   Rename-Item page-direct-import.tsx.backup page.tsx
   ```

2. **Limpar cache e reiniciar:**
   ```powershell
   cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
   Remove-Item -Recurse -Force .next
   # Parar servidor atual (Ctrl+C no terminal)
   npm run dev
   ```

3. **Testar novamente** no navegador

### Opção 2: Verificar Logs do Servidor

1. **Verificar terminal do servidor:**
   - Procurar por erros de compilação
   - Verificar se há warnings relacionados aos componentes

2. **Verificar Network tab no DevTools:**
   - Abrir aba "Network"
   - Recarregar página
   - Verificar se chunks são carregados
   - Verificar se há 404 ou 500

---

## 📊 Checklist de Teste

### Página `/viagens-grupo`
- [ ] Servidor rodando
- [ ] Página acessível
- [ ] Console sem erros webpack
- [ ] Página carrega completamente
- [ ] Tabs funcionam
- [ ] Componentes renderizam

### Página `/fidelidade`
- [ ] Página acessível
- [ ] Console sem erros webpack
- [ ] Página carrega completamente
- [ ] Funcionalidades funcionam

---

## 📝 Registrar Resultados

Preencher o arquivo `RESULTADO_TESTE_WEBPACK.md` com:
- Status de cada teste
- Erros encontrados (se houver)
- Screenshots (se possível)
- Observações

---

## 🆘 Problemas Comuns

### Página não carrega
- Verificar se servidor está rodando
- Verificar se porta 3000 está livre
- Limpar cache do navegador (Ctrl+Shift+Delete)

### Erro webpack persiste
- Tentar versão com importação direta
- Verificar compatibilidade Next.js
- Verificar configuração webpack

---

**Última atualização:** 07/12/2025

