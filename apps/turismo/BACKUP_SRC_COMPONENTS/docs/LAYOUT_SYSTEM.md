# 🎨 Sistema de Layout Reservei Viagens

## 📋 Visão Geral

O sistema de layout foi completamente implementado com funcionalidades avançadas de responsividade, personalização e animações. Este documento explica como usar e personalizar o sistema.

## 🚀 Funcionalidades Implementadas

### ✅ Layout Responsivo
- **Desktop**: Sidebar colapsável com largura de 256px (expandido) ou 80px (colapsado)
- **Mobile**: Sidebar em overlay com animações de slide
- **Tablet**: Adaptação automática baseada no breakpoint

### ✅ Sistema de Temas
- **Temas**: Claro, Escuro, Automático (segue preferência do sistema)
- **Esquemas de Cores**: 4 opções personalizadas para Reservei Viagens
  - 🔵 **Azul**: Águas termais (padrão)
  - 🟢 **Verde**: Natureza do cerrado
  - 🟣 **Roxo**: Elegância e sofisticação
  - 🟠 **Laranja**: Dourado do sol

### ✅ Persistência de Estado
- Estado do sidebar salvo no localStorage
- Configurações de tema persistidas
- Preferências do usuário mantidas entre sessões

### ✅ Animações Avançadas
- **Framer Motion**: Animações fluidas e profissionais
- **Submenus**: Expansão/contração com animação
- **Sidebar Mobile**: Slide suave com spring animation
- **Transições**: Hover effects e micro-interações

## 🛠️ Como Usar

### 1. Layout Básico

```tsx
import { Layout } from '../components/layout';

export default function MinhaPagina() {
  return (
    <Layout>
      <div>
        <h1>Conteúdo da Página</h1>
        {/* Seu conteúdo aqui */}
      </div>
    </Layout>
  );
}
```

### 2. Layout Sem Sidebar

```tsx
<Layout showSidebar={false}>
  <div>Página sem sidebar</div>
</Layout>
```

### 3. Layout Sem Header

```tsx
<Layout showHeader={false}>
  <div>Página sem header</div>
</Layout>
```

### 4. Usando Hooks Personalizados

```tsx
import { useSidebar, useTheme } from '../hooks';

export default function MinhaPagina() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { theme, colorScheme, setColorScheme } = useTheme();

  return (
    <div>
      <button onClick={toggleSidebar}>
        {isCollapsed ? 'Expandir' : 'Colapsar'} Sidebar
      </button>
      
      <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
        <option value="blue">Azul</option>
        <option value="green">Verde</option>
        <option value="purple">Roxo</option>
        <option value="orange">Laranja</option>
      </select>
    </div>
  );
}
```

## 🎨 Personalização de Cores

### Cores Disponíveis

```typescript
const RESERVEI_COLORS = {
  blue: {
    primary: '#2563EB',      // Azul água termal
    secondary: '#1D4ED8',    // Azul mais escuro
    accent: '#3B82F6',       // Azul claro
    light: '#DBEAFE',        // Azul muito claro
    dark: '#1E3A8A'          // Azul escuro
  },
  green: {
    primary: '#10B981',      // Verde natureza
    secondary: '#059669',    // Verde mais escuro
    accent: '#34D399',       // Verde claro
    light: '#D1FAE5',        // Verde muito claro
    dark: '#047857'          // Verde escuro
  },
  purple: {
    primary: '#8B5CF6',      // Roxo elegante
    secondary: '#7C3AED',    // Roxo mais escuro
    accent: '#A78BFA',       // Roxo claro
    light: '#EDE9FE',        // Roxo muito claro
    dark: '#6D28D9'          // Roxo escuro
  },
  orange: {
    primary: '#F59E0B',      // Dourado sol
    secondary: '#D97706',    // Laranja mais escuro
    accent: '#FBBF24',       // Laranja claro
    light: '#FEF3C7',        // Laranja muito claro
    dark: '#B45309'          // Laranja escuro
  }
};
```

### Aplicando Cores Customizadas

```tsx
import { useTheme } from '../hooks/useTheme';

export default function ComponenteCustomizado() {
  const { colors } = useTheme();

  return (
    <div 
      className="p-4 rounded-lg"
      style={{ 
        backgroundColor: colors.light,
        borderColor: colors.primary 
      }}
    >
      <h2 style={{ color: colors.primary }}>
        Título com cor personalizada
      </h2>
    </div>
  );
}
```

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Comportamento por Dispositivo

#### Mobile
- Sidebar em overlay
- Header com menu hambúrguer
- Busca colapsável
- Touch-friendly

#### Tablet
- Sidebar colapsável
- Layout adaptativo
- Otimizado para touch

