# PR 17 — Cloudflare, WAF e mídia assinada

Checklist operacional (infra; não exige deploy de código além do `trust proxy` + Turnstile secret).

## Edge (Cloudflare)

1. **Proxy laranja** no domínio do `site-publico` e API (`api.reserveiviagens.com.br` ou equivalente).
2. **WAF managed rules** + rate limiting no edge como camada extra (o `publicLimiter` Redis no Node continua obrigatório).
3. **Turnstile** — widget no wizard (`gerar-proposta`) e ações sensíveis; secret em `TURNSTILE_SECRET_KEY` no backend.
4. **Geo** (opcional): bloquear países fora do BR em rotas `/api/v1/cotacao-publica/*` se política comercial exigir.

## Variáveis de ambiente

| Variável | Onde | Uso |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | backend | `verificarTurnstile` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | site-publico | widget |
| `CORS_ORIGIN` | backend | lista separada por vírgula (ex.: `https://www.reserveiviagens.com.br,https://reserveiviagens.com.br`) |
| `OG_DEFAULT_IMAGE_URL` | backend | fallback OG 1200×630 |
| `MEDIA_SIGNING_SECRET` | backend/CDN | HMAC para signed URLs (ver abaixo) |

## Signed URLs de mídia (hero/vídeo)

Padrão recomendado para CDN (Cloudflare R2 ou bucket com Worker):

```
GET /media/roteiro/{assetId}?exp={unix}&sig={hmac_sha256}
```

- `sig = HMAC-SHA256(MEDIA_SIGNING_SECRET, assetId + exp)`
- Validade curta (15–60 min) para vídeos do `CinematicHero`.
- **Não** assinar assets estáticos públicos (logo, OG default).

Implementação futura: `server/lib/media-signed-url.ts` + Worker na borda.

## Nomenclatura (§9.1.1)

- Coluna de expiração: **`valido_ate`** (não `expira_em`).
- Config: **`configuracoes_sistema`** chave `modulo_propostas`.
- Índice de apoio: **`idx_propostas_status_valido_ate`** (migration 0018/0019) — não recriar.

## Verificação pós-deploy

- `curl -I` na API atrás do Cloudflare → header `cf-ray` presente; `req.ip` no log ≠ IP do proxy.
- 31 requisições/min na mesma rota pública → HTTP 429.
- `aceitar` sem `turnstileToken` em produção → HTTP 403.
