# 📋 Guia para Executar Script SQL de Logs

## ⚠️ Importante

O script SQL `scripts/create-logs-table.sql` precisa ser executado manualmente com as credenciais corretas do banco de dados.

## 🔧 Opções de Execução

### Opção 1: Via psql (Recomendado)

```bash
# Windows (PowerShell)
psql -U seu_usuario -d seu_banco -f scripts/create-logs-table.sql

# Linux/Mac
psql -U seu_usuario -d seu_banco -f scripts/create-logs-table.sql
```

### Opção 2: Via pgAdmin ou DBeaver

1. Abra o pgAdmin ou DBeaver
2. Conecte-se ao banco de dados
3. Abra o arquivo `scripts/create-logs-table.sql`
4. Execute o script

### Opção 3: Via Node.js (com .env configurado)

1. Configure as variáveis no `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=seu_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

2. Execute:
```bash
node scripts/run-create-logs-table.js
```

## 📝 Conteúdo do Script

O script cria:
- Tabela `application_logs` para armazenar logs
- Índices para performance
- Comentários descritivos

## ✅ Verificação

Após executar, verifique se a tabela foi criada:

```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'application_logs';
```

## 🔗 Próximos Passos

Após criar a tabela, o sistema de logging estará completamente funcional e começará a salvar logs automaticamente.

