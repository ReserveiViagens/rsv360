# Módulo Agentes — RSV360

## Flags (fail-safe OFF)

Chave `configuracoes_sistema.chave = 'agentes'`:

| Campo | Default | Notas |
|-------|---------|--------|
| `agentes_modulo_ativo` | `false` | Gate do router `/api/v1/agentes` |
| `agente_instrutor_ativo` | `false` | Dupla flag com o módulo para o Instrutor |
| `modelo_t1` | `gpt-4o-mini` | Chat T1 |
| `modelo_embedding` | `text-embedding-3-small` | Embeddings 1536 |
| `rag_top_k` | `4` | Chunks RAG |

Sem `OPENAI_API_KEY` no ambiente: T0 continua; T1 responde 503 "Instrutor temporariamente indisponível". **Nunca** derruba o backend.

## Schema `langgraph` (checkpoint)

A migration `0039_agente_conhecimento` cria apenas:

```sql
CREATE SCHEMA IF NOT EXISTS langgraph;
```

As **tabelas** do `PostgresSaver` (`@langchain/langgraph-checkpoint-postgres`) são criadas em runtime por `checkpointer.setup()`, **fora** do journal Drizzle. Não versionar essas tabelas aqui.

## Ingestão de guias

```bash
# a partir da raiz do monorepo (docs/instrutor acessível)
node backend/scripts/agentes/ingerir-guias.mjs
```

Requer `OPENAI_API_KEY` e `DATABASE_URL` (Postgres com pgvector). Idempotente via UNIQUE `(agente, doc_slug, chunk_ordem, versao_base)`.

## Endpoint Instrutor

`POST /api/v1/agentes/instrutor/perguntar`

- Auth JWT obrigatória
- Rate limit 10/min/usuário
- Body: `{ pergunta: string(1..500), papel?: "staff"|"anfitriao"|"ambos" }`
- Dupla flag OFF → 404 `"Módulo agentes desligado"`

## UI Turismo (:3005) — F2c-3

Widget flutuante **Ajuda** em `apps/turismo/components/agentes/InstrutorHelpWidget.tsx` (montado em `pages/_app.tsx`).

`docker-compose.yml` (serviço `backend`) repassa `OPENAI_API_KEY` do host — **sem** valor no git. Após mudar o compose:

```bash
docker compose up -d --build backend
```
