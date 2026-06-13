# SEC-05 — Plano: esbuild 0.28.1 via override

**Branch:** `chore/security-sec-05-esbuild`  
**Base:** `main` @ `a0df20203` (SEC-04 carimbo #322)

## Objetivo

Fechar alertas Dependabot esbuild (#32, #35, #137, #138, #139, #140) sem downgrade `drizzle-kit`.

## Estratégia

```json
"esbuild": "0.28.1"
```

+ `npm update esbuild --ignore-scripts` (root)  
+ patch sync `backend/package-lock.json` (3 entradas esbuild)

## Hard stops

- Sem `drizzle-kit@0.19.1`
- Sem alterar Next, mercadopago, exceljs, uuid, nodemailer

## Gates

- npm audit sem esbuild
- API P0 8/8
- backend tests (parcial aceitável se integração pré-existente)
