# Lint #237 — turismo AITutor warnings trim

**Data:** 2026-06-02  
**Branch:** `chore/t1.7-auth-v1-warnings`

## Baseline → after

| Métrica | Pós-#380 | Esta PR |
|---------|----------|---------|
| erros (`--quiet`) | 0 | **0** |
| warnings (repo turismo) | **7969** | **7877** (**−92**) |
| `AITutor.tsx` | 99 | **7** (**−92**) |

## Ações

| Ação | Impacto |
|------|---------|
| Trim imports Lucide `AITutor.tsx` | −~85 |
| Remover state morto (`activeSession`, `setLearningContext`) | −2 |
| Tipar `QuickAction.icon` sem `any` | −1 |

## Veredito

**GO condicional** — módulo `training/AITutor` saneado; débito global ~7877 warnings.
