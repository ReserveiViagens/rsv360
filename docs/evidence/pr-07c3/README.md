# PR-07c3 — Schemas PARCIAL → `.strict()` + I4 webhook Zod + helpers shared

**Branch:** `security/pr-07c3-parcial-webhook-helpers`  
**Base:** `main @ 00eee234`  
**Estado:** PARAR na URL (H0)

## Fase 0.5

| Frente | Item | Handlers / ação |
| --- | --- | --- |
| A | `gerarPropostaBodySchema` passthrough→strict | 1 (cotacao-publica) |
| A | `roteiroAnalytics*` | 1 batch |
| A | `comissoes*` (6 schemas) | ~6 HTTP writes/queries |
| A | `fornecedores-hub` oferta*/config | schemas (adapter + config HTTP) |
| A | `agentes` perguntar inline | 1 |
| A | **pricing*** | **SKIP** — módulo não montado (`PARCIAL_OR_DEAD`) |
| B | Stripe + MP pós-HMAC | 2 |
| C | `badRequest` → `server/lib/bad-request.ts` | 16 rotas |
| C | `parsePositiveIntId` → `server/lib/parse-id.ts` | 4 schemas re-export |
| **Total handlers schema/webhook** | | **~11 ≤ 20** |

Arquivos tocados >20 (helpers mecânicos em rotas 07b/c1/c2) — escopo do GO Frente C; handlers ≤20.

## SKIPs

- `server/modules/pricing/**` — não registrado em `backend/app.js`
- DELETE / seed sem body — intocados nesta fatia

## Diff (resumo)

- `server/lib/bad-request.ts` · `server/lib/parse-id.ts`
- PARCIAL → `.strict()` nos schemas listados
- `webhook-payload.schema.ts` + parse em `WebhookService` pós-HMAC
- Suite `pr07c3-zod-parcial-webhook.test.ts`
