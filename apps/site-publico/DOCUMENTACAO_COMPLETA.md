# 📚 DOCUMENTAÇÃO COMPLETA - RSV 360°

**Versão:** 1.0  
**Última atualização:** 2025-01-XX

---

## 📑 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [APIs](#apis)
6. [Componentes](#componentes)
7. [Fluxos Principais](#fluxos-principais)
8. [Testes](#testes)
9. [Deploy](#deploy)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

O **RSV 360°** é um sistema completo de gestão de reservas e hospedagem, desenvolvido com:

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL
- **Autenticação:** JWT, OAuth (Google, Facebook)
- **Pagamentos:** Mercado Pago (PIX, Cartão, Boleto)
- **Comunicação:** WhatsApp, Telegram, Email
- **Integrações:** Google Calendar, iCal, Fechaduras Inteligentes

---

## 🚀 INSTALAÇÃO

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone <repository-url>
   cd Hotel-com-melhor-preco-main
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o banco de dados:**
   ```bash
   # Crie o banco de dados
   createdb onboarding_rsv_db

   # Execute as migrations
   psql -U seu_usuario -d onboarding_rsv_db -f scripts/create-all-tables.js
   ```

4. **Configure as variáveis de ambiente:**
   ```bash
   cp env.example .env.local
   # Edite .env.local com suas credenciais
   ```

5. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

6. **Acesse:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

---

## ⚙️ CONFIGURAÇÃO

Veja o guia completo: [GUIA_CONFIGURACAO_ENV_COMPLETO.md](./GUIA_CONFIGURACAO_ENV_COMPLETO.md)

### Variáveis Essenciais

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=onboarding_rsv_db
DB_USER=onboarding_rsv
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=TEST-...
MERCADO_PAGO_PUBLIC_KEY=TEST-...
```

---

## 📁 ESTRUTURA DO PROJETO

```
Hotel-com-melhor-preco-main/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Autenticação
│   │   ├── bookings/     # Reservas
│   │   ├── properties/   # Propriedades
│   │   └── webhooks/     # Webhooks
│   ├── hoteis/           # Página de hotéis
│   ├── reservar/         # Fluxo de reserva
│   ├── perfil/           # Perfil do usuário
│   └── ...
├── components/            # Componentes React
│   ├── ui/               # Componentes UI base
│   ├── calendar/         # Calendário
│   └── ...
├── lib/                   # Utilitários
│   ├── email.ts          # Serviço de email
│   ├── mercadopago.ts    # Integração Mercado Pago
│   ├── pricing-engine.ts # Motor de preços
│   └── ...
├── scripts/               # Scripts utilitários
│   ├── create-all-tables.js
│   └── ...
├── public/               # Arquivos estáticos
└── __tests__/            # Testes
```

---

## 🔌 APIs

### Autenticação

#### POST /api/auth/register
Registra um novo usuário.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "phone": "62999999999"
}
```

**Response:**
```json
{
  "success": true,
  "user": { "id": 1, "name": "João Silva", "email": "joao@example.com" },
  "token": "jwt_token_aqui"
}
```

#### POST /api/auth/login
Faz login do usuário.

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

### Reservas

#### GET /api/bookings
Lista reservas do usuário autenticado.

**Query Params:**
- `status`: Filtrar por status (pending, confirmed, cancelled)
- `limit`: Limite de resultados
- `offset`: Offset para paginação

#### POST /api/bookings
Cria uma nova reserva.

**Request:**
```json
{
  "item_id": 1,
  "customer_name": "João Silva",
  "customer_email": "joao@example.com",
  "customer_phone": "62999999999",
  "check_in": "2025-12-01",
  "check_out": "2025-12-05",
  "guests": 2,
  "total": 1000.00
}
```

#### PATCH /api/bookings/:code
Atualiza uma reserva.

**Request:**
```json
{
  "status": "confirmed"
}
```

### Propriedades

#### GET /api/properties
Lista propriedades.

**Query Params:**
- `id`: ID da propriedade
- `city`: Filtrar por cidade
- `state`: Filtrar por estado

#### GET /api/properties/:id/calendar
Obtém calendário de uma propriedade.

**Query Params:**
- `start_date`: Data inicial (YYYY-MM-DD)
- `end_date`: Data final (YYYY-MM-DD)

#### GET /api/properties/:id/pricing
Calcula preço dinâmico.

**Query Params:**
- `check_in`: Data de check-in (YYYY-MM-DD)
- `check_out`: Data de check-out (YYYY-MM-DD)

---

## 🧩 COMPONENTES

### Componentes UI Base

#### LoadingSpinner
Exibe spinner de carregamento.

```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner';

<LoadingSpinner size="md" text="Carregando..." />
```

#### ToastNotification
Exibe notificações toast.

```tsx
import { useToast } from '@/components/ui/toast-notification';

const { showToast, ToastContainer } = useToast();

showToast('Operação realizada com sucesso!', 'success');
```

#### Skeleton
Exibe placeholders de carregamento.

```tsx
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

<SkeletonCard />
```

### Componentes de Formulário

#### FormField
Campo de formulário com validação em tempo real.

```tsx
import { FormField } from '@/components/form-with-validation';

<FormField
  label="Email"
  name="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  validator="email"
/>
```

**Validadores disponíveis:**
- `email`: Valida email
- `phone`: Valida e formata telefone
- `cpf`: Valida CPF
- `cnpj`: Valida CNPJ
- `url`: Valida URL
- `required`: Campo obrigatório

---

## 🔄 FLUXOS PRINCIPAIS

### Fluxo de Reserva

1. **Busca** (`/buscar`)
   - Usuário busca propriedades
   - Aplica filtros (preço, localização, etc.)

2. **Detalhes** (`/hoteis/[id]`)
   - Visualiza detalhes da propriedade
   - Seleciona datas e hóspedes

3. **Reserva** (`/reservar/[id]`)
   - Preenche dados pessoais
   - Seleciona método de pagamento

4. **Pagamento** (`/reservar/[id]/payment`)
   - Processa pagamento (PIX, Cartão, Boleto)
   - Confirma reserva

5. **Confirmação** (`/reservar/[id]/confirmacao`)
   - Exibe confirmação
   - Envia email de confirmação

### Fluxo de Check-in Online

1. **Acesso** (`/checkin?booking_id=1`)
   - Usuário acessa com código de reserva

2. **Documentos**
   - Upload de documentos
   - Verificação de identidade (opcional)

3. **Contrato**
   - Assinatura digital do contrato

4. **Instruções**
   - Recebe instruções de acesso
   - PIN de fechadura (se aplicável)

---

## 🧪 TESTES

### Executar Testes

```bash
# Todos os testes
npm test

# Testes específicos
npm test -- bookings.test.ts

# Com cobertura
npm test -- --coverage
```

### Scripts de Teste

```bash
# Testar funcionalidades
node scripts/testar-funcionalidades.js

# Testar email
node scripts/testar-email.js

# Testar Mercado Pago
node scripts/testar-mercadopago.js

# Testar OAuth
node scripts/testar-oauth.js

# Testar tudo
node scripts/testar-tudo.js
```

---

## 🚀 DEPLOY

### Vercel (Recomendado)

1. **Instale a CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Faça deploy:**
   ```bash
   vercel
   ```

3. **Configure variáveis de ambiente:**
   - Vercel Dashboard → Settings → Environment Variables

### Docker

1. **Build da imagem:**
   ```bash
   docker build -t rsv360 .
   ```

2. **Execute:**
   ```bash
   docker run -p 3000:3000 --env-file .env.local rsv360
   ```

### Manual

1. **Build:**
   ```bash
   npm run build
   ```

2. **Start:**
   ```bash
   npm start
   ```

---

## 🔧 TROUBLESHOOTING

### Erro: "Module not found: Can't resolve 'fs'"

**Solução:** Certifique-se de que `next.config.mjs` está configurado corretamente com webpack fallbacks.

### Erro: "relação 'users' não existe"

**Solução:** Execute os scripts de criação de tabelas:
```bash
node scripts/create-all-tables.js
```

### Erro: "coluna 'payment_status' não existe"

**Solução:** Execute o script de correção:
```bash
node scripts/corrigir-payment-status.js
```

### Email não está sendo enviado

**Verificações:**
1. SMTP configurado corretamente no `.env.local`
2. Teste com: `node scripts/testar-email.js`
3. Verifique logs do servidor

### Mercado Pago não processa pagamentos

**Verificações:**
1. Credenciais corretas no `.env.local`
2. Webhook configurado no painel do Mercado Pago
3. URL do webhook acessível publicamente

---

## 📞 SUPORTE

Para mais informações, consulte:

- [ANALISE_COMPLETA_SISTEMA.md](./ANALISE_COMPLETA_SISTEMA.md)
- [GUIA_CONFIGURACAO_ENV_COMPLETO.md](./GUIA_CONFIGURACAO_ENV_COMPLETO.md)
- [GUIA_IMPLEMENTACAO_COMPLETA.md](./GUIA_IMPLEMENTACAO_COMPLETA.md)

---

**Desenvolvido com ❤️ para RSV 360°**

