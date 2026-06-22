# F-027 / F-028 — Security closeout

**Data:** 2026-06-22  
**Branch:** `chore/f027-f028-security-audit` (base: F-024 lock hygiene)

## Overrides confirmados (`package.json`)

| Pacote | Override | Mínimo CVE |
|--------|----------|------------|
| `fast-xml-builder` | `1.2.0` | ≥ 1.1.7 (CVE-2026-44665) |
| `esbuild` | `0.28.1` | ≥ 0.25.0 |

## Verificação local

```bash
npm ls fast-xml-builder   # → fast-xml-builder@1.2.0 (via @aws-sdk/xml-builder)
npm ls esbuild            # → esbuild@0.28.1 (override; peer warnings esperados)
npm audit --json          # sem critical/high em fast-xml-builder ou esbuild
python3 .github/scripts/audit-gate.py <audit.json>   # allowlist vazia por design
```

## Escopos CI (`security-scan.yml`)

- root `npm audit`
- `backend/` `npm audit`
- apps conforme workflow existente

## Resultado

- Overrides já presentes na `main`; locks sincronizados na PR F-024.
- `fast-xml-builder@1.2.0` e `esbuild@0.28.1` resolvidos na árvore npm.
- Nenhuma entrada em `.github/audit-allowlist.json` para estes pacotes.
