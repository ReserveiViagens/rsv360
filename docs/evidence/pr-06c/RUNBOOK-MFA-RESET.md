# PR-06c — Runbook: MFA reset + account unlock (owner)

> **Sem valores.** Referência também em `docs/SEGREDOS.md`.

## Pré-condições

- Flags de enforcement só ligam na janela coordenada (aviso ≥24h · canário do owner).
- Endpoints admin ops exigem `AUTH_MFA_ADMIN_OPS=true` + bearer com role `admin|manager`.
- Nunca expor reset/unlock em UI pública.

## Reset MFA (procedimento administrativo)

1. Confirmar identidade do titular por canal independente (fora do app).
2. Registrar motivo (≥8 chars).
3. Com ops flag ligada:

```bash
curl -sS -X POST "$API/api/v1/auth/admin/reset-mfa" \
  -H "Authorization: Bearer $OPERATOR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":123,"reason":"titular perdeu authenticator e recovery","target_role":"admin"}'
```

4. Auditar logs: `MFAResetRequested` · `MFAResetCompleted` (sem TOTP/secret/recovery).
5. Titular refaz enrollment na janela (se aberta) ou owner reabre janela via `AUTH_MFA_ENROLLMENT_START_AT`.

## Unlock de conta (lockout progressivo)

```bash
curl -sS -X POST "$API/api/v1/auth/admin/unlock-account" \
  -H "Authorization: Bearer $OPERATOR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"account_key":"user@example.com","reason":"falso positivo apos incidente rede"}'
```

Desbloqueio automático ao fim de 15/30/60 min; antecipado só por este procedimento.

## Último recurso do owner (servidor/DB)

Se ops API indisponível:

1. Conectar ao Postgres do ambiente (credenciais só no secret store — nunca neste doc).
2. Limpar proteção da conta:

```sql
DELETE FROM auth_login_protection WHERE account_key = 'user@example.com';
```

3. (Opcional) remover MFA para forçar re-enrollment:

```sql
DELETE FROM login_2fa_challenges WHERE user_id = 123;
DELETE FROM user_2fa WHERE user_id = 123;
```

4. Registrar auditoria manual (operador · conta · motivo · timestamp) no canal de ops.

## Ativação (não é efeito do merge)

| Flag | Default | Efeito |
|------|---------|--------|
| `AUTH_LOGIN_PROTECTION_ENABLED` | `false` | Turnstile pós-3 + lockout 15→30→60 |
| `AUTH_MFA_ENFORCE` | `false` | TOTP obrigatório admin\|manager |
| `AUTH_MFA_ENROLLMENT_START_AT` | vazio | Janela 72h só com ISO explícito |
| `AUTH_MFA_ADMIN_OPS` | `false` | Libera unlock/reset MFA |
