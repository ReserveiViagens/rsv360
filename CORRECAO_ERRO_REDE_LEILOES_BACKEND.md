# Correção: Erro de Rede no Sistema de Leilões

## Problema Identificado

Ao acessar `/dashboard/leiloes` no Dashboard Turismo (porta 3005), ocorria o erro:

```
AxiosError: Network Error
GET /api/v1/leiloes
```

### Causa Raiz

O **backend não estava rodando** na porta 5000, que é onde o frontend tenta conectar para buscar os dados dos leilões.

## Solução Implementada

### 1. Script de Inicialização do Backend

**Arquivo:** `scripts/iniciar-backend.ps1`

Este script:
- Verifica se a porta 5000 está ativa
- Testa a conexão com o endpoint `/health`
- Inicia o backend automaticamente se não estiver rodando
- Aguarda até 12 segundos para o backend estar pronto
- Retorna `true` se tudo estiver OK, `false` caso contrário

### 2. Integração no Script de Inicialização

**Arquivo:** `Iniciar Sistema Completo.ps1` (atualizado)

O script foi atualizado para:
1. Verificar e iniciar PostgreSQL (porta 5433)
2. Verificar dados do CMS
3. Limpar portas 3000 e 3005
4. Limpar cache do Next.js
5. Iniciar microserviços (32 serviços)
6. **Verificar e iniciar Backend (porta 5000)** ← NOVO
7. Iniciar Dashboard Turismo (porta 3005)
8. Iniciar Site Público (porta 3000)

## Configuração do Backend

### CORS

O backend já está configurado para aceitar requisições da porta 3005:

```javascript
origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3005"]
```

### Rotas de Leilões

O backend possui as seguintes rotas registradas:
- `GET /api/v1/leiloes` - Listar leilões
- `GET /api/v1/leiloes/:id` - Detalhes do leilão
- `POST /api/v1/leiloes` - Criar leilão
- `PUT /api/v1/leiloes/:id` - Atualizar leilão
- `DELETE /api/v1/leiloes/:id` - Cancelar leilão
- `POST /api/v1/leiloes/:id/lances` - Fazer lance
- `GET /api/v1/leiloes/:id/lances` - Listar lances
- `GET /api/v1/leiloes/flash-deals` - Listar flash deals
- `GET /api/v1/leiloes/relatorios` - Relatórios

## Como Usar

### Execução Manual

```powershell
# Iniciar backend manualmente
cd backend
npm run dev
```

### Execução Automática

O script `Iniciar Sistema Completo.ps1` agora executa automaticamente:
1. Verificação e inicialização do PostgreSQL
2. Verificação dos dados do CMS
3. **Verificação e inicialização do Backend** ← NOVO
4. Inicialização dos microserviços
5. Inicialização do Dashboard Turismo
6. Inicialização do Site Público

## Verificação

Após iniciar o sistema, verifique:

1. **Backend está rodando:**
   ```powershell
   Get-NetTCPConnection -LocalPort 5000
   ```

2. **Backend responde:**
   ```powershell
   curl http://localhost:5000/health
   ```

3. **API de Leilões funciona:**
   ```powershell
   curl http://localhost:5000/api/v1/leiloes
   ```

4. **Frontend carrega dados:**
   - Acesse: http://localhost:3005/dashboard/leiloes
   - Verifique se os dados aparecem corretamente

## Dependências

O backend precisa de:
- **Node.js** instalado
- **npm** instalado
- **Dependências instaladas** (`npm install` no diretório `backend`)
- **PostgreSQL rodando** (porta 5433)
- **Variáveis de ambiente** configuradas (arquivo `.env` no diretório `backend`)

## Variáveis de Ambiente Necessárias

O backend precisa das seguintes variáveis no arquivo `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_NAME=rsv360
DB_USER=postgres
DB_PASSWORD=290491Bb
NODE_ENV=development
```

## Notas Importantes

1. **Aguardar Inicialização**: Após iniciar o backend, o script aguarda até 12 segundos para garantir que o serviço esteja totalmente inicializado.

2. **Logs**: O backend será iniciado em uma nova janela do PowerShell para que você possa ver os logs.

3. **Health Check**: O script testa o endpoint `/health` para verificar se o backend está respondendo corretamente.

4. **Timeout**: Se o backend não responder após 12 segundos, o script continua mesmo assim, mas exibe um aviso.

## Status

✅ **Correção Implementada**
- Script de inicialização do backend criado
- Integração no script de inicialização completa
- CORS já estava configurado corretamente
- Rotas de leilões já existem no backend

## Data da Correção

12 de Janeiro de 2026
