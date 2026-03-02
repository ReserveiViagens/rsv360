# Conexão pgAdmin 4 - Banco rsv360

## Configuração correta (evita "connection timeout")

O backend usa **porta 5432** (padrão do PostgreSQL). Use a mesma porta no pgAdmin.

| Campo | Valor |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `rsv360` |
| **Username** | `postgres` |
| **Password** | `290491Bb` |

---

## Se der "connection timeout" na 5432

1. **Verifique se o PostgreSQL está rodando:**
   ```powershell
   .\scripts\verificar-iniciar-postgresql.ps1
   ```

2. **O script testa 5432 e 5433** – use a porta que aparecer como "Conexão estabelecida".

3. **Se o PostgreSQL estiver na 5433** (instalação customizada):
   - Use Port `5433` no pgAdmin
   - Atualize o `backend\.env`: `DB_PORT=5433`

---

## Alterar porta no pgAdmin (conexão existente)

1. Clique com botão direito no servidor → **Properties**
2. Aba **Connection** → altere **Port** para `5432` (ou `5433` se for o seu caso)
3. Salve

---

## Iniciar PostgreSQL (se parado)

Execute como **Administrador**:
```powershell
Start-Service -Name "postgresql-x64-18"
```

Ou use o script:
```powershell
.\scripts\verificar-iniciar-postgresql.ps1
```
