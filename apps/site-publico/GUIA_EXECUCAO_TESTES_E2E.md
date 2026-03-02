# 🚀 GUIA DE EXECUÇÃO DE TESTES E2E

**Data:** 2025-12-16

---

## 📋 PRÉ-REQUISITOS

1. Node.js instalado (versão 18+)
2. Dependências instaladas (`npm install`)
3. Banco de dados configurado e rodando
4. Variáveis de ambiente configuradas (`.env`)

---

## 🎯 EXECUTAR TESTES E2E

### Opção 1: Execução Manual (Recomendado)

#### Passo 1: Iniciar Servidor
```bash
# Terminal 1
npm run dev
```

Aguarde até ver:
```
✓ Ready in Xs
○ Local: http://localhost:3000
```

#### Passo 2: Executar Testes E2E
```bash
# Terminal 2 (novo terminal)
npx playwright test
```

Ou para testes específicos:
```bash
npx playwright test tests/e2e/wishlist-flow.spec.ts
npx playwright test tests/e2e/trip-planning-flow.spec.ts
```

### Opção 2: Execução Automática

O Playwright pode iniciar o servidor automaticamente:

```bash
npx playwright test
```

**Nota:** Se a porta 3000 estiver em uso, o Playwright tentará a porta 3001.

---

## 📊 VER RESULTADOS

### Relatório HTML
```bash
npx playwright show-report
```

### Relatório no Terminal
```bash
npx playwright test --reporter=list
```

### Modo UI (Interativo)
```bash
npx playwright test --ui
```

---

## 🔧 CONFIGURAÇÃO

### Arquivo: `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

## ⚠️ PROBLEMAS COMUNS

### 1. Porta em Uso
**Erro:** `Port 3000 is in use`

**Solução:**
```bash
# Encontrar processo usando porta 3000
netstat -ano | findstr :3000

# Matar processo (substituir PID)
taskkill /PID <PID> /F

# Ou usar porta diferente
PORT=3001 npm run dev
```

### 2. Timeout do Servidor
**Erro:** `Timed out waiting 120000ms`

**Solução:**
- Verificar se o servidor está iniciando corretamente
- Aumentar timeout no `playwright.config.ts`
- Verificar logs do servidor

### 3. Testes Falhando
**Solução:**
- Verificar se o servidor está rodando
- Verificar se o banco de dados está configurado
- Verificar variáveis de ambiente
- Executar testes em modo debug: `npx playwright test --debug`

---

## ✅ CHECKLIST

- [ ] Servidor iniciado (`npm run dev`)
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Playwright instalado (`npx playwright install`)
- [ ] Testes executados (`npx playwright test`)

---

## 📚 COMANDOS ÚTEIS

```bash
# Instalar navegadores do Playwright
npx playwright install

# Executar testes em modo debug
npx playwright test --debug

# Executar testes em modo UI
npx playwright test --ui

# Executar testes específicos
npx playwright test tests/e2e/wishlist-flow.spec.ts

# Ver relatório HTML
npx playwright show-report

# Executar testes em modo headed (ver navegador)
npx playwright test --headed
```

---

**Última atualização:** 2025-12-16

