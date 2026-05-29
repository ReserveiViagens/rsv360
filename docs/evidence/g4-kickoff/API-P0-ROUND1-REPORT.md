# API P0 — Rodada 1 (evidência)

**Branch de trabalho:** `chore/g4-api-p0-round1`  
**Executor:** smoke automatizado + curl  
**Referência:** `API-CONTRACT-MATRIX.md`

## Resumo executivo

| Métrica | Valor |
|---------|------:|
| Testes executados | 9 |
| OK | 6 |
| GAP | 2 |
| FAIL | 1 |
| SKIP | 1 (A8) |

## Veredito para validação

**Bloco G4-API: NOGO** (rodada 1)

Motivos objetivos:

1. **A3** — login retorna **500** em credencial inválida (deveria ser 4xx).
2. **A2** — `/health/security` **404** (gap de implementação/documentação).
3. **A6** — CMS pages **500**; compose não expõe `DATABASE_URL` ao `site-publico` (gap G4-ENV).

Rotas **backend** (`:3002`) de pagamentos e health principal: **OK**.

## Payloads mínimos usados

Ver cabeçalhos em cada `logs/A*.log`.

| ID | Payload resumido |
|----|------------------|
| A3 | `{"email":"g4-smoke@...","password":"invalid-password"}` |
| A4 | `{}` |
| A5p | `{}` |
| A6 | Header `Authorization: Bearer admin-token-123` |
| A7p | `{"enterpriseId":"ent_1","amount":1,"currency":"BRL","customerId":"cus_g4","paymentMethod":"pix"}` |

## Próximo passo

- PR `chore/g4-env-site-publico-database` (compose) + fix A2/A3, depois rodada 2.
- Healthcheck Docker permanece PR paralela (não bloqueia esta análise).
