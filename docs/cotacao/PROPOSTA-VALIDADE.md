# Validade comercial da proposta

## Semântica (pós-hardening)

- **`valido_ate`** é validade **comercial** — aplica-se **somente até o aceite** da proposta.
- Status `accepted`, `paid` ou `converted` → roteiro e documento da viagem **nunca** são tratados como expirados por `valido_ate`.
- Worker `expirar-proposta` **não** altera propostas em status fechado (`PROPOSTA_STATUS_FECHADO`).

## Configuração

- Horas: `configuracoes_sistema.modulo_propostas.validadeCotacaoHoras` (default **48h**, opções 24/48/72 no admin).
- Aplicada em `gerar-proposta` via `aplicarValidadeProposta`.

## API pública

| Situação | GET proposta / roteiro |
|----------|------------------------|
| Pendente + dentro da validade | Payload completo |
| Pendente + expirada | Payload **mínimo** (`payloadReduzido`) — sem `valorTotal`, `conteudo`, `dailySchedule`; inclui `recotacaoUrl` e `whatsappUrl` |
| Aceita / paga | Payload completo; `/roteiro/:token` sem banner de expirada |

## Aceite

- `POST .../aceitar` continua bloqueando proposta comercialmente expirada (`403`).

## Backfill

- Migration `0036_proposta_expired_pos_aceite_backfill.sql` — corrige `expired` com evento `public_accept`.

## Fora de escopo (backlog)

- Roteiro inteligente stale (snapshot `dailySchedule` sem refresh).
