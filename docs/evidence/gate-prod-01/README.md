# GATE-PROD-01 — Hide mock contracts in production (Opção A)

**Branch:** `security/gate-prod-01-contratos-mock`  
**Base:** `main @ 82598223`  
**Decisão:** Opção A — flag + bloqueio/banner DEMO (sem motor e-sign)

## Fase 0 — inventário (tip atual)

| Path | Componente | O que renderiza | Ação nesta fatia |
| --- | --- | --- | --- |
| `apps/turismo/pages/contracts.tsx` | `ContractsPage` | Contratos/assinaturas **hardcoded** em `useState` (status `signed` / `fully_signed`) | Gate + banner |
| `apps/turismo/pages/reservei/contratos-hoteis.tsx` | `SistemaContratosHoteis` | `contratosMock` → `setContratos` | Gate + banner |
| `apps/turismo/src/pages/contracts.tsx` | cópia byte-idêntica de `pages/contracts.tsx` | Mesmo mock | **OUT** — Next usa `pages/`; evitar >5 arquivos |
| `apps/turismo/BACKUP_SRC_COMPONENTS/pages/contracts.tsx` | backup | Mock legado | **OUT** — não roteado |
| `client/.../admin/contratos.tsx` / `assinatura-digital.tsx` | — | **Não existem** no tip | Spec desatualizada |
| Clicksign | — | **Zero hits** em `apps/**/*.{ts,tsx,js,jsx}` | — |

Nav: `/contracts` (AppSidebar) · `/reservei/contratos` (dashboard) aponta para rota sem arquivo homônimo — tela live de hotéis é `/reservei/contratos-hoteis`.

## Grep de segurança (negócio)

| Padrão | Consumido por API/reserva/pagamento? |
| --- | --- |
| `contratosMock` / `mockContratos` | **Não** — só UI turismo |
| Backend | Sem hits |
| `apps/site-publico/app/api/contracts/route.ts` | Query DB `contracts` — **não** importa os mocks UI. Fora do escopo Opção A (não alterado). |

## Diff (esta fatia — 5 arquivos)

| Arquivo | Mudança |
| --- | --- |
| `apps/turismo/pages/contracts.tsx` | `NEXT_PUBLIC_ENABLE_CONTRATOS_MOCK !== 'true'` → placeholder; `true` → banner DEMO |
| `apps/turismo/pages/reservei/contratos-hoteis.tsx` | idem |
| `.env.example` | `NEXT_PUBLIC_ENABLE_CONTRATOS_MOCK=false` + comentário |
| `docker-compose.yml` | `x-app-env`: `${NEXT_PUBLIC_ENABLE_CONTRATOS_MOCK:-false}` |
| `docs/evidence/gate-prod-01/README.md` | esta evidence |

## Como validar

```bash
# Prod-safe (default)
NEXT_PUBLIC_ENABLE_CONTRATOS_MOCK=false
# → /contracts e /reservei/contratos-hoteis mostram só o aviso jurídico

# Dev demo
NEXT_PUBLIC_ENABLE_CONTRATOS_MOCK=true
# → mock visível + banner DEMO no topo
```

Rebuild/restart do app `turismo` necessário para `NEXT_PUBLIC_*` entrar no bundle.

## OUT

- Opção B (motor e-sign real)
- Remover código mock
- Patch em `src/pages/contracts.tsx` / BACKUP
- API `site-publico` contracts
- Lockfile / deps
