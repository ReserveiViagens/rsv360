# Security Trail — Status e handoff (Cursor + Codex)

**Última atualização:** 2026-06-13  
**Worktree canônico:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**Repositório:** https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo  
**Branch alvo:** `main` @ `74a01aa18` (pré SEC-04 impl)

> **Leia este arquivo primeiro** ao retomar no Codex ou Cursor após perda de chat.

---

## Regras operacionais (não negociar)

| Regra | Detalhe |
|-------|---------|
| Worktree | **`s2-fase-e-clean`** — nunca commitar de `s2-pr232-validate` |
| npm | `npx -y npm@10.9.7` |
| Docker | `-p rsv360` |
| Proibido | `npm audit fix --force`, downgrade, S1 |
| Padrão | PR impl + PR documental pós-merge (“carimbo”) |
| Escopo | Uma montanha por PR — não misturar pacotes |

---

## Linha do tempo completa

### Fase E — TS6 (concluída)

| Marco | PRs | Status |
|-------|-----|--------|
| guest / admin / turismo / site-publico | #299–#312 + closeout #313 | **GO** |
| Tailwind 4 / Express 5 / `.next/types` | — | **NOGO** até HITL |

Artefato: [../trilha-0/FASE-E-TS6-CLOSEOUT.md](../trilha-0/FASE-E-TS6-CLOSEOUT.md)

### Trilha Security / Dependabot

| Etapa | PR impl | PR carimbo | Pacote | Status |
|-------|---------|------------|--------|--------|
| Inventário | — | #314 | — | **GO** |
| SEC-01 | #315 | #316 | shell-quote + joi | **GO pós-merge** |
| SEC-02 | #317 | #318 | nodemailer root → 8.0.11 | **GO pós-merge** |
| SEC-03 | #319 | #320 | nodemailer site-publico → 8.0.11 | **GO pós-merge** |
| **SEC-04** | *(PR pendente)* | *(após merge)* | postcss → 8.5.15 | **Em andamento** |
| SEC-05 | — | — | esbuild / backend | Pendente |
| SEC-06 | — | — | uuid | Pendente |

**Dependabot open (pós SEC-03):** 9 alertas (0 critical, 2 high, 5 medium, 2 low)

---

## SEC-04 — em andamento (Cursor, 2026-06-13)

**Branch:** `chore/security-sec-04-postcss`  
**Objetivo:** eliminar `postcss` &lt; 8.5.10 (CVE-2026-41305, alerta Dependabot **#83**)

### Problema

Next 16.2.7 traz `postcss@8.4.31` nested em cada app:

```
apps/*/node_modules/next/node_modules/postcss → 8.4.31 (VULN)
```

### Solução aplicada (não alterar Next)

`package.json` overrides:

```json
"postcss": "8.5.15",
"next": { "postcss": "8.5.15" }
```

+ `npm install --ignore-scripts` → dedupe para **uma** instância `node_modules/postcss@8.5.15`.

**Hard stops respeitados:** Next permanece **16.2.7**; sem drizzle/mercadopago/exceljs/nodemailer/esbuild/uuid.

### Validação local (pré-PR)

| Gate | Resultado |
|------|-----------|
| postcss scan | **1 instância @ 8.5.15 OK** |
| npm audit root | total **11**; **sem postcss** |
| npm audit guest/admin/turismo | **0** vulns |
| npm audit site-publico | **5** (uuid/exceljs/artillery — não postcss) |
| type-check guest/admin | **PASS** |
| API P0 | **8/8 OK** |

### Artefatos SEC-04

| Arquivo | Uso |
|---------|-----|
| [SEC-04-POSTCSS-PLAN.md](./SEC-04-POSTCSS-PLAN.md) | Plano HITL |
| [SEC-04-POSTCSS-RESULT.md](./SEC-04-POSTCSS-RESULT.md) | Resultado impl |
| [logs/sec-04-*](./logs/) | Audits, type-check, API P0 |

### Próximo passo Codex/Cursor

1. Revisar PR impl SEC-04 (branch `chore/security-sec-04-postcss`)
2. Merge → revalidar alerta **#83 fixed**
3. PR carimbo `SEC-04-POST-MERGE.md`
4. **SEC-05** esbuild (PR isolada)

---

## Débitos conhecidos (não corrigir sem HITL)

- type-check turismo / site-publico — baseline TS6
- `.next/types` site-publico — ~1968 erros pós-build
- Tailwind 4, Express 5 — NOGO

---

## Índice de documentos

| Documento | Descrição |
|-----------|-----------|
| [DEPENDABOT-INVENTORY.md](./DEPENDABOT-INVENTORY.md) | Inventário original + status |
| [SEC-01-SHELL-QUOTE-JOI.md](./SEC-01-SHELL-QUOTE-JOI.md) | SEC-01 impl |
| [SEC-01-POST-MERGE.md](./SEC-01-POST-MERGE.md) | SEC-01 carimbo |
| [SEC-02-POST-MERGE.md](./SEC-02-POST-MERGE.md) | SEC-02 carimbo |
| [SEC-03-POST-MERGE.md](./SEC-03-POST-MERGE.md) | SEC-03 carimbo |
| **SECURITY-TRAIL-STATUS.md** | **Este arquivo — handoff vivo** |

---

*Mantenha este arquivo atualizado a cada merge de SEC-0N ou carimbo.*
