# F-023b - Site Publico

## 1. Visao geral

O `site-publico` e a vitrine principal do RSV360. Ele concentra descoberta,
busca, detalhe de hospedagem, conversao para reserva, perfil do usuario e
pontos de apoio de SEO tecnico.

### Objetivo funcional

- Atrair o visitante.
- Permitir busca e comparacao de hospedagens.
- Exibir detalhamento de oferta e disponibilidade.
- Encaminhar para reserva/checkout.
- Dar suporte a perfis, historico e preferencias.

## 2. Rotas e subpaginas

| Rota | Arquivo | Status | Funcao |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Criado | Home com busca, categorias e promoções |
| `/buscar` | `app/buscar/page.tsx` | Criado | Busca avancada de propriedades |
| `/hoteis` | `app/hoteis/page.tsx` | Criado | Listagem de hoteis disponiveis |
| `/hoteis/[slug]` | `app/hoteis/[slug]/page.tsx` | Parcial | Detalhe e CTA |
| `/perfil` | `app/perfil/page.tsx` | Criado | Perfil e historico |
| `/checkout` | `app/checkout/page.tsx` | Pendente | Checkout |
| `/sitemap.xml` | `app/sitemap.ts` | Pendente | SEO e indexacao |
| `/viagens-grupo` | `app/viagens-grupo/page.tsx` | Parcial | Grupos |
| `/fidelidade` | `app/fidelidade/page.tsx` | Parcial | Fidelidade |

## 3. Logica de navegacao

1. A home apresenta a proposta, categorias e atalhos de busca.
2. A busca refina por destino, datas, preco e disponibilidade.
3. A listagem mostra opcoes resumidas com filtros e ordenacao.
4. O detalhe consolida fotos, atributos, regras e CTA de reserva.
5. O checkout fecha a conversao e depende de contrato de pagamento.
6. O perfil organiza preferencias, reservas e dados persistidos.
7. `viagens-grupo` e `fidelidade` ampliam conversao e retenção.

## 4. Backlog filtrado relevante ao site-publico

### 4.1 Front-end e experiencia

| ID | Item | Status | Por que importa |
| --- | --- | --- | --- |
| BL-031 | Alinhar Next.js entre apps | A | Evita comportamento inconsistente |
| BL-032 | Eliminar warnings de build | A | Reduz ruído e risco de regressão |
| BL-033 | `output: 'standalone'` | A | Facilita deploy e imagem menor |
| BL-034 | `type-check` em `site-publico` | A | Qualidade no merge |
| BL-035 | Fluxo busca -> detalhe -> reserva | P | Jornada principal |
| BL-036 | SEO tecnico | P | SEO e descoberta |
| BL-045 | Design system unificado | P | Consistencia visual |
| BL-046 | Acessibilidade WCAG AA | A | A11y |
| BL-047 | i18n PT-BR/EN | P | Alcance e clareza |
| BL-048 | Autenticacao client-side com refresh seguro | P | Sessao sem atrito |
| BL-049 | Estado global com TanStack Query + Zod | A | Dados e validacao |
| BL-050 | Telemetria de uso | A | Funil e abandono |

### 4.2 Dependencias de backend que afetam o site-publico

| ID | Item | Status | Dependencia |
| --- | --- | --- | --- |
| BL-013 | Padronizacao da porta canonica | A | Ambiente unico para consumo |
| BL-014 | `GET /api/portal/checkin/status` | A | Fluxos de portal e reserva |
| BL-016 | Stub de `payments/checkout/session` | P | Checkout depende disso |
| BL-018 | CORS por ambiente | A | Consumo seguro no browser |
| BL-019 | CSP restritiva | A | Evita bloqueios e abuso |
| BL-020 | Validacao de disponibilidade | P | Alimenta busca e detalhe |
| BL-021 | Gateway real de pagamento | A | Fecha a jornada de reserva |
| BL-023 | Notificacoes e templates | P | Confirmação e pós-reserva |
| BL-029 | Autenticacao avancada | P | Acesso a perfil e checkout |
| BL-030 | Rate limiting | A | Protege rotas publicas |

## 5. Riscos especificos

- Divergencia de versão Next.js entre apps.
- Warnings de build ainda presentes.
- Checkout ainda depende de contrato backend.
- SEO e indexacao sem cobertura completa.
- `viagens-grupo` e `fidelidade` precisam validacao manual.

## 6. Status consolidado

| Area | Concluido | Parcial | Pendente |
| --- | --- | --- | --- |
| Rotas e pagina base | 3 | 3 | 3 |
| Conversao/checkout | 0 | 2 | 1 |
| SEO/qualidade | 0 | 2 | 2 |
| Governanca e dados | 0 | 2 | 2 |
