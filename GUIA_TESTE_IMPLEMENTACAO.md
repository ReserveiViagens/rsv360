# Guia de Teste - Implementação Completa

## Status da Implementação

✅ **Todas as funcionalidades foram implementadas com sucesso!**

### Resumo
- ✅ 15 páginas frontend criadas
- ✅ 18 componentes criados
- ✅ 3 serviços de API criados
- ✅ ~25 endpoints backend criados
- ✅ 9 tabelas de banco de dados criadas

---

## 1. Verificação do Banco de Dados

### Tabelas Criadas

Execute o script de verificação:

```powershell
.\scripts\verificar-tabelas-turismo.ps1
```

**Tabelas esperadas (9):**
- ✅ `auctions` - Leilões
- ✅ `bids` - Lances
- ✅ `excursoes` - Excursões
- ✅ `roteiros` - Roteiros de excursões
- ✅ `participantes_excursao` - Participantes
- ✅ `grupos_viagem` - Grupos de viagem
- ✅ `membros_grupo` - Membros do grupo
- ✅ `wishlist_items` - Itens de wishlist
- ✅ `pagamentos_divididos` - Pagamentos divididos

### Verificar Manualmente

```powershell
$env:PGPASSWORD = "290491Bb"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5433 -U postgres -d rsv360 -c "\dt"
```

---

## 2. Iniciar o Backend

### Configuração

Verifique o arquivo `.env` do backend:

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=rsv360
DB_USER=postgres
DB_PASSWORD=290491Bb
NODE_ENV=development
PORT=5000
JWT_SECRET=seu_jwt_secret_aqui
```

### Iniciar Servidor

```powershell
cd backend
npm install  # Se necessário
npm run dev
```

### Verificar APIs

O servidor deve iniciar em `http://localhost:5000`

**Endpoints disponíveis:**
- `GET /api/v1/leiloes` - Listar leilões
- `GET /api/v1/excursoes` - Listar excursões
- `GET /api/v1/viagens-grupo` - Listar grupos
- `GET /health` - Health check

**Teste rápido:**
```powershell
# Com token de autenticação
curl http://localhost:5000/health
```

---

## 3. Iniciar o Frontend

### Configuração

Verifique o arquivo `.env.local` do frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Iniciar Aplicação

```powershell
cd apps/turismo
npm install  # Se necessário
npm run dev
```

O frontend deve iniciar em `http://localhost:3005`

---

## 4. Testar Funcionalidades

### Módulo de Leilões

1. **Lista de Leilões**
   - Acesse: `http://localhost:3005/dashboard/leiloes`
   - Verifique: Lista de leilões com filtros e paginação

2. **Criar Leilão**
   - Acesse: `http://localhost:3005/dashboard/leiloes/novo`
   - Preencha o formulário e teste criação

3. **Detalhes do Leilão**
   - Acesse: `http://localhost:3005/dashboard/leiloes/[id]`
   - Verifique: Detalhes, histórico de lances, formulário de lance

4. **Flash Deals**
   - Acesse: `http://localhost:3005/dashboard/leiloes/flash-deals`
   - Verifique: Lista de flash deals com contador regressivo

5. **Relatórios**
   - Acesse: `http://localhost:3005/dashboard/leiloes/relatorios`
   - Verifique: Estatísticas e gráficos

### Módulo de Excursões

1. **Lista de Excursões**
   - Acesse: `http://localhost:3005/dashboard/excursoes`
   - Verifique: Lista com filtros

2. **Criar Excursão**
   - Acesse: `http://localhost:3005/dashboard/excursoes/nova`
   - Preencha o formulário e teste criação

3. **Detalhes da Excursão**
   - Acesse: `http://localhost:3005/dashboard/excursoes/[id]`
   - Verifique: Detalhes completos

4. **Roteiros**
   - Acesse: `http://localhost:3005/dashboard/excursoes/roteiros?excursao_id=[id]`
   - Verifique: Editor de roteiros

5. **Participantes**
   - Acesse: `http://localhost:3005/dashboard/excursoes/participantes?excursao_id=[id]`
   - Verifique: Lista e gerenciamento de participantes

### Módulo de Viagens em Grupo

1. **Lista de Grupos**
   - Acesse: `http://localhost:3005/dashboard/viagens-grupo`
   - Verifique: Lista com filtros

2. **Criar Grupo**
   - Acesse: `http://localhost:3005/dashboard/viagens-grupo/nova`
   - Preencha o formulário e teste criação

3. **Detalhes do Grupo**
   - Acesse: `http://localhost:3005/dashboard/viagens-grupo/[id]`
   - Verifique: Detalhes completos

4. **Wishlists**
   - Acesse: `http://localhost:3005/dashboard/viagens-grupo/wishlists?grupo_id=[id]`
   - Verifique: Lista de wishlists com votação

5. **Pagamentos Divididos**
   - Acesse: `http://localhost:3005/dashboard/viagens-grupo/pagamentos?grupo_id=[id]`
   - Verifique: Lista e criação de pagamentos divididos

---

## 5. Testar APIs com Postman/Insomnia

### Autenticação

