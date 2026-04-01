# PMS CRM RSV360 - Sistema Modular Monolith

[![Status](https://img.shields.io/badge/status-stable-green)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-blue)]()

> **Sistema completo de gerenciamento de turismo e propriedades** com arquitetura Modular Monolith, escalável e pronto para operações em produção.

## 📊 Visão Geral

O **RSV360** é uma plataforma integrada de gerenciamento que combina:

- 🏨 **Property Management System (PMS)** completo
- 💼 **Customer Relationship Management (CRM)** integrado
- 🎯 **Sistema de Leilões e Flash Deals** em tempo real
- ✈️ **Gestão de Excursões e Viagens em Grupo**
- 🤖 **Atendimento Automatizado com IA**
- 📱 **Interface Pública e Administrativa**

### 🏗️ Arquitetura

Utiliza o padrão **Modular Monolith** com:

- **Código Organizado por Domínio**: Cada module em sua própria pasta, com dependências claras
- **Deploy Monolítico**: Um único deploy, banco de dados compartilhado, fácil manutenção
- **Estrutura Escalável**: Simples adicionar novos módulos sem refatoração
- **Pronto para Microserviços**: Evolução facilitada se necessário no futuro

## 📁 Estrutura do Projeto

```
RSV360 Versao Oficial/
├── apps/                    # Aplicações Frontend
│   ├── turismo/            # Dashboard de Turismo (porta 3005)
│   ├── site-publico/       # Site Público + CRM (porta 3000)
│   ├── guest/              # App para Hóspedes
│   ├── admin/              # App Administrativo
│   └── atendimento-ia/     # Atendimento com IA
│
├── backend/                 # Backend e APIs
│   ├── src/
│   │   ├── api/v1/        # APIs por domínio
│   │   └── services/       # Serviços de negócio
│   └── migrations/         # Migrations do banco
│
├── packages/                # Pacotes Compartilhados
│   ├── shared/             # Código compartilhado
│   └── ui/                 # Componentes UI compartilhados
│
├── database/                # Banco de Dados
│   └── migrations/         # Migrations SQL
│       ├── leiloes/
│       ├── excursoes/
│       ├── viagens-grupo/
│       └── atendimento-ia/
│
└── scripts/                 # Scripts de automação
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL (para banco de dados)

### Instalação

1. **Clone o repositório** (se aplicável)

2. **Instale as dependências root:**
```bash
npm install
```

3. **Configure os workspaces:**
```powershell
.\scripts\CONFIGURAR_WORKSPACES.ps1
```

Ou manualmente:
```bash
npm install --workspaces
```

### Executar em Desenvolvimento

**Todos os serviços:**
```bash
npm run dev
```

**Serviços individuais:**
```bash
# Dashboard de Turismo (porta 3005)
npm run dev:turismo

# Site Público + CRM (porta 3000)
npm run dev:site

# Backend (porta 5000)
npm run dev:backend

# Atendimento IA (porta 3010)
npm run dev:atendimento
```

## 📦 Módulos Disponíveis

### 🎯 Módulos de Turismo

1. **Leilões e Flash Deals**
   - Sistema de leilões em tempo real
   - Ofertas relâmpago
   - Gestão de lances

2. **Excursões**
   - Montar excursões personalizadas
   - Gerenciar roteiros
   - Controle de participantes

3. **Viagens em Grupo**
   - Organizar viagens compartilhadas
   - Wishlists compartilhadas
   - Pagamentos divididos

### 🤖 Módulo de Atendimento IA

- Agentes especializados (vendas, suporte, financeiro, etc.)
- Treinamento híbrido (conteúdo + conversas)
- RAG (Retrieval-Augmented Generation)
- Integração com site público

## 🔧 Scripts Disponíveis

### Desenvolvimento
- `npm run dev` - Inicia todos os serviços
- `npm run dev:turismo` - Apenas dashboard de turismo
- `npm run dev:site` - Apenas site público
- `npm run dev:backend` - Apenas backend

### Build
- `npm run build` - Build de todos os workspaces
- `npm run build:turismo` - Build do dashboard
- `npm run build:site` - Build do site

### Banco de Dados
- `npm run migrate` - Executar migrations
- `npm run migrate:rollback` - Reverter migrations
- `npm run seed` - Popular banco com dados iniciais

### Outros
- `npm run lint` - Lint em todos os workspaces
- `npm run test` - Testes em todos os workspaces
- `npm run type-check` - Verificação de tipos TypeScript

## 🌐 Portas dos Serviços

| Serviço | Porta | URL |
|---------|-------|-----|
| Dashboard Turismo | 3005 | http://localhost:3005 |
| Site Público + CRM | 3000 | http://localhost:3000 |
| Backend API | 5000 | http://localhost:5000 |
| Atendimento IA | 3010 | http://localhost:3010 |

## 📊 Rotas Principais

### Dashboard de Turismo (3005)
- `/dashboard` - Dashboard principal
- `/dashboard/modulos-turismo` - Módulos de turismo
- `/dashboard/leiloes` - Leilões e Flash Deals
- `/dashboard/excursoes` - Excursões
- `/dashboard/viagens-grupo` - Viagens em Grupo

### Site Público (3000)
- `/` - Homepage
- `/admin/cms` - CMS Administrativo

## 🗄️ Banco de Dados

### Migrations Criadas

1. **Leilões** (`database/migrations/leiloes/`)
   - Tabelas: `auctions`, `bids`

2. **Excursões** (`database/migrations/excursoes/`)
   - Tabelas: `excursoes`, `excursoes_participantes`, `roteiros`

3. **Viagens em Grupo** (`database/migrations/viagens-grupo/`)
   - Tabelas: `grupos_viagem`, `grupos_membros`, `wishlists_compartilhadas`

4. **Atendimento IA** (`database/migrations/atendimento-ia/`)
   - Tabelas: `agents`, `conversations`, `training_content`, `training_conversations`

### Executar Migrations

```bash
npm run migrate
```

## 🧪 Testes

```bash
# Todos os testes
npm run test

# Testes específicos por workspace
npm run test --workspace=apps/turismo
```

## 📝 Documentação

- [Arquitetura Modular Monolith](./docs/ARQUITETURA.md)
- [Guia de Módulos](./docs/MODULOS.md)
- [API Documentation](./docs/API.md)

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça suas alterações
3. Execute testes e lint
4. Abra um Pull Request

## 📄 Licença

MIT

## 👥 Equipe

RSV360 Team

---

**Versão:** 1.0.0  
**Última Atualização:** 2025-12-30

