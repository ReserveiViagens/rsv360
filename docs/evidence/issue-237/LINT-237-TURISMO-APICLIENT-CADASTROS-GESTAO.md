# Lint #237 — turismo apiClient + cadastros + gestao

**Cluster:** **#20** | **Branch:** `chore/lint-turismo-apiclient-cadastros-gestao`

| Métrica | Pós-#431 | Esta PR |
|---------|----------|---------|
| warnings globais | **1910** | **1861** (**−49**) |
| 3 arquivos alvo | 49 | **0** |

**Correções principais:**
- `apiClient.ts`: `ApiErrorPayload`/`unknown` no lugar de `any`; tipagem genérica nos métodos HTTP
- `pages/cadastros.tsx`: mocks hoistados; imports enxutos; `UserForm` com `getFormField`; eslint-disable no load mock
- `pages/gestao.tsx`: interfaces `StatsCard`/`GestaoUser`/etc.; imports enxutos; casts nos modais de detalhe

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #21 — hotels-complete + reports + travel (−48)
