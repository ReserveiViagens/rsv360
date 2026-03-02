# 📋 Módulo de Orçamentos Parques Hoteis e Atrações

## 📖 Documentação Completa

Este módulo implementa um sistema completo de criação, gerenciamento e visualização de orçamentos para parques, hotéis, atrações e passeios turísticos.

---

## 🏗️ Estrutura do Projeto

### Diretórios Principais

```
frontend/
├── pages/
│   └── cotacoes/
│       ├── index.tsx                    # Dashboard de cotações
│       ├── new.tsx                      # Nova cotação (seleção de tipo)
│       ├── [id].tsx                     # Visualização de orçamento
│       ├── [id]/
│       │   └── edit.tsx                 # Edição completa (8 abas)
│       ├── from-template/
│       │   └── [templateId].tsx        # Customização de template
│       └── templates/
│           ├── page.tsx                 # Galeria de templates
│           ├── new.tsx                  # Criação de template
│           └── [id]/
│               └── edit.tsx             # Edição de template (5 abas)
│
├── components/
│   ├── budget-type-selector.tsx        # Seletor de tipo de orçamento
│   ├── budget-edit-selector.tsx        # Seletor de orçamento para editar
│   ├── photo-gallery-manager.tsx       # Gerenciador de galeria de fotos
│   ├── video-gallery-manager.tsx       # Gerenciador de vídeos YouTube
│   └── note-templates-manager.tsx       # Gerenciador de templates de notas
│
├── lib/
│   ├── types/
│   │   └── budget.ts                    # Interfaces TypeScript
│   ├── budget-storage.ts                # Armazenamento de orçamentos
│   ├── template-storage.ts              # Armazenamento de templates
│   ├── note-templates-storage.ts        # Armazenamento de templates de notas
│   ├── budget-utils.ts                  # Funções utilitárias
│   ├── budget-types.ts                   # Constantes e tipos
│   ├── default-templates.ts             # Inicialização de templates padrão
│   ├── caldas-novas-hotels.ts           # 90 templates de hotéis
│   ├── caldas-novas-parques.ts          # 52 templates de parques
│   ├── caldas-novas-atracoes.ts         # 9 templates de atrações
│   └── caldas-novas-passeios.ts         # 6 templates de passeios
│
└── hooks/
    ├── use-mobile.tsx                   # Hook para detectar mobile
    └── use-toast.tsx                     # Hook para notificações toast
```

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Next.js 16+

### Dependências

```bash
cd frontend
npm install
```

### Componentes shadcn/ui Necessários

Os seguintes componentes do shadcn/ui são utilizados:

- `button`
- `input`
- `textarea`
- `label`
- `select`
- `dialog`
- `tabs`
- `badge`
- `toast`

Instale os componentes necessários:

```bash
npx shadcn-ui@latest add button input textarea label select dialog tabs badge toast
```

---

## 📚 Uso

### Inicialização

Os templates padrão são carregados automaticamente na inicialização da aplicação através de `_app.tsx`:

```typescript
import { initializeDefaultTemplates } from '@/lib/default-templates';

// Automático no useEffect
initializeDefaultTemplates();
```

### Criar Orçamento a partir de Template

1. Acesse `/cotacoes/templates`
2. Selecione um template
3. Clique em "Usar Template"
4. Personalize os dados (cliente, valores, etc.)
5. Clique em "Salvar Cotação"

### Criar Orçamento do Zero

1. Acesse `/cotacoes`
2. Clique em "Nova Cotação"
3. Selecione o tipo (Hotel, Parque, Atração, Passeio)
4. Preencha todos os dados necessários
5. Clique em "Salvar"

### Editar Orçamento

1. Acesse `/cotacoes`
2. Clique em "Editar" ou acesse `/cotacoes/[id]/edit`
3. Navegue pelas 8 abas:
   - **Básico**: Informações do cliente e cotação
   - **Itens**: Produtos/serviços incluídos
   - **Financeiro**: Descontos, taxas, total
   - **Galeria**: Fotos com legendas
   - **Vídeos**: Vídeos do YouTube
   - **Conteúdo**: Destaques, benefícios, notas
   - **Contatos**: Informações de contato
   - **Cabeçalho**: Configuração do cabeçalho da empresa
4. Clique em "Salvar" após cada alteração

### Criar Template

1. Acesse `/cotacoes/templates/new`
2. Preencha informações básicas (nome, categoria, título)
3. Configure itens, fotos, benefícios, etc.
4. Clique em "Salvar Template"
5. O template aparecerá na galeria e poderá ser usado para criar orçamentos

---

## 🗂️ Modelos de Dados

### Budget (Orçamento)

