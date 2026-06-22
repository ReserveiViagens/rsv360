# Secrets rotation plan — #195

> **Plano apenas.** Rotação e rewrite de histórico requerem aprovação explícita do owner.

## Escopo

- `.env` commitados no histórico git
- Rotação de chaves API, DB, payment, JWT

## Fases (manual)

1. Inventário de secrets expostos (sem colar valores no repo)
2. Rotacionar em provedores (GitHub Secrets, Azure, Stripe, etc.)
3. `git filter-repo` ou BFG — branch coordination
4. Force-push protegido + notificar equipe

## Proibições

- Agente **não** executa rotação ou rewrite sem token owner
