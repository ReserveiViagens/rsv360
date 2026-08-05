# PR-10c-infra — infraestrutura de confiança DPoP + refresh cookie

**GO:** `GO 10c-infra @ main ebc53e60`  
**Branch local:** `security/pr-10c-infra`  
**Flags:** `AUTH_DPOP_ENABLED=false` e `AUTH_REFRESH_COOKIE_REQUIRED=false` por default.

## Fase 0 — hipóteses

1. **H1 (confirmada):** o `Map` local de JTI permite replay em outra réplica.
2. **H2 (confirmada):** `buildRequestHtu` consumia `X-Forwarded-Proto/Host` diretamente.
3. **H3 (confirmada):** `trust proxy = 1` aceitava o primeiro hop sem allowlist explícita.
4. **H4 (confirmada):** o refresh cookie não tinha `Domain`, impedindo transporte entre subdomínios.
5. **H5 (descartada):** `SameSite=None` não é necessário para subdomínios sob o mesmo site; `Lax` preserva retornos top-level OAuth/MP.

## Evidências

- **D1:** `backend/src/api/v1/auth/dpop.service.js` continha `const jtiCache = new Map()`.
- **D2:** o HTU priorizava `req.get('x-forwarded-proto')` e `req.get('x-forwarded-host')`.
- **D3:** `backend/app.js` continha `app.set('trust proxy', 1)`.
- **D4:** `getRefreshTokenCookieOptions` não retornava `domain`.
- **D5:** `backend/package.json` já contém `ioredis` e produção já exige `REDIS_URL`.

## Implementação

- JTI consumido atomicamente no Redis com `SET dpop:jti:<sha256(jti)> 1 PX 90000 NX`.
- Duas instâncias que compartilham Redis rejeitam o segundo consumo.
- Redis ausente/indisponível retorna `dpop_jti_store_unavailable`; com DPoP habilitado, o middleware rejeita a requisição (fail-closed).
- HTU usa somente `req.protocol` e `Host` processados pelo Express.
- `TRUST_PROXY` é uma allowlist CSV; default seguro: `loopback`.
- `AUTH_REFRESH_COOKIE_DOMAIN` é validado e aplicado tanto ao set quanto ao clear.
- `SameSite=Lax`, `Secure` em produção e os paths existentes foram preservados.

## Blast radius e risco

Camadas afetadas: auth backend, middleware Express, helper compartilhado de cookie e configuração de deploy.

O fluxo DPoP tornou-se assíncrono por exigência do Redis; todos os emissores/verificadores foram atualizados para `await`. As flags continuam desligadas. Configurar `AUTH_DPOP_ENABLED=true` sem Redis funcional bloqueia provas DPoP, intencionalmente. Configurar `TRUST_PROXY` sem o CIDR real do edge faz o Express ignorar forwarded headers, sem confiar no cliente.

O `Domain` compartilhado amplia a superfície de cookie para subdomínios irmãos (inclusive cookie tossing se um deles for comprometido). O cut-over deve ocorrer somente após confirmar controle uniforme de todos os subdomínios sob `reserveiviagens.com.br`.

## Validação

- `npm run build:shared`: **PASS**
- Testes focados DPoP/cookie/proxy: **25/25 PASS**
- Regressão auth/refresh/DPoP: **43/43 PASS**
- `npx tsc -p backend/tsconfig.json --noEmit`: **PASS**
- `npm run build`: **PASS**
- `npm run lint`: **FAIL preexistente de setup** — `Cannot find module 'next/dist/compiled/babel/eslint-parser'` nos quatro apps Next.
- `npm run type-check`: **FAIL preexistente fora da fatia** — erros já presentes em `apps/site-publico` e `apps/turismo`; backend focado passou.
- `npm run test`: **FAIL preexistente fora da fatia** — 770 PASS / 18 FAIL, incluindo `wishlist-service`, CRUD Fase 1, payments, fornecedores, guest portal e import vazio. O Jest também manteve handle aberto após emitir o resumo.

## Fora de escopo

- Cut-over das duas flags.
- Tokens legados sem `cnf.jkt`.
- Dashboard do evento `auth_refresh_body_deprecated`.
- mTLS e CSP.

## Gate

Não houve deploy, merge ou alteração de secret. A política atual está em fase `initial` (`openPullRequest=false`), e os gates amplos de lint/test não estão verdes; portanto a fatia permanece local/report-only até decisão humana compatível com os guardrails.
