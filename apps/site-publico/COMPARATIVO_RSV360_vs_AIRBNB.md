# Comparativo: RSV360 (localhost:3000) vs Airbnb (airbnb.com.br)

Análise detalhada das diferenças entre os dois sites: layout, menus, lógica, estrutura e funcionalidades.

---

## 1. IDENTIDADE E PROPÓSITO

| Aspecto | RSV360 (Reservei Viagens) | Airbnb |
|---------|---------------------------|--------|
| **Foco** | Hotéis, parques, atrações (principalmente Caldas Novas e região) | Locações por temporada, chalés, casas, experiências (global) |
| **Marca** | "Reservei Viagens" – "Parques, Hotéis & Atrações" | "Airbnb" – aluguéis e experiências |
| **Escopo geográfico** | Regional (Brasil – Caldas Novas, Cuiabá) | Global |
| **Modelo de negócio** | Agência/operadora de turismo | Marketplace P2P (hóspede x anfitrião) |

---

## 2. HEADER / TOPO DA PÁGINA

| Elemento | RSV360 | Airbnb |
|----------|--------|--------|
| **Logo** | Ícone circular + "Reservei Viagens" | Ícone "Airbnb" |
| **Posição do header** | Fundo azul gradiente (blue-600 a blue-800) | Header branco/neutro |
| **Busca** | Barra de busca única: "Buscar Hotéis, Parques..." (link para /buscar) | Barra de busca expandível com filtros (local, datas, hóspedes) |
| **CTA de login** | Botões "Entrar" e "Cadastrar" no header | "Entrar" ou avatar do usuário |
| **Layout do header** | Tudo dentro de um bloco azul | Minimalista, elementos separados |

### Diferenças de lógica
- **RSV360**: Busca redireciona para `/buscar`; formulário simples.
- **Airbnb**: Busca inline com modal expandido, filtros de destino, check-in, check-out e hóspedes.

---

## 3. MENU DE NAVEGAÇÃO PRINCIPAL

### RSV360 – Circular Nav (barra inferior fixa)
- **Início** → `/`
- **Buscar** → `/buscar`
- **Hotéis** → `/hoteis`
- **Promoções** → `/promocoes`
- **Ingressos** → `/ingressos`
- **Atrações** → `/atracoes`
- **Perfil** → `/perfil`
- **Contato** → `/contato`

### Airbnb – Barra inferior (mobile)
- **Explorar** (lupa)
- **Favoritos** (coração)
- **Entrar** / Conta (perfil)

### Diferenças
| RSV360 | Airbnb |
|--------|--------|
| 8 itens no circular nav | 3 itens principais na barra inferior |
| Menu circular/móvel | Menu linear simples |
| Sem "Favoritos" explícito | "Favoritos" em destaque |
| Categorias claras (Hotéis, Ingressos, Atrações) | Foco em "Explorar" e conta |

---

## 4. LAYOUT DA PÁGINA INICIAL

### RSV360
- **Desktop**: 3 colunas – Side Rail Esquerdo | Conteúdo central | Side Rail Direito
- **Mobile**: Coluna única com conteúdo central
- **Side Rails** (apenas desktop):
  - **Esquerdo**: "Descubra experiências" – Aluguel temporada, Hotéis, Parques, Atrações, Leilões
  - **Direito**: "Oportunidades do dia" – Flash Deals, Viagens em grupo, Excursões, Oferta da semana

### Airbnb
- **Layout**: Conteúdo central em largura total
- **Side Rails**: Não possui
- **Estrutura**: Grid de cards de acomodações ("Homes on Airbnb")

---

## 5. CONTEÚDO DO HERO / DESTAQUE

| RSV360 | Airbnb |
|--------|--------|
| Banner/imagem ou vídeo (Reservei Viagens – Hotéis em Caldas Novas) | Imagem/carrossel de destinos |
| Grid de categorias: Buscar, Hotéis, Ingressos, Atrações | Busca em destaque |
| Botão "Ver Promoções Especiais" | Sem botão equivalente direto |

---

## 6. CATEGORIAS / AÇÕES RÁPIDAS

### RSV360
- Buscar | Hotéis | Ingressos | Atrações (4 categorias)
- Promoções
- Cards: "Hotéis" e "Promoções"
- Trust badges: Garantia de Melhor Preço | Pagamento 100% Seguro | +5000 Clientes Satisfeitos

### Airbnb
- Tipos: Casas, Chalés, Casas de praia, Acomodações únicas, etc.
- Experiências
- Sem trust badges equivalentes na mesma posição

