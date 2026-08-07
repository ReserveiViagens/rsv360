# PR-13c — SRE shell hardening (`:5050`)

**Branch:** `security/pr-13c-sre-shell-hardening`  
**Baseline:** `651dfbaf66ae9d639e54c65ee4d5c03e4279c66c` (pós-13a / #224)

## Escopo

- **Auth fail-closed** (`SRE_API_TOKEN`): Bearer / `X-SRE-Token` em rotas mutáveis  
  (`/trigger`, `/approve`, `/reject`, collector start/stop, analyze, bulk-action, auto-heal).  
  Sem token configurado → **503**; token errado → **401**.
- **POST-only** em approve/reject/collector (remove GET CSRF-friendly).
- **Allowlist fechada** `recipe:<id>` via `safe_exec.py` — **`shell=False` sempre**.  
  Free-form (`npm …`, metachar `;|&`) rejeitado.
- **Bind default** `TRIGGER_API_HOST=127.0.0.1` (antes `0.0.0.0`).
- **Full restart** exige `SRE_ALLOW_FULL_RESTART=true` além do token.
- Dashboard: `localStorage.sre_api_token` + `sreAuthHeaders()`.

## OUT

- 13b sanitização onboarding/tax/split/comissões  
- Expandir recipes além de `noop` (owner)  
- Redis / JWT de produto / n8n  

## Test plan

```bash
cd sre-agents && python -m unittest tests.test_pr13c_sre_hardening -v
```

Resultado: **11 passed**.

## Risco

- Blast radius: pacote `sre-agents` apenas.  
- Ops: dashboard/API quebram sem `SRE_API_TOKEN` (intencional).  
- Auto-heal full_restart fica off até opt-in explícito.

## Rollback

Revert do squash merge desta PR.
