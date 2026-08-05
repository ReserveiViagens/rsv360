# PR-10c-infra — Redis JTI store (DPoP replay)

**GO:** `GO A — 10c-infra só Redis JTI @ main ebc53e60`  
**Branch:** `security/pr-10c-infra`  
**Baseline:** `main @ ebc53e60`  
**Flags:** `AUTH_DPOP_ENABLED=false` e `AUTH_REFRESH_COOKIE_REQUIRED=false` (sem cut-over).

## Escopo (mini-PR)

- Substituir `Map` local de JTI por store Redis compartilhado (`SET dpop:jti:<sha256(jti)> 1 PX 90000 NX`).
- Tornificar verificação/emissão DPoP assíncrona (`await`) nos callers.
- Fail-closed quando Redis indisponível e a prova DPoP exige consumo de JTI.
- Testes: replay multi-instância, fail-closed, regressão DPoP existente.

## Fora de escopo (fila)

| Fatia | Conteúdo |
|-------|----------|
| **10c-infra-b** | HTU sem XFH/XFP + `TRUST_PROXY` allowlist |
| **10c-infra-c** | `AUTH_REFRESH_COOKIE_DOMAIN` (inventário de subdomínios antes do cut-over) |

Patch completo preservado em `security/pr-10c-infra-full` (`8b68826c`) para reaproveitar b/c.

## Hipótese e evidência

- **H1 (confirmada):** `jtiCache = new Map()` não compartilha estado entre réplicas → replay possível.
- **D1:** `backend/src/api/v1/auth/dpop.service.js` usava Map in-memory.
- **D2:** monorepo já depende de `ioredis` + `REDIS_URL` em produção.

## Blast radius / risco

Camadas: auth backend + middleware JWT. Sem DDL. Flags OFF → impacto observável zero no caminho default.

Com `AUTH_DPOP_ENABLED=true` e Redis down → proofs rejeitadas (`dpop_jti_store_unavailable`) — intencional.

## Validação

- Testes focados DPoP Redis: ver CI / local `dpop.service.test.ts`
- Backend `tsc --noEmit`: esperado PASS
- Lint/type-check monorepo: falhas preexistentes fora da fatia (documentadas nas fatias anteriores)

## Gate

1 fatia = 1 PR. PARAR na URL. Sem merge automático. H0 humano após CodeQL verde.
