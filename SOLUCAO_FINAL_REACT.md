# 🔧 Solução Final: Múltiplas Instâncias do React

**Data:** 2025-01-05

---

## ❌ Problema Persistente

O erro continua mesmo após as correções anteriores:
```
Cannot read properties of null (reading 'useContext')
Invalid hook call
```

**Causa raiz:**
- `styled-jsx` (do Next.js) está usando React do root (18.3.1)
- App está usando React local (19.2.3)
- Conflito entre as duas instâncias

---

## ✅ Soluções Aplicadas

### 1. Atualizado `next.config.js`

**Mudanças:**
- ✅ Adicionado `NormalModuleReplacementPlugin` para forçar uso do React local
- ✅ Configurado para substituir todas as referências ao React
- ✅ Priorizado `node_modules` local sobre root

### 2. Atualizado `package.json` (root)

**Mudanças:**
- ✅ Removido React e React-DOM das dependências do root
- ✅ Atualizado `overrides` para usar React 19.2.3 (mesma versão do app)

---

## 🔄 Próximos Passos

### Opção 1: Limpar Cache e Reiniciar (Recomendado)

```powershell
# 1. Parar servidor frontend (Ctrl+C)

# 2. Limpar cache
cd apps\turismo
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3. Reiniciar
npm run dev
```

### Opção 2: Reinstalar Dependências do Root

Se a Opção 1 não funcionar:

```powershell
# Na raiz do projeto
npm install

# Depois limpar cache do frontend
cd apps\turismo
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

### Opção 3: Reinstalar Tudo

Se ainda não funcionar:

```powershell
# Na raiz
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install

# No app
cd apps\turismo
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm install
npm run dev
```

---

## 🔍 Verificações

### 1. Verificar Versões do React

```powershell
# Root
cd ..
npm list react react-dom

# App
cd apps\turismo
npm list react react-dom
```

**Esperado:**
- Root: Não deve ter React instalado (ou versão 19.2.3 via override)
- App: React 19.2.3

### 2. Verificar node_modules

```powershell
# Não deve existir React no root
Test-Path ..\node_modules\react

# Deve existir React no app
Test-Path node_modules\react
```

---

## 🎯 Solução Alternativa (Se Nada Funcionar)

Se o problema persistir, considere:

### 1. Usar React 18 no App (Compatível com Root)

```json
// apps/turismo/package.json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

Depois:
```powershell
cd apps\turismo
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
npm run dev
```

### 2. Usar React 19 no Root

```json
// package.json (root)
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  }
}
```

Depois:
```powershell
npm install
cd apps\turismo
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
npm run dev
```

---

## 📋 Checklist

- [x] `next.config.js` atualizado com `NormalModuleReplacementPlugin`
- [x] `package.json` root atualizado (React removido)
- [ ] Cache do Next.js limpo
- [ ] Frontend reiniciado
- [ ] Erro resolvido

---

## ⚠️ Nota Importante

O aviso `npm warn config ignoring workspace config at .../.npmrc` é normal em workspaces. O `.npmrc` local pode ser ignorado, mas o webpack config garante o uso correto do React.

---

## 🚀 Após Correção

Quando o erro for resolvido, você verá:
- ✅ Compilação sem erros
- ✅ Páginas carregando corretamente
- ✅ Sem avisos de "Invalid hook call"

---

**Última atualização:** 2025-01-05

