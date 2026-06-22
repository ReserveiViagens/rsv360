# Cursor Enterprise Automation — Checklist de go-live

**Data:** 2026-06-22 | **PRs:** #544, #546 na `main`  
**Smoke:** `node .cursor/hooks/enterprise-hardening.smoke.cjs` — passed

## Manual (owner)

- [ ] Cursor → Automations → **Find critical bugs**
- [ ] Instructions: `.cursor/automations/find-critical-bugs-instructions.md`
- [ ] Gatilho: 1×/dia (`currentPhase: initial`)
- [ ] Sem auto-merge | Reiniciar Cursor | Settings → Hooks