---

## 7. MODAL / POPUP DE CONSENTIMENTO

| RSV360 | Airbnb |
|--------|--------|
| LGPD popup (consentimento de cookies/privacidade) | Modal de preferências: "Aceitar todos", "Somente o necessário", "Gerenciar" |
| Popup LGPD customizado | Modal padrão de cookies/preferências |

---

## 8. ELEMENTOS FLUTUANTES (FABs)

### RSV360
- Botão verde de **telefone** (contato)
- Botão azul de **scroll para o topo**
- Circular nav flutuante na parte inferior

### Airbnb
- Sem FABs equivalentes na home (design mais limpo)

---

## 9. RODAPÉ (FOOTER)

### RSV360
- Logo + "Reservei Viagens"
- Slogan: "Parques, Hotéis & Atrações"
- Endereços: Sede Caldas Novas, Filial Cuiabá
- E-mail e telefone
- WhatsApp (vários números)
- Links para termos e privacidade (se houver)

### Airbnb
- Links institucionais (Sobre, Ajuda, etc.)
- Links legais
- Redes sociais
- Layout mais compacto e organizado em colunas

---

## 10. LÓGICA DE BUSCA

| Aspecto | RSV360 | Airbnb |
|---------|--------|--------|
| **Onde** | Link para `/buscar` | Busca inline no header com modal |
| **Campos** | Provavelmente: destino, datas, hóspedes | Destino, check-in, check-out, hóspedes |
| **Filtros** | Filtros em página separada | Filtros no modal ou na página de resultados |

---

## 11. TIPOS DE PRODUTO

| RSV360 | Airbnb |
|--------|--------|
| Hotéis | Casas inteiras |
| Parques aquáticos / Ingressos | Quartos compartilhados |
| Atrações e passeios | Chalés |
| Promoções / Flash Deals | Casas de praia |
| Leilões de viagem | Experiências |
| Viagens em grupo | - |
| Aluguel por temporada (marketplace) | Aluguel por temporada (core) |

---

## 12. PÁGINAS E ROTAS PRINCIPAIS

### RSV360
- `/` – Início
- `/buscar` – Busca
- `/hoteis` – Hotéis
- `/promocoes` – Promoções
- `/ingressos` – Ingressos
- `/atracoes` – Atrações
- `/perfil` – Perfil
- `/contato` – Contato
- `/login` – Login / Cadastro
- `/minhas-reservas` – Minhas reservas
- `/leiloes` – Leilões
- `/flash-deals` – Flash Deals
- `/viagens-grupo` – Viagens em grupo
- `/marketplace` – Marketplace

### Airbnb
- `/` – Explorar
- Busca (modal)
- Favoritos
- Perfil / Entrar
- Páginas de listagem
- Experiências
- Hospedar

---

## 13. RESPONSIVIDADE

| RSV360 | Airbnb |
|--------|--------|
| Mobile-first com max-width central | Mobile-first responsivo |
| Side rails ocultos em mobile | Layout único |
| Circular nav no mobile | Barra inferior fixa |
| Grid 4 colunas para categorias | Layout adaptativo |

---

## 14. IDENTIDADE VISUAL

| RSV360 | Airbnb |
|--------|--------|
| Azul (blue-600, blue-700, blue-800) | Vermelho/coral (#FF5A5F) |
| Gradientes amarelo/laranja em promoções | Tons neutros e branco |
| Cards com bordas arredondadas | Cards mais clean |

---

## 15. RESUMO DAS PRINCIPAIS DIFERENÇAS

1. **Modelo**: RSV360 é agência/operadora; Airbnb é marketplace P2P.
2. **Produto**: RSV360 = hotéis + parques + atrações; Airbnb = casas + experiências.
3. **Busca**: RSV360 redireciona; Airbnb mantém busca inline com modal.
4. **Menu**: RSV360 tem circular nav com 8 itens; Airbnb usa 3 itens na barra inferior.
5. **Layout**: RSV360 usa side rails em desktop; Airbnb usa layout full-width.
6. **Favoritos**: Airbnb tem "Favoritos" em destaque; RSV360 não tem item equivalente.
7. **Experiências**: Airbnb tem "Experiências"; RSV360 tem "Atrações".
8. **Hospedar**: Airbnb permite anúncio; RSV360 não possui fluxo similar na home.
9. **Cookie/LGPD**: Ambos têm modal, com textos e opções diferentes.
10. **FABs**: RSV360 tem botões flutuantes (telefone, scroll); Airbnb não.

---

*Documento gerado em: 11/02/2025*
