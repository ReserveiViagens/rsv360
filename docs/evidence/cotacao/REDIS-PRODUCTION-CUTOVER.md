# Redis em produção — cutover Cotação v2 (PR 4 + PR 5)

**Repo:** `rsv360` | **Bloqueante:** cache híbrido, lock anti-overbooking, filas BullMQ

## Pré-requisitos

- [ ] `REDIS_URL` definido em **todas** as réplicas do `backend`
- [ ] **`REDIS_DISABLED` ausente** ou explicitamente `false` (nunca `true` em prod)
- [ ] `FORNECEDORES_ENCRYPTION_KEY` — mín. 32 chars, **mesmo valor** em todas as réplicas
- [ ] Redis acessível pela rede do backend (compose: `redis://redis:6379`; managed: `rediss://...`)

## Variáveis (`.env` / secret manager)

```env
REDIS_URL=redis://redis:6379
FORNECEDORES_ENCRYPTION_KEY=<openssl rand -hex 32>
# NÃO definir REDIS_DISABLED em produção
```

`docker-compose.prod.yml` já injeta `REDIS_URL` e `depends_on: redis` no backend (a partir deste patch).

## Cutover (ordem sugerida)

1. **Subir Redis** (ou apontar para instância managed) com persistência (`appendonly yes` no compose).
2. **Deploy backend** com `REDIS_URL` + `FORNECEDORES_ENCRYPTION_KEY` — sem `REDIS_DISABLED`.
3. **Verificar logs** na subida:
   - `[fornecedores-hub] Worker reservas BullMQ registrado ✓`
   - `[propostas] Worker BullMQ avaliar-objecao registrado ✓`
   - Ausência de `Worker … omitido — REDIS_URL ausente`
4. **Smoke local / pós-deploy:**

```powershell
cd "C:\Users\RSV 360\Documents\rsv360"
docker compose up -d redis
$env:REDIS_URL="redis://127.0.0.1:6379"
Remove-Item Env:REDIS_DISABLED -ErrorAction SilentlyContinue
npx tsx server/scripts/smoke-redis-cutover.ts
```

5. **Hub + lock (opcional):** `npm run test:hub` com Redis no ar.
6. **Invalidação de cache** (se migrou de ambiente sem Redis): flush opcional das chaves `rsv360:ofertas:*` ou TTL natural (15 min padrão do resolver).

## Health / rollback

| Sintoma | Ação |
|---------|------|
| Lock sempre 409 | Verificar `REDIS_URL` igual em todas as instâncias |
| Cache stale após deploy | `FLUSHDB` só em janela controlada ou aguardar TTL |
| Workers não iniciam | `REDIS_DISABLED` ou URL errada — corrigir env e restart |
| Rollback emergencial | **Não** usar `REDIS_DISABLED` em prod multi-instância (quebra lock); reverter deploy |

## Smoke scripts versionados

| Script | Commit ref | Escopo |
|--------|------------|--------|
| `server/scripts/smoke-aprovacao.ts` | `fcf4bc58` | PR 8 auditoria |
| `server/scripts/smoke-redis-cutover.ts` | (este patch) | PR 4 + PR 5 Redis |
