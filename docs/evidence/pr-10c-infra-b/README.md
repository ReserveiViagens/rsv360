# PR-10c-infra-b — HTU + trust proxy allowlist

**GO:** `GO 10c-infra-b @ main 5adf3d30`  
**Branch:** `security/pr-10c-infra-b`  
**Baseline:** `main @ 5adf3d30`

## Fase 0

Hipóteses avaliadas:

1. **H1 (confirmada):** `buildRequestHtu` priorizava `X-Forwarded-Proto` e `X-Forwarded-Host` recebidos diretamente.
2. **H2 (confirmada):** `app.set('trust proxy', 1)` confiava por contagem de hops, sem allowlist explícita.
3. **H3 (descartada nesta fatia):** base HTU canônica fixa exigiria configuração adicional por ambiente e alteraria o contrato atual.

Evidências:

- **D1:** o HTU era construído a partir de `req.get('x-forwarded-proto')` / `req.get('x-forwarded-host')`.
- **D2:** o Express estava configurado com `trust proxy = 1`.
- **D3:** não existia `TRUST_PROXY` no compose nem no exemplo local.

## Implementação

- `buildRequestHtu` usa `req.protocol` e `req.get('host')`, processados pelo Express.
- Headers `X-Forwarded-Proto` / `X-Forwarded-Host` não são mais lidos diretamente pelo serviço DPoP.
- `TRUST_PROXY` aceita allowlist CSV de nomes, IPs e CIDRs.
- Default seguro: `loopback`.
- Compose propaga `TRUST_PROXY` ao backend.

## Casos de teste

- Request com protocolo/host efetivos `https` + `api.reserveiviagens.com.br` e forwarded headers `http` + `attacker.example`: HTU permanece `https://api.reserveiviagens.com.br/api/v1/x`.
- Allowlist `loopback,::1,192.168.0.0/24` é convertida em três entradas aceitas pelo Express.
- Sem configuração, a allowlist é `['loopback']`.

## Risco e operação

Se produção tiver Cloudflare, nginx, ALB ou múltiplos proxies, os IPs/CIDRs reais devem ser configurados em `TRUST_PROXY` antes do cut-over de `AUTH_DPOP_ENABLED=true`. Allowlist incompleta faz o Express ignorar forwarded proto e pode causar mismatch de HTU; ela não passa a confiar no cliente.

## Fora de escopo

- `AUTH_REFRESH_COOKIE_DOMAIN` (10c-infra-c).
- Cut-over das flags.
- mTLS e CSP.

## Validação

- `npm run test --workspace=backend -- --testPathPattern=dpop.service.test.ts --runInBand --forceExit`: **16/16 PASS**
- `npx tsc -p backend/tsconfig.json --noEmit`: **PASS**
- `docker compose config --quiet`: **PASS**
- `npm run build`: **PASS**
- `npm run lint`: **FAIL preexistente de setup** — `Cannot find module 'next/dist/compiled/babel/eslint-parser'` nos apps Next.
- `npm run type-check`: **FAIL preexistente fora da fatia** — erros nos frontends; backend focado passou.
- `npm run test`: **767 PASS / 18 FAIL preexistentes** (wishlist, Fase 1 CRUD, pagamentos, fornecedores, guest portal e import vazio); Jest manteve handle aberto após o resumo.

PARAR na URL. CodeQL verde e H0 humano obrigatórios. O agente não mergeia.