Primeiro, obtenha um token:

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "seu-email@exemplo.com",
  "password": "sua-senha"
}
```

Use o token retornado no header:

```
Authorization: Bearer [seu-token]
```

### Endpoints de Leilões

```http
# Listar leilões
GET http://localhost:5000/api/v1/leiloes?page=1&limit=10

# Criar leilão
POST http://localhost:5000/api/v1/leiloes
Content-Type: application/json

{
  "title": "Leilão de Teste",
  "starting_price": 1000.00,
  "start_date": "2025-01-01T10:00:00Z",
  "end_date": "2025-01-31T23:59:59Z",
  "type": "auction"
}

# Buscar leilão por ID
GET http://localhost:5000/api/v1/leiloes/[id]

# Criar lance
POST http://localhost:5000/api/v1/leiloes/[id]/lances
Content-Type: application/json

{
  "amount": 1100.00
}
```

### Endpoints de Excursões

```http
# Listar excursões
GET http://localhost:5000/api/v1/excursoes?page=1&limit=10

# Criar excursão
POST http://localhost:5000/api/v1/excursoes
Content-Type: application/json

{
  "nome": "Excursão de Teste",
  "destino": "Caldas Novas",
  "data_inicio": "2025-02-01",
  "data_fim": "2025-02-05",
  "preco": 1500.00,
  "vagas_totais": 20
}
```

### Endpoints de Viagens em Grupo

```http
# Listar grupos
GET http://localhost:5000/api/v1/viagens-grupo?page=1&limit=10

# Criar grupo
POST http://localhost:5000/api/v1/viagens-grupo
Content-Type: application/json

{
  "nome": "Grupo de Teste",
  "destino": "Rio de Janeiro",
  "privacidade": "publico"
}
```

---

## 6. Checklist de Validação

### Backend
- [ ] Servidor inicia sem erros
- [ ] Conexão com banco de dados funcionando
- [ ] Rotas registradas corretamente
- [ ] Autenticação funcionando
- [ ] Endpoints retornam dados corretos

### Frontend
- [ ] Aplicação inicia sem erros
- [ ] Páginas carregam corretamente
- [ ] Navegação entre páginas funciona
- [ ] Formulários validam corretamente
- [ ] Integração com APIs funcionando
- [ ] Loading states funcionando
- [ ] Tratamento de erros funcionando

### Banco de Dados
- [ ] Todas as tabelas criadas
- [ ] Índices criados
- [ ] Foreign keys funcionando
- [ ] Constraints aplicadas

---

## 7. Problemas Comuns e Soluções

### Erro: "Cannot find module"
```powershell
# Reinstalar dependências
cd backend
npm install

cd ../apps/turismo
npm install
```

### Erro: "Connection refused" no banco
```powershell
# Verificar se PostgreSQL está rodando
Get-Service postgresql*

# Verificar porta
netstat -an | findstr 5433
```

### Erro: "Table already exists"
- Normal se a migration já foi executada
- As migrations usam `CREATE TABLE IF NOT EXISTS`

### Erro: "Unauthorized" nas APIs
- Verificar se o token está sendo enviado
- Verificar se o token é válido
- Fazer login novamente

---

## 8. Próximos Passos Recomendados

1. **Adicionar dados de teste**
   - Criar seeders para popular o banco
   - Adicionar leilões, excursões e grupos de exemplo

2. **Melhorar validações**
   - Adicionar validações mais robustas
   - Melhorar mensagens de erro

3. **Adicionar testes**
   - Testes unitários dos services
   - Testes de integração das APIs
   - Testes E2E do frontend

4. **Otimizações**
   - Adicionar cache onde apropriado
   - Otimizar queries do banco
   - Melhorar performance do frontend

5. **Documentação**
   - Documentar APIs (Swagger)
   - Adicionar comentários no código
   - Criar guias de uso

---

## 9. Estrutura de Arquivos Criados

```
RSV360 Versao Oficial/
├── apps/turismo/
│   ├── pages/dashboard/
│   │   ├── leiloes/ (5 páginas)
│   │   ├── excursoes/ (5 páginas)
│   │   └── viagens-grupo/ (5 páginas)
│   └── src/
│       ├── components/
│       │   ├── shared/ (4 componentes)
│       │   ├── leiloes/ (6 componentes)
│       │   ├── excursoes/ (4 componentes)
│       │   └── viagens-grupo/ (4 componentes)
│       └── services/api/ (3 serviços)
├── backend/src/
│   ├── api/v1/
│   │   ├── leiloes/ (routes.js, controller.js)
│   │   ├── excursoes/ (routes.js, controller.js)
│   │   └── viagens-grupo/ (routes.js, controller.js)
│   └── services/
│       ├── leiloes/ (leilaoService.js)
│       ├── excursoes/ (excursaoService.js)
│       └── viagens-grupo/ (grupoService.js)
└── database/migrations/
    ├── excursoes/ (001-create-excursoes-tables.sql)
    └── viagens-grupo/ (001-create-viagens-grupo-tables.sql)
```

---

## 10. Suporte

Se encontrar problemas:

1. Verifique os logs do backend no console
2. Verifique os logs do frontend no console do navegador (F12)
3. Verifique os logs do PostgreSQL
4. Consulte a documentação do código

---

**Implementação concluída com sucesso! 🎉**

