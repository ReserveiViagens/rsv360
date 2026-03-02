# 🔧 Correção: Múltiplas Instâncias do React

**Data:** 2025-01-05

---

## ❌ Problema

**Erro:**
```
Invalid hook call. Hooks can only be called inside of the body of a function component.
Cannot read properties of null (reading 'useContext')
```

**Causa:**
- Conflito de versões do React no monorepo
- Root `package.json`: React 18.3.1
- `apps/turismo/package.json`: React 19.2.3
- Múltiplas instâncias do React sendo carregadas

---

## ✅ Soluções Aplicadas

### 1. Atualizado `next.config.js`

**Mudanças:**
- ✅ Forçar uso do React local (não do root)
- ✅ Configurar webpack para usar apenas React local
- ✅ Adicionar fallback para evitar múltiplas instâncias
- ✅ Configurar modules para priorizar node_modules local

### 2. Criado `.npmrc`

**Conteúdo:**
```
shamefully-hoist=false
strict-peer-dependencies=false
```

Isso garante que o React seja instalado localmente, não hoisted.

---

## 🔄 Próximos Passos

### Opção 1: Reinstalar Dependências (Recomendado)

```powershell
cd apps\turismo
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
```

### Opção 2: Forçar Reinstalação

```powershell
cd apps\turismo
npm install --force
```

### Opção 3: Limpar e Reinstalar Tudo

```powershell
# Na raiz do projeto
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\turismo\node_modules -ErrorAction SilentlyContinue
npm install
```

---

## ✅ Verificação

Após reinstalar, verifique:

```powershell
cd apps\turismo
npm list react react-dom
```

**Deve mostrar:**
```
react@19.2.3
react-dom@19.2.3
```

---

## 🚀 Reiniciar Frontend

Após reinstalar:

```powershell
cd apps\turismo
npm run dev
```

---

## 📋 Checklist

- [x] `next.config.js` atualizado
- [x] `.npmrc` criado
- [ ] Dependências reinstaladas
- [ ] Frontend reiniciado
- [ ] Erro resolvido

---

## 🔍 Se o Problema Persistir

1. **Verificar versões:**
   ```powershell
   cd apps\turismo
   npm list react react-dom
   ```

2. **Verificar node_modules:**
   ```powershell
   # Deve existir
   Test-Path apps\turismo\node_modules\react
   Test-Path apps\turismo\node_modules\react-dom
   ```

3. **Limpar cache do Next.js:**
   ```powershell
   cd apps\turismo
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   npm run dev
   ```

4. **Verificar webpack aliases:**
   - Abrir DevTools (F12)
   - Verificar se há erros de múltiplas instâncias
   - Verificar console para mensagens de React

---

**Nota:** O problema é causado pelo hoisting do npm workspaces. A solução força o uso do React local, evitando conflitos.

