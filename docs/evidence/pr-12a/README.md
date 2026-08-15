# PR-12a — nginx HTTP/2 Rapid Reset hardening

**GO:** `GO 12a @ main 9403c2a16b18c8b654027111ab2156576f4b9213`  
**Branch:** `security/pr-12a-nginx-http2`  
**Baseline:** pós Fase 0 (#240) — terminador TLS/HTTP2 = **nginx** (owner)

## Escopo

| Arquivo | Mudança |
|---------|---------|
| `docker/nginx/nginx.conf` | `http2_max_concurrent_streams 128`; `limit_conn_zone` + `limit_conn perip 32`; comment `keepalive_requests 100` + versão mínima |
| `docker/nginx/nginx.test.conf` | Espelho das diretivas `http{}` / `limit_conn` |
| `docker/nginx/pr12a-http2-hardening.test.cjs` | Assert estático das pins |

## OUT

- 12b Cloudflare / PR17
- 12c flood test em staging
- 12d MadeYouReset / CDN mídia
- Alterar app Node / Turnstile / `publicLimiter`

## Validação

```bash
node --test docker/nginx/pr12a-http2-hardening.test.cjs
# Na VPS (após sync do conf):
nginx -t && nginx -s reload
```

Resultado local: **2 passed**.

## Risco

- Blast: só conf nginx (prod template + test).
- `limit_conn perip 32` pode 503 clientes atrás de NAT gigante — tunar se necessário; booking path não muda no app.
- Conf in-repo precisa ser **deployado** na VPS para ter efeito.

## Rollback

Revert squash · ou restaurar conf anterior na VPS + `nginx -s reload`.
