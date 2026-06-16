# Lint #237 — turismo api-publica + Dashboard + ProcessMonitoring

**Cluster:** **#10** | **Branch:** `chore/lint-turismo-api-dashboard-processmonitoring`

| Métrica | Pós-#421 | Esta PR |
|---------|----------|---------|
| warnings globais | **2464** | **2401** (**−63**) |
| 3 arquivos alvo | 63 | **0** |

**Correções principais:**
- `api-publica.tsx`: imports enxutos; `stats` como constante; tipo `TestApiResponse`; entidades JSX escapadas
- `Dashboard.tsx`: removido carregamento API/WebSocket morto; dashboard usa mock local
- `ProcessMonitoring.tsx`: `MOCK_PROCESSES`/`MOCK_ALERTS` com datas fixas; imports recharts/lucide enxutos

**Gates:** ESLint 0 nos 3 alvos | type-check OK | build OK

**Próximo:** cluster #11 — cadastros + security-system-test + TaskAutomation (−60)
