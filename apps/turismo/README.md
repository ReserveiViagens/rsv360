# 🌟 RSV 360° ECOSYSTEM AI

## 📋 VISÃO GERAL

O **RSV 360° Ecosystem AI** é o servidor master que integra todos os sistemas da Reservei Viagens em uma plataforma unificada e inteligente. Este ecossistema modular permite uma gestão completa e integrada de todos os aspectos do negócio de turismo.

### 🎯 OBJETIVO PRINCIPAL
Centralizar e integrar todos os módulos de negócio da Reservei Viagens em um ecossistema coeso, proporcionando uma experiência unificada para usuários, clientes e administradores.

---

## 🏗️ ARQUITETURA DO ECOSSISTEMA

```
RSV-360-ECOSYSTEM/
├── 🌐 ECOSYSTEM-MASTER/           # Servidor Principal
│   ├── api-gateway/               # Gateway de APIs
│   ├── auth-service/              # Autenticação Central
│   ├── notification-hub/          # Hub de Notificações
│   ├── analytics-engine/          # Motor de Analytics
│   └── integration-layer/         # Camada de Integração
│
├── 🏢 BUSINESS-MODULES/           # Módulos de Negócio
│   ├── crm-system/               # Sistema CRM
│   ├── booking-engine/           # Motor de Reservas
│   ├── payment-gateway/          # Gateway de Pagamentos
│   ├── inventory-management/     # Gestão de Estoque
│   ├── customer-service/         # Atendimento ao Cliente
│   ├── marketing-automation/     # Automação de Marketing
│   ├── financial-system/         # Sistema Financeiro
│   └── product-catalog/          # Catálogo de Produtos
│
├── 🌍 PUBLIC-FACING/             # Interfaces Públicas
│   ├── website-public/           # Site Público
│   ├── mobile-app/               # App Mobile
│   ├── booking-widget/           # Widget de Reservas
│   ├── customer-portal/          # Portal do Cliente
│   └── admin-dashboard/          # Dashboard Administrativo
│
├── 📊 ANALYTICS-INTELLIGENCE/    # Inteligência e Analytics
│   ├── business-intelligence/    # BI e Relatórios
│   ├── ai-recommendations/       # Recomendações IA
│   ├── predictive-analytics/     # Analytics Preditivo
│   ├── performance-monitoring/   # Monitoramento
│   └── reporting-dashboard/      # Dashboard de Relatórios
│
├── 🔧 ADMINISTRATION/            # Administração
│   ├── user-management/          # Gestão de Usuários
│   ├── system-config/            # Configurações
│   ├── audit-logs/               # Logs de Auditoria
│   ├── security-center/          # Centro de Segurança
│   └── backup-management/        # Gestão de Backup
│
└── 🚀 INFRASTRUCTURE/            # Infraestrutura
    ├── docker-configs/           # Configurações Docker
    ├── ci-cd/                    # Pipeline CI/CD
    ├── monitoring/               # Monitoramento
    ├── backup-recovery/          # Backup e Recuperação
    ├── load-balancer/            # Balanceador de Carga
    └── database-cluster/         # Cluster de Banco de Dados
```

---

## 🚀 INÍCIO RÁPIDO

### 1. **Instalação**
```bash
# Clone o repositório
git clone https://github.com/reservei-viagens/rsv-360-ecosystem.git
cd rsv-360-ecosystem

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### 2. **Iniciar o Ecossistema**
```bash
# Iniciar todos os módulos
node start-ecosystem.js

