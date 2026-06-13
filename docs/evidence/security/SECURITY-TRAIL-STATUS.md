# Security Trail — Status e handoff (Cursor + Codex)

**Última atualização:** 2026-06-13  
**Worktree canônico:** `C:\Users\RSV 360\Documents\s2-fase-e-clean`  
**Repositório:** https://github.com/ReserveiViagens/PMS-CRM-RSV360-Versao-Oficial-definitivo  
**`main` atual:** `6de6a70d5` (SEC-04 impl #321)

> **Leia este arquivo primeiro** ao retomar no Codex ou Cursor após perda de chat.

---

## Regras operacionais

| Regra | Detalhe |
|-------|---------|
| Worktree | **`s2-fase-e-clean`** — nunca `s2-pr232-validate` |
| npm | `npx -y npm@10.9.7` |
| Proibido | `npm audit fix --force`, downgrade, S1 |
| Padrão | PR impl + PR carimbo documental |

---

## Linha do tempo Security

| Etapa | PR impl | PR carimbo | Status |
|-------|---------|------------|--------|
| Inventário | — | #314 | **GO** |
| SEC-01 shell-quote + joi | #315 | #316 | **GO pós-merge** |
| SEC-02 nodemailer root | #317 | #318 | **GO pós-merge** |
| SEC-03 nodemailer site-publico | #319 | #320 | **GO pós-merge** |
| SEC-04 postcss | #321 | #322 | **GO pós-merge** |
| **SEC-05 esbuild** | *(PR pendente)* | — | **Em andamento** |
| SEC-06 uuid | — | — | Pendente |

**Dependabot open (pós SEC-04):** **8** (0 critical, 2 high, 4 medium, 2 low)  
**Alertas esbuild open:** #32, #35, #137, #138, #139, #140

---

## SEC-04 — concluído (impl)

- Overrides `postcss@8.5.15`; Next **16.2.7** inalterado
- Alerta **#83 fixed**
- Artefatos: [SEC-04-POSTCSS-RESULT.md](./SEC-04-POSTCSS-RESULT.md), [SEC-04-POST-MERGE.md](./SEC-04-POST-MERGE.md)

---

## SEC-05 — em andamento

**Objetivo:** `esbuild` → **0.28.1** via override (sem downgrade drizzle-kit)

**Instâncias atuais (preflight):**

| Versão | Onde |
|--------|------|
| 0.28.0 | backend (precisa 0.28.1) |
| 0.27.7 | tsx nested |
| 0.25.12 | root hoisted |
| 0.18.20 | @esbuild-kit (drizzle-kit) |

**Estratégia:** override root `"esbuild": "0.28.1"` + sync `backend/package-lock.json`

**Hard stops:** sem `drizzle-kit@0.19.1`, sem alterar mercadopago/exceljs/uuid/Next

---

## Débitos conhecidos (NOGO sem HITL)

- type-check turismo/site-publico baseline
- `.next/types` site-publico
- Tailwind 4, Express 5

---

## Índice

| Doc | Uso |
|-----|-----|
| [DEPENDABOT-INVENTORY.md](./DEPENDABOT-INVENTORY.md) | Inventário + fila SEC |
| [SEC-04-POST-MERGE.md](./SEC-04-POST-MERGE.md) | Carimbo SEC-04 |
| **SECURITY-TRAIL-STATUS.md** | Este handoff |
