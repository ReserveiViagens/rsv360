# Lint #237 — turismo animations-demo + backend-integration-test + configuracoes-sistema

**Cluster:** **#14** | **Branch:** `chore/lint-turismo-animations-backend-config`

| Métrica | Pós-#425 | Esta PR |
|---------|----------|---------|
| warnings globais | **2229** | **2175** (**−54**) |
| 3 arquivos alvo | 54 | **0** |

**Correções principais:**
- `animations-demo.tsx`: import `motion` (framer-motion); destructuring enxuto de `useAnimations`; tipos `CardAnimation`/`CardHover`/`LoaderType`
- `backend-integration-test.tsx`: imports mortos removidos; `getErrorMessage`; catches com `unknown`; responses não usados removidos
- `configuracoes-sistema.tsx`: imports enxutos; `loadSettings`/`loadSystemHealth` hoisted; `updateSetting` tipado; removido `getUsageColor`

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #15 — cotacoes/hoteis + dashboard-personalizado + insurance (−54)
