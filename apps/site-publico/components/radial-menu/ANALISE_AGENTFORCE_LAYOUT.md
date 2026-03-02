# Análise Profunda: Layout Agentforce → RSV 360° Menu Radial

## 1. Estrutura Visual da Imagem (Agentforce)

### 1.1 Forma Geral
- **Semi-círculo** (arco de ~180°) expandindo para cima a partir de uma base horizontal
- **Não é um círculo completo** – formato de leque/ventilador
- Três camadas concêntricas em arco + núcleo central + barra inferior fixa

### 1.2 Camadas (de fora para dentro)

| Camada | Cor | Conteúdo | Analogia RSV 360° |
|--------|-----|----------|-------------------|
| **Externa** | Azul escuro (#1e3a5f) | "Agentforce" + agentes (Sales, Support, Marketing, CX, Analytics, Finance, HR, Health, Banking, Product, Ops) | **Perfis**: Proprietário, Operador, Admin |
| **Média** | Azul claro (#bae6fd / #e0f2fe) | "Customer 360" + módulos com ícones circulares (Slack, Commerce, Industries, Success, Sales, Service, Marketing, Experience, Tableau, Revenue, Partner) | **Módulos**: Turismo, Financeiro, Tributação, etc. |
| **Interna** | Roxo (#7c3aed / #6d28d9) | "Data Cloud" + "Zero Copy & RAG" + ícone central (pessoa com círculo pontilhado) | **Núcleo**: RSV 360° / Reservas, Clientes, Propriedades |

### 1.3 Elementos Adicionais
- **Trust Layer**: Faixa fina escura entre núcleo e plataforma
- **Barra inferior**: Azul escuro, "Salesforce Platform" + capacidades (Custom apps, Einstein AI, Flow, Omnichannel, Security, Analytics)
- **Integração**: "MuleSoft Integration" abaixo da barra

### 1.4 Estilo dos Módulos (camada média)
- **Ícones circulares** (não quadrados com cantos arredondados)
- Ícones coloridos (verde, rosa, laranja, azul, amarelo)
- Label **abaixo** do ícone
- Fundo da camada é azul claro; os cards flutuam sobre ele

---

## 2. O Que Temos Hoje vs. O Que Precisamos

### 2.1 Layout
| Aspecto | Atual | Necessário |
|---------|-------|------------|
| Forma | Círculo completo 360° | Semi-círculo ~180° (arco superior) |
| Perfis | Tabs acima do menu | **Arco externo** integrado ao radial |
| Módulos | Cards quadrados | **Ícones circulares** com label abaixo |
| Núcleo | Gradiente azul | **Roxo** (#7c3aed) estilo "Data Cloud" |
| Fundo | Cinza claro | **Arcos coloridos** (azul escuro externo, azul claro médio) |

### 2.2 Interação
| Aspecto | Atual | Necessário |
|---------|-------|------------|
| Mouse | Arrastar no anel (pointer events) | ✅ Já existe – manter |
| Touch mobile | Grid estático (sem radial) | **Radial no mobile** + arrastar com dedo |
| `touch-action` | `touch-none` no orbit | Garantir que **não bloqueie** touch no mobile |

### 2.3 Cores (paleta Agentforce)
- **Externo**: `#0f172a` ou `#1e3a5f` (azul escuro)
- **Médio**: `#bae6fd` / `#e0f2fe` (azul claro)
- **Núcleo**: `#7c3aed` / `#6d28d9` (roxo/violeta)
- **Barra inferior**: `#0f172a` (azul escuro)
- **Texto**: Branco nas áreas escuras

---

## 3. Plano de Implementação

### Fase 1: Layout Semi-Circular
1. Alterar posicionamento dos módulos de 360° para **arco de 180°** (ex.: de -90° a +90° a partir do topo)
2. Fórmula: `angle = -90 + (180 / (n-1)) * i` ou similar para distribuir no semi-círculo
3. Ajustar raio e centro para o arco superior

### Fase 2: Camada Externa (Perfis)
1. Criar **arco externo** com fundo azul escuro
2. Posicionar labels dos perfis (Proprietário, Operador, Admin) ao longo do arco
3. Integrar ao layout radial em vez de tabs separadas

### Fase 3: Camada Média (Módulos)
1. Criar **arco médio** com fundo azul claro
2. Alterar `ModuleOrbit`: ícone **circular** (não quadrado), label abaixo
3. Manter cores variadas por módulo

### Fase 4: Núcleo (CoreHub)
1. Cor de fundo **roxo** (#7c3aed)
2. Título "Data Cloud" → "RSV 360°" ou "Núcleo"
3. Subtítulo "Zero Copy & RAG" → "Reservas • Clientes • Propriedades"
4. Ícone central (User ou Database)

### Fase 5: Barra Inferior
1. Fundo azul escuro
2. Título "RSV 360° Plataforma"
3. Capacidades: "Apps customizados • IA • Automação • Segurança • Analytics"
4. Link do site

### Fase 6: Trust Layer
1. Faixa fina entre núcleo e barra inferior
2. Texto opcional: "Camada de Confiança" ou similar

### Fase 7: Mobile – Radial com Touch
1. **Remover** o grid fallback no mobile
2. Mostrar o **mesmo radial** em telas pequenas (com scale/zoom se necessário)
3. Garantir `touch-action: none` ou `pan-y` no container para **arrastar com dedo** sem scroll
4. `onPointerDown` / `onPointerMove` / `onPointerUp` já funcionam com touch (Pointer Events unificam mouse e touch)
5. Adicionar `touch-action: none` no orbit para evitar scroll durante o arraste

### Fase 8: Ajustes de Touch
- `touch-action: none` no container do orbit → evita scroll da página ao arrastar
- `user-select: none` → evita seleção de texto
- `-webkit-tap-highlight-color: transparent` → remove highlight em mobile
- Testar em dispositivos reais

---

## 4. Checklist de Alterações

- [ ] Semi-círculo (arco 180°) em vez de círculo completo
- [ ] Arco externo azul escuro com perfis
- [ ] Arco médio azul claro com módulos
- [ ] Núcleo roxo estilo "Data Cloud"
- [ ] ModuleOrbit: ícone circular, label abaixo
- [ ] Barra inferior azul escuro com capacidades
- [ ] Trust layer (faixa fina)
- [ ] Radial no mobile (não grid)
- [ ] Touch drag no mobile (pointer events + touch-action)
- [ ] Mouse drag já funciona – manter
