# PR-13b — Sanitize LLM inputs (onboarding / tax / split / comissões)

**Branch:** `security/pr-13b-llm-input-sanitize`  
**Baseline:** `ba3a31be01562d813faa25635e1ae5c904f9fa03` (pós-13c / #225)

## Escopo

- Novo `@rsv360/shared` `llm/prompt-sanitize`: allowlist + strip role-spoof/fences + caps de tamanho.
- **Onboarding** `/api/onboarding/generate-plan`: remove `JSON.stringify(data)` do prompt; usa `sanitizeOnboardingPromptFields` (sem e-mail).
- **Tax chat**: mensagem sanitizada + contexto só `grossRevenue` / `deductions` / `cnae`.
- **Split suggest**: `context` free-form truncado/sanitizado; `service_type` whitelist.
- **Comissões IA**: user message = linhas allowlisted (não `JSON.stringify(input)`).

## OUT

- 13d Instrutor output filter  
- Gateway LLM unificado (13e)  
- Auth/rate-limit já cobertos em outras fatias  

## Test plan

```bash
cd packages/shared && npm run build
cd apps/site-publico && npx jest __tests__/lib/llm-prompt-sanitize.test.ts --forceExit
cd backend && npx jest src/__tests__/unit/comissoes-ia-suggest.test.ts --forceExit
```

Resultado: **9 + 2 passed**.

## Risco

- Blast radius: shared + 4 superfícies LLM (site-publico + comissões).  
- Prompts perdem campos não allowlisted (intencional / LGPD).  
- Requer rebuild de `@rsv360/shared` (`dist/` versionado se aplicável).

## Rollback

Revert do squash merge desta PR.
