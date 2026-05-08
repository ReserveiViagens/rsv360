# F-023d - Admin

## 1. Visao geral

O `admin` centraliza operacao interna: painéis de controle, reservas, equipe,
revenue, permissões e rotinas administrativas. Ele atua como camada de gestão
para a operação do negócio.

### Objetivos do sub-app

- Dar visibilidade operacional e financeira.
- Organizar a gestão de reservas e usuarios.
- Apoiar housekeeping, revenue e integracoes.
- Servir como painel de decisao para o time interno.

## 2. Rotas e subpaginas

| Rota | Arquivo | Status | Funcao |
| --- | --- | --- | --- |
| `/dashboard` | `app/dashboard/page.tsx` | Parcial | KPIs |
| `/reservas` | `app/reservas/page.tsx` | Parcial | Reservas |
| `/housekeeping` | `app/housekeeping/page.tsx` | Parcial | Quarto |
| `/revenue` | `app/revenue/page.tsx` | Parcial | Smart pricing e tarifas |
| `/usuarios` | `app/usuarios/page.tsx` | Parcial | Usuarios |
| `/integracoes` | `app/integracoes/page.tsx` | Pendente | OTA, PMS e gateway |
| `/relatorios` | `app/relatorios/page.tsx` | Pendente | Exportacoes e BI |
| `/auditoria` | `app/auditoria/page.tsx` | Pendente | Historico e trilhas |

## 3. Logica funcional

1. O dashboard exibe o estado macro da operação.
2. Reservas consolida filtros, ações e acompanhamento.
3. Housekeeping organiza limpeza, pendencias e evidencias.
4. Revenue ajusta tarifa, demanda e regras de precificacao.
5. Usuarios controla acesso, perfis e permissões.
6. Integracoes faz a ponte com sistemas externos.

## 4. Backlog filtrado relevante ao admin

### 4.1 Backoffice e operacao

| ID | Item | Status | Importancia |
| --- | --- | --- | --- |
| BL-039 | Dashboards de ocupacao e revenue | P | Painel principal do admin |
| BL-040 | Gestao de usuarios e permissoes | P | Controle interno |
| BL-041 | Housekeeping | P | Operacao de quartos |
| BL-024 | Smart pricing | A | Revenue |
| BL-025 | Qualidade de host | A | Operacao |
| BL-026 | CRM | P | Relacionamento e follow-up |
| BL-027 | Analytics | P | Leitura de performance |
| BL-028 | Integracoes OTA/PMS | A | Sincronizacao externa |
| BL-029 | Autenticacao avancada | P | Seguranca do admin |
| BL-030 | Rate limiting | A | Protecao de rotas |

### 4.2 Dependencias compartilhadas

| ID | Item | Status | Observacao |
| --- | --- | --- | --- |
| BL-013 | Padronizacao da porta canonica | A | Ambiente unico |
| BL-018 | CORS por ambiente | A | Consumo seguro |
| BL-019 | CSP restritiva | A | Seguranca do navegador |
| BL-020 | Validacao de disponibilidade | P | Ajuda reservas |
| BL-023 | Notificacoes e templates | P | Fluxos administrativos |
| BL-031 | Alinhar Next.js entre apps | A | Consistencia |
| BL-032 | Eliminar warnings de build | A | Menos ruido |

## 5. Riscos especificos

- Dashboards podem depender de dados ainda nao consolidados no banco.
- Integracoes externas pedem contratos e tokens bem definidos.
- `revenue` precisa alinhar regras com disponibilidade real.
- O painel admin deve evitar duplicacao de experiencia com outros apps.

## 6. Status consolidado

| Area | Concluido | Parcial | Pendente |
| --- | --- | --- | --- |
| Painel e reservas | 0 | 2 | 0 |
| Operacao interna | 0 | 1 | 0 |
| Revenue e analytics | 0 | 2 | 1 |
| Integracoes e seguranca | 0 | 1 | 2 |
