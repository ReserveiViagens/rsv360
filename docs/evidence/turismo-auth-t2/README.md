# turismo/auth-t2 — Wiring defaults `:5000` → `:3002`

**Base:** `main @ 5cea9d80` (pós-T1 / #184)  
**Branch:** `turismo/auth-t2`  
**Escopo:** clients turismo (superfície viva) — higiene de wiring, não mudança de backend.

## Mapa de portas

| Porta | Papel |
|------:|-------|
| **3005** | UI turismo (Next `dev`/`start` `-p 3005`; compose raiz `3005:3005`) |
| **3002** | API backend (Express; compose raiz `x-app-env` + `auth-v1.ts` `DEFAULT_API_URL`) |
| **5000** | **Default morto** — removido nesta fatia. Nunca foi a porta do backend atual. Não usar como alternativa. |

## `NEXT_PUBLIC_API_URL`

- **Override** do default nos clients: se setada, ganha de `http://localhost:3002`.
- Compose raiz (`docker-compose.yml` → `x-app-env`): já injeta `NEXT_PUBLIC_API_URL=http://localhost:3002` — **confirmado, não alterado**.
- `apps/turismo/package.json`: scripts `dev`/`start` só fixam UI `-p 3005` — **sem** override de `NEXT_PUBLIC_API_URL`.
- `apps/turismo/.env*.example`: **ABSENT** — SKIP explícito (não inventado nesta fatia).

## Fora de escopo (anotado, não tocado)

- `docker-compose.yml` → `NEXT_PUBLIC_PRIMARY_SITE_URL` default `http://localhost:5000` = **site-publico** (primary site), não API turismo.
- `BACKUP_SRC_COMPONENTS/`, `reservei/`, `RSV-360-ECOSYSTEM/`, backend, site-publico, 04b, T3.

## Evidence

| Arquivo | Conteúdo |
|---------|----------|
| `grep-before.json` | Hits de porta `:5000` na superfície viva (base `5cea9d80`) |
| `grep-after.json` | Mesmo padrão → **0** hits |

## Validação esperada

- `npm run build --workspace=apps/turismo` PASS
- lockfile intocado → Docker Fase 5 N/A
- backend intocado
