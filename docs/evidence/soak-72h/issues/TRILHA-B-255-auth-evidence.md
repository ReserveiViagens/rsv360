# Trilha B — Evidência técnica #255 (auth / middleware)

**Modo:** leitura de código (sem alterar runtime)  
**Data:** 2026-05-30  
**Issue:** [#255](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/255)

## Resumo executivo

| Área | Comportamento atual | Risco | Alvo pós-soak |
|------|---------------------|-------|----------------|
| `POST /api/auth/login` | 401 em credencial inválida **se DB OK**; **500** no `catch` global | Médio | Nunca 500 para payload inválido/DB down → 401/503 |
| APIs `/api/admin/website/*` | `checkAuth` compara Bearer **`admin-token-123`** fixo | **Alto** | 401 sem JWT admin válido |
| `middleware.ts` (UI `/admin`) | `verifyAdminToken` (JWT `ADMIN_JWT_SECRET`) | OK | Manter |
| `advancedAuthMiddleware` | Cookie `admin-token-123` → user mock | Alto em prod | Restringir a `NODE_ENV=development` |
| API P0 A6 (smoke) | 200 com `Bearer admin-token-123` | Contrato fraco | Atualizar matriz + smoke após hardening |

**Smoke atual (30/05):** API P0 **8/8 OK** — inclui A6=200 com token demo (não prova hardening).

## Evidência por arquivo

### 1) Login — 500 em exceção não tratada

```152:160:apps/site-publico/app/api/auth/login/route.ts
  } catch (error: any) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao realizar login' },
      { status: 500 }
    );
  }
```

- Caminho feliz inválido: L65–69 → **401** OK.
- Falha `queryDatabase` (PG indisponível, tabela ausente) → **500** (histórico em `g4-kickoff/logs/A3.log` rodada 1).

**Risco:** confundir indisponibilidade com bug de auth; quebra gate API P0.

### 2) Admin API — token demo hardcoded (duplicado em ~15 rotas)

```4:9:apps/site-publico/app/api/admin/website/pages/route.ts
function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === 'admin-token-123';
}
```

Mesmo padrão em:

- `app/api/admin/website/pages/route.ts` (e `[id]`, `versions`, `gallery`)
- `app/api/admin/website/header/route.ts`, `side-rails/route.ts`
- `app/api/admin/website/content/**/route.ts`
- `app/api/admin/credentials/**/route.ts`

**Comportamento A6:** `Authorization: Bearer admin-token-123` → **200** (by design atual).

### 3) Middleware UI — JWT correto

```20:29:apps/site-publico/middleware.ts
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = req.cookies.get('admin_token')?.value
    const adminPayload = await verifyAdminToken(adminToken)
    if (!adminPayload) { ... redirect /admin/login }
  }
```

```35:46:apps/site-publico/lib/admin-token.ts
export async function verifyAdminToken(token: string | undefined | null) {
  if (!token) return null
  const secretKey = getSecretKey()  // ADMIN_JWT_SECRET
  ...
}
```

**Gap:** UI protegida por JWT; **APIs REST admin** ainda aceitam string fixa.

### 4) Cookie demo em advanced-auth

```187:201:apps/site-publico/lib/advanced-auth.ts
    const adminToken = request.cookies.get('admin_token')?.value;
    if (adminToken === 'admin-token-123') {
      return { user: { id: 1, email: 'admin@rsv360.com', role: 'admin', ... }, error: null };
    }
```

### 5) Fallbacks no frontend admin

- `components/admin/SiteManagement.tsx` L124
- `hooks/useWebsiteData.ts` L112, L130
- (+ outros em grep `admin-token-123`)

### 6) JWT secret fallback

```108:108:apps/site-publico/app/api/auth/login/route.ts
    const JWT_SECRET = getJwtSecret(); // PR-04a fail-closed (legacy public fallback removed)
```

Compose já injeta `JWT_SECRET` em `site-publico` (`docker-compose.yml` L134).

## Matriz contrato (referência)

`docs/evidence/g4-kickoff/API-CONTRACT-MATRIX.md` — A3 401, A6 200 com demo token documentado como OK na rodada 2.

**Pós-hardening:** A6 deve ser **401** sem JWT admin válido; smoke G4 atualizar critério.

## Plano de implementação (pós-soak)

### Fase 1 — Biblioteca única (1 PR)

- Criar `lib/admin-api-auth.ts`:
  - `verifyAdminApiRequest(req)` → usa `verifyAdminToken` no Bearer **ou** rejeita.
  - Opcional dev-only: `ALLOW_DEMO_ADMIN_TOKEN=true` explícito no `.env` local.

### Fase 2 — Rotas admin (1 PR)

- Substituir `checkAuth` duplicado em todas as rotas `app/api/admin/**`.
- Remover comparação literal `admin-token-123`.

### Fase 3 — Login resiliente (1 PR)

- `catch` em `login/route.ts`:
  - Erros de DB → **503** + log estruturado (sem stack ao cliente).
  - Manter **401** para credencial inválida.
- Teste: PG down → não retorna 500.

### Fase 4 — Contrato + smoke

- Atualizar `API-CONTRACT-MATRIX.md` (A6 → 401 sem token).
- `run-api-p0-round1.ps1` / `.sh`: A6 sem Bearer → esperar 401.
- E2E `admin-crud.spec.ts`: usar login admin real ou fixture JWT.

## Critérios de pronto (ready-to-implement)

**Admin API (2 asserts)**
- [ ] Sem token válido → **401**
- [ ] Com JWT admin válido → **200**

**Login**
- [ ] Credencial inválida → **401**
- [ ] DB indisponível → **503** (nunca 500 no fluxo esperado)

**Non-goals:** não refatorar UI/admin inteira; não mexer em S1.

**Ordem:** bloqueada por fim soak + **#256** → **#252** → **#255**

**Evidência PR:** `API-P0-SUMMARY.tsv`, `A3.log`/`A6.log`, lista de rotas migradas

## Arquivos tocados (estimativa)

| Prioridade | Paths |
|------------|-------|
| P0 | `app/api/admin/**/route.ts`, `lib/admin-api-auth.ts` (novo) |
| P1 | `app/api/auth/login/route.ts`, `lib/advanced-auth.ts` |
| P2 | `hooks/useWebsiteData*.ts`, `components/admin/*.tsx` |
| P3 | `tests/e2e/admin-crud.spec.ts`, `API-CONTRACT-MATRIX.md` |

## Bloqueio soak

Nenhuma alteração acima até **G4 completo GO** e `>= 2026-06-02T09:03:09-03:00`.
