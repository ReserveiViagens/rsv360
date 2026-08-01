# PR-08 — Upload seguro (CMS + import acomodações)

**Branch:** `security/pr-08-upload`  
**Base:** `main @ 04de9de8` (pós-07c4 #194)  
**Estado:** PARAR na URL (H0)

## Fase 0.5 — superfícies montadas

| # | Mount | Risco pré-fix | Ação |
| --- | --- | --- | --- |
| 1 | `POST /api/v1/cms/upload` | HIGH/MED — ext de `originalname` + MIME client-only | canonical ext + magic bytes |
| 2 | `POST …/acomodacoes/import/preview\|commit` | MED — multer sem fileFilter | MIME/ext allowlist + magic |
| 3 | `GET /uploads/*` | amplifica #1 | `nosniff` no static |
| — | cloud multer / Next upload | não montados no Express | **fora** desta fatia |

## Diff

- `server/lib/secure-upload.ts` — sniff magic, canonical filename, import assert
- `server/modules/cms/upload.ts` + `routes.ts` + `index.ts`
- `server/modules/acomodacoes/routes/import.routes.ts`
- Suite `pr08-secure-upload.test.ts`

## Fora de escopo

- `initializeCloudModule` (órfão)
- Rotas Next `app/api/upload/*`
- S3 / watermark
