# Melhorias: Atração, Intuitividade e “Monte suas férias”

Objetivo: tornar o site **mais atrativo**, **intuitivo** e **inteligente**, com **cards laterais** mais envolventes e uma experiência em que o **cliente monte seu próprio roteiro** (melhor hotel, passeio, atração, parque + add-ons).

---

## Índice

1. [Visão geral: atrativo, intuitivo, inteligente](#1-visão-geral-atrativo-intuitivo-inteligente)
2. [Cards laterais: Descubra experiências e Oportunidades do dia](#2-cards-laterais-descubra-experiências-e-oportunidades-do-dia)
3. [“Monte suas férias”: roteiro personalizado](#3-monte-suas-férias-roteiro-personalizado)
4. [Efeitos visuais nos cards (imagens, vídeos, animações)](#4-efeitos-visuais-nos-cards)
5. [Add-ons sugeridos e integração](#5-add-ons-sugeridos-e-integração)
6. [Referências de código e próximos passos](#6-referências-de-código-e-próximos-passos)

---

# 1. Visão geral: atrativo, intuitivo, inteligente

| Pilar | Objetivo | Exemplos de ação |
|-------|----------|-------------------|
| **Atrativo** | Primeira impressão forte, desejo de explorar | Cards com imagem/vídeo, microanimações, gradientes, “Oferta da semana” em destaque |
| **Intuitivo** | Usuário acha o que quer sem esforço | CTA “Monte suas férias” visível, breadcrumb do roteiro, um fluxo único: datas → hotel → parque → atração → add-ons → revisão |
| **Inteligente** | Sensação de personalização e economia | Sugestões por destino/datas, contadores “X opções ativas”, “Últimas X reservas”, timer em Flash Deals, “Quem viu isso também reservou” |

Sugestão de **copy** na home:  
*“Monte suas férias: escolha hotel, parque, atrações e extras em um só lugar.”*

---

# 2. Cards laterais: Descubra experiências e Oportunidades do dia

## 2.1 Estado atual (resumo)

- **Esquerda:** “Descubra experiências” – Aluguel por temporada, Reservas de hotéis, Parques aquáticos, Atrações e passeios, Leilões de viagem. Só texto + badge; `image` existe no tipo mas não é usada no layout.
- **Direita:** “Oportunidades do dia” – Flash Deals, Viagens em grupo, Excursões, Oferta da semana. Mesmo padrão.

## 2.2 Melhorias por card (experiência do usuário)

### Lateral esquerda – Descubra experiências

| Card | Melhoria de conteúdo / UX | Dado extra sugerido |
|------|---------------------------|----------------------|
| Aluguel por temporada | “Casas e flats para família e grupos” + imagem de imóvel; CTA “Ver oferta” | `image`, opcional `count` |
| Reservas de hotéis | Manter “41 opções ativas” (dinâmico); imagem de quarto ou fachada | `image`, `count` (já usado) |
| Parques aquáticos | “5 opções ativas”; imagem de parque/piscina | `image`, `count` |
| Atrações e passeios | “7 opções ativas”; imagem de passeio | `image`, `count` |
| Leilões de viagem | “Ofertas com lances e economia real”; badge “Leilão” com leve destaque | `image` opcional |

### Lateral direita – Oportunidades do dia

| Card | Melhoria de conteúdo / UX | Dado extra sugerido |
|------|---------------------------|----------------------|
| Flash Deals | Timer “Termina em Xh” ou “11 opções”; sensação de urgência | `image`, `expiresAt` ou `count` |
| Viagens em grupo | “Pacotes para amigos, família e equipes”; ícone ou foto de grupo | `image` |
| Excursões | “Roteiros prontos com suporte completo” | `image` |
| Oferta da semana | Destaque visual (borda, ícone “Destaque”); “Selecionados com alta procura” | `image`, `highlight: true` |

## 2.3 Modelo de dados sugerido (side rails)

Ampliar `SideRailItem` em `lib/home-side-rails.ts` para suportar mídia e destaque:

```ts
// Em lib/home-side-rails.ts – estender SideRailItem
export interface SideRailItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  image?: string;
  // Novos (opcional):
  videoUrl?: string;       // vídeo curto em hover ou clique
  imageAlt?: string;
  highlight?: boolean;     // Oferta da semana, etc.
  expiresAt?: string;     // ISO para Flash Deals (timer)
  count?: number;         // já derivado em parte; pode vir da API
}
```

Assim os cards podem exibir imagem/vídeo, timer e destaque sem quebrar o fallback atual.

---

# 3. “Monte suas férias”: roteiro personalizado

## 3.1 Conceito

O cliente **monta o roteiro** em um fluxo guiado:

1. **Datas e pessoas** (check-in, check-out, adultos, crianças).
2. **Hotel** – escolher 1 ou mais (melhor custo-benefício, localização, etc.).
3. **Parque aquático** – ingressos/combos (opcional).
4. **Atrações e passeios** – escolher o que fazer (opcional).
5. **Add-ons** – Roupa de cama, Café da manhã, Almoço (quando disponível).
6. **Revisão e envio** – resumo + “Solicitar cotação” ou “Falar no WhatsApp”.

Objetivo: **um único fluxo** (“Monte suas férias”) em vez de várias telas soltas.

## 3.2 O que já existe (cotação)

- **Rota:** `/cotacao`
- **Steps:** `QuoteStepDates` → `QuoteStepProducts` (hotéis, ingressos, atrações) → `QuoteStepAddOns` (Café da manhã, Roupa de cama) → `QuoteStepContact` → `QuoteStepReview`
- **Estado:** `CotacaoState` em `components/cotacao/cotacao-utils.ts` com `hotelIds`, `ticketIds`, `attractionIds`, `addOns` (por hotel: `cafeDaManha`, `roupaDeCama`).

Ou seja: a base para “monte suas férias” já está na cotação; falta **nomear**, **destacar** e **enriquecer** (copy, add-on Almoço, imagens nos produtos).

## 3.3 Melhorias no fluxo “Monte suas férias”

| Onde | Melhoria |
|------|----------|
| **Home e side rails** | CTA claro: “Monte suas férias” ou “Montar roteiro” apontando para `/cotacao`. Opcional: mesmo fluxo em `/monte-suas-ferias` (redirect ou alias). |
| **Step 1 – Datas** | Títulos: “Quando?” / “Quantas pessoas?”. Placeholder touch-friendly; calendário em popover no mobile. |
| **Step 2 – Produtos** | Títulos: “Escolha seu hotel”, “Parques aquáticos”, “Atrações e passeios”. Cards com imagem, preço desde, badge “Mais reservado”. |
| **Step 3 – Add-ons** | Manter Café da manhã e Roupa de cama; **incluir Almoço** quando o hotel/parceiro oferecer (ver seção 5). Copy: “Complete sua experiência”. |
| **Step 4 – Contato** | “Quase lá: seus dados para enviarmos a cotação.” |
| **Step 5 – Revisão** | Resumo em “roteiro”: datas + hotel + parque + atrações + add-ons; botão “Solicitar cotação” ou “Enviar por WhatsApp”. |

## 3.4 Add-ons desejados pelo cliente

- **Roupa de cama** – já existe no fluxo.
- **Café da manhã** – já existe.
- **Almoço** – sugerido como novo add-on (incluir no modelo e na UI quando houver oferta; pode ser por hotel ou por pacote).

Implementação sugerida: em `cotacao-utils.ts` e em `QuoteStepAddOns`, estender `addOns` com `almoco?: boolean` e, na API/backend, considerar almoço nos pacotes quando disponível.

---

# 4. Efeitos visuais nos cards

## 4.1 Objetivo

Deixar os cards das **laterais** (e, se quiser, os da home) mais envolventes com **imagem**, **vídeo leve** ou **animação**, sem prejudicar performance nem acessibilidade.

## 4.2 Sugestões por tipo de efeito

| Efeito | Onde | Como implementar (resumo) |
|--------|------|----------------------------|
| **Imagem de fundo** | Cada card do side rail | Usar `SideRailItem.image`; card com `overflow-hidden`, imagem em `absolute` com gradiente por cima; texto em `relative z-10`. |
| **Hover: leve zoom + sombra** | Todos os cards | Já existe `hover:-translate-y-0.5` e `hover:shadow-lg`; pode acrescentar `hover:scale-[1.02]` e `transition-transform duration-300`. |
| **Vídeo curto (hover ou autoplay mute)** | Card “Oferta da semana” ou Flash Deals | Opcional: `videoUrl` no item; `<video muted loop playsInline>` dentro do card; carregar só quando `inView` ou no hover para não pesar. |
| **Badge animado** | Flash Deals, Oferta da semana | `animate-pulse` ou pequena animação CSS (ex.: brilho) no badge. |
| **Gradiente no card** | Título da seção (Descubra / Oportunidades) | Manter gradiente atual; nos itens, opcional gradiente sutil no topo da imagem. |
| **Skeleton ao carregar** | Side rails | Enquanto `loading`, mostrar cards com `animate-pulse` e altura fixa. |
| **Ícone ou ilustração** | Se não houver imagem | Fallback por `id` (ex.: hotel → ícone hotel, parques → ícone água) para não deixar card vazio. |

## 4.3 Exemplo de estrutura de card com imagem (side rail)

```tsx
// Pseudocódigo para um item do side rail
<Card className="group overflow-hidden ...">
  {item.image && (
    <div className="relative h-24 overflow-hidden">
      <Image src={item.image} alt={item.imageAlt ?? item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  )}
  <CardContent className="p-3.5 ...">
    <h3>...</h3>
    <p className="subtitle">...</p>
    <p className="text-blue-700 ...">Ver oferta</p>
  </CardContent>
</Card>
```

Assim os cards ficam mais atrativos e ainda funcionam sem `image` (só texto, como hoje).

---

# 5. Add-ons sugeridos e integração

## 5.1 Hoje

- **Café da manhã** e **Roupa de cama** em `QuoteStepAddOns`, baseados em `getHotelEligibleAddOns(hotel)` (features do hotel).

## 5.2 Incluir “Almoço”

- **Modelo:** em `CotacaoState.addOns`, algo como `cafeDaManha`, `roupaDeCama`, `almoco`.
- **Eligibilidade:** mesmo critério que café (ex.: lista de features do hotel ou oferta de meia pensão); pode criar `ALMOCO_TERMS` em `cotacao-utils.ts` e estender `getHotelEligibleAddOns` para retornar `almoco: boolean`.
- **UI:** em `QuoteStepAddOns`, mais um checkbox “Almoço” quando `almoco === true`.

Isso completa o trio Roupa de cama + Café da manhã + Almoço pedido pelo cliente.

---

# 6. Referências de código e próximos passos

## 6.1 Arquivos principais

| O quê | Arquivo |
|-------|---------|
| Dados e tipo dos side rails | `lib/home-side-rails.ts` |
| Card lateral esquerdo | `components/home/left-side-rail.tsx` |
| Card lateral direito | `components/home/right-side-rail.tsx` |
| Fluxo cotação / Monte suas férias | `app/cotacao/page.tsx` |
| Steps da cotação | `components/cotacao/QuoteStep*.tsx` |
| Estado e add-ons | `components/cotacao/cotacao-utils.ts` |

## 6.2 Ordem sugerida de implementação

1. **Cards laterais**
   - Estender `SideRailItem` com `image`, `imageAlt`, `highlight`, `expiresAt` (e usar no fallback/API).
   - Em `left-side-rail.tsx` e `right-side-rail.tsx`: renderizar imagem no topo do card, hover (scale + sombra), skeleton quando `loading`.
   - (Opcional) Vídeo em 1–2 cards e badge animado em Flash / Oferta da semana.

2. **“Monte suas férias”**
   - Renomear ou destacar na home e nos rails: CTA “Monte suas férias” → `/cotacao`.
   - Ajustar títulos dos steps (Quando? / Hotel / Parques / Atrações / Extras / Revisão).
   - Incluir add-on **Almoço** em `cotacao-utils.ts` e em `QuoteStepAddOns`.

3. **Inteligente**
   - Manter/ajustar contagens dinâmicas (“X opções ativas”) nos side rails.
   - (Futuro) Timer em Flash Deals se `expiresAt` existir; “Últimas reservas” ou “Mais reservado” nos cards de produto.

4. **Performance e acessibilidade**
   - Imagens dos cards com `loading="lazy"` e dimensões fixas; vídeo só sob demanda (hover ou inView).
   - Textos alternativos e contraste para leitores de tela.

---

*Documento: Melhorias atratividade, UX e Monte suas férias. Projeto: RSV360 – Site Público.*
