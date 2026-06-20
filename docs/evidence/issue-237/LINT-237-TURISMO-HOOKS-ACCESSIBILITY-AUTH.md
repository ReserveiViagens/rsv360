# Lint #237 — turismo useAccessibility + useAnimations + useAuth

**Cluster:** **#80** | **Branch:** `chore/lint-turismo-hooks-accessibility-auth`

| Métrica | Pós-#79 | Esta PR |
|---------|---------|---------|
| warnings globais | **217** | **205** (**−12**) |
| 3 arquivos alvo | 12 | **0** |

**Correções:** hoist `applyAccessibilityConfig`; eslint-disable em loads de preferências/localStorage; `Record<string, unknown>` em variantes de animação; eslint-disable em sync `reducedMotion` e `initializeAuth`; args não usados prefixados com `_`

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #81 — enterprises edit + analytics-complete + cotacoes/share (−9)
