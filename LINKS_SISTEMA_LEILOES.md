# 🔗 Links do Sistema de Leilões

**Data:** 2025-01-05

---

## 🌐 URLs de Acesso

### Base URL
**Dashboard Turismo:** http://localhost:3005

---

## 📋 Rotas do Sistema de Leilões

### 1. Lista de Leilões
**URL:** http://localhost:3005/dashboard/leiloes

**Descrição:**
- Lista todos os leilões disponíveis
- Filtros e paginação
- Cards com informações dos leilões
- Botão para criar novo leilão

**Funcionalidades:**
- Visualizar leilões ativos
- Filtrar por status, categoria, etc.
- Paginação
- Busca

---

### 2. Criar Novo Leilão
**URL:** http://localhost:3005/dashboard/leiloes/novo

**Descrição:**
- Formulário para criar um novo leilão
- Campos: título, descrição, valor inicial, data de início/fim, etc.

**Funcionalidades:**
- Criar leilão
- Configurar detalhes
- Definir regras e condições

---

### 3. Detalhes/Edição de Leilão
**URL:** http://localhost:3005/dashboard/leiloes/[id]

**Exemplo:**
- http://localhost:3005/dashboard/leiloes/123

**Descrição:**
- Visualizar detalhes completos do leilão
- Editar informações
- Ver histórico de lances
- Gerenciar leilão

**Funcionalidades:**
- Visualizar detalhes
- Editar leilão
- Ver lances
- Gerenciar status

---

### 4. Flash Deals
**URL:** http://localhost:3005/dashboard/leiloes/flash-deals

**Descrição:**
- Leilões com desconto especial
- Ofertas relâmpago
- Promoções temporárias

**Funcionalidades:**
- Visualizar flash deals ativos
- Criar flash deals
- Gerenciar ofertas especiais

---

### 5. Relatórios de Leilões
**URL:** http://localhost:3005/dashboard/leiloes/relatorios

**Descrição:**
- Relatórios e estatísticas dos leilões
- Análise de performance
- Métricas e gráficos

**Funcionalidades:**
- Visualizar relatórios
- Exportar dados
- Análise de performance
- Estatísticas

---

## 🗺️ Mapa de Navegação

```
Dashboard Principal
└── /dashboard/leiloes (Lista)
    ├── /dashboard/leiloes/novo (Criar)
    ├── /dashboard/leiloes/[id] (Detalhes/Editar)
    ├── /dashboard/leiloes/flash-deals (Flash Deals)
    └── /dashboard/leiloes/relatorios (Relatórios)
```

---

## 📝 Exemplos de Uso

### Acessar Lista de Leilões
```
http://localhost:3005/dashboard/leiloes
```

### Criar Novo Leilão
```
http://localhost:3005/dashboard/leiloes/novo
```

### Ver Leilão Específico (ID: 123)
```
http://localhost:3005/dashboard/leiloes/123
```

### Ver Flash Deals
```
http://localhost:3005/dashboard/leiloes/flash-deals
```

### Ver Relatórios
```
http://localhost:3005/dashboard/leiloes/relatorios
```

---

## 🔐 Autenticação

**Importante:** Todas as rotas são protegidas e requerem autenticação.

**Login:**
- URL: http://localhost:3005/login
- Credenciais demo: `demo@onionrsv.com` / `demo123`
- Credenciais admin: `admin@onionrsv.com` / `admin123`

---

## 🚀 Como Acessar

1. **Certifique-se de que o sistema está rodando:**
   ```powershell
   # Verificar se a porta 3005 está em uso
   Get-NetTCPConnection -LocalPort 3005
   ```

2. **Acesse o dashboard:**
   - http://localhost:3005/dashboard

3. **Navegue para leilões:**
   - http://localhost:3005/dashboard/leiloes

---

## 📊 Status das Páginas

- ✅ `/dashboard/leiloes` - **Implementada**
- ✅ `/dashboard/leiloes/novo` - **Implementada**
- ✅ `/dashboard/leiloes/[id]` - **Implementada**
- ✅ `/dashboard/leiloes/flash-deals` - **Implementada**
- ✅ `/dashboard/leiloes/relatorios` - **Implementada**

---

## 🔗 Links Rápidos

### Sistema de Leilões
- **Lista:** http://localhost:3005/dashboard/leiloes
- **Novo:** http://localhost:3005/dashboard/leiloes/novo
- **Flash Deals:** http://localhost:3005/dashboard/leiloes/flash-deals
- **Relatórios:** http://localhost:3005/dashboard/leiloes/relatorios

### Outros Módulos
- **Excursões:** http://localhost:3005/dashboard/excursoes
- **Viagens em Grupo:** http://localhost:3005/dashboard/viagens-grupo
- **Dashboard Principal:** http://localhost:3005/dashboard

---

**Última atualização:** 2025-01-05

