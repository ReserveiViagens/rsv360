# Melhorias Mobile: Cross-sell e Distribuição Dinâmica das Barras Laterais

Documento técnico para distribuir os itens das barras laterais (Descubra Experiências e Oportunidades do Dia) na versão mobile, com foco em **cross-sell**, **produtos complementares**, **imagens aleatórias** e **animações atrativas**.

---

## Índice

1. [Objetivo](#1-objetivo)
2. [Conceito: produto completa o outro](#2-conceito-produto-completa-o-outro)
3. [Regras de posicionamento por página](#3-regras-de-posicionamento-por-página)
4. [Matriz de cross-sell e complementaridade](#4-matriz-de-cross-sell-e-complementaridade)
5. [Estrutura do componente reutilizável](#5-estrutura-do-componente-reutilizável)
6. [Imagens aleatórias](#6-imagens-aleatórias)
7. [Animações atrativas](#7-animações-atrativas)
8. [Usabilidade dinâmica](#8-usabilidade-dinâmica)
9. [Exemplos de uso](#9-exemplos-de-uso)
10. [Referências de código e próximos passos](#10-referências-de-código-e-próximos-passos)

---

## 1. Objetivo

- **Mobile:** Em vez de ocultar as barras laterais (`hidden md:block`), **distribuir** seus itens ao longo das páginas.
- **Contexto:** Inserir cards entre listas (hotéis, promoções, atrações) e em páginas de detalhe, com **relevância contextual**.
- **Objetivo de negócio:** Aumentar cliques e conversões por meio de sugestões que **complementam** o que o usuário está vendo (ex.: viu hotel → sugerir parque; viu parque → sugerir hotel).

---

## 2. Conceito: produto completa o outro

| Usuário está em…       | Sugerir…                 | Mensagem de contexto                          |
|------------------------|---------------------------|-----------------------------------------------|
| Lista de hotéis        | Parques, Atrações         | "Complete sua viagem com diversão"            |
| Detalhe do hotel       | Parques, Atrações         | "Parques próximos a este hotel"               |
| Lista de parques       | Hotéis                    | "Onde se hospedar em Caldas Novas"            |
| Lista de atrações      | Hotéis, Parques           | "Monte o pacote ideal"                        |
| Flash Deals            | Viagens em grupo          | "Leve a família: pacotes em grupo"            |
| Promoções              | Leilões                   | "Economize mais: leilões de viagem"           |
| Home                   | Mix de oportunidades      | "Descubra experiências" / "Oportunidades do dia" |

**Lógica:** O produto sugerido **complementa** ou é **similar/inverso** ao produto atual. Ex.: Hotel ↔ Parque (quem busca hotel quer diversão); Parque ↔ Hotel (quem busca parque precisa de onde ficar).

---

## 3. Regras de posicionamento por página

### 3.1 Home (`/`)

| Posição                  | O que exibir                             | Frequência |
|--------------------------|------------------------------------------|------------|
| Após categorias          | 1 card “Oportunidades do dia” (destaque) | 1x         |
| Após card PROMOFÉRIAS    | 2 cards “Descubra” (ex.: Hotéis + Parques) | 1x       |
| Entre Trust Badges e Quick Access | 1 card “Flash Deals” ou “Oferta da semana” | 1x   |
| Após Quick Access        | 2 cards cruzados (ex.: Atrações + Aluguel temporada) | 1x |

### 3.2 Lista de hotéis (`/hoteis`, `/hoteis/busca/*`)

| Posição           | O que exibir                    | Regra |
|-------------------|---------------------------------|-------|
| A cada 4 cards    | 1 card “Parques” ou “Atrações”  | Rotação: Parques, Atrações, Excursões |
| Após lista        | 1 card “Viagens em grupo”       | Complementar para famílias |

### 3.3 Lista de parques / ingressos (`/ingressos`)

| Posição           | O que exibir                    | Regra |
|-------------------|---------------------------------|-------|
| A cada 4 cards    | 1 card “Hotéis” ou “Aluguel temporada” | Alternância |
| Após lista        | 1 card “Monte suas férias” (link `/cotacao`) | CTA principal |

### 3.4 Lista de atrações (`/atracoes`)

| Posição           | O que exibir                    | Regra |
|-------------------|---------------------------------|-------|
| A cada 3 cards    | 1 card “Hotéis” ou “Parques”    | Cross-sell |
| Após lista        | 1 card “Excursões”              | Roteiros prontos |

### 3.5 Lista de promoções (`/promocoes`)

| Posição           | O que exibir                    | Regra |
|-------------------|---------------------------------|-------|
| A cada 4 cards    | 1 card “Flash Deals” ou “Leilões” | Urgência / economia |
| Após lista        | 1 card “Viagens em grupo”       | Pacotes |

### 3.6 Flash Deals (`/flash-deals`)

| Posição           | O que exibir                    | Regra |
|-------------------|---------------------------------|-------|
| A cada 3 deals    | 1 card “Oferta da semana” ou “Viagens em grupo” | Oportunidades |

### 3.7 Detalhe do hotel (`/hoteis/[id]`)

| Posição                 | O que exibir                    | Regra |
|-------------------------|---------------------------------|-------|
| Após galeria/descrição  | 2 cards: “Parques” + “Atrações” | Complemento direto |
| Acima do CTA reservar   | 1 card “Monte suas férias”      | CTA secundário |

### 3.8 Detalhe de parque / atração

| Posição           | O que exibir                    | Regra |
|-------------------|---------------------------------|-------|
| Após descrição    | 2 cards: “Hotéis” + “Excursões” | Onde ficar + roteiros |

---

## 4. Matriz de cross-sell e complementaridade

```
                    HOTÉIS  PARQUES  ATRAÇÕES  PROMO  FLASH  GRUPO  EXCURSÕES  LEILÕES  ALUGUEL
HOTÉIS                -       ✓         ✓        ✓      ✓      ✓       ✓         -        ✓
PARQUES              ✓        -         ✓        ✓      ✓      ✓       ✓         -        ✓
ATRAÇÕES             ✓        ✓         -        ✓      ✓      ✓       ✓         -        ✓
PROMOÇÕES            ✓        ✓         ✓        -      ✓      ✓       ✓         ✓        ✓
FLASH DEALS          ✓        ✓         ✓        ✓      -      ✓       ✓         -        ✓
VIAGENS GRUPO        ✓        ✓         ✓        ✓      ✓      -       ✓         -        ✓
EXCURSÕES            ✓        ✓         ✓        ✓      ✓      ✓       -         -        ✓
LEILÕES              ✓        ✓         ✓        ✓      ✓      ✓       ✓         -        ✓
ALUGUEL TEMPORADA    ✓        ✓         ✓        ✓      ✓      ✓       ✓         -        -
```

**Uso:** Para cada `página_atual`, escolher 1–3 itens com ✓ na coluna correspondente, priorizando complementaridade (ex.: hotel → parque, parque → hotel).

---

## 5. Estrutura do componente reutilizável

### 5.1 Nome sugerido

`MobileCrossSellCard` ou `DistributedRailCard`

### 5.2 Props

```ts
interface MobileCrossSellCardProps {
  item: SideRailItem;           // dados do item (title, subtitle, href, badge, image, etc.)
  variant?: "compact" | "full"; // compact: menor; full: mais destaque
  position?: "inline" | "block";// inline: entre cards; block: seção inteira
  context?: PageContext;        // "hotels" | "parks" | "attractions" | "home" | etc.
  randomImage?: boolean;        // usar imagem aleatória do pool
  animation?: "fade" | "slide" | "scale" | "none";
}
```

### 5.3 Estrutura visual (sugestão)

```
┌─────────────────────────────────────┐
│  [IMAGEM - aleatória ou do item]    │  ← altura ~100–120px, gradiente
│  (gradiente overlay)                │
├─────────────────────────────────────┤
│  [BADGE]              título        │
│  descrição / subtítulo              │
│  [CTA: Ver oferta / Abrir agora]    │
└─────────────────────────────────────┘
```

### 5.4 Hook / utilitário de seleção

```ts
// Exemplo: selecionar itens para cross-sell dado o contexto da página
function getCrossSellItems(
  context: PageContext,
  excludeIds?: string[],
  limit?: number
): SideRailItem[];
```

---

## 6. Imagens aleatórias

### 6.1 Pool de imagens por categoria

| Categoria   | IDs dos itens        | Pool (exemplos Unsplash) |
|------------|----------------------|---------------------------|
| Hospedagem | hotels, season-rentals | casas, quartos, piscinas |
| Parques    | water-parks          | parques aquáticos, toboáguas |
| Atrações   | attractions          | passeios, natureza, jardins |
| Ofertas    | flash-deals, weekly-offer | praia, sol, viagem |
| Grupo      | group-travel         | família, amigos, grupo |
| Excursões  | excursions           | ônibus, roteiro, destino |
| Leilões    | auctions             | lances, economia |

### 6.2 Lógica de aleatoriedade

- **Por sessão:** Ao montar a página, sortear 1 imagem do pool para cada card exibido (evitar troca constante durante scroll).
- **Seed opcional:** Usar `item.id + Math.floor(Date.now() / 60000)` para mudar a cada minuto, mantendo coerência dentro da mesma sessão.
- **Fallback:** Se não houver pool, usar `item.image` fixa do `SideRailItem`.

### 6.3 Exemplo de pool (estrutura)

```ts
const IMAGE_POOL: Record<string, string[]> = {
  "hotels": [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=160&fit=crop",
    // ...
  ],
  "water-parks": [ /* ... */ ],
  "attractions": [ /* ... */ ],
  // ...
};

function getRandomImage(itemId: string): string {
  const key = mapItemIdToPoolKey(itemId);
  const pool = IMAGE_POOL[key] ?? [defaultImage];
  return pool[Math.floor(Math.random() * pool.length)];
}
```

---

## 7. Animações atrativas

### 7.1 Entrada (ao aparecer no viewport)

| Animação | Uso        | CSS / implementação                      |
|----------|------------|------------------------------------------|
| Fade-in  | Padrão     | `animate-in fade-in duration-500`        |
| Slide-up | Destaque   | `animate-in slide-in-from-bottom-4`      |
| Scale    | Ofertas    | `animate-in zoom-in-95`                  |

### 7.2 Hover / toque (mobile)

- Leve elevação: `hover:shadow-lg` ou `active:scale-[0.98]`
- Borda: `hover:border-blue-300` ou `focus:ring-2`
- Transição: `transition-all duration-200`

### 7.3 Badge em ofertas (Flash, Oferta da semana)

- `animate-pulse` no badge
- Ou animação customizada de brilho (shimmer) em CSS

### 7.4 Scroll (opcional)

- Cards entram com pequeno delay escalonado (stagger) ao rolar
- Usar `IntersectionObserver` + classe `animate-in` quando `isIntersecting`

---

## 8. Usabilidade dinâmica

### 8.1 Prioridades

1. **Contexto:** Sempre mostrar sugestões que façam sentido para a página atual (matriz de cross-sell).
2. **Não repetir:** Evitar o mesmo item 2x na mesma viewport.
3. **Diversificar:** Alternar entre “Descubra” e “Oportunidades” ao intercalar.
4. **CTA claro:** Texto direto: “Ver oferta”, “Abrir agora”, “Completar pacote”.

### 8.2 Responsividade

- Cards em **largura total** no mobile (100% ou `max-w` do container).
- Altura da imagem: ~100–120px.
- Área de toque: mínimo 44px de altura em botões/links.

### 8.3 Acessibilidade

- `alt` descritivo nas imagens.
- Contraste adequado (texto sobre gradiente).
- `aria-label` em links/botões quando necessário.

---

## 9. Exemplos de uso

### 9.1 Home – após categorias

```tsx
// Inserir 1 card "Oferta da semana" ou "Flash Deals"
<MobileCrossSellCard
  item={rightSection.items.find(i => i.id === "weekly-offer")}
  variant="full"
  context="home"
  randomImage
  animation="slide"
/>
```

### 9.2 Lista de hotéis – a cada 4 cards

```tsx
// Dentro do map de hotéis:
{hotels.map((hotel, index) => (
  <>
    <HotelCard key={hotel.id} hotel={hotel} />
    {(index + 1) % 4 === 0 && (
      <MobileCrossSellCard
        item={getCrossSellItem("hotels", index)}
        variant="compact"
        context="hotels"
        randomImage
        animation="fade"
      />
    )}
  </>
))}
```

### 9.3 Detalhe do hotel – após descrição

```tsx
<MobileCrossSellCard item={parksItem} variant="full" context="hotel-detail" />
<MobileCrossSellCard item={attractionsItem} variant="full" context="hotel-detail" />
```

---

## 10. Referências de código e próximos passos

### 10.1 Arquivos envolvidos

| Função                     | Arquivo atual                  | Ação sugerida                          |
|----------------------------|--------------------------------|----------------------------------------|
| Dados side rails           | `lib/home-side-rails.ts`       | Exportar itens; opcional: pool de imagens |
| Cards side rail            | `left-side-rail.tsx`, `right-side-rail.tsx` | Manter desktop; novo componente mobile |
| Lista hotéis               | `app/hoteis/page.tsx`, `app/hoteis/busca/*` | Inserir `<MobileCrossSellCard>` no loop |
| Lista parques/ingressos    | `app/ingressos/*` ou similar   | Idem                                   |
| Lista atrações             | `app/atracoes/*`               | Idem                                   |
| Lista promoções            | `app/promocoes/*`              | Idem                                   |
| Flash Deals                | `app/flash-deals/page.tsx`     | Idem                                   |
| Detalhe hotel              | `app/hoteis/[id]/page.tsx`     | Inserir cards após descrição           |
| Home                       | `app/page.tsx`                 | Inserir cards nas posições definidas   |

### 10.2 Ordem de implementação sugerida

1. Criar `MobileCrossSellCard` com props e suporte a imagem aleatória e animações.
2. Criar `getCrossSellItems(context, excludeIds, limit)` e pool de imagens.
3. Adicionar cards na **home** (3–4 posições).
4. Adicionar cards nas **listas** (hotéis, parques, atrações, promoções).
5. Adicionar cards nas **páginas de detalhe** (hotel, parque, atração).
6. Testar fluxo e ajustar frequência/posicionamento.

### 10.3 Condição para exibição

- Usar `className="md:hidden"` no wrapper de `MobileCrossSellCard` para que apareça **somente no mobile**.
- Side rails atuais permanecem `hidden md:block` no desktop.

---

*Documento: Melhorias Mobile – Cross-sell e Distribuição. Projeto: RSV360 – Site Público.*
