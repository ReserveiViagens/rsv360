# H7 — Triagem drift advisories (pós-H6d / paralelo ao #164)

> **Não é regressão do PR-06c.** Lockfile do #164 intacto; advisories novas contra deps já no tip `59c42ce9`.
> Padrão H6: **1 fatia = 1 patch real** (preferido) ou allowlist com `reason` + `expires`. GO separado — sem misturar com 06c.

## Inventário (audit-gate BLOCK)

| # | Pacote | Sev gate | Direto? | Versão no tip | Range vulnerável | Fix disponível | GHSA / via |
|---|--------|----------|---------|---------------|------------------|----------------|------------|
| H7a | `shell-quote` | high | transitivo de `concurrently` | **1.8.4** (override) | `<=1.8.4` | sim (`>1.8.4`) | [GHSA-395f-4hp3-45gv](https://github.com/advisories/GHSA-395f-4hp3-45gv) DoS quadratic `parse()` |
| H7b | `concurrently` | high | **sim** (root `^8.2.2` → **8.2.2**) | 8.2.2 | audit marca via `shell-quote` (efeito) | bump `shell-quote` resolve o efeito; major 9/10 também listado | via `shell-quote` |
| H7c | `js-yaml` | high | transitivo | **4.2.0** (`@eslint/eslintrc`) · **3.14.2** (`artillery`) | `<3.15.0` · `4.x <4.3.0` | sim (`3.15.0` / `4.3.0`) | [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m) · [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68) |

Allowlist atual (inalterada, 3): `engine.io-client` · `ws` · `xlsx`.

## Ordem proposta (1 PR por fatia)

1. **H7a — `shell-quote` ≥1.8.5** via override (já há override em 1.8.4) — deve limpar BLOCK de `shell-quote` **e** o efeito em `concurrently` se o gate agrega por via.
2. **H7b — confirmar `concurrently`** após H7a; se ainda BLOCK, avaliar bump `concurrently` (sem major desnecessário) ou allowlist temporária com expiry.
3. **H7c — `js-yaml`**: overrides `3.15.0` + `4.3.0` (dois ranges no tree) · smoke eslint + artillery paths.

## Gate por fatia (norma H6)

- rebase `main` tip limpo · branch dedicada · `npm audit` + `audit-gate.py` · Docker Fase 5 **se** lockfile tocado · evidence `docs/evidence/h7*/` · sanitize · **PARAR na URL**.

## Relação com #164

- Security Scan NPM Audit no #164: **SUCCESS** (workflow); drift host vs tip documentado no Review.
- CI vermelho no #164 por **journal Drizzle órfão `0040`** (= bug da fatia 06c) — corrigir no próprio #164, **não** via H7.

## Estado

| Item | Status |
|------|--------|
| Triagem inventário | **Ready** (este doc) |
| GO H7a | Aguarda owner |
| #164 merge | Bloqueado até journal `0040` no CI |

---

## Fechamento (pós-execução)

Inventário preservado como evidência citada no canônico. Desfecho das fatias:

| Fatia | Resultado | SHA squash |
|-------|-----------|------------|
| **H7a** | `shell-quote` 1.8.4 → **1.10.0** (override) | `1dd900c1` |
| **H7b** | **Quitada** — efeito em `concurrently` limpo pela H7a | — |
| **H7c** | `js-yaml` **3.15.0** + `@eslint/eslintrc` **4.3.0** | `932634fa` |

**BLOCK = 0** no tip `main @ 932634fa`. Allowlist permanece 3 (`engine.io-client` · `ws` · `xlsx`).
