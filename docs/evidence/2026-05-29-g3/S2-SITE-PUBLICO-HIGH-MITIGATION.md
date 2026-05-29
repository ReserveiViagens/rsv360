# Plano de mitigação — 6 high em `apps/site-publico`

**Data:** 2026-05-29  
**Evidência SCA:** `logs/S2/site-publico-npm-audit.json` — **0 high / 8 moderate / 0 critical** (pós T0b, 29/05)  
**Política:** conservador — **sem** `npm audit fix --force` nem salto direto para Next 16.

---

## Resumo executivo

| Pacote / bloco | High | Fix npm | Trilha recomendada | Prazo sugerido |
|----------------|------|---------|-------------------|----------------|
| `next` + eslint (`eslint-config-next`, `@next/eslint-plugin-next`, `glob`) | 4* | major → 16.x | **T0:** patch 14.2.35 + eslint 14.2.x | Sprint 0 / G3 |
| `nodemailer` | 1 | major → 7.x | **T1:** upgrade 7.0.11+ + testes e-mail | Sprint 0 |
| `xlsx` | 1 | **nenhum** | **T2:** mitigação operacional ou troca de lib | Sprint 0 → Trilha 0 |

\*Contagem lógica: 1 direct `next` + 1 `eslint-config-next` + transitivas `glob` / plugin — correlacionadas.

**S1:** `npm audit fix` conservador — **0 vulns** (check + build OK).  
**Turismo:** 1 high (`xlsx`) — dependência **sem import em `src/`** → candidata a remoção.

---

## 1) Bloco Next.js + ESLint (4 high correlacionados)

### Situação atual

- `next`: `^14.0.0` (instalado abaixo dos patches de segurança recentes)
- `eslint-config-next`: `^14.2.0`
- Advisories: DoS RSC, SSRF WebSocket, middleware bypass, deserialização HTTP (ver GHSA no audit JSON)
- `npm audit` sugere `next@16.2.6` (semver major) — **fora de escopo imediato** (Trilha 0 / alinhamento com admin-guest Next 15)

### Trilha T0 — patch na linha 14 (preferida)

1. Fixar versões patch estáveis:
   - `next`: `14.2.35` (último 14.2.x no registry)
   - `eslint-config-next`: `14.2.35` (alinhar com next)
2. `npm install` em `apps/site-publico`
3. Validar G2 local:
   - `npm run lint`
   - `npm run type-check`
   - `npm run build`
4. Reexecutar `run-g3-security-wsl.sh` e comparar `site-publico-npm-audit.json`
5. Se **ainda high** em `next`: documentar residual e agendar **T0b** (ver abaixo)

**Risco:** baixo (patch minor dentro de 14).  
**Rollback:** reverter `package.json` / lock e imagem Docker anterior.

### Trilha T0b — se patch 14.2.35 não zerar high

- Avaliar `next@15.5.16+` (minor/major controlado, React 18 compatível) em branch dedicada
- **Não** pular para 16 no mesmo PR que G3
- Depende de gate **G2-S2** verde após upgrade

### Trilha T0c — glob (transitiva, dev)

- Vem do toolchain ESLint/Next
- Corrige junto com `eslint-config-next` / overrides npm se necessário
- **Exposição:** CLI `glob` em dev/CI — risco menor que runtime, mas manter no inventário

---

## 2) `nodemailer` (1 high, direct)

### Situação

- Versão: `^6.10.1`
- CVEs: DoS `addressparser` (high), interpretation conflict domínio (moderate contabilizado no pacote)
- Fix indicado: `>=7.0.11` (major)

### Uso no código (site-publico)

| Arquivo | Uso |
|---------|-----|
| `lib/email.ts` | SMTP transporter |
| `lib/notification-service.ts` | notificações |
| `lib/ticket-notifications.ts` | ingressos |
| `lib/credentials-service.ts` | require dinâmico |
| `scripts/testar-email.js` | script manual |

### Trilha T1 — upgrade controlado

1. `nodemailer@^7.0.11` (ou latest 7.x estável)
2. Revisar [changelog nodemailer 7](https://github.com/nodemailer/nodemailer/blob/master/CHANGELOG.md) — breaking em API/options
3. Testes manuais: envio SMTP / fluxo ticket / credenciais
4. `npm run check` + `npm run build`
5. Re-audit

**Compensating controls (até T1):**

- Rate limit em rotas que disparam e-mail
- Validar endereços com allowlist de domínio no backend
- Não expor endpoints de envio sem auth

---

## 3) `xlsx` (1 high, sem fix npm)

### Situação

- Versão: `^0.18.5` (SheetJS community)
- CVEs: prototype pollution, ReDoS — `fixAvailable: false`
- Pacote praticamente **abandonado** no npm público; correções em builds comerciais / forks

### Uso no código (site-publico)

| Arquivo | Uso |
|---------|-----|
| `lib/export-reports.ts` | export relatórios |
| `lib/accounting-integration.ts` | integração contábil |

### Trilha T2 — mitigação (escolher uma)

| Opção | Esforço | Efeito no audit |
|-------|---------|-----------------|
| **T2a** Controles compensatórios | Baixo | High permanece; aceite documentado |
| **T2b** Migrar para `exceljs` ou `sheetjs-ce` | Médio | Remove `xlsx` do grafo |
| **T2c** Processar XLSX só no **backend S2** (API isolada) | Médio | Reduz superfície no Next |

**T2a — controles mínimos (implementar já):**

- Processar upload/export **somente server-side** (Route Handlers / API routes), nunca no bundle client
- Limite de tamanho (ex.: 5 MB) e timeout
- Rejeitar ficheiros não autenticados / sem role admin
- Não passar input utilizador direto para `sheet_names` / fórmulas dinâmicas

**T2b — migração (recomendada para GO de segurança):**

- Substituir `XLSX.read` / `write` em `export-reports.ts` e `accounting-integration.ts`
- Testes de regressão nos exports existentes

### Turismo (`xlsx` — 1 high)

- `xlsx` em `package.json` **sem** `import` em `src/`
- **Ação rápida:** remover dependência + `npm install` → deve eliminar 1 high do turismo
- Validar build turismo após remoção

---

## 4) Ordem de execução (checklist)

```text
[x] T0  next + eslint-config-next → 14.2.35 + G2 — high permanecem (6→6, bloco Next)
[x] T1  nodemailer → ^7.0.13 (--legacy-peer-deps) + lint/build OK — high 6→5
[x] turismo: xlsx removido (sem uso em src) — high 1→0
[ ] T2a Controles xlsx (server-only, limites) — documentar em SEC-G3-004
[x] T2b migração xlsx → exceljs — high 5→4
[x] T0b `next@15.5.18` + `eslint-config-next@15.5.x` — **high 4→0** (branch `security/t0b-next15-site-publico`)
[ ] Reexecutar run-g3-security-wsl.sh
[ ] Atualizar SECURITY-BASELINE (plano aprovado → high residual aceito ou zerado)
[ ] Rollback-READINESS.md
```

---

## 5) Critério para marcar SEC-G3-004

- **Resolvido:** `site-publico` audit com **0 high** após T0+T1+T2b
- **Mitigado (aceite temporário):** T0+T1 feitos + T2a documentado + prazo T2b na Trilha 0 + aprovação em `SECURITY-BASELINE.md`

---

## Referências

- Audit: `docs/evidence/2026-05-29-g3/logs/S2/site-publico-npm-audit.json`
- Gates: `docs/integracao-v3/sprint-0/GATES-v3.md`
- G2 site-publico: `docs/evidence/2026-05-28/logs/S2/s2_apps_site-publico_build.log`
