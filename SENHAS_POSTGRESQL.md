# 🔐 Senhas do PostgreSQL – Padronizadas

**Senha única para todo o sistema:** `290491Bb`

---

## Configuração Padronizada

Todos os arquivos de configuração e scripts usam a mesma senha:

- **Usuário:** `postgres`
- **Senha:** `290491Bb`

---

## Arquivos Atualizados

| Arquivo | Configuração |
|---------|--------------|
| `backend/.env` | `DB_PASSWORD=290491Bb` |
| `.env` (raiz) | `DB_PASSWORD=290491Bb` |
| `apps/site-publico/.env.local` | `DB_PASSWORD=290491Bb` |
| `scripts/verificar-iniciar-postgresql.ps1` | `$env:PGPASSWORD = "290491Bb"` |
| `scripts/executar-migration-website-content.ps1` | `$DB_PASSWORD = "290491Bb"` |
| Scripts de migração e análise | Senha padronizada |

---

## Como Conectar

### Via pgAdmin 4

1. **Host:** `localhost`
2. **Port:** `5432` (padrão – igual ao backend)
3. **Database:** `rsv360`
4. **Username:** `postgres`
5. **Password:** `290491Bb`

> Se der "connection timeout", use porta 5432. Execute `.\scripts\verificar-iniciar-postgresql.ps1` para ver qual porta está ativa.

### Via psql (Linha de Comando)

```powershell
$env:PGPASSWORD = "290491Bb"
psql -U postgres -d rsv360 -p 5432
```

---

## Docker (se utilizado)

Se você usa o container Docker `postgres-rsv360`, defina a senha para `290491Bb`:

```sql
ALTER USER postgres PASSWORD '290491Bb';
```

Execute dentro do container:

```powershell
docker exec -it postgres-rsv360 psql -U postgres -c "ALTER USER postgres PASSWORD '290491Bb';"
```
