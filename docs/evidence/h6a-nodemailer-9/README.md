# H6a — nodemailer backend ≥9.0.1 (remove allowlist)

**Base:** `main @ 4a7d33f1` (pós-S0c)  
**Branch:** `h6a-nodemailer-9`  
**Advisory:** GHSA-p6gq-j5cr-w38f (high)

## Diff

| Item | Antes | Depois |
|------|-------|--------|
| `backend` dep | `nodemailer@^8.0.11` | `nodemailer@^9.0.3` (resolved **9.0.3**) |
| Allowlist `.github/audit-allowlist.json` | 4 entries (incl. `nodemailer`) | 3 entries — **nodemailer removido** |

## Breaking changes 8→9 (CHANGELOG)

- **9.0.0:** HTTPS fetches (attachments via URL, OAuth2 token endpoints, proxy CONNECT) passam a validar certificado TLS por default (`tls.rejectUnauthorized`).
- **Uso no backend:** `password-reset-email.service.js` — `createTransport({ host, port, secure, auth })` + `sendMail({ from, to, subject, html, text })`. Sem attachments remotos, OAuth2 ou proxy.
- **Adaptação de código:** nenhuma — nenhum impacto no path atual.

## Validação local

| Check | Resultado |
|-------|-----------|
| `cd backend && npx tsc --noEmit` | **0** |
| `npm test --workspace=backend -- --testPathIgnorePatterns=integration` | **563** PASS |
| Backend “build” | sem script `build`; gate CI = **tsc** (PASS) |
| Docker Fase 5 `docker/backend/Dockerfile` → `rsv360/backend:fase5-h6a` | **PASS** |
| Docker Fase 5 `docker/frontend/Dockerfile` (site-publico) → `rsv360/site-publico:fase5-h6a` | **PASS** (retry após EOF do daemon) |
| `npm run build --workspace=apps/site-publico` (local) | **PASS** |
| `audit-gate.py` root + backend | **[OK]** · nodemailer **ABSENT** do BLOCK e da allowlist · ALLOWED 4→**3** |
| Smoke API | `createTransport` + `sendMail` function OK em nodemailer **9.0.3** (sem SMTP real) |

## Escopo

Só nodemailer backend + allowlist + lockfile. Sem dompurify / body-parser / eslint.
