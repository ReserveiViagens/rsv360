# Lint #237 — turismo src/documents + src/e-commerce + TutorialSystem

**Cluster:** **#33** | **Branch:** `chore/lint-turismo-src-documents-ecommerce-tutorial`

| Métrica | Pós-#32 | Esta PR |
|---------|---------|---------|
| warnings globais | **1336** | **1297** (**−39**) |
| 3 arquivos alvo | 39 | **0** |

**Correções principais:**
- `src/pages/documents.tsx`: imports enxutos; `ImageIcon`; tipos no sort; `_user`
- `src/pages/e-commerce.tsx`: imports enxutos; `_user`; union type em `selectedItem`
- `TutorialSystem.tsx`: mock data fora do componente; `setTimeout(0)`; imports enxutos; callbacks prefixados

**Gates:** ESLint 0 nos 3 alvos | build OK

**Próximo:** cluster #34 — TaxManagement + PaymentModal + CustomReportBuilder (−39)
