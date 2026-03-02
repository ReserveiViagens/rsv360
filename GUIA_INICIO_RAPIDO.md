# 🚀 GUIA DE INÍCIO RÁPIDO - RSV360 Modular Monolith

**Data:** 2025-12-30  
**Status:** ✅ Sistema Configurado e Pronto

---

## ✅ INSTALAÇÃO CONCLUÍDA

As dependências foram instaladas com sucesso! O sistema está pronto para desenvolvimento.

---

## 🎯 PRÓXIMOS PASSOS

### **1. Configurar Banco de Dados** (Opcional)

Se você ainda não configurou o banco de dados:

1. **Criar banco PostgreSQL:**
```sql
CREATE DATABASE rsv360;
```

2. **Configurar variáveis de ambiente:**
Crie um arquivo `.env` no diretório `backend/`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rsv360
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

3. **Executar migrations:**
```bash
cd backend
npm run migrate
```

Ou execute as migrations SQL manualmente:
- `database/migrations/leiloes/001-create-leiloes-tables.sql`
- `database/migrations/excursoes/001-create-excursoes-tables.sql`
- `database/migrations/viagens-grupo/001-create-viagens-grupo-tables.sql`
- `database/migrations/atendimento-ia/001-create-atendimento-ia-tables.sql`

---

### **2. Iniciar Desenvolvimento**

#### **Opção A: Todos os Serviços**
```bash
npm run dev
```

Isso iniciará:
- ✅ Dashboard de Turismo (porta 3005)
- ✅ Site Público + CRM (porta 3000)
- ✅ Backend API (porta 5000)

#### **Opção B: Serviços Individuais**

**Apenas Dashboard de Turismo:**
```bash
npm run dev:turismo
```
Acesse: http://localhost:3005/dashboard

**Apenas Site Público:**
```bash
npm run dev:site
```
Acesse: http://localhost:3000/

**Apenas Backend:**
```bash
npm run dev:backend
```
API disponível em: http://localhost:5000

---

## 🌐 URLs de Acesso

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Dashboard Principal | http://localhost:3005/dashboard | Dashboard completo |
| Módulos de Turismo | http://localhost:3005/dashboard/modulos-turismo | Leilões, Excursões, Viagens em Grupo |
| Site Público | http://localhost:3000/ | Site público |
| CMS Admin | http://localhost:3000/admin/cms | Painel administrativo |
| Backend API | http://localhost:5000 | API REST |

---

## 📦 Módulos Disponíveis

### **1. Leilões e Flash Deals**
- **Rota:** `/dashboard/modulos-turismo` (tab Leilões)
- **Componente:** `apps/turismo/src/components/leiloes/LeiloesDashboard.tsx`
- **API:** `backend/src/api/v1/leiloes/`
- **Migration:** `database/migrations/leiloes/001-create-leiloes-tables.sql`

### **2. Excursões**
- **Rota:** `/dashboard/modulos-turismo` (tab Excursões)
- **Componente:** `apps/turismo/src/components/excursoes/ExcursoesDashboard.tsx`
- **API:** `backend/src/api/v1/excursoes/`
- **Migration:** `database/migrations/excursoes/001-create-excursoes-tables.sql`

### **3. Viagens em Grupo**
- **Rota:** `/dashboard/modulos-turismo` (tab Viagens em Grupo)
- **Componente:** `apps/turismo/src/components/viagens-grupo/ViagensGrupoDashboard.tsx`
- **API:** `backend/src/api/v1/viagens-grupo/`
- **Migration:** `database/migrations/viagens-grupo/001-create-viagens-grupo-tables.sql`

### **4. Atendimento IA**
- **Estrutura:** `apps/atendimento-ia/`
- **API:** `backend/src/api/v1/atendimento/`
- **Migration:** `database/migrations/atendimento-ia/001-create-atendimento-ia-tables.sql`

---

## 🔧 Scripts Disponíveis

### **Desenvolvimento**
```bash
npm run dev              # Todos os serviços
npm run dev:turismo      # Apenas dashboard
npm run dev:site         # Apenas site público
npm run dev:backend      # Apenas backend
npm run dev:atendimento  # Apenas atendimento IA
```

### **Build**
```bash
npm run build            # Build de todos os workspaces
npm run build:turismo    # Build do dashboard
npm run build:site       # Build do site
npm run build:backend    # Build do backend
```

### **Banco de Dados**
```bash
npm run migrate          # Executar migrations
npm run migrate:rollback # Reverter migrations
npm run seed            # Popular banco com dados
```

### **Outros**
```bash
npm run lint            # Lint em todos os workspaces
npm run test            # Testes em todos os workspaces
npm run type-check      # Verificação de tipos TypeScript
```

---

## 🐛 Solução de Problemas

### **Erro: Porta já em uso**
Se uma porta estiver em uso, você pode:
1. Parar o processo que está usando a porta
2. Alterar a porta no `package.json` ou `next.config.js`

### **Erro: Dependências não encontradas**
```bash
# Reinstalar dependências
npm install
npm install --workspaces
```

### **Erro: Banco de dados não conecta**
1. Verifique se o PostgreSQL está rodando
2. Verifique as variáveis de ambiente no `.env`
3. Teste a conexão manualmente

---

## 📚 Documentação Adicional

- **README.md** - Documentação completa do projeto
- **RELATORIO_CONFIGURACAO_FINAL.md** - Relatório de configuração
- **RELATORIO_CLONAGEM_FINAL.md** - Relatório de clonagem

---

## ✅ Status Atual

- ✅ Dependências instaladas
- ✅ Workspaces configurados
- ✅ Módulos criados e integrados
- ✅ Componentes de dashboard criados
- ✅ Migrations SQL prontas
- ✅ Scripts de desenvolvimento configurados

**Sistema pronto para desenvolvimento!** 🎉

---

**Última Atualização:** 2025-12-30

