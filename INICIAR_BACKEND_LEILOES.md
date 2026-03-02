# Como iniciar o backend para a página de leilões

## Comando rápido

```powershell
cd "RSV360 Versao Oficial"; .\Iniciar Sistema Completo.ps1
```

O script inicia em sequência: PostgreSQL, Backend Principal (5000), Backend Admin (5002), 32 microserviços e os frontends (Site Público + Dashboard Turismo).

---

## Erro comum

Se você vê a mensagem:

> **Erro ao carregar leilões: Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 5000.**

Significa que o backend não está rodando. O site público (frontend) tenta conectar em `http://localhost:5000` para buscar os leilões.

---

## Solução rápida

### Opção 1: Iniciar Sistema Completo (recomendado)

Inicia **tudo sincronizado**: PostgreSQL, backends (5000 e 5002), 32 microserviços e frontends (Site Público + Dashboard Turismo).

**Se estiver na pasta pai** (ex: `Backup rsv36-servidor-oficial...`):

```powershell
cd "RSV360 Versao Oficial"
.\Iniciar Sistema Completo.ps1
```

**Se já estiver dentro de** `RSV360 Versao Oficial`:

```powershell
.\Iniciar Sistema Completo.ps1
```

O script inicia em ordem:
1. PostgreSQL (porta 5433)
2. Backend Principal (porta 5000) – usado pelos leilões
3. Backend Admin/CMS (porta 5002)
4. 32 microserviços (portas 6000–6031)
5. Dashboard Turismo (porta 3005)
6. Site Público (porta 3000)

### Opção 2: Apenas o backend (porta 5000)

Na pasta raiz do projeto (`RSV360 Versao Oficial`), execute:

```powershell
.\scripts\iniciar-backend.ps1
```

O script verifica se a porta 5000 está livre, inicia o backend e abre uma nova janela com os logs.

### Opção 3: Manualmente

1. Abra um terminal (PowerShell ou CMD)
2. Navegue até a pasta do backend:
   ```powershell
   cd backend
   ```
3. Instale as dependências (se ainda não fez):
   ```powershell
   npm install
   ```
4. Inicie o servidor:
   ```powershell
   npm run dev
   ```

O backend deve iniciar na porta **5000** e exibir algo como:

```
Server running on port 5000
```

---

## Verificar se o backend está rodando

Acesse no navegador ou via curl:

- **Health check:** http://localhost:5000/health
- **Leilões ativos:** http://localhost:5000/api/v1/auctions/active

Se retornar JSON ou status 200, o backend está funcionando.

---

## Pré-requisitos

- **Node.js** instalado
- **PostgreSQL** rodando (porta 5432 ou 5433, conforme `.env` do backend)
- Arquivo `.env` configurado na pasta `backend/` (copie de `.env.example` se necessário)

---

## Configuração do frontend

O site público usa a variável `NEXT_PUBLIC_API_URL` para saber onde conectar. Em desenvolvimento, o padrão é `http://localhost:5000`.

Arquivo: `apps/site-publico/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Se o backend rodar em outra porta ou URL, ajuste essa variável.
