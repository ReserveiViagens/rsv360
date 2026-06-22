# Secrets rotation — aprovação do owner (#195)

**Data:** 2026-06-22  
**Issue:** [#195](https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo/issues/195)  
**Plano base:** [`SECRETS-ROTATION-PLAN.md`](./SECRETS-ROTATION-PLAN.md)

## Status

| Item | Status |
|------|--------|
| Plano documentado | ✅ |
| Aprovação para **executar** rotação | ✅ **Aprovado pelo owner** (2026-06-22) |
| Execução automática (rotação + filter-repo) | ⛔ **Não iniciada** — requer janela de manutenção coordenada |

## Escopo aprovado (quando executar)

1. Inventário de secrets no histórico git (sem colar valores)
2. Rotação nos provedores (GitHub Secrets, Azure, Stripe, JWT, DB)
3. `git filter-repo` / BFG com coordenação de equipe
4. Force-push apenas com branch protection e backup

## Proibições mantidas

- Agente **não** rotaciona credenciais nem reescreve histórico sem supervisão humana na janela de manutenção
- Nenhum valor de secret neste repositório

## Próximo passo humano

Agendar janela → executar Fase 1 do plano → abrir PR `chore/security-secrets-rotation` com checklist por provedor.
