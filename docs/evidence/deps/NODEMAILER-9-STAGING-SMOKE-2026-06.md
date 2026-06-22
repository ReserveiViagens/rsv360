# Nodemailer 9 — staging smoke (#543)

**Data:** 2026-06-22  
**Branch:** `dependabot/npm_and_yarn/nodemailer-9.0.1`  
**Resultado:** **PASS**

## Procedimento

Smoke em ambiente de staging local (Ethereal — mesmo padrão de `server/modules/communication/providers/email/nodemailer.provider.ts` em dev):

1. `nodemailer@9.0.1` instalado (root)
2. `createTestAccount()` → conta Ethereal
3. `transporter.verify()` → OK
4. `sendMail()` → `messageId` retornado
5. `getTestMessageUrl(info)` → URL de preview válida

## Evidência

```
nodemailer version: 9.0.1
STAGING_SMOKE_PASS 9.0.1 <3f9a0d91-84e5-7e47-59c3-c40d375e29c4@rsv360.dev>
preview: https://ethereal.email/message/ajkofqtu2Pi7q0ayajkohfsdSb1TykU5AAAAAaB3PJ7Kr2tsMjBDyggPrAc
```

## Decisão

**Merge #543 aprovado** após smoke PASS. SMTP real em produção deve ser validado no próximo deploy staging com credenciais do ambiente.
