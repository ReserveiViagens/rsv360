# Plano de Teste Completo RSV360

## 1) Objetivo

Evitar regressao de:

- loading infinito em rotas criticas;
- erro 404 em rotas prioritarias;
- falhas de redirecionamento em rotas protegidas.

## 2) Escopo recorrente (smoke)

### Eixo 1 - Fluxos centrais

- `/`
- `/buscar`
- `/hoteis`
- `/hoteis/busca/completa`
- `/cotacao`
- `/perfil` (deve redirecionar sem autenticacao)
- `/minhas-reservas` (deve redirecionar sem autenticacao)

### Eixo 2 - Rotas admin/dashboards

- `/admin/login`
- `/admin/cms`
- `/admin/tickets`
- `/admin/verification`
- `/dashboard`
- `/dashboard/hotels`
- `/dashboard-rsv`
- `/pricing/dashboard`

### Rotas complementares priorizadas

- `/fidelidade`, `/loyalty`, `/loyalty/rewards`
- `/quality`, `/quality/dashboard`, `/quality/leaderboard`
- `/marketplace`
- `/mensagens`, `/group-chats`, `/notificacoes`, `/contato`

## 3) Criterios de aprovacao

- Nenhuma rota de alta prioridade retorna 404.
- Nenhuma rota critica fica apenas em spinner sem mensagem de erro apos o timeout de smoke.
- Em falha de backend, existe fallback amigavel ("Nao foi possivel carregar..." ou equivalente).
- Rotas protegidas redirecionam para login com parametro de retorno:
  - Usuario: `/login?redirect=<rota>`
  - Admin: `/admin/login?from=<rota>`

## 4) Criterios de pronto automatizaveis

- Smoke de `/hoteis` e `/cotacao` deve finalizar em estado terminal:
  - Conteudo principal, ou
  - Erro amigavel, e nunca "loading-only".
- Smoke de auth deve cobrir:
  - `/admin/cms`, `/admin/tickets`, `/admin/verification` -> `/admin/login?from=...`
  - `/dashboard`, `/dashboard/hotels`, `/dashboard-rsv`, `/pricing/dashboard` -> `/login?redirect=...`
- Home (`/`) deve renderizar sem depender de sucesso do header dinamico.
- Polling de conteudo publico nao pode reabrir loading full-screen.
- Cotacao deve ter timeout/retry por endpoint e botao de tentativa manual.

## 5) Backlog de testes (fora do smoke)

- Validar fluxos completos com API real para dashboards de proprietario.
- Cobrir cenarios de token expirado e reautenticacao.
- Cobrir upload/manutencao de conteudo no CMS com massa de dados maior.
