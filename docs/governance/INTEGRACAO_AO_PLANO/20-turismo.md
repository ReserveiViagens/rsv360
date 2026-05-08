# F-023c - Turismo

## 1. Visao geral

O `turismo` e o catalogo de experiencias, pacotes e atracoes. Ele organiza a
oferta turistica por destino, periodo e tipo de viagem, servindo como camada
de descoberta e inspiracao para conversao futura.

### Objetivos do sub-app

- Apresentar pacotes, atracoes e itinerarios.
- Filtrar ofertas por destino, data e categoria.
- Conectar a jornada do visitante com reservas e grupos.
- Sustentar geolocalizacao e recomendacoes futuras.

## 2. Rotas e subpaginas

| Rota | Arquivo | Status | Funcao |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Criado | Vitrine de pacotes e destinos |
| `/pacotes` | `app/pacotes/page.tsx` | Parcial | Catalogo com filtros |
| `/pacotes/[id]` | `app/pacotes/[id]/page.tsx` | Parcial | Detalhe |
| `/atracoes` | `app/atracoes/page.tsx` | Parcial | Lista de atracoes |
| `/mapa` | `app/mapa/page.tsx` | Pendente | Geolocalizacao e POIs |
| `/grupos` | `app/grupos/page.tsx` | Pendente | Viagens em grupo |
| `/resumos` | `app/resumos/page.tsx` | Pendente | Consolida roteiros |

## 3. Logica funcional

1. A home do turismo destaca destinos, destaques e atalhos.
2. A pagina de pacotes filtra por preco, data e categoria.
3. O detalhe do pacote apresenta itinerario, duracao e inclusos.
4. A pagina de atracoes separa passeios, ingressos e atividades.
5. A area de grupos organiza cotas, participantes e regras.
6. O mapa deve permitir exploracao espacial e proximidade.

## 4. Backlog filtrado relevante ao turismo

### 4.1 Front-end e experiencia

| ID | Item | Status | Importancia |
| --- | --- | --- | --- |
| BL-037 | Catalogo de pacotes e atracoes | P | Eixo principal do sub-app |
| BL-038 | Mapas e geolocalizacao | A | Descoberta por localizacao |
| BL-045 | Design system unificado | P | Coerencia entre apps |
| BL-046 | Acessibilidade WCAG AA | A | Uso inclusivo |
| BL-047 | i18n PT-BR/EN | P | Alcance e clareza |
| BL-049 | Estado global com TanStack Query + Zod | A | Consistencia de dados |
| BL-050 | Telemetria de uso | A | Medir conversao e abandono |

### 4.2 Dependencias compartilhadas

| ID | Item | Status | Observacao |
| --- | --- | --- | --- |
| BL-031 | Alinhar Next.js entre apps | A | Impacta todos os frontends |
| BL-032 | Eliminar warnings de build | A | Reduz ruido de integracao |
| BL-033 | `output: 'standalone'` | A | Ajuda deploy e imagem |
| BL-034 | `type-check` em `site-publico` | A | Nao repete aqui |
| BL-020 | Validacao de disponibilidade | P | Base para conversao futura |
| BL-023 | Notificacoes e templates | P | Confirma oferta e reserva |
| BL-028 | Integracoes OTA/PMS | A | Pode alimentar catalogo |
| BL-029 | Autenticacao avancada | P | Reuso em jornadas persistentes |

## 5. Riscos especificos

- Pode duplicar jornada de descoberta com `site-publico` se o conteudo não
  ficar bem segmentado.
- O mapa depende de dados geograficos ainda nao formalizados.
- `grupos` e `resumos` precisam alinhamento com reservas.
- A cobertura de SEO e conversao é menor que a do `site-publico`.

## 6. Status consolidado

| Area | Concluido | Parcial | Pendente |
| --- | --- | --- | --- |
| Paginas base | 1 | 3 | 3 |
| Catálogo e busca | 0 | 2 | 1 |
| Mapa e grupos | 0 | 0 | 2 |
| Governanca e dados | 0 | 2 | 2 |
