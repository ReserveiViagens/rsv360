# 🚀 Guia de Teste Rápido

## Serviços Iniciados

Os serviços foram iniciados em janelas separadas do PowerShell.

### Backend
- **URL:** http://localhost:5000
- **Status:** Verificar na janela do backend
- **Health Check:** http://localhost:5000/health

### Frontend
- **URL:** http://localhost:3005
- **Status:** Verificar na janela do frontend
- **Aplicação:** http://localhost:3005/dashboard/modulos-turismo

---

## ✅ Testes Rápidos

### 1. Verificar Backend

Abra no navegador ou use curl:
```powershell
# Health check
curl http://localhost:5000/health

# Ou no navegador
# http://localhost:5000/health
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

Você deve ver a página de login ou dashboard (dependendo da autenticação).

### 3. Testar Autenticação

Se necessário, faça login:
- Email: (verificar no banco de dados)
- Senha: (verificar no banco de dados)

Ou use o token demo:
```javascript
// No console do navegador (F12)
localStorage.setItem('access_token', 'demo-token');
localStorage.setItem('refresh_token', 'demo-refresh-token');
location.reload();
```

### 4. Navegar pelas Páginas

#### Módulo de Leilões
1. Acesse: http://localhost:3005/dashboard/modulos-turismo
2. Clique na aba "Leilões"
3. Teste:
   - Ver lista: http://localhost:3005/dashboard/leiloes
   - Criar novo: http://localhost:3005/dashboard/leiloes/novo
   - Flash deals: http://localhost:3005/dashboard/leiloes/flash-deals
   - Relatórios: http://localhost:3005/dashboard/leiloes/relatorios

#### Módulo de Excursões
1. Clique na aba "Excursões"
2. Teste:
   - Ver lista: http://localhost:3005/dashboard/excursoes
   - Criar nova: http://localhost:3005/dashboard/excursoes/nova
   - Roteiros: http://localhost:3005/dashboard/excursoes/roteiros?excursao_id=[id]
   - Participantes: http://localhost:3005/dashboard/excursoes/participantes?excursao_id=[id]

#### Módulo de Viagens em Grupo
1. Clique na aba "Viagens em Grupo"
2. Teste:
   - Ver lista: http://localhost:3005/dashboard/viagens-grupo
   - Criar novo: http://localhost:3005/dashboard/viagens-grupo/nova
   - Wishlists: http://localhost:3005/dashboard/viagens-grupo/wishlists?grupo_id=[id]
   - Pagamentos: http://localhost:3005/dashboard/viagens-grupo/pagamentos?grupo_id=[id]

---

## 🔍 Verificar Integração Frontend-Backend

### 1. Abrir DevTools (F12)

No navegador, abra o Console (F12) e verifique:
- ✅ Requisições sendo feitas para `http://localhost:5000/api/v1/...`
- ✅ Respostas sendo recebidas
- ⚠️ Erros de CORS (se houver, verificar configuração do backend)
- ⚠️ Erros 401 (normal se não estiver autenticado)

### 2. Testar Criação de Leilão

1. Acesse: http://localhost:3005/dashboard/leiloes/novo
2. Preencha o formulário:
   - Título: "Leilão de Teste"
   - Preço Inicial: 1000.00
   - Data Início: (data futura)
   - Data Término: (data após início)
   - Tipo: Leilão
3. Clique em "Criar Leilão"
4. Verifique:
   - ✅ Mensagem de sucesso
   - ✅ Redirecionamento para lista
   - ✅ Leilão aparece na lista

### 3. Testar API Diretamente

Use o script de teste:
```powershell
.\scripts\testar-endpoints.ps1
```

Ou use Postman/Insomnia:
```
GET http://localhost:5000/api/v1/leiloes
Headers:
  Authorization: Bearer [seu-token]
```

---

## ⚠️ Problemas Comuns

### Backend não inicia
- Verificar se a porta 5000 está livre
- Verificar se o PostgreSQL está rodando
- Verificar arquivo .env

### Frontend não inicia
- Verificar se a porta 3005 está livre
- Verificar se node_modules está instalado
- Verificar arquivo .env.local

### Erro 401 (Unauthorized)
- Normal se não estiver autenticado
- Fazer login ou usar token demo

### Erro de CORS
- Verificar configuração CORS no backend
- Verificar se NEXT_PUBLIC_API_URL está correto

### Páginas retornam 404
- Verificar se os arquivos estão nos locais corretos
- Verificar se o Next.js está rodando
- Limpar cache: `rm -rf .next` (Linux/Mac) ou `Remove-Item -Recurse -Force .next` (PowerShell)

---

## 📊 Checklist de Teste

### Backend
- [ ] Servidor inicia sem erros
- [ ] Health check responde
- [ ] Conexão com banco funciona
- [ ] Rotas registradas corretamente
- [ ] Endpoints retornam dados ou 401

### Frontend
- [ ] Aplicação inicia sem erros
- [ ] Página principal carrega
- [ ] Navegação funciona
- [ ] Formulários carregam
- [ ] Integração com API funciona

### Integração
- [ ] Requisições são feitas corretamente
- [ ] Respostas são processadas
- [ ] Erros são tratados
- [ ] Loading states funcionam
- [ ] Mensagens de sucesso/erro aparecem

---

## 🎯 Próximos Passos Após Teste

1. **Adicionar dados de teste**
   - Criar seeders para popular o banco
   - Adicionar leilões, excursões e grupos de exemplo

2. **Melhorar validações**
   - Adicionar mais validações client-side
   - Melhorar mensagens de erro

3. **Otimizar performance**
   - Adicionar cache
   - Otimizar queries
   - Melhorar loading states

4. **Adicionar testes**
   - Testes unitários
   - Testes de integração
   - Testes E2E

---

**Boa sorte com os testes! 🚀**

