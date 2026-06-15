# Lint #237 — turismo voucher-editor dead code −66

**Data:** 2026-06-02  
**Branch:** `chore/voucher-editor-dead-code`

## Baseline → after (4 arquivos alvo)

| Arquivo | Pós-#382 | Esta PR |
|---------|----------|---------|
| `pages/voucher-editor.tsx` | 68 | **8** (−60) |
| `src/pages/voucher-editor.tsx` | 10 | **4** (−6) |
| `pages/validation.tsx` | 0 | **0** |
| `src/pages/validation.tsx` | 0 | **0** |
| **Subtotal** | **78** | **12** (**−66**) |

Estimativa repo turismo: **~7374 → ~7308** warnings.

## Ações

| Ação | Impacto |
|------|---------|
| Remover ~955 linhas duplicadas (`LinkInput`/`HeaderEditor`/… internos vs `*Stable`) | −display-name, −hooks cascata |
| Remover handlers/state mortos (field handlers, `selectedElement`, template/element edit) | −no-unused-vars |
| `displayName` nos componentes `*Stable` | −6 display-name |
| Reordenar `useEffect` localStorage após declaração de state | −immutability |
| Script `remove-voucher-dead-code.cjs` | reutilizável |

## Débito restante (12)

`pages/voucher-editor`: `set-state-in-effect`, `QRCodeGenerator` inline, `no-explicit-any`, `no-img-element`.  
`src/pages/voucher-editor`: `exhaustive-deps`, `any`, `no-img-element`.

## Gates

| Gate | Resultado |
|------|-----------|
| `type-check` turismo | **PASS** |
| `build` turismo | **PASS** |
| `eslint . --quiet` | **0 erros** |

## Veredito

**GO condicional** — bloco morto removido; 4 arquivos alvo **78 → 12** warnings.
