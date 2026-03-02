# 🔧 TROUBLESHOOTING - RSV360

**Versão:** 1.0.0  
**Data:** 2025-12-16

---

## 📋 ÍNDICE

1. [Problemas de API](#problemas-de-api)
2. [Problemas de Cache](#problemas-de-cache)
3. [Problemas de Banco de Dados](#problemas-de-banco-de-dados)
4. [Problemas de Autenticação](#problemas-de-autenticação)
5. [Problemas de Performance](#problemas-de-performance)
6. [Problemas de Frontend](#problemas-de-frontend)

---

## 🔌 PROBLEMAS DE API

### Erro 400: Dados Inválidos

**Sintoma:** API retorna erro 400 com mensagem "Dados inválidos"

**Causas Possíveis:**
- Parâmetros obrigatórios faltando
- Formato de dados incorreto
- Validação falhando

**Solução:**
1. Verifique a documentação da API (`docs/API_SWAGGER.md`)
2. Verifique se todos os campos obrigatórios estão presentes
3. Verifique o formato dos dados:
   - Datas: YYYY-MM-DD
   - Emails: formato válido
   - Números: valores numéricos válidos
4. Verifique os limites:
   - Strings: máximo de caracteres
   - Números: valores positivos/negativos permitidos

**Exemplo:**
```json
// ❌ Errado
{
  "item_id": "abc",  // Deve ser número
  "check_in": "20/12/2025"  // Formato errado
}

// ✅ Correto
{
  "item_id": 123,
  "check_in": "2025-12-20"
}
```

---

### Erro 401: Não Autenticado

**Sintoma:** API retorna erro 401 "Não autenticado"

**Causas Possíveis:**
- Token ausente
- Token expirado
- Token inválido

**Solução:**
1. Verifique se o header `Authorization` está presente:
   ```
   Authorization: Bearer <token>
   ```
2. Verifique se o token não expirou
3. Faça login novamente para obter um novo token
4. Verifique se o token está sendo enviado corretamente

---

### Erro 403: Sem Permissão

**Sintoma:** API retorna erro 403 "Sem permissão"

**Causas Possíveis:**
- Usuário não tem permissão para a ação
- Não é membro da wishlist
- Não é o dono do recurso

**Solução:**
1. Verifique se você tem acesso ao recurso
2. Para wishlists: verifique se você é membro
3. Para propriedades: verifique se você é o dono
4. Contate o administrador se necessário

---

### Erro 404: Não Encontrado

**Sintoma:** API retorna erro 404 "Não encontrado"

**Causas Possíveis:**
- Recurso não existe
- ID inválido
- Recurso foi deletado

**Solução:**
1. Verifique se o ID está correto
2. Verifique se o recurso existe no banco de dados
3. Verifique se o recurso não foi deletado

---

### Erro 500: Erro Interno

**Sintoma:** API retorna erro 500 "Erro interno"

**Causas Possíveis:**
- Erro no servidor
- Erro no banco de dados
- Erro de processamento

**Solução:**
1. Verifique os logs do servidor
2. Verifique a conexão com o banco de dados
3. Tente novamente após alguns minutos
4. Se persistir, contate o suporte

---

## 💾 PROBLEMAS DE CACHE

### Cache Não Está Funcionando

**Sintoma:** Respostas não estão sendo cacheadas

**Causas Possíveis:**
- Cache desabilitado
- TTL muito curto
- Cache sendo invalidado muito frequentemente

**Solução:**
1. Verifique se o cache está habilitado
2. Verifique o TTL configurado
3. Verifique se há muitas invalidações
4. Verifique os logs de cache

**Debug:**
```typescript
// Verificar estatísticas de cache
const stats = cacheService.getStats();
console.log(stats);
// { total: 100, active: 95, expired: 5 }
```

---

### Cache Desatualizado

**Sintoma:** Dados em cache estão desatualizados

**Causas Possíveis:**
- Cache não está sendo invalidado após atualizações
- TTL muito longo

**Solução:**
1. Verifique se o cache está sendo invalidado após modificações
2. Reduza o TTL se necessário
3. Force invalidação manual se necessário

**Exemplo:**
```typescript
// Invalidar cache após atualização
cacheService.delete(`wishlist:${wishlistId}:items`);
```

---

## 🗄️ PROBLEMAS DE BANCO DE DADOS

### Erro de Conexão

**Sintoma:** Erro ao conectar ao banco de dados

**Causas Possíveis:**
- Banco de dados não está rodando
- Credenciais incorretas
- Firewall bloqueando conexão
- Limite de conexões atingido

**Solução:**
1. Verifique se o PostgreSQL está rodando:
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Windows
   # Verificar serviços
   ```
2. Verifique as credenciais no `.env`:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
3. Verifique o firewall
4. Verifique o limite de conexões no PostgreSQL

---

### Erro de Migração

**Sintoma:** Erro ao executar migrações

**Causas Possíveis:**
- Migração já executada
- Dependências faltando
- Erro de sintaxe SQL

**Solução:**
1. Verifique quais migrações já foram executadas:
   ```bash
   npm run db:check
   ```
2. Verifique se há conflitos:
   ```bash
   npm run db:analyze
   ```
3. Execute migrações pendentes:
   ```bash
   npm run migrate
   ```
4. Se houver erro, verifique o SQL da migração

---

### Performance Lenta

**Sintoma:** Queries demorando muito

**Causas Possíveis:**
- Índices faltando
- Queries não otimizadas
- Muitos dados

**Solução:**
1. Verifique se há índices nas colunas usadas em WHERE/JOIN
2. Use EXPLAIN ANALYZE para analisar queries:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM wishlist_items WHERE wishlist_id = 1;
   ```
3. Considere adicionar índices:
   ```sql
   CREATE INDEX idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);
   ```
4. Considere paginação para grandes resultados

---

## 🔐 PROBLEMAS DE AUTENTICAÇÃO

### Token Não Está Funcionando

**Sintoma:** Token válido mas API retorna 401

**Causas Possíveis:**
- Token não está sendo enviado corretamente
- Header incorreto
- Token expirado

**Solução:**
1. Verifique o header:
   ```
   Authorization: Bearer <token>
   ```
2. Verifique se o token não expirou
3. Verifique se o token está sendo gerado corretamente
4. Faça login novamente

---

### Sessão Expirando Muito Rápido

**Sintoma:** Usuário precisa fazer login frequentemente

**Causas Possíveis:**
- TTL do token muito curto
- Token não está sendo renovado

**Solução:**
1. Aumente o TTL do token (se apropriado)
2. Implemente renovação automática de token
3. Use refresh tokens

---

## ⚡ PROBLEMAS DE PERFORMANCE

### API Lenta

**Sintoma:** Respostas demorando muito

**Causas Possíveis:**
- Queries lentas
- Cache não está sendo usado
- Muitas requisições simultâneas

**Solução:**
1. Verifique se o cache está funcionando
2. Otimize queries do banco de dados
3. Considere usar paginação
4. Considere usar rate limiting

---

### Frontend Lento

**Sintoma:** Página demorando para carregar

**Causas Possíveis:**
- Muitas requisições
- Componentes pesados
- Imagens grandes

**Solução:**
1. Use lazy loading para componentes
2. Otimize imagens
3. Reduza número de requisições
4. Use code splitting

---

## 🎨 PROBLEMAS DE FRONTEND

### Componente Não Está Renderizando

**Sintoma:** Componente não aparece na tela

**Causas Possíveis:**
- Erro JavaScript
- Import incorreto
- Condição de renderização

**Solução:**
1. Verifique o console do navegador para erros
2. Verifique se o componente está sendo importado corretamente
3. Verifique condições de renderização
4. Verifique se há erros de TypeScript

---

### Erro de Importação

**Sintoma:** Erro "Cannot find module"

**Causas Possíveis:**
- Caminho incorreto
- Arquivo não existe
- Export incorreto

**Solução:**
1. Verifique o caminho do import
2. Verifique se o arquivo existe
3. Verifique se o export está correto
4. Use imports absolutos quando possível:
   ```typescript
   import { Component } from '@/components/Component';
   ```

---

### Erro de Build

**Sintoma:** Erro ao fazer build do projeto

**Causas Possíveis:**
- Erros de TypeScript
- Dependências faltando
- Configuração incorreta

**Solução:**
1. Verifique erros de TypeScript:
   ```bash
   npm run type-check
   ```
2. Instale dependências:
   ```bash
   npm install
   ```
3. Verifique configuração do Next.js
4. Limpe cache e tente novamente:
   ```bash
   rm -rf .next
   npm run build
   ```

---

## 📞 SUPORTE ADICIONAL

### Logs

Para debug, verifique os logs:
- **Backend:** Console do servidor
- **Frontend:** Console do navegador (F12)
- **Banco de Dados:** Logs do PostgreSQL

### Comandos Úteis

```bash
# Verificar status do banco
npm run db:check

# Executar migrações
npm run migrate

# Analisar migrações
npm run db:analyze

# Verificar tipos TypeScript
npm run type-check

# Build do projeto
npm run build
```

---

**Última atualização:** 2025-12-16