#### Desktop
- Sidebar fixo lateral
- Hover effects
- Keyboard navigation
- Mouse interactions

## 🎭 Animações

### Tipos de Animação

1. **Sidebar Collapse/Expand**
   - Duração: 300ms
   - Easing: ease-in-out
   - Propriedade: width

2. **Submenu Toggle**
   - Duração: 200ms
   - Easing: ease-in-out
   - Propriedades: opacity, height

3. **Mobile Sidebar**
   - Tipo: spring
   - Damping: 25
   - Stiffness: 200
   - Propriedade: x (translateX)

4. **Menu Items**
   - Delay escalonado: 50ms por item
   - Duração: 200ms
   - Propriedades: opacity, x

### Customizando Animações

```tsx
import { motion } from 'framer-motion';

const customVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

<motion.div
  variants={customVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
  transition={{ duration: 0.3 }}
>
  Conteúdo animado
</motion.div>
```

## 🔧 Configuração Avançada

### Modificando o Menu

Para adicionar novos itens ao menu, edite o arquivo `Sidebar.tsx`:

```tsx
const menuItems: MenuItem[] = [
  {
    id: 'novo-item',
    name: 'Novo Item',
    icon: <NovoIcon className="h-5 w-5" />,
    href: '/novo-item',
    description: 'Descrição do novo item',
    submenu: [
      {
        id: 'sub-item',
        name: 'Sub Item',
        icon: <SubIcon className="h-4 w-4" />,
        href: '/novo-item/sub'
      }
    ]
  }
  // ... outros itens
];
```

### Adicionando Novos Temas

Para adicionar um novo esquema de cores:

```typescript
// Em useTheme.ts
export const RESERVEI_COLORS = {
  // ... cores existentes
  red: {
    primary: '#EF4444',
    secondary: '#DC2626',
    accent: '#F87171',
    light: '#FEE2E2',
    dark: '#B91C1C'
  }
};

export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red';
```

## 📊 Performance

### Otimizações Implementadas

1. **Lazy Loading**: Componentes carregados sob demanda
2. **Memoização**: Estados otimizados com useMemo/useCallback
3. **Debounce**: Resize events debounced
4. **LocalStorage**: Persistência eficiente
5. **CSS Variables**: Temas aplicados via CSS custom properties

### Métricas de Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🧪 Testes

### Páginas de Teste

1. **`/layout-test`**: Teste básico do layout
2. **`/demo-layout`**: Demonstração completa com todas as funcionalidades

### Como Testar

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar páginas de teste
http://localhost:3000/layout-test
http://localhost:3000/demo-layout
```

### Cenários de Teste

1. **Responsividade**
   - Redimensionar janela
   - Testar em diferentes dispositivos
   - Verificar breakpoints

2. **Temas**
   - Alternar entre temas claro/escuro
   - Testar esquemas de cores
   - Verificar persistência

3. **Animações**
   - Colapsar/expandir sidebar
   - Abrir/fechar submenus
   - Testar sidebar mobile

4. **Persistência**
   - Recarregar página
   - Fechar/abrir navegador
   - Verificar localStorage

## 🐛 Troubleshooting

### Problemas Comuns

1. **Sidebar não persiste**
   - Verificar se localStorage está habilitado
   - Limpar cache do navegador

2. **Animações não funcionam**
   - Verificar se framer-motion está instalado
   - Verificar console para erros

3. **Temas não aplicam**
   - Verificar se CSS variables estão sendo definidas
   - Verificar se Tailwind dark mode está configurado

4. **Layout quebrado em mobile**
   - Verificar viewport meta tag
   - Testar em diferentes navegadores

### Logs de Debug

```typescript
// Habilitar logs de debug
localStorage.setItem('debug-layout', 'true');

// Verificar estado atual
console.log('Sidebar State:', localStorage.getItem('rsv-sidebar-state'));
console.log('Theme Config:', localStorage.getItem('rsv-theme-config'));
```

## 🚀 Próximos Passos

### Melhorias Futuras

1. **PWA Support**: Service workers e offline capability
2. **Keyboard Shortcuts**: Navegação por teclado
3. **RTL Support**: Suporte a idiomas da direita para esquerda
4. **Accessibility**: Melhorias de acessibilidade
5. **Performance**: Otimizações adicionais

### Integração com Backend

1. **User Preferences**: Salvar preferências no servidor
2. **Real-time Updates**: WebSocket para atualizações em tempo real
3. **Analytics**: Tracking de uso e performance

---

## 📞 Suporte

Para dúvidas ou problemas com o sistema de layout:

1. Verificar este documento
2. Consultar páginas de teste
3. Verificar console do navegador
4. Contatar equipe de desenvolvimento

**Sistema desenvolvido para Reservei Viagens - Caldas Novas, GO** 🏖️
