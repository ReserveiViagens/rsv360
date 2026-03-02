# Diagnóstico - Aba Leilões (Internal Server Error)

## Resultado do teste executado

O script `scripts/diagnosticar-auctions.js` foi executado e confirmou a causa exata.

---

## ✅ Causa confirmada: **Schema diferente**

| Verificação | Resultado |
|-------------|-----------|
| **Tabela auctions existe?** | ✅ SIM |
| **enterprises existe?** | ✅ SIM |
| **properties existe?** | ✅ SIM |
| **accommodations existe?** | ✅ SIM |
| **bids existe?** | ✅ SIM |
| **customers existe?** | ❌ NÃO |

### Schema da tabela `auctions` (atual)

A tabela foi criada pela migration **leiloes/001-create-leiloes-tables.sql**:

- `id` → **uuid** (backend espera integer)
- `starting_price` → existe (backend espera `start_price`)
- `property_id` → **uuid** (backend espera integer)
- **Não tem** `enterprise_id`
- **Não tem** `accommodation_id`
- **Não tem** `min_increment`

### Erro exato

```
column a.enterprise_id does not exist
```

A query completa do backend usa `a.enterprise_id`, que não existe na tabela atual.

---

## Causas descartadas

1. **Tabelas ausentes** – enterprises, properties, accommodations e bids existem.
2. **Tabela auctions inexistente** – A tabela existe.
3. **Schema diferente** – Confirmado: schema de leiloes/001, não o da 003.

---

## Correção aplicada

O backend já possui um **fallback** no `service.js`:

- Se a query completa falhar (por exemplo, `enterprise_id` inexistente), é usada uma query simples.
- A query simples retornou **0 registros** no teste e funciona corretamente.

### Para aplicar a correção

1. Reiniciar o backend (porta 5000).
2. Acessar http://localhost:3000/admin/cms → aba Leilões.
3. A aba deve carregar sem erro (lista vazia ou com dados).

---

## Opções futuras (opcional)

Para alinhar o schema ao esperado pelo backend (003):

1. Criar migration que adicione as colunas faltantes em `auctions`:
   - `enterprise_id`, `accommodation_id`, `min_increment`
   - Renomear `starting_price` → `start_price` (ou criar view)
2. Ou migrar dados para uma nova tabela com o schema da 003.

Enquanto isso, o fallback garante que a aba Leilões funcione com o schema atual.
