# 🧪 GUIA DE TESTE - CMS ADMIN

**Data:** 2025-12-02  
**Status:** ✅ Migração Completa - Pronto para Teste

---

## 🔐 CREDENCIAIS DE LOGIN

### Informações de Acesso:
- **URL de Login:** `http://localhost:3000/admin/login?from=/admin/cms`
- **Senha:** `admin-token-123`
- **Método:** Cookie-based authentication

---

## 📋 CHECKLIST DE TESTE

### 1. ✅ Teste de Login
- [ ] Acessar `http://localhost:3000/admin/cms`
- [ ] Ser redirecionado para `/admin/login`
- [ ] Inserir senha: `admin-token-123`
- [ ] Clicar em "Entrar"
- [ ] Ser redirecionado para `/admin/cms`
- [ ] Verificar se não há erros no console

### 2. ✅ Teste de Abas do CMS
- [ ] **Aba Hotéis** - Verificar se carrega sem erros
- [ ] **Aba Promoções** - Verificar se carrega sem erros
- [ ] **Aba Atrações** - Verificar se carrega sem erros
- [ ] **Aba Ingressos** - Verificar se carrega sem erros
- [ ] **Aba Header** - Verificar se carrega sem erros
- [ ] **Aba Site** - Verificar se carrega sem erros

### 3. ✅ Teste de Funcionalidades
- [ ] Botão "Atualizar" funciona
- [ ] Botão "Perfil" funciona
- [ ] Botão "Configurações" abre dialog
- [ ] Botão "Sair" faz logout
- [ ] Estatísticas são exibidas corretamente

### 4. ✅ Teste de Console
- [ ] Abrir DevTools (F12)
- [ ] Verificar Console - não deve haver erros
- [ ] Verificar Network - requisições devem funcionar
- [ ] Verificar se não há ChunkLoadError

---

## 🔍 PROBLEMAS CONHECIDOS E SOLUÇÕES

### Problema 1: Erro de Webpack
**Sintoma:** `Cannot read properties of undefined (reading 'call')`  
**Status:** ✅ Resolvido - Todos os componentes migrados

### Problema 2: ChunkLoadError
**Sintoma:** `ChunkLoadError: Loading chunk vendors... failed`  
**Status:** ✅ Resolvido - Barrel file + webpack config

### Problema 3: Erro de Imagem
**Sintoma:** `hostname is not configured under images`  
**Status:** ✅ Resolvido - remotePatterns configurado

---

## 🚨 SE ENCONTRAR ERROS

### 1. Limpar Cache do Navegador
```
F12 → Clique direito no recarregar → "Esvaziar cache e atualizar forçadamente"
OU
Ctrl + Shift + N (modo anônimo)
```

### 2. Verificar Servidor
- Deve mostrar: `✓ Ready in X.Xs`
- Não deve haver erros de compilação
- Porta 3000 deve estar em uso

### 3. Verificar Console
- Abrir DevTools (F12)
- Verificar aba Console
- Copiar erros e enviar para análise

---

## 📊 RESULTADO ESPERADO

Após todas as correções:
- ✅ Login funciona corretamente
- ✅ CMS carrega sem erros
- ✅ Todas as abas funcionam
- ✅ Sem erros no console
- ✅ Sem ChunkLoadError
- ✅ Todos os ícones carregam

---

**Status:** ✅ Pronto para Teste Completo

**Próximo Passo:** Teste o login e todas as funcionalidades do CMS

