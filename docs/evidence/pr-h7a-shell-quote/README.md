# H7a — shell-quote 1.8.4 → 1.10.0 (GHSA-395f-4hp3-45gv)

**Base:** `main @ 904bc2bb` (pós-06c)  
**Branch:** `fix/h7a-shell-quote`  
**Advisory:** [GHSA-395f-4hp3-45gv](https://github.com/advisories/GHSA-395f-4hp3-45gv) (high) — DoS quadratic em `parse()` · range vulnerável `<=1.8.4`

## Diff

| Item | Antes | Depois |
|------|-------|--------|
| Root `overrides.shell-quote` | `1.8.4` | **`1.10.0`** |
| Resolvido sob `concurrently@8.2.2` | `shell-quote@1.8.4` | **`shell-quote@1.10.0` overridden** |
| Allowlist | 3 | **3 inalterada** |

```text
npm ls shell-quote
└── concurrently@8.2.2
    └── shell-quote@1.10.0 overridden
```

Cadeia: root `devDependency` `concurrently@^8.2.2` → transitivo `shell-quote` (override root). Sem bump de `concurrently` (→ H7b). Sem `js-yaml` (→ H7c).

## Audit antes → depois (host)

| Pacote | Antes (BLOCK) | Depois |
|--------|---------------|--------|
| `shell-quote` | high BLOCK | **ABSENT** |
| `concurrently` | high BLOCK (via shell-quote) | **ABSENT** (efeito limpo com o patch do filho) |
| `js-yaml` | high BLOCK | high BLOCK (H7c) |
| allowlist 3 | engine.io-client · ws · xlsx | **inalterada** |

**BLOCK net:** 3 → **1** (só `js-yaml`). GO citava expectativa 3→2; na prática o gate deixa de marcar `concurrently` quando a via `shell-quote` some — documentado (não é regressão).

## Validação local

| Check | Resultado |
|-------|-----------|
| `cd backend && npx tsc --noEmit` | **0** |
| jest backend (excl. integration) | **575** PASS (zero net-new) |
| `npm run build --workspace=apps/site-publico` | **PASS** |
| Docker Fase 5 backend → `rsv360/backend:fase5-h7a` | **PASS** |
| Docker Fase 5 site-publico → `rsv360/site-publico:fase5-h7a` | **PASS** (`--build-arg APP_DIR=apps/site-publico`) |
| `audit-gate.py` | BLOCK **1** (`js-yaml`) · allowlist **3** · `shell-quote` ABSENT |

## Escopo

Só override `shell-quote` + lockfile + evidence. Zero runtime.
