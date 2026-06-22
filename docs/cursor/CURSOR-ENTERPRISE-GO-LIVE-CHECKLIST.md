# Cursor Enterprise Automation — Checklist de go-live

**Data:** 2026-06-22 | **PRs:** #544, #546 na `main`  
**Smoke:** `node .cursor/hooks/enterprise-hardening.smoke.cjs` — **passed** (2026-06-22)

## Verificado automaticamente

- [x] `hooks.json` válido (JSON parse OK)
- [x] `enterprise-hardening.smoke.cjs` — 19/19 testes PASS
- [x] `phase-config.json` → `currentPhase: initial` (na `main`)
- [x] Instructions prontas: `.cursor/automations/find-critical-bugs-instructions.md`

## Manual (owner) — Cursor IDE

> Automações do Cursor **não** são configuráveis via CLI/API; exige UI do Cursor Desktop.

- [ ] Cursor → **Automations** → template **Find critical bugs**
- [ ] Colar instructions de `.cursor/automations/find-critical-bugs-instructions.md`
- [ ] Gatilho: **1×/dia** (`currentPhase: initial`)
- [ ] **Sem auto-merge**
- [ ] Reiniciar Cursor → **Settings → Hooks** (confirmar hooks ativos)

### Atalho de configuração

1. Abrir Command Palette → *Cursor: Open Automations*
2. New automation → **Find critical bugs**
3. Instructions: copiar arquivo `find-critical-bugs-instructions.md` (linha 7 em diante, após `---`)
4. Schedule: daily
5. Repo: este workspace
6. Desmarcar qualquer opção de auto-merge / auto-PR merge

## Evidência

Após configurar na UI, marcar data abaixo:

| Campo | Valor |
|-------|-------|
| Automation criada | _preencher pelo owner_ |
| Hooks visíveis em Settings | _preencher pelo owner_ |
