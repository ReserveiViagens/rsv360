# PR-11d — G6 hard-hold at proposal acceptance (no DDL)

**Branch:** `security/pr-11d-g6-hold`  
**Baseline:** `28a77241` (pós-11e)

## Fase 0 / causa-raiz

- **D1:** `respondPublic('accept')` executava `assertDisponibilidadeReserva` e
  `marcarDiariasReservadas` em operações separadas, antes de atualizar a proposta.
- **D2:** `marcarDiariasReservadas` fazia `SELECT` e depois `INSERT|UPDATE` por noite.
  Dois aceites concorrentes podiam observar ausência e ambos prosseguir.
- **D3:** `disponibilidade_acomodacao` já possui `UNIQUE(acomodacao_id, data)`
  (`backend/drizzle/0024_disponibilidade_acomodacao.sql`), mas linhas ausentes não
  podem ser protegidas com `FOR UPDATE`.
- **D4:** proposta `accepted` é o registro canônico e as noites são materializadas
  nessa tabela no aceite (`docs/cotacao/MODULO-RESERVAS-CALENDARIO.md`).

## Hipóteses avaliadas

1. **Advisory xact lock por unidade+noite + upsert condicional + CAS da proposta na
   mesma transação** — escolhida; sem DDL, lock granular e rollback integral.
2. `FOR UPDATE` nas linhas do calendário — descartada: não protege noites sem linha.
3. `SERIALIZABLE` global no aceite — descartada: retries e blast radius maiores.
4. Soft-hold geração→expiração — fora deste GO: exige identidade/expiração/cleanup
   persistidos e migration dedicada.

## Modelo implementado

- Hard-hold adquirido **no aceite**, não na geração da proposta.
- `pg_advisory_xact_lock(hashtextextended(key, 0))` para cada noite, em ordem.
- `INSERT ... ON CONFLICT ... DO UPDATE ... WHERE disponivel = true RETURNING`.
- Qualquer noite indisponível retorna conflito 409 e desfaz todas as noites.
- `propostas.status = accepted` usa CAS (`id + status observado`) dentro da mesma
  transação; falha do CAS também desfaz o hold.
- Side-effects (métrica, fila, chat e eventos) permanecem após commit.

## Blast radius

- Produção: hook de disponibilidade + aceite público de proposta.
- Sem DDL, pricing, pagamento, cupom, DPoP, CSP ou rate limit.
- Locks não são globais: datas/unidades diferentes não se bloqueiam.

## Test plan

```bash
npm run test --workspace=backend -- --testPathPattern="disponibilidade-reserva.hook.test.ts|proposta-validade-hardening.test.ts"
npx tsc --noEmit -p backend/tsconfig.json
```

- dois aceites concorrentes na mesma noite → um vence, um 409;
- unidades diferentes → ambos vencem;
- conflito numa noite → rollback das noites já claimed;
- CAS da proposta falha → rollback do hard-hold.

### Validação executada

| Comando | Resultado |
|---------|-----------|
| Backend focused tests (17) | PASS |
| `tsc --noEmit -p backend/tsconfig.json` | PASS |
| `npm run build` | PASS |
| `npm run lint` | FAIL pré-existente (`eslint-config-next` missing parser) |
| `npm run type-check` | FAIL pré-existente em apps UI fora do escopo |
| `npm run test` monorepo | FAIL pré-existentes (wishlist mocks / integration 401-503) |

## OUT

- Soft-hold geração→expiração (requer decisão + migration dedicada).
- PR-10c cut-over, PR-16d CSP enforce e demais filas permanecem fora.
