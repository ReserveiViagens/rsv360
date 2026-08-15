# Fase 0 — PR-12 DDoS L7 (HTTP/2) + WAF/CDN (PARAR)

**Base:** `main @ 04c2415a22b27d553ce6cb2b57ef2796ac1ddc60` (pós-H4 / #239)  
**Branch:** `security/pr-12-fase0`  
**Modo:** read-only · **zero** runtime / WAF / edge nesta fatia  
**Spec canônico:** PR-12 — patch HTTP/2 (Rapid Reset CVE-2023-44487, MadeYouReset CVE-2025-8671), WAF/CDN L7, limitar streams/reset (F4)

## Veredito

**PARAR** — inventário completo no repo; implementação de WAF/CDN e teste de flood **dependem de edge/VPS real** (fora do monorepo). Primeira fatia de código possível no repo = **12a (nginx hardening)**, só após owner confirmar o path de terminação TLS/HTTP2 em produção.

## 1. Superfícies HTTP/2 (repo)

| Camada | Estado | Evidência |
|--------|--------|-----------|
| **Node backend** | **HTTP/1.1 only** | `backend/server.js` → `http.createServer(app)` — sem `http2` / `createSecureServer` |
| **Next apps (compose prod)** | Portas app diretas | `docker-compose.prod.yml`: `backend`, `site-publico`, `turismo`, `admin`, `guest` — **sem serviço nginx** |
| **Nginx in-repo** | **HTTP/2 ON** no conf de referência | `docker/nginx/nginx.conf:110` → `listen 443 ssl http2;` |
| **Upstream nginx→app** | HTTP/1.1 | `proxy_http_version 1.1` em `/`, `/api/`, `/socket.io/` |
| **npm `http2-wrapper`** | Transitivo **cliente** | `package-lock.json` — não expõe servidor HTTP/2 |
| **K8s ingress (legado)** | nginx-ingress annotations | `apps/site-publico/k8s/ingress.yaml` — sem tuning HTTP/2/WAF no manifesto |

**Implicação Rapid Reset:** o vetor clássico atinge o **terminador HTTP/2** (nginx/edge), não o Express. Se produção for Node/Next sem proxy HTTP/2, o CVE de stream-reset **não se aplica** nessa hop; se houver nginx/CF na frente, o risco está **fora do processo Node**.

## 2. Mitigações já presentes (app ≠ WAF)

| Controle | Onde | Papel vs PR-12 |
|----------|------|----------------|
| `publicLimiter` + Redis fail-closed | Express / guest-portal / cotação | L7 app-rate — **não** substitui WAF |
| Route quotas PR-06b / login Turnstile PR-06c | Next + Express | Anti-abuso produto |
| `limit_req` zones (api / frontend / login) | `docker/nginx/nginx.conf` | Edge **só se** esse conf estiver deployado |
| `keepalive_requests 100` | nginx conf | Mais restritivo que default 1000 (ajuda Rapid Reset) |
| `http2_max_concurrent_streams` | **Ausente** (default nginx ~128) | Não pinado / não documentado |
| `limit_conn` | **Ausente** | Gap vs guidance F5/nginx Rapid Reset |
| Cloudflare WAF / orange-cloud | **Só checklist** | `docs/security/PR17-CLOUDFLARE.md` — sem Terraform/IaC no repo |
| Turnstile | Cotação / chat / login | Bot challenge — **não** DDoS volumetric |
| `TRUST_PROXY` allowlist | `backend/app.js` + compose | Pronto para CF/nginx; default `loopback` |

## 3. Gaps (ordenados)

1. **Path de produção desconhecido no repo** — compose prod sem nginx; `docker/nginx/` sem Dockerfile/image pin; owner precisa declarar: CF / nginx VPS / bare Node.
2. **Sem WAF managed rules / bot score no edge** — PR17 e `BLOCO-11-SecurityShield360` são aspiracionais.
3. **Sem teste de flood de reset** (spec PR-12) — exige staging + ferramenta; não fazível só com Jest.
4. **MadeYouReset (CVE-2025-8671)** — mitigação tipicamente em CDN/proxy atualizado; sem inventário de versão do proxy de produção.
5. **CDN de mídia assinada** — PR17 descreve R2/Worker; `MEDIA_SIGNING_SECRET` / Worker **não implementados** no código.

## 4. Hipóteses (Fase 0)

| ID | Hipótese | Status |
|----|----------|--------|
| H1 | Node expõe HTTP/2 e é alvo direto de Rapid Reset | **Descartada** (`http.createServer`) |
| H2 | Conf nginx in-repo habilita HTTP/2 e é o template de risco se deployado | **Confirmada** |
| H3 | Compose prod já termina TLS/HTTP2 via nginx do monorepo | **Descartada** (sem service nginx) |
| H4 | Cloudflare WAF já está codificado/IaC no repo | **Descartada** (docs only) |
| H5 | App rate limits cobrem o escopo PR-12 | **Parcial** — reduzem abuso; **não** cobrem DDoS L7 HTTP/2 |

## 5. Sub-fatiamento proposto (Decisor)

| Fatia | Escopo | Pré-condição | Tipo |
|-------|--------|--------------|------|
| **12-fase0** | Este inventário | — | Docs (esta PR) |
| **12a** | Nginx: pin `http2_max_concurrent_streams`, `limit_conn`, alinhar `keepalive_requests`, comentar versão mínima; espelhar em `nginx.test.conf` | Owner confirma que `docker/nginx/nginx.conf` (ou equivalente VPS) **é** o terminador HTTP/2 | Config ≤5 arquivos |
| **12b** | Cloudflare: proxy laranja + WAF managed + edge RL + validar `cf-ray` / `TRUST_PROXY` CIDRs | Conta CF + DNS + VPS | **Ops owner** (PR17) — pouco/nenhum código app |
| **12c** | Evidence de flood reset mitigado (staging) | 12a ou 12b no ar | Ops + relatório |
| **12d** | MadeYouReset / CDN mídia assinada | Edge stack confirmado | Condicional |

**OUT desta Fase 0:** alterar nginx, ligar Cloudflare, flood test, 04b, 16d, 10c-infra-c.

## 6. Condição de PARAR do spec (runtime)

> WAF gerar falso positivo em fluxo de reserva → parar e tunar regra.

Só aplicável após **12b**; registrar allowlist de paths (`/api/bookings`, cotação, webhook MP) antes de regras agressivas.

## 7. Próximo GO recomendado

Após merge H0 desta Fase 0:

```text
GO 12a @ main <tip>   # se nginx VPS/conf in-repo é o terminador HTTP/2
```

ou

```text
GO 12b-ops @ owner    # se Cloudflare já (ou será) o edge — checklist PR17, sem PR de app
```

Sem confirmação do path de edge → **não** emitir GO de implementação.
