# 🚀 Instruções de Reinício dos Serviços

**Data:** 2025-01-05

---

## ✅ Serviços Iniciados

Os serviços foram iniciados em janelas separadas do PowerShell.

### Backend
- **Janela:** PowerShell separada
- **URL:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **Status:** Verificar na janela do backend

### Frontend
- **Janela:** PowerShell separada
- **URL:** http://localhost:3005
- **Status:** Verificar na janela do frontend

---

## ⏳ Aguardar Inicialização

### Backend
- Geralmente inicia em 2-5 segundos
- Verifique a mensagem: `✅ Database connected successfully`
- Verifique a mensagem: `Server running on port 5000`

### Frontend
- Pode levar 30-60 segundos na primeira vez
- Você verá mensagens de compilação do Next.js
- Quando estiver pronto, verá: `Ready on http://localhost:3005`

---

## 🔍 Verificar Status

### 1. Verificar Backend

Abra no navegador ou use curl:
```
http://localhost:5000/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": ...,
  "version": "1.0.0",
  "environment": "development"
}
```

### 2. Verificar Frontend

Abra no navegador:
```
http://localhost:3005
```

Você deve ver a página de login ou dashboard.

---

## 🎯 Testar Funcionalidades

### 1. Acessar Dashboard de Módulos

```
http://localhost:3005/dashboard/modulos-turismo
```

### 2. Testar Módulo de Leilões

- Lista: http://localhost:3005/dashboard/leiloes
- Criar: http://localhost:3005/dashboard/leiloes/novo
- Flash Deals: http://localhost:3005/dashboard/leiloes/flash-deals
- Relatórios: http://localhost:3005/dashboard/leiloes/relatorios

### 3. Testar Módulo de Excursões

- Lista: http://localhost:3005/dashboard/excursoes
- Criar: http://localhost:3005/dashboard/excursoes/nova
- Roteiros: http://localhost:3005/dashboard/excursoes/roteiros?excursao_id=[id]
- Participantes: http://localhost:3005/dashboard/excursoes/participantes?excursao_id=[id]

### 4. Testar Módulo de Viagens em Grupo

- Lista: http://localhost:3005/dashboard/viagens-grupo
- Criar: http://localhost:3005/dashboard/viagens-grupo/nova
- Wishlists: http://localhost:3005/dashboard/viagens-grupo/wishlists?grupo_id=[id]
- Pagamentos: http://localhost:3005/dashboard/viagens-grupo/pagamentos?grupo_id=[id]

---

## ⚠️ Problemas Comuns

### Backend não inicia

**Sintomas:**
- Erro na janela do PowerShell
- Porta 5000 em uso

**Solução:**
```powershell
# Liberar porta
.\scripts\liberar-portas.ps1

# Reiniciar
cd backend
npm run dev
```

### Frontend não inicia

**Sintomas:**
- Erro na janela do PowerShell
- Porta 3005 em uso
- Erro de compilação

**Solução:**
```powershell
# Fechar janela anterior manualmente
# Ou liberar porta
.\scripts\liberar-portas.ps1

# Reiniciar
cd apps\turismo
npm run dev
```

### Erro de módulo não encontrado

**Sintomas:**
- `Module not found: Can't resolve 'react-hot-toast'`

**Solução:**
```powershell
cd apps\turismo
npm install react-hot-toast
npm run dev
```

### Página não carrega

**Sintomas:**
- 404 Not Found
- Página em branco

**Solução:**
1. Verificar se o frontend compilou com sucesso
2. Verificar console do navegador (F12) para erros
3. Limpar cache: `Ctrl + Shift + R` (hard refresh)

---

## 📊 Logs e Debugging

### Backend
- Logs aparecem na janela do PowerShell
- Procure por erros em vermelho
- Verifique conexão com banco de dados

### Frontend
- Logs aparecem na janela do PowerShell
- Erros de compilação aparecem em vermelho
- Console do navegador (F12) mostra erros de runtime

---

## ✅ Checklist de Verificação

### Backend
- [ ] Servidor inicia sem erros
- [ ] Health check responde (http://localhost:5000/health)
- [ ] Conexão com banco funciona
- [ ] Logs aparecem normalmente

### Frontend
- [ ] Aplicação compila sem erros
- [ ] Página principal carrega (http://localhost:3005)
- [ ] Navegação funciona
- [ ] Sem erros no console do navegador

### Integração
- [ ] Requisições para API funcionam
- [ ] Toasts aparecem (notificações)
- [ ] Formulários funcionam
- [ ] Dados são carregados corretamente

---

## 🎉 Pronto!

Se todos os itens do checklist estiverem marcados, o sistema está funcionando corretamente!

**Aproveite testando as funcionalidades criadas!** 🚀

