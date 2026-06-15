# Lint #237 — turismo voucher-editor residual −12

**Data:** 2026-06-02  
**Branch:** `chore/voucher-editor-residual-warnings`

## Baseline → after (4 arquivos alvo)

| Arquivo | Pós-#383 | Esta PR |
|---------|----------|---------|
| `pages/voucher-editor.tsx` | 8 | **0** |
| `src/pages/voucher-editor.tsx` | 4 | **0** |
| `validation.tsx` (×2) | 0 | **0** |
| **Subtotal** | **12** | **0** (**−12**) |

## Ações

| Ação | Regra resolvida |
|------|-----------------|
| `loadPersistedVoucherSection` + lazy `useState` | `set-state-in-effect` |
| `VOUCHER_DEFAULT_TEMPLATES` hoisted + lazy init | `set-state-in-effect`, `exhaustive-deps` |
| `QRCodeGeneratorPanel` módulo top-level | `static-components` |
| `SocialMedia['platform']`, `QrErrorLevel` | `no-explicit-any` |
| `<img>` → `<Image unoptimized>` | `no-img-element` |
| Remover import `useEffect` morto | `no-unused-vars` |

## Gates

| Gate | Resultado |
|------|-----------|
| `type-check` turismo | **PASS** |
| `build` turismo | **PASS** |
| ESLint 4 arquivos alvo | **0 warnings** |

## Veredito

**GO** — módulo voucher-editor/validation **0 warnings** nos 4 arquivos alvo.
