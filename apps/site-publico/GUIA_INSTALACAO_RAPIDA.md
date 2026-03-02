# 🚀 GUIA DE INSTALAÇÃO RÁPIDA

## ✅ PASSO 1: Configurar Variáveis de Ambiente

O arquivo `.env.local` já foi criado com as configurações padrão. Se precisar ajustar, edite o arquivo:

```
D:\servidor RSV\Hotel-com-melhor-preco-main\.env.local
```

**Configurações padrão:**
- DB_HOST=localhost
- DB_PORT=5432
- DB_NAME=onboarding_rsv_db
- DB_USER=onboarding_rsv
- DB_PASSWORD=senha_segura_123

---

## ✅ PASSO 2: Executar Script SQL

### Opção A: Via pgAdmin (Recomendado)

1. Abra o **pgAdmin**
2. Conecte ao servidor PostgreSQL
3. Selecione o banco de dados: `onboarding_rsv_db`
4. Clique com botão direito → **Query Tool** (Ferramenta de Consulta)
5. Abra o arquivo: `scripts\create-bookings-table.sql`
6. Cole todo o conteúdo no Query Tool
7. Execute (F5 ou botão ▶️)

### Opção B: Via PowerShell (se psql estiver instalado)

```powershell
cd "D:\servidor RSV\Hotel-com-melhor-preco-main\scripts"
$env:PGPASSWORD="senha_segura_123"
psql -h localhost -p 5432 -U onboarding_rsv -d onboarding_rsv_db -f create-bookings-table.sql
```

### Opção C: Via linha de comando psql

```bash
psql -h localhost -p 5432 -U onboarding_rsv -d onboarding_rsv_db -f "D:\servidor RSV\Hotel-com-melhor-preco-main\scripts\create-bookings-table.sql"
```

---

## ✅ PASSO 3: Verificar Instalação

Execute no pgAdmin ou psql:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bookings', 'payments', 'users')
ORDER BY table_name;
```

**Resultado esperado:**
```
 table_name 
------------
 bookings
 payments
 users
(3 rows)
```

---

## ✅ PASSO 4: Testar o Sistema

1. **Inicie o servidor Next.js:**
   ```powershell
   cd "D:\servidor RSV\Hotel-com-melhor-preco-main"
   npm run dev
   ```

2. **Acesse no navegador:**
   - http://localhost:3000

3. **Teste o fluxo completo:**
   - Buscar hotéis em `/buscar` ou `/hoteis`
   - Clicar em "Ver Detalhes"
   - Selecionar datas e hóspedes
   - Clicar em "Reservar"
   - Preencher dados e escolher pagamento
   - Confirmar reserva
   - Ver QR Code PIX (se escolheu PIX)
   - Verificar em "Minhas Reservas"

---

## 🔧 TROUBLESHOOTING

### Erro: "database does not exist"
- Verifique se o banco `onboarding_rsv_db` existe
- Crie o banco se necessário:
  ```sql
  CREATE DATABASE onboarding_rsv_db;
  ```

### Erro: "permission denied"
- Verifique se o usuário `onboarding_rsv` tem permissões
- Ou use um usuário com permissões (ex: `postgres`)

### Erro: "connection refused"
- Verifique se o PostgreSQL está rodando
- Verifique a porta (padrão: 5432)
- Verifique o firewall

### Erro ao criar reserva
- Verifique se as tabelas foram criadas corretamente
- Verifique os logs do console do Next.js
- Verifique as variáveis de ambiente no `.env.local`

---

## 📝 PRÓXIMOS PASSOS

Após a instalação bem-sucedida:

1. ✅ Configure credenciais reais do Mercado Pago (se usar pagamentos reais)
2. ✅ Gere uma chave JWT segura para produção
3. ✅ Configure backup do banco de dados
4. ✅ Configure monitoramento e logs

---

## ✨ PRONTO!

Se todas as etapas foram concluídas com sucesso, o sistema está funcionando! 🎉