```typescript
interface Budget {
  id: string;
  type: 'hotel' | 'parque' | 'atracao' | 'passeio' | 'personalizado';
  mainCategory?: string;
  title: string;
  description?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string; // Obrigatório
  currency: string;
  items: BudgetItem[];
  subtotal: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  tax?: number;
  taxType?: 'percentage' | 'fixed';
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  photos?: Photo[];
  highlights?: Highlight[];
  benefits?: Benefit[];
  accommodationDetails?: AccommodationDetail[];
  importantNotes?: ImportantNote[];
  detailedItinerary?: DayItinerary[];
  contacts?: ContactInfo;
  companyHeader?: CompanyHeader;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

### BudgetTemplate (Template)

```typescript
interface BudgetTemplate {
  id: string;
  name: string;
  mainCategory: 'Hotéis' | 'Parques' | 'Atrações' | 'Passeios';
  subCategory?: string;
  thumbnailUrl?: string;
  title: string;
  templateDescription?: string;
  items?: BudgetItem[];
  photos?: Photo[];
  highlights?: Highlight[];
  benefits?: Benefit[];
  // ... todos os campos do Budget exceto informações do cliente
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔧 API de Armazenamento

### budgetStorage

```typescript
import { budgetStorage } from '@/lib/budget-storage';

// Obter todos os orçamentos
const budgets = budgetStorage.getAll();

// Obter por ID
const budget = budgetStorage.getById(id);

// Salvar
budgetStorage.save(budget);

// Excluir
budgetStorage.delete(id);

// Estatísticas
const stats = budgetStorage.getStats();
```

### templateStorage

```typescript
import { templateStorage } from '@/lib/template-storage';

// Obter todos os templates
const templates = templateStorage.getAll();

// Obter por ID
const template = templateStorage.getById(id);

// Obter por categoria
const hotelTemplates = templateStorage.getByCategory('Hotéis');

// Salvar
templateStorage.save(template);

// Excluir
templateStorage.delete(id);

// Versão
const version = templateStorage.getVersion();
```

---

## 🧮 Funções Utilitárias

### budget-utils.ts

```typescript
import {
  formatCurrency,
  formatDate,
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTotal,
  getStatusColor,
  getStatusLabel,
} from '@/lib/budget-utils';

// Formatação
const formatted = formatCurrency(1000); // "R$ 1.000,00"
const date = formatDate('2024-01-01'); // "01/01/2024"

// Cálculos
const subtotal = calculateSubtotal(items);
const discount = calculateDiscount(subtotal, 10, 'percentage');
const tax = calculateTax(subtotal, 5, 'percentage');
const total = calculateTotal(budget);

// Status
const color = getStatusColor('approved'); // "bg-green-100 text-green-800"
const label = getStatusLabel('draft'); // "Rascunho"
```

---

## 🎨 Componentes Customizados

### BudgetTypeSelector

Modal para seleção do tipo de orçamento.

```tsx
<BudgetTypeSelector
  open={isOpen}
  onOpenChange={setIsOpen}
  onSelect={(type) => {
    // Redirecionar baseado no tipo
  }}
/>
```

### PhotoGalleryManager

Gerenciador completo de galeria de fotos.

```tsx
<PhotoGalleryManager
  photos={budget.photos || []}
  onChange={(photos) => {
    updateBudget('photos', photos);
  }}
/>
```

### VideoGalleryManager

Gerenciador de vídeos do YouTube.

```tsx
<VideoGalleryManager
  videos={videos}
  onChange={(videos) => {
    updateBudget('videos', videos);
  }}
/>
```

### NoteTemplatesManager

Gerenciador de templates de notas reutilizáveis.

```tsx
<NoteTemplatesManager
  onSelect={(template) => {
    // Aplicar template às notas
  }}
/>
```

---

## 📱 Responsividade

O módulo é totalmente responsivo:

- **Mobile (< 768px)**: Sidebar vira drawer, layouts adaptados
- **Tablet (768px - 1024px)**: Layout otimizado
- **Desktop (> 1024px)**: Layout completo com sidebar colapsável

---

## 🖨️ Impressão/PDF

O módulo inclui estilos CSS otimizados para impressão:

- Layout A4 (210mm x 297mm)
- Margens de 2cm
- Quebras de página inteligentes
- Preservação de cores e imagens
- Cabeçalho e rodapé personalizados

Use o botão "Imprimir" na visualização do orçamento ou `window.print()`.

---

## 🧪 Testes

Consulte o arquivo `TESTES_MODULO_COTACOES.md` para guia completo de testes.

Para executar testes de localStorage:

```typescript
import { runAllLocalStorageTests } from '@/lib/test-localstorage';

// No console do browser
runAllLocalStorageTests();
```

---

## 📝 Changelog

### Versão 1.0.0 (2024)

- ✅ Implementação completa do módulo
- ✅ 157 templates padrão (90 hotéis + 52 parques + 9 atrações + 6 passeios)
- ✅ Sistema de versionamento de templates
- ✅ Componentes customizados integrados
- ✅ 8 abas de edição completa
- ✅ Galeria de templates com filtros
- ✅ Gerenciadores de fotos, vídeos e notas
- ✅ Responsividade completa
- ✅ Estilos de impressão otimizados

---

## 🔗 Referências

- Documentação principal: `CURSOR_AI_PROJECT_DOCUMENTATION.md`
- Guia de testes: `TESTES_MODULO_COTACOES.md`
- Script de testes: `lib/test-localstorage.ts`

---

## 💡 Próximos Passos

1. Migrar de localStorage para backend (API REST ou GraphQL)
2. Adicionar exportação DOCX (já preparado)
3. Implementar compartilhamento via link
4. Adicionar analytics e métricas
5. Sistema de aprovação em workflow

