# PR 17 / PR-12b-ops — Cloudflare, WAF e mídia assinada

Checklist operacional (infra). O agente **não** altera conta Cloudflare, DNS nem secrets de produção.

**Relacionado:** Fase 0 `docs/evidence/pr-12-fase0/` · evidence ops `docs/evidence/pr-12b-ops/` · nginx HTTP/2 `PR-12a` (paralelo).

## Topologias

| Modo | Edge | Origin | `TRUST_PROXY` no backend |
|------|------|--------|---------------------------|
| **A (recomendado pós-12a)** | Cloudflare (laranja) | nginx VPS → Node | IP/CIDR do **nginx** (hop imediato visto pelo Node) |
| **B** | Cloudflare (laranja) | Node direto | CIDRs oficiais Cloudflare ([ips](https://www.cloudflare.com/ips/)) + `loopback` se aplicável |
| **C** | Só nginx (12a) | Node | `loopback` ou IP do nginx no docker/host |

Não misturar allowlist “adivinada”. Atualizar `TRUST_PROXY` **só** com hops reais; lista Cloudflare muda — consultar a página oficial no dia do cut-over (não versionar dump completo no repo).

## Edge (Cloudflare) — checklist owner

- [ ] 1. **Proxy laranja** no apex/`www` do `site-publico` e no host da API (`api.reserveiviagens.com.br` ou equivalente).
- [ ] 2. **SSL/TLS mode** Full (strict) se o origin tem cert válido; nunca Flexible em produção.
- [ ] 3. **WAF managed rules** (Core + OWASP ou equivalente do plano) em modo **log** primeiro; só depois challenge/block.
- [ ] 4. **Rate limiting no edge** em rotas públicas sensíveis (complementa `publicLimiter` Redis — **não** remove o limiter Node).
- [ ] 5. **Turnstile** — widget no wizard (`gerar-proposta`) e ações sensíveis; `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` já no produto.
- [ ] 6. **Geo** (opcional): bloquear países fora do BR em `/api/v1/cotacao-publica/*` se política comercial exigir.
- [ ] 7. Origin **não** exposto na internet sem CF (firewall VPS: só IPs Cloudflare → 443, se topologia A/B).

## WAF — paths de reserva (PARAR se falso positivo)

Antes de regras agressivas (block), validar em **log/challenge** que estes fluxos passam:

| Path / superfície | Motivo |
|-------------------|--------|
| `POST /api/bookings` (site-publico) | Criação de reserva |
| Cotação pública `/api/v1/cotacao-publica/*` · `/api/v1/p/*` | Wizard / proposta |
| Webhook Mercado Pago (rotas MP documentadas) | Confirmação pagamento |
| `/api/v1/payments/webhooks/*` | Stripe/MP |
| Guest portal `/api/portal/*` | Token de hóspede |

Se WAF bloquear reserva legítima → **PARAR**, afrouxar regra, re-testar (condição do spec PR-12).

## `TRUST_PROXY`

Já suportado em `backend/app.js` (allowlist CSV; default `loopback`). Compose: `TRUST_PROXY=${TRUST_PROXY:-loopback}`.

Exemplos (ilustrativos — **substituir** pelos hops reais):

```bash
# Topologia A — Node atrás do nginx local
TRUST_PROXY=loopback,10.0.0.0/8

# Topologia B — Node origin direto atrás do Cloudflare (colar CIDRs oficiais do dia)
TRUST_PROXY=loopback,173.245.48.0/20,...
```

Pós-cut-over: log de acesso deve mostrar **IP do cliente** (não só o IP do proxy). Header de resposta `cf-ray` presente no edge.

**Não** commitar valores de produção neste repositório.

## Variáveis de ambiente

| Variável | Onde | Uso |
|---|---|---|
| `TRUST_PROXY` | backend | Allowlist de proxies (PR-10c-infra-b) |
| `TURNSTILE_SECRET_KEY` | backend | `verificarTurnstile` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | site-publico | widget |
| `CORS_ORIGIN` | backend | lista separada por vírgula (ex.: `https://www.reserveiviagens.com.br,https://reserveiviagens.com.br`) |
| `OG_DEFAULT_IMAGE_URL` | backend | fallback OG 1200×630 |
| `MEDIA_SIGNING_SECRET` | backend/CDN | HMAC para signed URLs (ver abaixo) |

## Signed URLs de mídia (hero/vídeo) — 12d / futuro

Padrão recomendado para CDN (Cloudflare R2 ou bucket com Worker):

```
GET /media/roteiro/{assetId}?exp={unix}&sig={hmac_sha256}
```

- `sig = HMAC-SHA256(MEDIA_SIGNING_SECRET, assetId + exp)`
- Validade curta (15–60 min) para vídeos do `CinematicHero`.
- **Não** assinar assets estáticos públicos (logo, OG default).

Implementação futura: `server/lib/media-signed-url.ts` + Worker na borda (**fora** do escopo 12b-ops).

## Nomenclatura (§9.1.1)

- Coluna de expiração: **`valido_ate`** (não `expira_em`).
- Config: **`configuracoes_sistema`** chave `modulo_propostas`.
- Índice de apoio: **`idx_propostas_status_valido_ate`** (migration 0018/0019) — não recriar.

## Verificação pós-deploy (owner)

1. `curl -I https://<api-host>/health` (ou rota pública) → header **`cf-ray`** presente.
2. Log backend: `req.ip` ≠ IP genérico do proxy único sem allowlist correta.
3. 31 requisições/min na mesma rota sob `publicLimiter` → HTTP 429 (app).
4. Edge RL / WAF: disparo controlado em lab → 403/429 do CF **sem** quebrar paths da tabela acima.
5. `aceitar` sem `turnstileToken` em produção → HTTP 403.
6. Se topologia A: conf 12a já deployado (`nginx -t` / reload) **antes** de apontar DNS laranja.