# Ou iniciar módulos individuais
cd ECOSYSTEM-MASTER && npm run dev
cd BUSINESS-MODULES/crm-system && npm run dev
cd BUSINESS-MODULES/booking-engine && npm run dev
```

### 3. **Acessar o Sistema**
- **Servidor Principal**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **Auth Service**: http://localhost:3002
- **CRM System**: http://localhost:3003
- **Booking Engine**: http://localhost:3004

---

## 🎨 MÓDULOS PRINCIPAIS

### 🏨 **SISTEMA DE RESERVAS E HOTÉIS**
- **Porta**: 3004
- **Funcionalidades**: Gestão de hotéis, reservas, contratos, disponibilidade
- **Arquivos**: `reservas-hoteis.tsx`, `hoteis.tsx`, `contratos-hoteis.tsx`
- **Integração**: Sistema de pagamentos, CRM, analytics

### 👥 **SISTEMA CRM E CLIENTES**
- **Porta**: 3003
- **Funcionalidades**: Gestão de clientes, perfis, atendimento, leads
- **Arquivos**: `usuarios.tsx`, `perfis.tsx`, `central-atendimento.tsx`
- **Integração**: Sistema de reservas, marketing, analytics

### 📧 **SISTEMA DE MARKETING**
- **Porta**: 3007
- **Funcionalidades**: Email marketing, SMS, WhatsApp, campanhas, automação
- **Arquivos**: `email-marketing.tsx`, `sms-whatsapp.tsx`, `campanhas.tsx`
- **Integração**: CRM, analytics, automação

### 🎫 **SISTEMA DE ATENDIMENTO**
- **Porta**: 3006
- **Funcionalidades**: Tickets, chat, base de conhecimento, FAQ
- **Arquivos**: `tickets-suporte.tsx`, `chat-online.tsx`, `base-conhecimento.tsx`
- **Integração**: CRM, notificações, analytics

### 💰 **SISTEMA FINANCEIRO**
- **Porta**: 3008
- **Funcionalidades**: Faturamento, pagamentos, fluxo de caixa, relatórios
- **Arquivos**: `faturamento.tsx`, `pagamentos.tsx`, `fluxo-caixa.tsx`
- **Integração**: Reservas, CRM, relatórios

### 📊 **SISTEMA DE ANALYTICS**
- **Porta**: 3013
- **Funcionalidades**: Analytics, relatórios, dashboards, BI
- **Arquivos**: `analytics.tsx`, `relatorios-vendas.tsx`, `relatorios-financeiros.tsx`
- **Integração**: Todos os módulos

### 🎯 **CATÁLOGO DE PRODUTOS**
- **Porta**: 3009
- **Funcionalidades**: Produtos, viagens, parques, atrações
- **Arquivos**: `produtos.tsx`, `viagens.tsx`, `parques.tsx`, `atracoes.tsx`
- **Integração**: Reservas, marketing, analytics

---

## 🔗 INTEGRAÇÃO ENTRE SISTEMAS

### 🌐 **API Gateway Central**
- **Rota Principal**: `/api/v1/ecosystem/`
- **Autenticação**: JWT + OAuth2
- **Rate Limiting**: Por usuário e por módulo
- **Load Balancing**: Distribuição inteligente de carga

### 📡 **Comunicação Entre Módulos**
```typescript
interface EcosystemMessage {
  source: 'crm' | 'booking' | 'payment' | 'analytics';
  target: 'crm' | 'booking' | 'payment' | 'analytics';
  event: string;
  data: any;
  timestamp: string;
  correlationId: string;
}
```

---

## 🛠️ TECNOLOGIAS UTILIZADAS

### **Frontend**
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Recharts** - Gráficos e visualizações
- **React Hook Form** - Formulários
- **Zod** - Validação de dados

### **Backend**
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões
- **JWT** - Autenticação
- **Socket.io** - Comunicação em tempo real

### **Infraestrutura**
- **Docker** - Containerização
- **Nginx** - Proxy reverso
- **GitHub Actions** - CI/CD
- **Prometheus** - Monitoramento
- **Grafana** - Dashboards

---

## 📊 MONITORAMENTO E HEALTH CHECKS

### **Endpoints de Monitoramento**
- **Health Check**: `GET /health`
- **Status do Ecossistema**: `GET /api/v1/ecosystem/status`
- **Métricas**: `GET /metrics`
- **Logs**: `GET /api/v1/ecosystem/logs`

### **Métricas Monitoradas**
- ✅ Status dos módulos
- 📊 Performance das APIs
- 🔐 Segurança e autenticação
- 💾 Uso de recursos
- 🌐 Disponibilidade dos serviços

---

## 🔒 SEGURANÇA

### **Autenticação e Autorização**
- **JWT Tokens** com refresh automático
- **OAuth2** para integração com provedores externos
- **RBAC** (Role-Based Access Control)
- **Rate Limiting** por usuário e por módulo

### **Proteções Implementadas**
- **Helmet.js** para headers de segurança
- **CORS** configurado adequadamente
- **Validação de entrada** com Zod
- **Sanitização** de dados
- **Logs de auditoria** completos

---

## 📈 BENEFÍCIOS DO ECOSSISTEMA

- ✅ **Unificação**: Todos os sistemas em uma plataforma
- ✅ **Escalabilidade**: Arquitetura modular e escalável
- ✅ **Integração**: Comunicação fluida entre módulos
- ✅ **Inteligência**: IA integrada em todos os processos
- ✅ **Experiência**: Interface unificada para usuários
- ✅ **Manutenção**: Código organizado e modular
- ✅ **Performance**: Otimização global do sistema
- ✅ **Segurança**: Autenticação e autorização centralizadas

---

## 🚀 COMANDOS ÚTEIS

### **Desenvolvimento**
```bash
# Iniciar todo o ecossistema
node start-ecosystem.js

# Iniciar módulo específico
cd BUSINESS-MODULES/crm-system && npm run dev

# Build de produção
npm run build

# Testes
npm run test
npm run test:e2e
```

### **Monitoramento**
```bash
# Health check
curl http://localhost:3000/health

# Status do ecossistema
curl http://localhost:3000/api/v1/ecosystem/status

# Logs em tempo real
tail -f logs/ecosystem.log
```

---

## 📞 SUPORTE E CONTATO

### **Reservei Viagens**
- **Sede**: Rua RP5, Residencial Primavera 2, Caldas Novas, GO
- **Filial**: Av. Manoel José de Arruda, Porto, Cuiabá, MT
- **WhatsApp**: (64) 99319-7555, (64) 99306-8752, (65) 99235-1207, (65) 99204-8814
- **Telefone**: (65) 2127-0415
- **Email**: reservas@reserveiviagens.com.br
- **Website**: reserveiviagens.com.br
- **Horário**: Seg-Sex 8h-18h, Sáb 8h-12h

### **Redes Sociais**
- **Instagram**: @reserveiviagens
- **Facebook**: facebook.com/comercialreservei

---

## 📄 LICENÇA

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

*Desenvolvido com ❤️ pela equipe da Reservei Viagens*
