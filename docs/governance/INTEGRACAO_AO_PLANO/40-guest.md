# F-023e - Guest

## 1. Visao geral

O `guest` e a area do hospede apos a confirmacao da reserva. Ele concentra
check-in, check-out, comunicacao, consumo, documentos e interacoes durante a
estadia.

### Objetivos do sub-app

- Permitir autoatendimento do hospede.
- Facilitar check-in e check-out digital.
- Centralizar mensagens e alertas da estadia.
- Exibir conta do quarto, extras e comprovantes.

## 2. Rotas e subpaginas

| Rota | Arquivo | Status | Funcao |
| --- | --- | --- | --- |
| `/portal` | `app/portal/page.tsx` | Parcial | Home do hospede |
| `/portal/checkin` | `app/portal/checkin/page.tsx` | Parcial | Check-in |
| `/portal/checkout` | `app/portal/checkout/page.tsx` | Pendente | Check-out |
| `/portal/faturas` | `app/portal/faturas/page.tsx` | Pendente | Faturas |
| `/portal/chat` | `app/portal/chat/page.tsx` | Pendente | Chat |
| `/portal/extras` | `app/portal/extras/page.tsx` | Pendente | Extras |
| `/portal/avaliacoes` | `app/portal/avaliacoes/page.tsx` | Pendente | Review |
| `/portal/consumo` | `app/portal/consumo/page.tsx` | Pendente | Consumo |

## 3. Logica funcional

1. O portal abre com o resumo da reserva ativa.
2. O check-in coleta dados, confirma identidade e libera acesso.
3. O checkout consolida consumo, extras e survey final.
4. Faturas e recibos permitem download e auditoria.
5. O chat conecta hospede, recepcao e apoio operacional.
6. Extras oferece upsell durante a estadia.

## 4. Backlog filtrado relevante ao guest

### 4.1 Jornada do hospede

| ID | Item | Status | Importancia |
| --- | --- | --- | --- |
| BL-042 | Portal de check-in/out | P | Eixo do guest |
| BL-043 | Faturas e PDFs | A | Documentos |
| BL-044 | Chat/mensageria | A | Suporte |
| BL-048 | Autenticacao client-side com refresh seguro | P | Sessao |
| BL-059 | Tokens de portal | P | Entrada |

### 4.2 Dependencias compartilhadas

| ID | Item | Status | Observacao |
| --- | --- | --- | --- |
| BL-014 | `GET /api/portal/checkin/status` | A | Check-in |
| BL-016 | Stub de `payments/checkout/session` | P | Checkout |
| BL-018 | CORS por ambiente | A | Browser |
| BL-019 | CSP restritiva | A | Portal |
| BL-023 | Notificacoes e templates | P | Alertas |
| BL-029 | Autenticacao avancada | P | Sessao |
| BL-030 | Rate limiting | A | Protecao |

## 5. Fronteiras de escopo

- `site-publico` cobre a reserva antes da confirmacao.
- `guest` comeca depois da reserva confirmada.
- Se houver login ou confirmacao compartilhada, referenciar o site publico.
- Alertas do admin sao apenas consumidos aqui.

## 6. Riscos especificos

- O check-in depende de uma cadeia de autenticacao e dados do portal.
- Checkout, faturas e consumo precisam alinhar com o backend de reservas.
- A comunicacao com a recepcao precisa evitar duplicacao com admin.
- Avaliacoes e extras devem ser integrados sem friccao na jornada.

## 7. Status consolidado

| Area | Concluido | Parcial | Pendente |
| --- | --- | --- | --- |
| Portal e check-in | 0 | 2 | 0 |
| Checkout e documentos | 0 | 0 | 2 |
| Comunicacao | 0 | 1 | 1 |
| Consumo e avaliacao | 0 | 0 | 2 |
