# Lint #237 — turismo TeamManager + hoteis + permissions

**Cluster:** **#8** | **Branch:** `chore/lint-turismo-team-hoteis-permissions`

| Métrica | Pós-#419 | Esta PR |
|---------|----------|---------|
| warnings globais | **2597** | **2530** (**−67**) |
| 3 arquivos alvo | 67 | **0** |

**Correções principais:**
- `TeamManager.tsx`: imports enxutos; removido `handleDeleteMember` morto; `Select` tipado
- `hoteis.tsx`: padrão `parques` (effects, `ImageIcon`, img eslint-disable); removidos helpers mortos; `unknown`/`Budget` types
- `permissions.tsx`: imports Lucide enxutos; `loadData` hoisted; removido `loading` morto

**Próximo:** cluster #9 — turismo (pages) + parks + permissions (src) (−66)
